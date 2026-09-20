import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  descriptionMarkdown: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['UI/UX', 'Integrations', 'Performance', 'General']),
});

type FormValues = z.infer<typeof schema>;

interface SubmitFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitFeatureModal({ isOpen, onClose }: SubmitFeatureModalProps) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'General',
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => api.post('/features', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast.success("Feature request submitted successfully!");
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to submit feature");
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg w-full max-w-lg overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Request a Feature</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              {...register('title')}
              placeholder="E.g. Dark Mode"
            />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select 
              id="category"
              {...register('category')}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="UI/UX">UI/UX</option>
              <option value="Integrations">Integrations</option>
              <option value="Performance">Performance</option>
              <option value="General">General</option>
            </select>
            {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Details (Markdown supported)</Label>
            <Textarea 
              id="desc"
              {...register('descriptionMarkdown')}
              rows={4}
              placeholder="Describe the feature in detail..."
            />
            {errors.descriptionMarkdown && <p className="text-destructive text-sm">{errors.descriptionMarkdown.message}</p>}
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
