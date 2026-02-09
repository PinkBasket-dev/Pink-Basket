import sql from "../../../utils/sql";

// 1. GET: Fetch Categories
export async function GET() {
  try {
    const categories = await sql`
      SELECT * FROM categories ORDER BY display_order ASC
    `;
    return Response.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// 2. POST: Create Category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, display_order } = body;

    if (!name) {
      return Response.json({ error: "Category name is required" }, { status: 400 });
    }

    await sql`
      INSERT INTO categories (name, display_order)
      VALUES (${name}, ${display_order || 99})
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error creating category:", error);
    return Response.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// 3. DELETE: Remove Category
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "Missing id" }, { status: 400 });
    }

    await sql`
      DELETE FROM categories WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return Response.json({ error: "Failed to delete category" }, { status: 500 });
  }
}