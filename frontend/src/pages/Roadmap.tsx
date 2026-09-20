import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Feature } from '../types/feature';
import { FeatureCard } from '../components/features/FeatureCard';
import { Loader2, Layout } from 'lucide-react';

interface RoadmapData {
  planned: Feature[];
  inProgress: Feature[];
  completed: Feature[];
}

export function Roadmap() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['roadmap'],
    queryFn: async () => {
      const res = await api.get<{ data: RoadmapData }>('/roadmap');
      return res.data.data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (isError || !data) {
    return <div className="text-center py-20 text-destructive">Failed to load roadmap.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <Layout className="w-8 h-8 text-muted-foreground" />
          Public Roadmap
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">See what we're working on and what's coming next.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned Column */}
        <div className="bg-muted/20 border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h2 className="text-lg font-semibold text-foreground">Planned <span className="text-muted-foreground font-normal ml-1">({data.planned.length})</span></h2>
          </div>
          <div className="flex-1 space-y-4">
            {data.planned.map(feature => (
              <FeatureCard key={feature._id} feature={feature} />
            ))}
            {data.planned.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">No items planned yet.</div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-muted/20 border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">In Progress <span className="text-muted-foreground font-normal ml-1">({data.inProgress.length})</span></h2>
          </div>
          <div className="flex-1 space-y-4">
            {data.inProgress.map(feature => (
              <FeatureCard key={feature._id} feature={feature} />
            ))}
            {data.inProgress.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">No items in progress.</div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-muted/20 border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h2 className="text-lg font-semibold text-foreground">Completed <span className="text-muted-foreground font-normal ml-1">({data.completed.length})</span></h2>
          </div>
          <div className="flex-1 space-y-4">
            {data.completed.map(feature => (
              <FeatureCard key={feature._id} feature={feature} />
            ))}
            {data.completed.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">No completed items yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
