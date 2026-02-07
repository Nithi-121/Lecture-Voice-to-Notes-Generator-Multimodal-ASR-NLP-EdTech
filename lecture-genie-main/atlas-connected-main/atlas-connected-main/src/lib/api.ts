import type { Lecture, LectureFormData, LecturesResponse, LectureResponse } from '@/types/lecture';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const API_BASE = `${SUPABASE_URL}/functions/v1/lectures`;

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.error || 'An error occurred');
    (error as Error & { hint?: string }).hint = data.hint;
    throw error;
  }

  return data;
}

export async function getLectures(search?: string): Promise<Lecture[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchAPI<LecturesResponse>(query);
  return response.data || [];
}

export async function getLecture(id: string): Promise<Lecture> {
  const response = await fetchAPI<LectureResponse>(`/${id}`);
  if (!response.data) throw new Error('Lecture not found');
  return response.data;
}

export async function createLecture(data: LectureFormData): Promise<Lecture> {
  const response = await fetchAPI<LectureResponse>('', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.data) throw new Error('Failed to create lecture');
  return response.data;
}

export async function updateLecture(id: string, data: Partial<LectureFormData>): Promise<void> {
  await fetchAPI<LectureResponse>(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLecture(id: string): Promise<void> {
  await fetchAPI<LectureResponse>(`/${id}`, {
    method: 'DELETE',
  });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}
