import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectToDatabase();
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch transactions: ${error}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    
    const transaction = await Transaction.create({ 
      amount: parseFloat(amount), 
      date, 
      description: description.trim(),
      category
    });
    
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: `Failed to create transaction: ${error}` }, { status: 500 });
  }
}