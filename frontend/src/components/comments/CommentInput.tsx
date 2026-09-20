import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface CommentInputProps {
  featureId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentInput({ featureId, parentId, onSuccess, onCancel }: CommentInputProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post(`/features/${featureId}/comments`, {
        bodyMarkdown: content,
        parentComment: parentId || null,
      });
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', featureId] });
      queryClient.invalidateQueries({ queryKey: ['feature', featureId] });
      if (onSuccess) onSuccess();
    }
  });

  if (!user) {
    return (
      <div className="bg-muted/20 border border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground mb-4">You must be logged in to leave a comment.</p>
        <Link to="/login" className={buttonVariants()}>
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full bg-background resize-none"
        placeholder="Leave a comment... (Markdown supported)"
      />
      <div className="flex justify-end gap-2 mt-3">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={!content.trim() || mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Post Comment
        </Button>
      </div>
    </div>
  );
}
