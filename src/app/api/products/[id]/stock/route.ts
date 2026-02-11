import sql from "../../../../../utils/sql"; 
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id); 
    const body = await request.json();
    const { stock_quantity } = body;

    if (isNaN(stock_quantity)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

     await sql`
      UPDATE products 
      SET stock_quantity = ${stock_quantity}
      WHERE id = ${idNum}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}