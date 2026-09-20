import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, User as UserIcon, MessageSquare, LayoutList, Settings } from 'lucide-react';
import { FeatureCard } from '../components/features/FeatureCard';
import type { Feature } from '../types/feature';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function Profile() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'features' | 'comments' | 'settings'>('features');

  const { data: features, isLoading: isFeaturesLoading } = useQuery({
    queryKey: ['my_features'],
    queryFn: async () => {
      const res = await api.get<{ data: { features: Feature[] } }>('/users/me/features');
      return res.data.data.features;
    },
    enabled: !!user,
  });

  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['my_comments'],
    queryFn: async () => {
      const res = await api.get<{ data: { comments: any[] } }>('/users/me/comments');
      return res.data.data.comments;
    },
    enabled: !!user,
  });

  if (isAuthLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
          <UserIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('features')}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === 'features' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          )}
        >
          <LayoutList className="w-4 h-4" />
          My Features
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === 'comments' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          My Comments
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === 'settings' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'features' && (
          <div className="space-y-4">
            {isFeaturesLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : features?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-border">
                You haven't requested any features yet.
              </div>
            ) : (
              features?.map(feature => (
                <FeatureCard key={feature._id} feature={feature} />
              ))
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {isCommentsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : comments?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-border">
                You haven't commented on any features yet.
              </div>
            ) : (
              comments?.map(comment => (
                <Card key={comment._id} className="p-4 shadow-sm border border-border bg-card">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    Commented on: <Link to={`/features/${comment.featureRequest._id}`} className="font-medium text-primary hover:underline">{comment.featureRequest.title}</Link>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none text-foreground">
                    {comment.bodyMarkdown}
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-md">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Name</div>
                  <div className="text-foreground">{user.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                  <div className="text-foreground">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Role</div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {user.role}
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-border">
                  <Button variant="destructive" onClick={logout} className="w-full">
                    Logout
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
