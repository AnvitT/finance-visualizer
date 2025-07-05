
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { name, color } = await req.json();
    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 });
    }
    
    // Check if another category with this name already exists (excluding current one)
    const existingCategory = await Category.findOne({ name, _id: { $ne: params.id } });
    if (existingCategory) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
    }
    
    const updated = await Category.findByIdAndUpdate(params.id, { name, color }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    
    // Allow deleting "Other" category, but warn that it might be recreated
    await Category.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
