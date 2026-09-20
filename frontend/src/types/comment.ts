export interface CommentType {
  _id: string;
  featureRequest: string;
  author: {
    _id: string;
    name: string;
  };
  bodyMarkdown: string;
  parentComment: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
