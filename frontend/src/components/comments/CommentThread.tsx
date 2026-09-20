import { useState } from 'react';
import type { CommentType } from '../../types/comment';
import { CommentInput } from './CommentInput';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Reply, User, Trash2, Edit2, Loader2, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';

interface CommentThreadProps {
  comments: CommentType[];
  featureId: string;
  parentId: string | null;
  depth?: number;
}

export function CommentThread({ comments, featureId, parentId, depth = 0 }: CommentThreadProps) {
  // Find all comments that belong to this parent
  const childComments = comments.filter(c => c.parentComment === parentId);

  if (childComments.length === 0) return null;

  return (
    <div className={cn("space-y-4", depth > 0 && "pl-4 md:pl-8 border-l border-white/10 mt-4")}>
      {childComments.map(comment => (
        <CommentNode 
          key={comment._id}
          comment={comment}
          allComments={comments}
          featureId={featureId}
          depth={depth}
        />
      ))}
    </div>
  );
}

function CommentNode({ comment, allComments, featureId, depth }: { 
  comment: CommentType, 
  allComments: CommentType[], 
  featureId: string,
  depth: number 
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.bodyMarkdown);

  const canManage = user?.id === comment.author._id || user?.role === 'admin';

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/comments/${comment._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', featureId] });
      toast.success("Comment deleted");
    },
    onError: () => toast.error("Failed to delete comment")
  });

  const editMutation = useMutation({
    mutationFn: () => api.patch(`/comments/${comment._id}`, { bodyMarkdown: editContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', featureId] });
      setIsEditing(false);
      toast.success("Comment updated");
    },
    onError: () => toast.error("Failed to update comment")
  });

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-sm border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
            <User className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{comment.author.name}</div>
            <div className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className={cn(
          "prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-muted-foreground",
          comment.isDeleted && "text-muted-foreground italic"
        )}>
          {comment.isDeleted ? (
            <p>This comment has been deleted.</p>
          ) : isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full bg-background resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => editMutation.mutate()} disabled={editMutation.isPending}>
                  {editMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />} Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditContent(comment.bodyMarkdown); }}>
                  <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {comment.bodyMarkdown}
            </ReactMarkdown>
          )}
        </div>

        {!comment.isDeleted && !isEditing && (
          <div className="mt-4 flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs h-8 text-muted-foreground"
            >
              <Reply className="w-3.5 h-3.5 mr-1.5" />
              Reply
            </Button>
            {canManage && (
              <>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-xs h-8 text-muted-foreground"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this comment?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="text-xs h-8 text-destructive hover:text-destructive"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                  Delete
                </Button>
              </>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-4">
            <CommentInput 
              featureId={featureId} 
              parentId={comment._id} 
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
      </Card>

      {/* Render nested children recursively */}
      <CommentThread 
        comments={allComments}
        featureId={featureId}
        parentId={comment._id}
        depth={depth + 1}
      />
    </div>
  );
}
