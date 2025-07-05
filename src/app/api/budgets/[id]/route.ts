import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Budget from "@/models/Budget";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  await Budget.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
