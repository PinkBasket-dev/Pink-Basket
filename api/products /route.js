import sql from "@/src/utils/sql";
import { v2 as cloudinary } from "cloudinary";

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload buffer to cloudinary
async function uploadImageToCloudinary(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "pink_basket" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

// 2. GET: Fetch Products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    let products;

    if (categoryId) {
      products = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ${categoryId} 
        AND p.is_active = true
        ORDER BY p.name ASC
      `;
    } else {
      products = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY c.display_order ASC, p.name ASC
      `;
    }

    return Response.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// 3. POST: Add New Product
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name");
    const priceCents = formData.get("price_cents");
    const categoryId = formData.get("category_id");
    const imageFile = formData.get("image");

    if (!name || !priceCents || !categoryId || !imageFile) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // A. Upload Image to Cloudinary
    console.log("Uploading image...");
    const imageUrl = await uploadImageToCloudinary(imageFile);
    console.log("Image uploaded:", imageUrl);

    // B. Save to Database
    await sql`
      INSERT INTO products (name, price_cents, category_id, image_url, is_active)
      VALUES (${name}, ${Math.round(parseFloat(priceCents) * 100)}, ${categoryId}, ${imageUrl}, true)
    `;

    return Response.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error creating product:", error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}