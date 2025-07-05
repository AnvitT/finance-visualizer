import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/finance-visualizer";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  await seedDefaultCategories();
  return cached.conn;
}

async function seedDefaultCategories() {
  try {
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      color: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }));

    // Check if "Other" category exists, if not create it
    const otherExists = await Category.findOne({ name: "Other" });
    if (!otherExists) {
      await Category.create({ name: "Other", color: "#8884d8" });
    }

    // Optionally seed some common categories if no categories exist
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount <= 1) { // Only "Other" exists
      const defaultCategories = [
        { name: "Food", color: "#ff6b6b" },
        { name: "Transport", color: "#4ecdc4" },
        { name: "Shopping", color: "#45b7d1" },
        { name: "Bills", color: "#96ceb4" },
        { name: "Entertainment", color: "#feca57" },
        { name: "Health", color: "#ff9ff3" },
      ];

      for (const category of defaultCategories) {
        const exists = await Category.findOne({ name: category.name });
        if (!exists) {
          await Category.create(category);
        }
      }
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

(global as any).mongoose = cached;