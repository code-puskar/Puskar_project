import { ChevronUp, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Feature } from '../../types/feature';
import { cn } from '../../lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Card } from '../ui/card';

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (feature.hasVoted) {
        return api.delete(`/features/${feature._id}/vote`);
      } else {
        return api.post(`/features/${feature._id}/vote`);
      }
    },
    onMutate: async () => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['features'] });
      const previousFeatures = queryClient.getQueryData(['features']);

      queryClient.setQueriesData({ queryKey: ['features'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: Feature) => {
              if (item._id === feature._id) {
                return {
                  ...item,
                  hasVoted: !item.hasVoted,
                  voteCount: item.hasVoted ? item.voteCount - 1 : item.voteCount + 1,
                };
              }
              return item;
            }),
          })),
        };
      });

      return { previousFeatures };
    },
    onError: (context: any) => {
      queryClient.setQueriesData({ queryKey: ['features'] }, context.previousFeatures);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation since card is wrapped in link
    if (!user) {
      toast.error("Please login to upvote features", {
        description: "You must be authenticated to interact."
      });
      return;
    }
    voteMutation.mutate();
  };

  return (
    <Link
      to={`/features/${feature._id}`}
      className="block group outline-none"
    >
      <Card className="p-5 transition-all hover:bg-muted/50 border-border shadow-sm group-focus-visible:ring-2 ring-ring">
        <div className="flex gap-4">
          {/* Voting Block */}
          <button
            onClick={handleVote}
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] h-14 rounded-md border transition-all",
              feature.hasVoted
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <ChevronUp className="w-5 h-5 -mb-1" strokeWidth={3} />
            <span className="font-bold text-sm">{feature.voteCount}</span>
          </button>

          {/* Content Block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {feature.descriptionMarkdown}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 text-xs font-medium">
              <span className={cn(
                "px-2.5 py-1 rounded-full border whitespace-nowrap flex-shrink-0",
                feature.status === 'under_review' && "bg-secondary text-secondary-foreground border-transparent",
                feature.status === 'planned' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                feature.status === 'in_progress' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                feature.status === 'completed' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              )}>
                {feature.status.replace('_', ' ').toUpperCase()}
              </span>

              <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full border border-transparent whitespace-nowrap flex-shrink-0">
                {feature.category}
              </span>

              <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap flex-shrink-0">
                <MessageSquare className="w-4 h-4" />
                <span>{feature.commentCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap flex-shrink-0">
                <Clock className="w-4 h-4" />
                <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
