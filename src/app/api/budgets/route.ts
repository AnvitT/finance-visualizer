import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Budget from "@/models/Budget";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const filter: Record<string, unknown> = {};
    if (month) filter.month = month;
    const budgets = await Budget.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(budgets);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { category, month, amount } = await req.json();
    
    if (!category || !month || !amount) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    
    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }
    
    let budget = await Budget.findOne({ category, month });
    if (budget) {
      budget.amount = amount;
      await budget.save();
    } else {
      budget = await Budget.create({ category, month, amount });
    }
    return NextResponse.json(budget);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
