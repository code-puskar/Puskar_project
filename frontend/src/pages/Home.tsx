import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { FeatureCard } from '../components/features/FeatureCard';
import { SubmitFeatureModal } from '../components/features/SubmitFeatureModal';
import type { PaginatedFeatures } from '../types/feature';
import { Search, Plus, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function Home() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtering state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('trending');
  const [page, setPage] = useState(1);

  // Simple debounce for search
  // In a real app, use a custom hook, doing it inline for brevity
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    setTimeout(() => setDebouncedSearch(e.target.value), 500);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['features', { page, search: debouncedSearch, category, status, sort }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort,
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status', status);

      const res = await api.get<{ data: PaginatedFeatures }>(`/features?${params.toString()}`);
      return res.data.data;
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Feature Requests</h1>
          <p className="text-muted-foreground mt-1">Help us shape the future of the product.</p>
        </div>
        
        {user ? (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Request Feature
          </Button>
        ) : (
          <Link to="/login" className={buttonVariants({ variant: "secondary" })}>
            Sign in to Request
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-muted/30 border border-border p-2 rounded-lg flex flex-col md:flex-row gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search features..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-background pl-9 border-border"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select 
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="flex h-10 w-full md:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="All">All Categories</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Integrations">Integrations</option>
              <option value="Performance">Performance</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="flex h-10 w-full md:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="All">All Statuses</option>
              <option value="under_review">Under Review</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="relative flex-1 md:flex-none">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select 
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="flex h-10 w-full md:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
              <option value="most_discussed">Most Discussed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive">Failed to load features.</div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 border border-border rounded-lg">
            <p className="text-muted-foreground text-lg">No feature requests found.</p>
          </div>
        ) : (
          data?.items.map((feature) => (
            <FeatureCard key={feature._id} feature={feature} />
          ))
        )}
      </div>

      {/* Pagination (Simplified) */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button 
            variant="outline"
            disabled={!data.pagination.hasPreviousPage}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm font-medium">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button 
            variant="outline"
            disabled={!data.pagination.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <SubmitFeatureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
