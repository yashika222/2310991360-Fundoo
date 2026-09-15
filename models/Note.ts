import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { NOTE_COLORS, type NoteColor } from '@/lib/validators';

export interface INote extends Document {
  title: string;
  description: string;
  userId: Types.ObjectId;
  color: NoteColor;
  isArchived: boolean;
  isDeleted: boolean;
  labels: string[];
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 5000, default: '' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    color: { type: String, enum: NOTE_COLORS, default: '#FFFFFF' },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    labels: [{ type: String, trim: true }],
    collaborators: {
      type: [{ type: String, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ }],
      validate: {
        validator(value: string[]) {
          return value.length <= 10;
        },
        message: 'Maximum 10 collaborators',
      },
    },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, isDeleted: 1, isArchived: 1 });
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ collaborators: 1, isDeleted: 1 });
noteSchema.index({ userId: 1, updatedAt: -1 });

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

export default Note;
