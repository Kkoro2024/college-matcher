import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

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

      const systemPrompt = `You are an expert college admissions counselor with deep knowledge of US colleges and universities.
When given a student's profile, you MUST respond in exactly this JSON format and nothing else:

{
  "colleges": [
    {
      "name": "Full University Name",
      "location": "City, State",
      "type": "Safety" | "Match" | "Reach",
      "acceptanceRate": "XX%",
      "avgGPA": "X.XX",
      "avgSAT": "XXXX",
      "tuition": "$XX,XXX/year",
      "size": "Small" | "Medium" | "Large",
      "ranking": "#XX National Universities",
      "matchScore": 85,
      "whyMatch": "2-3 sentences explaining why this college is a great fit for this specific student based on their profile",
      "topPrograms": ["Program 1", "Program 2", "Program 3"],
      "campusLife": "1 sentence about clubs/activities relevant to student interests",
      "financialAid": "1 sentence about financial aid availability"
    }
  ],
  "summary": "2-3 sentence overall summary of the student's college list strategy",
  "tips": ["Tip 1 specific to this student", "Tip 2", "Tip 3"]
}

Rules:
- Always return exactly 8 colleges: 3 Safety, 3 Match, 2 Reach
- For REACH schools, choose schools with 15-30% acceptance rates — never recommend Ivy League or sub-12% acceptance schools unless the student explicitly requests them
- matchScore is 0-100 based on how well the college fits the student
- Use ACCURATE, REAL acceptance rates and GPA averages — never invent or estimate statistics
- Reference these known accurate rates: UMass Amherst ~64%, Boston University ~37%, Northeastern ~18%, University of Rochester ~30%, RPI ~47%, WPI ~49%, Villanova ~28%, Fordham ~46%, American University ~35%, Lehigh ~41%, Tulane ~13%, University of Miami ~27%, NYU ~21%, Case Western ~47%
- Tailor recommendations to the student's major, location, budget, and activities
- Return ONLY valid JSON, no markdown, no extra text`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: input.question }
      ];

      const response = await openrouter.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 4000,
      });

      const answer = response.choices[0]?.message?.content || "{}";
      const qna = await storage.createQna({ question: input.question, answer });
      res.status(201).json({ ...qna, answer });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message || "Validation error",
          field: err.errors[0]?.path.join('.'),
        });
      }
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}