import { useState, useCallback } from 'react';
import { Plus, Video, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LectureCard } from '@/components/LectureCard';
import { LectureForm } from '@/components/LectureForm';
import { SearchBar } from '@/components/SearchBar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EmptyState } from '@/components/EmptyState';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useLectures, useCreateLecture, useUpdateLecture, useDeleteLecture } from '@/hooks/useLectures';
import type { Lecture, LectureFormData } from '@/types/lecture';

const Index = () => {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [playingLecture, setPlayingLecture] = useState<Lecture | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: lectures = [], isLoading, error, refetch } = useLectures(search);
  const createMutation = useCreateLecture();
  const updateMutation = useUpdateLecture();
  const deleteMutation = useDeleteLecture();

  const handleOpenForm = useCallback(() => {
    setEditingLecture(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback((data: LectureFormData) => {
    if (editingLecture) {
      updateMutation.mutate(
        { id: editingLecture._id, data },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  }, [editingLecture, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSuccess: () => setDeletingId(null),
      });
    }
  }, [deletingId, deleteMutation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center glow-primary">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold gradient-text">
                  Lecture Hub
                </h1>
                <p className="text-xs text-muted-foreground">
                  Video lecture management
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-72">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <Button 
                onClick={handleOpenForm}
                className="gradient-primary glow-primary shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Lecture</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="mt-2">
              {(error as Error & { hint?: string }).hint || (error as Error).message}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && lectures.length === 0 && (
          <EmptyState hasSearch={!!search} onAddLecture={handleOpenForm} />
        )}

        {/* Lectures grid */}
        {!isLoading && lectures.length > 0 && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {lectures.length} lecture{lectures.length !== 1 ? 's' : ''}{search && ` matching "${search}"`}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lectures.map((lecture) => (
                <LectureCard
                  key={lecture._id}
                  lecture={lecture}
                  onEdit={handleEdit}
                  onDelete={setDeletingId}
                  onPlay={setPlayingLecture}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <LectureForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        lecture={editingLecture}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <VideoPlayer
        lecture={playingLecture}
        onClose={() => setPlayingLecture(null)}
      />

      <DeleteConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Index;