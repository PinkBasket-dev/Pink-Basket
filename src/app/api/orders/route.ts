import sql from "../../../utils/sql"; 
import { NextResponse } from "next/server";

// 1. GET: Fetch All Orders (For Admin Dashboard)
export async function GET() {
  try {
    const orders = await sql`
      SELECT * FROM orders ORDER BY created_at DESC
    `;
    return Response.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// 2. PUT: Update Order Status (For Admin Dashboard)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ error: "Missing id or status" }, { status: 400 });
    }

    await sql`
      UPDATE orders SET status = ${status} WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// 3. POST: Create Order (With Stock Validation)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, phone, address, total_cents, items } = body;

    if (!customer_name || !phone || !address || !items) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Validate Stock & Deduct Inventory
    // Note: items is already an array, we don't need to JSON.parse it again
    for (const item of items) {
      
      // Check if stock is sufficient AND subtract in one go.
      // If stock_quantity < item.quantity, this query updates 0 rows.
      const updateResult = await sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.id} AND stock_quantity >= ${item.quantity}
        RETURNING stock_quantity
      `;

      // If updateResult is empty, it means we couldn't fulfill the order (Out of Stock)
      if (updateResult.length === 0) {
        return Response.json(
          { error: `Insufficient stock for "${item.name}". Please reduce the quantity and try again.` },
          { status: 400 }
        );
      }
    }

    // 2. If stock was deducted successfully, Create the Order
    const result = await sql`
      INSERT INTO orders (customer_name, phone, address, total_cents, items)
      VALUES (${customer_name}, ${phone}, ${address}, ${total_cents}, ${JSON.stringify(items)})  
      RETURNING id
    `;

    return Response.json({ success: true, orderId: result[0]?.id });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}