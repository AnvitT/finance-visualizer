import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  date: string;
  description: string;
  category: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: [
    'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'
  ], default: 'Other' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);