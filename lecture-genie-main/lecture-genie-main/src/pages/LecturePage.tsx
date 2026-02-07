import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Brain, ListChecks, HelpCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { getLecture } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function QuizCard({ q, i }: { q: { question: string; answer: string }; i: number }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <motion.div variants={fadeUp} className="glass rounded-xl p-6">
      <p className="font-medium mb-3">Q{i + 1}: {q.question}</p>
      <button
        onClick={() => setRevealed(!revealed)}
        className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline mb-2"
      >
        {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {revealed ? "Hide Answer" : "Show Answer"}
      </button>
      <AnimatePresence>
        {revealed && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-muted-foreground overflow-hidden"
          >
            <span className="text-primary font-medium">A:</span> {q.answer}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LecturePage() {
  const { id } = useParams<{ id: string }>();
  const { data: lecture, isLoading, error } = useQuery({
    queryKey: ["lecture", id],
    queryFn: () => getLecture(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Lecture not found. Is the backend running?
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-hero">
      <div className="container max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">{lecture.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(lecture.created_at).toLocaleDateString("en-US", {
              dateStyle: "long",
            })}
          </p>
        </motion.div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="glass rounded-xl p-1 flex-wrap">
            <TabsTrigger value="summary" className="rounded-lg gap-2">
              <Brain className="h-4 w-4" /> <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="keypoints" className="rounded-lg gap-2">
              <ListChecks className="h-4 w-4" /> <span className="hidden sm:inline">Key Points</span>
            </TabsTrigger>
            <TabsTrigger value="transcript" className="rounded-lg gap-2">
              <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Transcript</span>
            </TabsTrigger>
            {lecture.quiz && lecture.quiz.length > 0 && (
              <TabsTrigger value="quiz" className="rounded-lg gap-2">
                <HelpCircle className="h-4 w-4" /> <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="summary">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="glass rounded-2xl p-6 sm:p-8"
            >
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {lecture.summary}
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="keypoints">
            <motion.ul
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {lecture.key_points.map((point, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  className="glass rounded-xl p-5 flex items-start gap-4"
                >
                  <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90">{point}</span>
                </motion.li>
              ))}
            </motion.ul>
          </TabsContent>

          <TabsContent value="transcript">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="glass rounded-2xl p-6 sm:p-8"
            >
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {lecture.transcript}
              </p>
            </motion.div>
          </TabsContent>

          {lecture.quiz && lecture.quiz.length > 0 && (
            <TabsContent value="quiz">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {lecture.quiz.map((q, i) => (
                  <QuizCard key={i} q={q} i={i} />
                ))}
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
