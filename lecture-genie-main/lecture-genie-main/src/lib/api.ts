const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Lecture {
  _id: string;
  title: string;
  created_at: string;
  audio_filename: string;
  transcript: string;
  summary: string;
  key_points: string[];
  quiz?: { question: string; answer: string }[];
}

export async function uploadLecture(file: File, title: string): Promise<Lecture> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  const res = await fetch(`${API_BASE}/api/lectures/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function getLectures(): Promise<Lecture[]> {
  const res = await fetch(`${API_BASE}/api/lectures`);
  if (!res.ok) throw new Error("Failed to fetch lectures");
  return res.json();
}

export async function getLecture(id: string): Promise<Lecture> {
  const res = await fetch(`${API_BASE}/api/lectures/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lecture");
  return res.json();
}
