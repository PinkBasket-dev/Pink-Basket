import sql from "../../../utils/sql";
import { sendOrderConfirmation } from "../../../lib/email"; // Import new function
import { NextResponse } from "next/server";

// 1. GET: Fetch All Orders (Unchanged)
export async function GET() {
  try {
    const orders = await sql`
      SELECT * FROM orders ORDER BY created_at DESC
    `;
    return Response.json({ orders });
  } catch (error) {
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// 2. PUT: Update Order Status (Unchanged)
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
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// 3. POST: Create Order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // ADD 'email' to destructuring
    const { customer_name, email, phone, address, total_cents, items, payment_method, transaction_id } = body;

    if (!customer_name || !phone || !address || !items) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Validate Stock & Deduct Inventory (Your existing logic is perfect)
    for (const item of items) {
      const updateResult = await sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.id} AND stock_quantity >= ${item.quantity}
        RETURNING stock_quantity
      `;

      if (updateResult.length === 0) {
        return Response.json(
          { error: `Insufficient stock for "${item.name}". Please reduce the quantity and try again.` },
          { status: 400 }
        );
      }
    }

    // 2. Create the Order
    // UPDATED: Added 'email' to the INSERT statement
    const result = await sql`
      INSERT INTO orders (customer_name, email, phone, address, total_cents, items, payment_method, transaction_id)
      VALUES (${customer_name}, ${email}, ${phone}, ${address}, ${total_cents}, ${JSON.stringify(items)}, ${payment_method}, ${transaction_id})
      RETURNING id
    `;

    if (result.length > 0) {
      const orderId = result[0].id;
      
      // 3. Send Email using the new function
      // We pass the email directly from the form (Guest Checkout)
      await sendOrderConfirmation(orderId, email);
    }

    return Response.json({ success: true, orderId: result[0]?.id });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}