import sql from "../../../utils/sql";
import { sendOrderConfirmation } from "../../../lib/email"; // Import new function
import { NextResponse } from "next/server";

// 1. GET: Fetch All Orders OR Single Order
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch Single Order
      const order = await sql`
        SELECT * FROM orders WHERE id = ${id}
      `;
      if (order.length === 0) {
        return Response.json({ error: "Order not found" }, { status: 404 });
      }
      return Response.json({ order: order[0] });
    } else {
      // Fetch All Orders (Default Admin behavior)
      const orders = await sql`
        SELECT * FROM orders ORDER BY created_at DESC
      `;
      return Response.json({ orders });
    }
  } catch (error) {
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// 2. PUT: Update Order Status & Locations (Robust Version)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, driver_lat, driver_lng, driver_name, driver_id } = body;

    if (!id) {
      return Response.json({ error: "Missing id" }, { status: 400 });
    }

    // 1. Update Status (if provided)
    if (status) {
      try {
        await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      } catch (err) {
        console.error("Error updating status:", err);
        return Response.json({ error: "Failed to update status column" }, { status: 500 });
      }
    }

    // 2. Update Driver Location (if both lat and lng are provided)
    if (driver_lat && driver_lng) {
      try {
        await sql`UPDATE orders SET driver_lat = ${driver_lat}, driver_lng = ${driver_lng} WHERE id = ${id}`;
      } catch (err) {
        console.error("Error updating location:", err);
        // This is the most likely failure point if columns are missing
        return Response.json({ error: "Failed to update location. Do columns driver_lat/lng exist?" }, { status: 500 });
      }
    }

    // 3. Update Driver Name (if provided)
    if (driver_name) {
      try {
        await sql`UPDATE orders SET driver_name = ${driver_name} WHERE id = ${id}`;
      } catch (err) {
        console.error("Error updating name:", err);
        return Response.json({ error: "Failed to update name" }, { status: 500 });
      }
    }

    // 4. Update Driver ID (if provided)
    if (driver_id) {
      try {
        await sql`UPDATE orders SET driver_id = ${driver_id} WHERE id = ${id}`;
      } catch (err) {
        console.error("Error updating driver ID:", err);
        return Response.json({ error: "Failed to update driver ID" }, { status: 500 });
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error("General PUT Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 3. POST: Create Order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destructure the new location fields
    const { customer_name, email, phone, address, customer_lat, customer_lng, total_cents, items, payment_method, transaction_id } = body;

    if (!customer_name || !phone || !address || !items) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Validate Stock & Deduct Inventory
    for (const item of items) {
      const updateResult = await sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.id} AND stock_quantity >= ${item.quantity}
        RETURNING stock_quantity
      `;

      if (updateResult.length === 0) {
        return Response.json(
          { error: `Insufficient stock for "${item.name}".` },
          { status: 400 }
        );
      }
    }

    // 2. Create the Order (Including Customer GPS)
    const result = await sql`
      INSERT INTO orders (customer_name, email, phone, address, customer_lat, customer_lng, total_cents, items, payment_method, transaction_id)
      VALUES (${customer_name}, ${email}, ${phone}, ${address}, ${customer_lat}, ${customer_lng}, ${total_cents}, ${JSON.stringify(items)}, ${payment_method}, ${transaction_id})
      RETURNING id
    `;

    if (result.length > 0) {
      const orderId = result[0].id;
      // Send email logic remains here...
      await sendOrderConfirmation(orderId, email);
    }

    return Response.json({ success: true, orderId: result[0]?.id });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}