import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Trophy, MapPin, DollarSign, Users, Star, BookOpen, Zap, Target, Shield } from "lucide-react";
import Home from "./Home";

const FEATURES = [
  { icon: Trophy, title: "GPA & Test Score Matching", description: "Get matched to schools where your academic profile gives you the best chance of admission." },
  { icon: MapPin, title: "Location Preferences", description: "Filter by region, state, or climate. Find schools where you actually want to live for four years." },
  { icon: BookOpen, title: "Major-Specific Fits", description: "We match your intended major to schools with top-ranked programs in your field." },
  { icon: DollarSign, title: "Budget-Aware Results", description: "Every recommendation accounts for your budget and flags schools with strong financial aid." },
  { icon: Users, title: "Activities & Culture Fit", description: "Your clubs, sports, and hobbies matter. We match you to campuses where you'll thrive." },
  { icon: Star, title: "Safety / Match / Reach", description: "A balanced list of 8 schools — 3 safeties, 3 matches, and 2 reaches — built just for you." },
];

const STATS = [
  { value: "5,000+", label: "Colleges in Database" },
  { value: "8", label: "Matches Per Search" },
  { value: "<10s", label: "Average Response" },
  { value: "Free", label: "No Login Required" },
];

export default function Landing() {
  const [launched, setLaunched] = useState(false);

  if (launched) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Home />
      </motion.div>
    );
  }

  return (
    <div style={{ background: "#080c14", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "white", overflowX: "hidden" }}>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Glow */}
      <div style={{
        position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "800px", borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Nav */}
        <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 40px", borderBottom: "1px solid rgba(59,130,246,0.1)",
            backdropFilter: "blur(20px)", background: "rgba(8,12,20,0.8)",
            position: "sticky", top: 0, zIndex: 100,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(59,130,246,0.4)",
            }}>
              <GraduationCap size={16} color="white" />
            </div>
            <span style={{ fontWeight: "bold", letterSpacing: "0.05em", fontSize: "15px" }}>COLLEGEMATCH AI</span>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setLaunched(true)}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", border: "none",
              borderRadius: "8px", padding: "8px 20px", color: "white", fontWeight: "bold",
              fontSize: "13px", cursor: "pointer", letterSpacing: "0.03em",
            }}>
            Get Started →
          </motion.button>
        </motion.nav>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "120px 24px 80px" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <div style={{
              display: "inline-block", border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "100px", padding: "6px 16px", marginBottom: "32px",
              background: "rgba(59,130,246,0.08)",
            }}>
              <span style={{ fontSize: "12px", color: "#60a5fa", letterSpacing: "0.1em" }}>
                🎓 AI-POWERED COLLEGE MATCHING
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(40px, 7vw, 84px)", fontWeight: "800", lineHeight: 1.05, marginBottom: "24px", letterSpacing: "-0.02em" }}>
              Find Your Perfect<br />
              <span style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                College Match.
              </span>
            </h1>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.5)", maxWidth: "560px", margin: "0 auto 48px", lineHeight: 1.7 }}>
              Tell us your GPA, major, budget, and activities. Get a personalized list of 8 colleges — safeties, matches, and reaches — in seconds.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(59,130,246,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLaunched(true)}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", border: "none",
                borderRadius: "14px", padding: "18px 48px", color: "white",
                fontWeight: "bold", fontSize: "16px", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "10px",
                boxShadow: "0 0 30px rgba(59,130,246,0.25)",
              }}>
              Find My Colleges <ArrowRight size={18} />
            </motion.button>
            <p style={{ marginTop: "16px", fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
              Free · No signup · Instant results
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            display: "flex", justifyContent: "center", flexWrap: "wrap",
            borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)", margin: "0 0 100px",
          }}>
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{
              textAlign: "center", padding: "32px 48px",
              borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#60a5fa", marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{stat.label.toUpperCase()}</div>
            </div>
          ))}
        </motion.section>

        {/* Features */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 100px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "bold", marginBottom: "16px" }}>Everything you need to build your college list.</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>Built for high school students who want real, personalized guidance.</p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.04)" }}
                  style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px", background: "rgba(255,255,255,0.02)", transition: "all 0.2s" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", marginBottom: "16px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color="#60a5fa" />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>{f.title}</h3>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Why section */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "32px" }}>
          {[
            { icon: Zap, title: "Instant Results", body: "No waiting. Get 8 personalized college matches in under 10 seconds powered by Groq AI." },
            { icon: Target, title: "Truly Personalized", body: "Every recommendation is tailored to your specific GPA, major, budget, location, and activities." },
            { icon: Shield, title: "Honest & Realistic", body: "We give you a balanced list — not just dream schools. Safety schools matter too." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} style={{ textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", margin: "0 auto 16px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color="#60a5fa" />
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "10px" }}>{item.title}</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{item.body}</p>
              </motion.div>
            );
          })}
        </section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: "center", padding: "80px 24px 120px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "bold", marginBottom: "16px" }}>Ready to find your colleges?</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "40px", fontSize: "16px" }}>Free to use. No signup. Just results.</p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(59,130,246,0.4)" }} whileTap={{ scale: 0.97 }}
            onClick={() => setLaunched(true)}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", border: "none", borderRadius: "14px",
              padding: "18px 56px", color: "white", fontWeight: "bold", fontSize: "16px", cursor: "pointer",
              boxShadow: "0 0 30px rgba(59,130,246,0.2)",
            }}>
            Find My Colleges →
          </motion.button>
        </motion.section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={12} color="white" />
            </div>
            <span style={{ fontSize: "13px", fontWeight: "bold", letterSpacing: "0.06em" }}>COLLEGEMATCH AI</span>
          </div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>AI-powered recommendations · Not a guarantee of admission</p>
        </footer>

      </div>
    </div>
  );
}