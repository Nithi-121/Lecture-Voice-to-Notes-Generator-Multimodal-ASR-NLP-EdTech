import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadLecture } from "@/lib/api";
import { toast } from "sonner";

const loadingSteps = [
  "Transcribing lecture…",
  "Analyzing content…",
  "Summarizing key concepts…",
  "Extracting key points…",
  "Generating quiz questions…",
  "Finalizing notes…",
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!uploading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % loadingSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [uploading]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length) {
      setFile(accepted[0]);
      if (!title) setTitle(accepted[0].name.replace(/\.[^.]+$/, ""));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".webm"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setLoadingStep(0);
    try {
      const lecture = await uploadLecture(file, title || file.name);
      toast.success("Lecture processed successfully!");
      navigate(`/lecture/${lecture._id}`);
    } catch {
      toast.error("Upload failed. Is the backend running?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-hero">
      <div className="container max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">
            Upload a <span className="text-gradient">Lecture</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Drop an audio file and let AI do the rest.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Lecture Title
            </label>
            <Input
              placeholder="e.g. Intro to Machine Learning – Week 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div
            {...getRootProps()}
            className={`relative rounded-xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : file
                ? "border-primary/40 bg-primary/5"
                : "border-border/50 hover:border-muted-foreground/40 hover:bg-secondary/20"
            }`}
          >
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="rounded-full bg-primary/10 p-4">
                    <FileAudio className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="rounded-full bg-muted p-4 animate-float">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium">
                    {isDragActive ? "Drop it here!" : "Drag & drop audio file"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    MP3, WAV, M4A, OGG, WEBM
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Multi-step loading indicator */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-primary/5 border border-primary/20 p-4 overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-medium text-primary"
                    >
                      {loadingSteps[loadingStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="mt-3 h-1 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 18, ease: "linear" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            size="lg"
            className="w-full rounded-xl glow-primary btn-premium text-base font-semibold"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Transcribe & Summarize
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
