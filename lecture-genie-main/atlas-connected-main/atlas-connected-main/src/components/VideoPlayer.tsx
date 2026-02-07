import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Lecture } from '@/types/lecture';

interface VideoPlayerProps {
  lecture: Lecture | null;
  onClose: () => void;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  // Direct video URL
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return url;
  }

  return null;
}

export function VideoPlayer({ lecture, onClose }: VideoPlayerProps) {
  if (!lecture) return null;

  const embedUrl = getEmbedUrl(lecture.videoUrl);
  const isDirectVideo = lecture.videoUrl.match(/\.(mp4|webm|ogg)$/i);

  return (
    <Dialog open={!!lecture} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 bg-black border-none overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="aspect-video bg-black">
            {isDirectVideo ? (
              <video
                src={lecture.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <p>Unable to play this video. <a href={lecture.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open in new tab</a></p>
              </div>
            )}
          </div>

          <div className="p-6 bg-card">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {lecture.title}
            </h2>
            {lecture.description && (
              <p className="mt-2 text-muted-foreground">
                {lecture.description}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
