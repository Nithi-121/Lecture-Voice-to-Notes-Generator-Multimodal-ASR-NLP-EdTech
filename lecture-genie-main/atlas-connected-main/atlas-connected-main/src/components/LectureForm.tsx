import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Lecture, LectureFormData } from '@/types/lecture';

const lectureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  videoUrl: z.string().url('Please enter a valid URL'),
  thumbnail: z.string().url('Please enter a valid URL').or(z.literal('')),
  duration: z.coerce.number().min(0, 'Duration must be positive'),
  description: z.string().max(2000, 'Description is too long'),
  tags: z.array(z.string()),
});

interface LectureFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LectureFormData) => void;
  lecture?: Lecture | null;
  isLoading?: boolean;
}

export function LectureForm({ open, onClose, onSubmit, lecture, isLoading }: LectureFormProps) {
  const [tagInput, setTagInput] = useState('');
  
  const form = useForm<LectureFormData>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: '',
      videoUrl: '',
      thumbnail: '',
      duration: 0,
      description: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (lecture) {
      form.reset({
        title: lecture.title,
        videoUrl: lecture.videoUrl,
        thumbnail: lecture.thumbnail,
        duration: lecture.duration,
        description: lecture.description || '',
        tags: lecture.tags || [],
      });
    } else {
      form.reset({
        title: '',
        videoUrl: '',
        thumbnail: '',
        duration: 0,
        description: '',
        tags: [],
      });
    }
  }, [lecture, form, open]);

  const tags = form.watch('tags');

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      form.setValue('tags', [...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    form.setValue('tags', tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (data: LectureFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {lecture ? 'Edit Lecture' : 'Add New Lecture'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Introduction to React Hooks" 
                      className="bg-input border-border"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://youtube.com/watch?v=..." 
                      className="bg-input border-border"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/thumbnail.jpg" 
                      className="bg-input border-border"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (seconds)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="3600"
                      className="bg-input border-border"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Learn the fundamentals of React Hooks..."
                      className="bg-input border-border resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mt-1.5">
                <Input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a tag..."
                  className="bg-input border-border"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="icon"
                  onClick={addTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gradient-primary glow-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : lecture ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
