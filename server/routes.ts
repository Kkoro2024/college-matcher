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
  "latest.school.carnegie_size_setting": number | null;
}

interface CollegeStats {
  name: string;
  location: string;
  acceptanceRate: string;
  avgSAT: string;
  tuition: string;
  size: "Small" | "Medium" | "Large";
  rawAcceptanceRate: number | null; // used for Safety/Match/Reach classification
}

// ─── Step 1: Ask LLM for college name recommendations only ───────────────────

async function getCollegeRecommendations(studentProfile: string): Promise<{ name: string; type: "Safety" | "Match" | "Reach" }[]> {
  const prompt = `You are a college admissions counselor. Based on this student profile, recommend exactly 8 US colleges/universities: 3 Safety, 3 Match, 2 Reach.

Return ONLY a JSON array — no markdown, no extra text:
[
  { "name": "Exact Official University Name", "type": "Safety" },
  ...
]

Rules:
- Use the full, exact official name (e.g. "University of Massachusetts Amherst", not "UMass")
- Safety = student is very likely to be admitted
- Match = student has a reasonable chance
- Reach = competitive but achievable (acceptance rate 12-30%)
- Do NOT recommend Ivy League or schools under 12% acceptance unless the student asks
- Tailor choices to the student's intended major, location preferences, and budget

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

// ─── Step 2: Fetch real stats from College Scorecard API ─────────────────────

async function fetchCollegeStats(collegeName: string): Promise<CollegeStats | null> {
  console.log("Fetching stats for:", collegeName);
  console.log("API key present:", !!SCORECARD_API_KEY);
  
  const fields = [
    "school.name",
    "latest.admissions.admission_rate.overall",
    "latest.admissions.sat_scores.average.overall",
    "latest.student.size",
    "latest.cost.tuition.out_of_state",
    "latest.cost.tuition.in_state",
    "latest.school.city",
    "latest.school.state",
    "latest.school.carnegie_size_setting",
  ].join(",");

  const url = `${SCORECARD_BASE}?school.name=${encodeURIComponent(collegeName)}&fields=${fields}&api_key=${SCORECARD_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("Scorecard response for", collegeName, ":", JSON.stringify(data?.results?.length), "results");

  const results: ScorecardResult[] = data?.results;
  if (!results?.length) return null;

  // Pick the closest name match
  const school = results.find(r =>
    r["school.name"].toLowerCase().includes(collegeName.toLowerCase().split(" ")[0])
  ) || results[0];

  const rawRate = school["latest.admissions.admission_rate.overall"];
  const acceptanceRate = rawRate != null ? `${Math.round(rawRate * 100)}%` : "N/A";

  const sat = school["latest.admissions.sat_scores.average.overall"];
  const avgSAT = sat != null ? Math.round(sat).toString() : "N/A";

  const oos = school["latest.cost.tuition.out_of_state"];
  const ins = school["latest.cost.tuition.in_state"];
  const tuitionVal = oos ?? ins;
  const tuition = tuitionVal != null
    ? `$${tuitionVal.toLocaleString()}/year`
    : "N/A";

  const studentSize = school["latest.student.size"] ?? 0;
  const size: "Small" | "Medium" | "Large" =
    studentSize < 5000 ? "Small" : studentSize < 15000 ? "Medium" : "Large";

  const city = school["latest.school.city"] ?? "";
  const state = school["latest.school.state"] ?? "";
  const location = city && state ? `${city}, ${state}` : "N/A";

  return {
    name: school["school.name"],
    location,
    acceptanceRate,
    avgSAT,
    tuition,
    size,
    rawAcceptanceRate: rawRate,
  };
}

// ─── Step 3: Ask LLM to write qualitative details using real stats ───────────

async function enrichWithDescriptions(
  studentProfile: string,
  colleges: Array<CollegeStats & { type: "Safety" | "Match" | "Reach" }>
): Promise<object> {
  const prompt = `You are a college admissions counselor. A student has been matched to these colleges using REAL, verified statistics from the US Department of Education.

Your job is to write ONLY the qualitative/descriptive fields. Do not change or invent any statistics.

Student profile:
${studentProfile}

Colleges with verified stats:
${JSON.stringify(colleges, null, 2)}

Return ONLY valid JSON in this exact format — no markdown, no extra text:
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
      "matchScore": <0-100 integer based on fit>,
      "whyMatch": "2-3 sentences on why this school fits THIS specific student",
      "topPrograms": ["Program 1", "Program 2", "Program 3"],
      "campusLife": "1 sentence about clubs/activities relevant to student interests",
      "financialAid": "1 sentence about financial aid or scholarship availability"
    }
  ],
  "summary": "2-3 sentence overall strategy summary for this student",
  "tips": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4000,
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

      // Step 1 — LLM picks colleges (reasoning, no stats)
      const recommendations = await getCollegeRecommendations(input.question);

      console.log("LLM recommended:", JSON.stringify(recommendations, null, 2));

      // Step 2 — Fetch real stats for each college from Scorecard API
      const statsResults = await Promise.all(
        recommendations.map(async (rec) => {
          const stats = await fetchCollegeStats(rec.name);
          if (!stats) return null;
          return { ...stats, type: rec.type };
        })
      );

      const validColleges = statsResults.filter(
        (c): c is CollegeStats & { type: "Safety" | "Match" | "Reach" } => c !== null
      );

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