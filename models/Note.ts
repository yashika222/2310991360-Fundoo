import mongoose from 'mongoose';

export const noteFields = {
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 5000 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  color: {
    type: String,
    enum: ['#FFFFFF', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3'],
    default: '#FFFFFF',
  },
  labels: [{ type: String, trim: true }],
  collaborators: [{ type: String, lowercase: true, trim: true }],
};

export function makeNoteSchema() {
  const schema = new mongoose.Schema(noteFields, { timestamps: true });
  schema.index({ userId: 1, updatedAt: -1 });
  return schema;
}

export default mongoose.models.Note || mongoose.model('Note', makeNoteSchema());
