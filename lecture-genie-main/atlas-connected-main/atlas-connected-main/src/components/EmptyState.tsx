import { Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasSearch?: boolean;
  onAddLecture: () => void;
}

export function EmptyState({ hasSearch, onAddLecture }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-6 animate-pulse-glow">
        <Video className="w-10 h-10 text-primary" />
      </div>
      
      {hasSearch ? (
        <>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No lectures found
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Try adjusting your search terms or add a new lecture.
          </p>
        </>
      ) : (
        <>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No lectures yet
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Get started by adding your first video lecture to the collection.
          </p>
          <Button 
            onClick={onAddLecture}
            className="gradient-primary glow-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Lecture
          </Button>
        </>
      )}
    </div>
  );
}
