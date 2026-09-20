import mongoose, { Document, Schema } from 'mongoose';

export interface IFeatureRequest extends Document {
  title: string;
  descriptionMarkdown: string;
  category: 'UI/UX' | 'Integrations' | 'Performance' | 'General';
  status: 'under_review' | 'planned' | 'in_progress' | 'completed';
  author: mongoose.Types.ObjectId;
  voterIds: mongoose.Types.ObjectId[];
  voteCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const featureRequestSchema = new Schema<IFeatureRequest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionMarkdown: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['UI/UX', 'Integrations', 'Performance', 'General'],
      required: true,
    },
    status: {
      type: String,
      enum: ['under_review', 'planned', 'in_progress', 'completed'],
      default: 'under_review',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    voterIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    voteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
featureRequestSchema.index({ author: 1 });
featureRequestSchema.index({ status: 1 });
featureRequestSchema.index({ category: 1 });
featureRequestSchema.index({ createdAt: -1 });
featureRequestSchema.index({ voteCount: -1 });
featureRequestSchema.index({ commentCount: -1 });

// Text index for search
featureRequestSchema.index({
  title: 'text',
  descriptionMarkdown: 'text',
});

export const FeatureRequest = mongoose.model<IFeatureRequest>('FeatureRequest', featureRequestSchema);
