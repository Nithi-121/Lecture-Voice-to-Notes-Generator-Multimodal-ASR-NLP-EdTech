import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileAudio, ArrowRight, Loader2, Inbox } from "lucide-react";
import { getLectures } from "@/lib/api";

export default function DashboardPage() {
  const { data: lectures, isLoading } = useQuery({
    queryKey: ["lectures"],
    queryFn: getLectures,
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-hero">
      <div className="container max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Your <span className="text-gradient">Lectures</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Browse all processed recordings
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-premium self-start"
          >
            Upload New
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !lectures?.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-10 sm:p-16 text-center"
          >
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No lectures yet</p>
            <p className="text-muted-foreground mb-6">
              Upload your first audio recording to get started.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Go to Upload <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {lectures.map((l) => (
              <motion.div
                key={l._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  to={`/lecture/${l._id}`}
                  className="block glass rounded-2xl p-6 card-hover group h-full"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="rounded-lg bg-primary/10 p-2 transition-shadow group-hover:glow-primary">
                      <FileAudio className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{l.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(l.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {l.summary}
                  </p>
                  <div className="mt-4 flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View details <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
