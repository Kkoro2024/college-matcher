import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAskQuestion } from "@/hooks/use-qna";
import { GraduationCap, Loader2, MapPin, Trophy, DollarSign, Users, BookOpen, Star, ChevronDown, ChevronUp } from "lucide-react";

type CollegeResult = {
  name: string;
  location: string;
  type: "Safety" | "Match" | "Reach";
  acceptanceRate: string;
  avgGPA: string;
  avgSAT: string;
  tuition: string;
  size: string;
  ranking: string;
  matchScore: number;
  whyMatch: string;
  topPrograms: string[];
  campusLife: string;
  financialAid: string;
};

type MatchResult = {
  colleges: CollegeResult[];
  summary: string;
  tips: string[];
};

function CollegeCard({ college, index }: { college: CollegeResult; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const typeColors = {
    Safety: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", text: "#34d399" },
    Match: { bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)", text: "#60a5fa" },
    Reach: { bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)", text: "#fb923c" },
  };
  const colors = typeColors[college.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-2xl overflow-hidden border"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
                fontFamily: "system-ui"
              }}>
                {college.type}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "system-ui" }}>
                {college.ranking}
              </span>
            </div>
            <h3 className="text-base font-bold text-white" style={{ fontFamily: "system-ui" }}>{college.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "system-ui" }}>{college.location}</span>
            </div>
          </div>

          <div className="flex-shrink-0 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2" style={{
              background: "rgba(59,130,246,0.1)",
              borderColor: college.matchScore >= 80 ? "#34d399" : college.matchScore >= 60 ? "#60a5fa" : "#fb923c"
            }}>
              <div>
                <p className="text-base font-bold text-white leading-none" style={{ fontFamily: "system-ui" }}>{college.matchScore}</p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>match</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: "Accept", value: college.acceptanceRate },
            { label: "Avg GPA", value: college.avgGPA },
            { label: "Avg SAT", value: college.avgSAT },
            { label: "Tuition", value: college.tuition.replace("/year", "") },
          ].map(stat => (
            <div key={stat.label} className="text-center rounded-lg py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-xs font-bold text-white" style={{ fontFamily: "system-ui" }}>{stat.value}</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "system-ui" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "system-ui" }}>
          {college.whyMatch}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {college.topPrograms.map(p => (
            <span key={p} className="text-[11px] px-2 py-0.5 rounded-full" style={{
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
              color: "#93c5fd", fontFamily: "system-ui"
            }}>{p}</span>
          ))}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs transition-opacity hover:opacity-100"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "system-ui", opacity: 0.7 }}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Less info" : "More info"}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3" style={{ color: "#60a5fa" }} />
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "system-ui" }}>Campus Life</p>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "system-ui" }}>{college.campusLife}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3 h-3" style={{ color: "#34d399" }} />
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "system-ui" }}>Financial Aid</p>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "system-ui" }}>{college.financialAid}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "system-ui" }}>School Size</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "system-ui" }}>{college.size}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResultsView({ result }: { result: MatchResult }) {
  const safeties = result.colleges.filter(c => c.type === "Safety");
  const matches = result.colleges.filter(c => c.type === "Match");
  const reaches = result.colleges.filter(c => c.type === "Reach");

  const Section = ({ title, colleges, color }: { title: string; colleges: CollegeResult[]; color: string }) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: "system-ui" }}>{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>{colleges.length}</span>
      </div>
      <div className="space-y-3">
        {colleges.map((c, i) => <CollegeCard key={c.name} college={c} index={i} />)}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-6 border"
        style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4" style={{ color: "#60a5fa" }} />
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#60a5fa", fontFamily: "system-ui" }}>Your College Strategy</p>
        </div>
        <p className="text-sm leading-relaxed text-white" style={{ fontFamily: "system-ui" }}>{result.summary}</p>
      </motion.div>

      <Section title="Safety Schools" colleges={safeties} color="#34d399" />
      <Section title="Match Schools" colleges={matches} color="#60a5fa" />
      <Section title="Reach Schools" colleges={reaches} color="#fb923c" />

      {result.tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 border"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>Admissions Tips For You</p>
          <ul className="space-y-2">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "system-ui" }}>
                <span style={{ color: "#60a5fa" }}>→</span>{tip}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

