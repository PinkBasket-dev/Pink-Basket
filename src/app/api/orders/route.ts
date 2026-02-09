import sql from "../../../utils/sql";

// 1. Create Order (This is what the Shop uses)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, phone, address, total_cents, items } = body;

    if (!customer_name || !phone || !address || !items) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

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

// 2. Get All Orders (This is what your Admin Dashboard uses)
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

// 3. Update Order Status (This is what the Admin Dropdown uses)
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