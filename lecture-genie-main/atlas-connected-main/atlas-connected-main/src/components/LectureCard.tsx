import { Play, Clock, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Lecture } from '@/types/lecture';
import { formatDuration, formatViews } from '@/lib/api';

interface LectureCardProps {
  lecture: Lecture;
  onEdit: (lecture: Lecture) => void;
  onDelete: (id: string) => void;
  onPlay: (lecture: Lecture) => void;
}

export function LectureCard({ lecture, onEdit, onDelete, onPlay }: LectureCardProps) {
  return (
    <Card className="group overflow-hidden card-elevated transition-all duration-300 hover:glow-primary hover:scale-[1.02] animate-fade-in">
      {/* Thumbnail */}
      <div 
        className="relative aspect-video cursor-pointer overflow-hidden"
        onClick={() => onPlay(lecture)}
      >
        {lecture.thumbnail ? (
          <img 
            src={lecture.thumbnail} 
            alt={lecture.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full gradient-primary flex items-center justify-center">
            <Play className="w-12 h-12 text-primary-foreground opacity-80" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 thumbnail-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full glass flex items-center justify-center glow-primary">
            <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md glass text-xs font-medium">
          {formatDuration(lecture.duration)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 
            className="font-display font-semibold text-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => onPlay(lecture)}
          >
            {lecture.title}
          </h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuItem onClick={() => onEdit(lecture)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(lecture._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {lecture.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {lecture.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatViews(lecture.views)} views
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(lecture.duration)}
          </span>
        </div>

        {lecture.tags && lecture.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lecture.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {tag}
              </span>
            ))}
            {lecture.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{lecture.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
