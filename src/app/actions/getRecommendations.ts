"use server";

import sql from "@/utils/sql";

// Added categoryId parameter
export async function getRecommendations(currentProductId: number, categoryId: number) {
  try {
    // 1. TRY AI: Collaborative Filtering (What people bought together)
    const aiRecommendations = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.price_cents, 
        p.image_url,
        COUNT(p.id) as score
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      WHERE oi.order_id IN (
        SELECT order_id FROM order_items WHERE product_id = ${currentProductId}
      )
      AND p.id != ${currentProductId}
      GROUP BY p.id
      ORDER BY score DESC
      LIMIT 4
    `;

    // 2. IF AI RETURNS RESULTS, use them
    if (aiRecommendations.length > 0) {
      return { success: true, data: aiRecommendations, source: "AI" };
    }

    // 3. FALLBACK: If no data, recommend from same category
    console.log(`No order history for product ${currentProductId}, using Category Fallback.`);
    const categoryRecommendations = await sql`
      SELECT 
        id, 
        name, 
        price_cents, 
        image_url
      FROM products
      WHERE category_id = ${categoryId}
      AND id != ${currentProductId}
      ORDER BY RANDOM() -- Randomize so it's not the same order every time
      LIMIT 4
    `;

    return { success: true, data: categoryRecommendations, source: "Category" };

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return { success: false, data: [] };
  }
}