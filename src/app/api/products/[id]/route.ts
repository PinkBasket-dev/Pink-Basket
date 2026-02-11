import sql from "../../../../utils/sql";
import { NextResponse } from "next/server";

// 1. GET: Fetch Single Product (To populate the Edit Form)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await sql`
      SELECT * FROM products WHERE id = ${parseInt(id)}
    `;

    if (!product || product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// 2. PUT: Update Product (Handle Name, Price, Description, Image)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const priceCents = formData.get("price_cents") as string;
    const categoryId = formData.get("category_id") as string;
    const description = formData.get("description") as string || "";
    const sku = formData.get("sku") as string || null;
    const stockQuantity = formData.get("stock_quantity") as string;
    const imageFile = formData.get("image") as File | null;

    // 1. Check if a new image is being uploaded
    let imageUrl = formData.get("existing_image_url") as string; // Keep old by default

    if (imageFile && imageFile.size > 0) {
      // If yes, upload to Cloudinary (You need the upload function here)
      // For simplicity, I'm re-creating the upload logic here or you would import it.
      // Ideally, move uploadImageToCloudinary to a separate utils file.
      // For now, let's assume you just update text fields or I'll add the logic:
      
      const cloudinary = require("cloudinary").v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "pink_basket" },
          (error: any, result: any) => {
            if (error) return reject(error);
            resolve(result?.secure_url);
          }
        );
        uploadStream.end(buffer);
      }) as string;
    }

    // 2. Update Database
    await sql`
      UPDATE products 
      SET 
        name = ${name},
        price_cents = ${parseInt(priceCents) * 100},
        category_id = ${parseInt(categoryId)},
        description = ${description},
        sku = ${sku},
        stock_quantity = ${parseInt(stockQuantity)},
        image_url = ${imageUrl}
      WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// 3. DELETE: Soft Delete (Keep existing functionality)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`
      UPDATE products 
      SET is_active = false 
      WHERE id = ${parseInt(id)}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}