export interface Feature {
  _id: string;
  title: string;
  descriptionMarkdown: string;
  category: 'UI/UX' | 'Integrations' | 'Performance' | 'General';
  status: 'under_review' | 'planned' | 'in_progress' | 'completed';
  author: {
    _id: string;
    name: string;
  };
  voteCount: number;
  commentCount: number;
  hasVoted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFeatures {
  items: Feature[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
