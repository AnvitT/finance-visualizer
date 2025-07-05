import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Budget from "@/models/Budget";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deleted = await Budget.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: `Failed to delete budget: ${error}` }, { status: 500 });
  }
}