import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const SCORECARD_API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const SCORECARD_BASE = "https://api.data.gov/ed/collegescorecard/v1/schools";

const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScorecardResult {
  "school.name": string;
  "latest.admissions.admission_rate.overall": number | null;
  "latest.admissions.sat_scores.average.overall": number | null;
  "latest.student.size": number | null;
  "latest.cost.tuition.out_of_state": number | null;
  "latest.cost.tuition.in_state": number | null;
  "latest.school.city": string;
  "latest.school.state": string;
}

interface CollegeStats {
  name: string;
  location: string;
  acceptanceRate: string;
  avgSAT: string;
  tuition: string;
  size: "Small" | "Medium" | "Large";
  rawAcceptanceRate: number | null;
}

// ─── Step 1: LLM picks college names only ────────────────────────────────────

async function getCollegeRecommendations(studentProfile: string): Promise<{ name: string; type: "Safety" | "Match" | "Reach" }[]> {
  const prompt = `You are a college admissions counselor. Based on this student profile, recommend exactly 8 US colleges/universities: 3 Safety, 3 Match, 2 Reach.

Return ONLY a JSON array — no markdown, no extra text:
[
  { "name": "Exact Official University Name", "type": "Safety" },
  ...
]

Rules:
- Use the full, exact official name (e.g. "University of Massachusetts Amherst", not "UMass")
- Safety = student is very likely to be admitted (acceptance rate above 50%)
- Match = student has a reasonable chance (acceptance rate 30-50%)
- Reach = competitive but achievable (acceptance rate 15-30%)
- Do NOT recommend schools under 12% acceptance unless the student asks
- Tailor choices to the student's intended major, location preferences, and budget
- Recommend well-known schools that are easy to look up

Student profile:
${studentProfile}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
  });

  const raw = response.choices[0]?.message?.content || "[]";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── Step 2: Fetch real stats from Scorecard with fallback search ─────────────

async function fetchCollegeStats(collegeName: string): Promise<CollegeStats | null> {
  const fields = [
    "school.name",
    "latest.admissions.admission_rate.overall",
    "latest.admissions.sat_scores.average.overall",
    "latest.student.size",
    "latest.cost.tuition.out_of_state",
    "latest.cost.tuition.in_state",
    "latest.school.city",
    "latest.school.state",
  ].join(",");

  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const stopWords = new Set(["university", "college", "institute", "of", "the", "at", "and", "school", "technology"]);

  // Try multiple search strategies in order
  const searchTerms: string[] = [];
  
  // Strategy 1: full name search
  searchTerms.push(collegeName.replace(/,/g, ""));
  
  // Strategy 2: first two meaningful words
  const meaningfulWords = collegeName.split(" ").filter(w => !stopWords.has(w.toLowerCase()) && w.length > 2);
  if (meaningfulWords.length >= 2) searchTerms.push(meaningfulWords.slice(0, 2).join(" "));
  
  // Strategy 3: single most distinctive keyword
  if (meaningfulWords.length > 0) searchTerms.push(meaningfulWords[0]);

  let results: ScorecardResult[] = [];

  for (const term of searchTerms) {
    try {
      const url = `${SCORECARD_BASE}?school.name=${encodeURIComponent(term)}&fields=${fields}&api_key=${SCORECARD_API_KEY}&per_page=20`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.results?.length) {
        results = data.results;
        break; // found results, stop trying
      }
    } catch (err) {
      console.log("Fetch error for term:", term, err);
    }
  }

  if (!results.length) {
    console.log("No results for:", collegeName);
    return null;
  }

  // Score each result — count matching words from the target name
  const targetWords = normalise(collegeName).split(" ").filter(w => w.length > 2);
  const scored = results.map(r => {
    const resultName = normalise(r["school.name"]);
    const matches = targetWords.filter(w => resultName.includes(w)).length;
    const exactBonus = resultName.includes(normalise(collegeName).substring(0, 10)) ? 2 : 0;
    // Penalize if result name has words not in target (avoids "Delaware State" matching "University of Delaware")
    const resultWords = resultName.split(" ").filter(w => !stopWords.has(w) && w.length > 2);
    const extraWords = resultWords.filter(w => !normalise(collegeName).includes(w)).length;
    return { r, score: matches + exactBonus - extraWords };
  });
  
  const best = scored.sort((a, b) => b.score - a.score)[0].r;
  console.log(`Matched "${collegeName}" → "${best["school.name"]}"`);

  const rawRate = best["latest.admissions.admission_rate.overall"];
  const acceptanceRate = rawRate != null ? `${Math.round(rawRate * 100)}%` : "N/A";
  const sat = best["latest.admissions.sat_scores.average.overall"];
  const avgSAT = sat != null ? Math.round(sat).toString() : "N/A";
  const oos = best["latest.cost.tuition.out_of_state"];
  const ins = best["latest.cost.tuition.in_state"];
  const tuitionVal = oos ?? ins;
  const tuition = tuitionVal != null ? `$${tuitionVal.toLocaleString()}/year` : "N/A";
  const studentSize = best["latest.student.size"] ?? 0;
  const size: "Small" | "Medium" | "Large" =
    studentSize < 5000 ? "Small" : studentSize < 15000 ? "Medium" : "Large";
  const city = best["latest.school.city"] ?? "";
  const state = best["latest.school.state"] ?? "";
  const location = city && state ? `${city}, ${state}` : "N/A";

  return { name: best["school.name"], location, acceptanceRate, avgSAT, tuition, size, rawAcceptanceRate: rawRate };
}

// ─── Classify type based on real acceptance rate ──────────────────────────────

function classifyType(rawRate: number | null, llmType: "Safety" | "Match" | "Reach"): "Safety" | "Match" | "Reach" {
  if (rawRate == null) return llmType; // fallback to LLM suggestion if no data
  const pct = rawRate * 100;
  if (pct >= 50) return "Safety";
  if (pct >= 25) return "Match";
  return "Reach";
}

// ─── Step 3: LLM writes qualitative fields using real stats ───────────────────

async function enrichWithDescriptions(
  studentProfile: string,
  colleges: Array<CollegeStats & { type: "Safety" | "Match" | "Reach" }>
): Promise<object> {
  const prompt = `You are a college admissions counselor. A student has been matched to these colleges using REAL verified statistics from the US Department of Education.

Write ONLY the qualitative/descriptive fields. Do NOT change or invent any statistics.

Student profile:
${studentProfile}

Colleges with verified stats:
${JSON.stringify(colleges, null, 2)}

Return ONLY valid JSON — no markdown, no extra text:
{
  "colleges": [
    {
      "name": "exactly as provided",
      "location": "exactly as provided",
      "type": "exactly as provided",
      "acceptanceRate": "exactly as provided",
      "avgSAT": "exactly as provided",
      "tuition": "exactly as provided",
      "size": "exactly as provided",
      "matchScore": <0-100 integer based on student fit>,
      "whyMatch": "2-3 sentences on why this school fits THIS specific student's major, budget, and location preferences",
      "topPrograms": ["Program 1", "Program 2", "Program 3"],
      "campusLife": "1 sentence about clubs or activities relevant to this student's interests",
      "financialAid": "1 sentence about merit aid, need-based aid, or scholarship availability"
    }
  ],
  "summary": "2-3 sentence overall strategy summary for this specific student",
  "tips": ["Actionable tip 1 specific to this student", "Actionable tip 2", "Actionable tip 3"]
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 8000,
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.qna.list.path, async (req, res) => {
    const qnas = await storage.getQnas();
    res.json(qnas);
  });

  app.post(api.qna.ask.path, async (req, res) => {
    try {
      const input = api.qna.ask.input.parse(req.body);

      // Step 1 — LLM picks colleges (reasoning only, no stats)
      const recommendations = await getCollegeRecommendations(input.question);
      console.log("LLM recommended:", recommendations.map(r => r.name));

      // Step 2 — Fetch real stats for each college
      const statsResults = await Promise.all(
        recommendations.map(async (rec) => {
          const stats = await fetchCollegeStats(rec.name);
          if (!stats) return null;
          const type = classifyType(stats.rawAcceptanceRate, rec.type);
          return { ...stats, type };
        })
      );

      const validColleges = statsResults.filter(
        (c): c is CollegeStats & { type: "Safety" | "Match" | "Reach" } => c !== null
      );

      console.log(`Found Scorecard data for ${validColleges.length}/${recommendations.length} colleges`);

      if (!validColleges.length) {
        return res.status(502).json({ message: "Could not retrieve college data. Check your COLLEGE_SCORECARD_API_KEY." });
      }

      // Step 3 — LLM writes qualitative fields around the real stats
      const answer = await enrichWithDescriptions(input.question, validColleges);
      const answerStr = JSON.stringify(answer);

      const qna = await storage.createQna({ question: input.question, answer: answerStr });
      res.status(201).json({ ...qna, answer: answerStr });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message || "Validation error",
          field: err.errors[0]?.path.join("."),
        });
      }
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}