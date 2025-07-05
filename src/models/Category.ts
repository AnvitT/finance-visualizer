import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  color: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
