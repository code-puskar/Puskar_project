import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Feature } from '../types/feature';
import type { CommentType } from '../types/comment';
import { CommentInput } from '../components/comments/CommentInput';
import { CommentThread } from '../components/comments/CommentThread';
import { ChevronUp, Loader2, MessageSquare, Clock, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export function FeatureDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Feature
  const { data: feature, isLoading: isFeatureLoading, isError: isFeatureError } = useQuery({
    queryKey: ['feature', id],
    queryFn: async () => {
      const res = await api.get<{ data: Feature }>(`/features/${id}`);
      return res.data.data;
    }
  });

  // Fetch Comments (Flat list from backend)
  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const res = await api.get<{ data: { items: CommentType[] } }>(`/features/${id}/comments`);
      return res.data.data.items;
    }
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (!feature) return;
      if (feature.hasVoted) {
        return api.delete(`/features/${id}/vote`);
      } else {
        return api.post(`/features/${id}/vote`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature', id] });
      queryClient.invalidateQueries({ queryKey: ['features'] }); // keep feed in sync
    }
  });

  if (isFeatureLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (isFeatureError || !feature) {
    return <div className="text-center py-20 text-red-400">Feature not found.</div>;
  }

  const handleVote = () => {
    if (!user) {
      alert("Please login to vote");
      return;
    }
    voteMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Link>

      <div className="flex gap-6 items-start">
        <button
          onClick={handleVote}
          className={cn(
            "flex flex-col items-center justify-center min-w-[72px] h-20 rounded-md border transition-all shrink-0",
            feature.hasVoted
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <ChevronUp className="w-8 h-8 -mb-2" strokeWidth={3} />
          <span className="font-bold text-lg">{feature.voteCount}</span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold tracking-wide border",
              feature.status === 'under_review' && "bg-secondary text-secondary-foreground border-transparent",
              feature.status === 'planned' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
              feature.status === 'in_progress' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
              feature.status === 'completed' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            )}>
              {feature.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold border border-transparent">
              {feature.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-6">
            {feature.title}
          </h1>

          <div className="prose prose-invert max-w-none mb-8 bg-muted/20 border border-border p-6 rounded-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {feature.descriptionMarkdown}
            </ReactMarkdown>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Requested by</span>
              <span className="text-foreground font-medium">{feature.author.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-8">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Discussion ({feature.commentCount})</h2>
            </div>

            <div className="mb-10">
              <CommentInput featureId={id!} />
            </div>

            {isCommentsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="mt-8 max-h-[600px] overflow-y-auto pr-4">
                {/* 
                  Pass parentId=null to render the root level comments. 
                  The CommentThread component handles rendering children recursively.
                */}
                <CommentThread comments={comments || []} featureId={id!} parentId={null} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
