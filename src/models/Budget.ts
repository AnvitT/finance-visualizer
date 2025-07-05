import mongoose, { Schema, Document } from "mongoose";

export interface IBudget extends Document {
  category: string;
  month: string; // YYYY-MM
  amount: number;
  createdAt: Date;
}

const BudgetSchema = new Schema<IBudget>({
  category: { type: String, required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Budget ||
  mongoose.model<IBudget>("Budget", BudgetSchema);
