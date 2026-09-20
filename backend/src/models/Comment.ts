import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  featureRequest: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  bodyMarkdown: string;
  parentComment: mongoose.Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    featureRequest: {
      type: Schema.Types.ObjectId,
      ref: 'FeatureRequest',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bodyMarkdown: {
      type: String,
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commentSchema.index({ featureRequest: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ createdAt: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
