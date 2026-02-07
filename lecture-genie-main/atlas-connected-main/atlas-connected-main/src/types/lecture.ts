export interface Lecture {
  _id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  duration: number; // in seconds
  views: number;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LectureFormData {
  title: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  description: string;
  tags: string[];
}

export interface LecturesResponse {
  success: boolean;
  data?: Lecture[];
  error?: string;
}

export interface LectureResponse {
  success: boolean;
  data?: Lecture;
  error?: string;
  message?: string;
  hint?: string;
}
