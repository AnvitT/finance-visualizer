
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  await connectToDatabase();
  const categories = await Category.find({});
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, color } = await req.json();
    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 });
    }
    
    // Check if category already exists
    const exists = await Category.findOne({ name });
    if (exists) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }
    
    const category = await Category.create({ name, color });
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
