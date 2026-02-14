import { Resend } from 'resend';
import { render } from '@react-email/render';
import InvoiceEmail, { OrderDetails } from '@/lib/emails/Invoice';
import sql from '@/utils/sql'; // Using your existing sql utility

const resend = new Resend(process.env.RESEND_API_KEY);

// Generic function (kept if you need it elsewhere)
export async function sendOrderEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'orders@pinkbasket.store',
      to: to,
      subject: subject,
      html: html,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to send email' };
  }
}

// NEW: Specialized Order Confirmation
// We accept 'customerEmail' as an argument so we don't strictly need a users table (Guest Checkout support)
export async function sendOrderConfirmation(orderId: number, customerEmail?: string) {
  try {
    // 1. Fetch Order Data
    // We select * to get all details, including the email column we will add soon
    const orderResult = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;

    if (!orderResult || orderResult.length === 0) {
      console.error(`Order ${orderId} not found.`);
      return { success: false, error: 'Order not found' };
    }

    const order = orderResult[0];

    // 2. Determine Email Address
    // Priority: 1. Passed argument (from form), 2. Order record (if stored), 3. Fallback
    const recipientEmail = customerEmail || order.email || 'support@pinkbasket.store';

    // 3. Parse Items (Stored as JSON string in DB)
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    // 4. Prepare Data for Template
    const orderDetails: OrderDetails = {
      customerName: order.customer_name,
      orderId: order.id,
      total: order.total_cents,
      date: new Date(order.created_at).toLocaleDateString(),
      items: items,
    };

    // 5. Render React Email to HTML
    const emailHtml = await render(InvoiceEmail({ orderDetails }));

    // 6. Send via Resend
    const { data, error } = await resend.emails.send({
      from: 'Pink Basket <orders@pinkbasket.store>',
      to: [recipientEmail],
      subject: `Order Confirmation #${order.id}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Email sent to ${recipientEmail} for Order #${orderId}`);
    return { success: true, data };

  } catch (error) {
    console.error('Error in sendOrderConfirmation:', error);
    return { success: false, error: 'Internal server error' };
  }
}