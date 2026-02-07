import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Mic, Brain, ListChecks } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Mic, title: "AI Transcription", desc: "Whisper-powered speech-to-text with high accuracy" },
  { icon: Brain, title: "Smart Summaries", desc: "NLP-driven summaries that capture key concepts" },
  { icon: ListChecks, title: "Key Points", desc: "Auto-extracted highlights and quiz generation" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="container relative z-10 pt-24 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              Multimodal ASR + NLP
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] font-display"
          >
            Transform lectures into{" "}
            <span className="text-gradient">actionable notes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Upload any lecture recording and get AI-generated transcripts,
            summaries, key points, and quizzes in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="glow-primary btn-premium rounded-full px-8 text-base font-semibold w-full sm:w-auto">
              <Link to="/upload">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base w-full sm:w-auto">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </motion.div>
        </div>

        <div className="mt-16 sm:mt-24 grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
              className="glass rounded-2xl p-6 card-hover group"
            >
              <div className="rounded-xl bg-primary/10 p-3 w-fit mb-4 group-hover:glow-primary transition-shadow">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
