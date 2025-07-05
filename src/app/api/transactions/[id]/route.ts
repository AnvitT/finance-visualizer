import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Category from "@/models/Category";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const deleted = await Transaction.findByIdAndDelete(params.id);
    
    if (!deleted) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { amount, date, description, category } = await req.json();
    
    if (!amount || !date || !description || !category) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }
    
    // Check if category exists in database or is "Other"
    const categories = await Category.find({});
    const categoryNames = categories.map(cat => cat.name);
    if (!categoryNames.includes("Other")) {
      categoryNames.push("Other"); // Ensure "Other" is always allowed
    }
    
    if (!categoryNames.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    
    const updated = await Transaction.findByIdAndUpdate(
      params.id,
      { amount: parseFloat(amount), date, description: description.trim(), category },
      { new: true }
    );
    
    if (!updated) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}