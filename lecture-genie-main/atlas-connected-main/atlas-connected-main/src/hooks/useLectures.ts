import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLectures, getLecture, createLecture, updateLecture, deleteLecture } from '@/lib/api';
import type { LectureFormData } from '@/types/lecture';
import { toast } from '@/hooks/use-toast';

export function useLectures(search?: string) {
  return useQuery({
    queryKey: ['lectures', search],
    queryFn: () => getLectures(search),
    staleTime: 30000,
  });
}

export function useLecture(id: string) {
  return useQuery({
    queryKey: ['lecture', id],
    queryFn: () => getLecture(id),
    enabled: !!id,
  });
}

export function useCreateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LectureFormData) => createLecture(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
      toast({
        title: 'Success',
        description: 'Lecture created successfully',
      });
    },
    onError: (error: Error & { hint?: string }) => {
      toast({
        title: 'Error',
        description: error.hint || error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LectureFormData> }) => 
      updateLecture(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
      queryClient.invalidateQueries({ queryKey: ['lecture', variables.id] });
      toast({
        title: 'Success',
        description: 'Lecture updated successfully',
      });
    },
    onError: (error: Error & { hint?: string }) => {
      toast({
        title: 'Error',
        description: error.hint || error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLecture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
      toast({
        title: 'Success',
        description: 'Lecture deleted successfully',
      });
    },
    onError: (error: Error & { hint?: string }) => {
      toast({
        title: 'Error',
        description: error.hint || error.message,
        variant: 'destructive',
      });
    },
  });
}