const FIELDS = [
  { id: "gpa", label: "GPA", placeholder: "e.g. 3.8", icon: Trophy },
  { id: "sat", label: "SAT / ACT Score", placeholder: "e.g. 1350 SAT or 29 ACT", icon: BookOpen },
  { id: "major", label: "Intended Major", placeholder: "e.g. Computer Science, Business, Pre-Med", icon: GraduationCap },
  { id: "location", label: "Preferred Location", placeholder: "e.g. Northeast, California, open to anywhere", icon: MapPin },
  { id: "state", label: "Your Home State", placeholder: "e.g. New York, California, Texas", icon: MapPin },
  { id: "size", label: "School Size Preference", placeholder: "e.g. Small liberal arts, large research university", icon: Users },
  { id: "budget", label: "Annual Budget", placeholder: "e.g. Under $30k, need financial aid, no limit", icon: DollarSign },
  { id: "competitiveness", label: "Competitiveness", placeholder: "e.g. Ivy League only, moderately selective, open to all", icon: Star },
  { id: "activities", label: "Clubs & Activities", placeholder: "e.g. Debate team captain, robotics, varsity soccer, volunteering", icon: Users },
];

export default function Home() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const askMutation = useAskQuestion();

  const handleSubmit = () => {
    const filled = FIELDS.filter(f => form[f.id]?.trim());
    if (filled.length < 5) {
      setError("Please fill in at least 5 fields to get accurate recommendations.");
      return;
    }
    setError(null);
    setResult(null);

    const prompt = `Please find college matches for this student:
GPA: ${form.gpa || "Not provided"}
SAT/ACT: ${form.sat || "Not provided"}
Intended Major: ${form.major || "Not provided"}
Preferred Location: ${form.location || "Not provided"}
Home State: ${form.state || "Not provided"}
School Size Preference: ${form.size || "Not provided"}
Annual Budget: ${form.budget || "Not provided"}
Competitiveness: ${form.competitiveness || "Not provided"}
Extracurriculars & Activities: ${form.activities || "Not provided"}`;

    askMutation.mutate({ question: prompt } as any, {
      onSuccess: (data: any) => {
        try {
          const clean = data.answer.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          setResult(parsed);
        } catch {
          setError("Something went wrong parsing the results. Please try again.");
        }
      },
      onError: () => setError("Something went wrong. Please try again."),
    });
  };

  if (result) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #080c14 0%, #0d1421 50%, #080e1a 100%)", fontFamily: "system-ui" }}>
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <header className="sticky top-0 z-50 border-b px-4 py-4" style={{ background: "rgba(8,12,20,0.95)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">CollegeMatch AI</span>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-xs px-4 py-2 rounded-lg transition-all"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}
            >
              ← New Search
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <ResultsView result={result} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #080c14 0%, #0d1421 50%, #080e1a 100%)", fontFamily: "system-ui" }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />
      <div style={{
        position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "600px", borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)"
      }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            boxShadow: "0 0 30px rgba(59,130,246,0.3)"
          }}>
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CollegeMatch AI</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px" }}>
            Tell us about yourself and get personalized college recommendations
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 border space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.id}>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <Icon className="w-3 h-3" style={{ color: "#60a5fa" }} />
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={form[field.id] || ""}
                    onChange={e => setForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "system-ui",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.background = "rgba(59,130,246,0.05)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                </div>
              );
            })}
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center" style={{ fontFamily: "system-ui" }}>{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={askMutation.isPending}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: askMutation.isPending ? "rgba(59,130,246,0.4)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              boxShadow: askMutation.isPending ? "none" : "0 0 20px rgba(59,130,246,0.3)",
              cursor: askMutation.isPending ? "not-allowed" : "pointer",
              fontSize: "15px"
            }}
          >
            {askMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Finding your colleges...</>
            ) : (
              <><GraduationCap className="w-4 h-4" /> Find My Colleges</>
            )}
          </motion.button>
        </motion.div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
          AI-powered recommendations · Not a guarantee of admission
        </p>
      </div>
    </div>
  );
}