import sql from "../../../../utils/sql";
import { sendOrderEmail } from "../../../../lib/email"; // <--- THE LINK
import { NextResponse } from "next/server";

// Helper: Generate the Invoice HTML
const generateInvoiceHTML = (order: any, items: any[]) => {
  const total = (order.total_cents / 100).toFixed(2);
  
  const itemsList = items.map((item: any) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <