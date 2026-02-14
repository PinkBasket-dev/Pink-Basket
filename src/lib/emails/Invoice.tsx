import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";
import * as React from "react";

export interface OrderDetails {
  customerName: string;
  orderId: number;
  total: number;
  items: {
    id: number;
    name: string;
    quantity: number;
    price_cents: number;
  }[];
  date: string;
}

export default function InvoiceEmail({ orderDetails }: { orderDetails: OrderDetails }) {
  const { customerName, orderId, total, items, date } = orderDetails;

  return (
    <Html>
      <Head />
      <Preview>Order Confirmation for Order #{String(orderId)}</Preview>
      
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Pink Basket</Heading>
            <Text style={headerText}>Your order has been confirmed!</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hello {customerName},</Text>
            <Text style={paragraph}>
              Thanks for shopping with Pink Basket. We’ve received your order
              and it’s being processed.
            </Text>
            
            {/* Order Info Box */}
            <div style={box}>
              <Text style={boxText}><strong>Order ID:</strong> #{orderId}</Text>
              <Text style={boxText}><strong>Date:</strong> {date}</Text>
            </div>

            {/* Items */}
            <Heading style={h3}>Order Summary</Heading>
            
            {/* Table Container */}
            <div style={tableContainer}>
              {items.map((item) => (
                <div key={item.id} style={itemRow}>
                  <div>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemQty}>Qty: {item.quantity}</Text>
                  </div>
                  <Text style={itemPrice}>
                    LSL {((item.price_cents * item.quantity) / 100).toFixed(2)}
                  </Text>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={totalContainer}>
              <Text style={totalText}>
                Total Paid: LSL {(total / 100).toFixed(2)}
              </Text>
            </div>
          </Section>

          {/* Button */}
          <Section style={buttonContainer}>
            <Button style={button} href="https://pinkbasket.store/shop">
              Continue Shopping
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Contact us at support@pinkbasket.store
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  backgroundColor: "#ec4899", // Pink-500
  padding: "24px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const headerText = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "5px 0 0 0",
  opacity: 0.9,
};

const content = {
  padding: "0 48px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#525f7f",
  margin: "0 0 24px",
};

const box = {
  padding: "16px",
  backgroundColor: "#fdf2f8", // Pink-50
  borderRadius: "4px",
  marginBottom: "24px",
  border: "1px solid #fbcfe8",
};

const boxText = {
  fontSize: "14px",
  color: "#374151",
  margin: "4px 0",
  display: "block",
};

const h3 = {
  color: "#111827",
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "12px",
};

const tableContainer = {
  border: "1px solid #e5e7eb",
  borderRadius: "4px",
  overflow: "hidden",
  marginBottom: "24px",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  borderBottom: "1px solid #e5e7eb",
};

const itemName = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#111827",
  display: "block",
};

const itemQty = {
  fontSize: "12px",
  color: "#6b7280",
  marginTop: "4px",
  display: "block",
};

const itemPrice = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#111827",
};

const totalContainer = {
  borderTop: "1px solid #e5e7eb",
  paddingTop: "16px",
  textAlign: "right" as const,
  marginTop: "16px",
};

const totalText = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#ec4899", // Pink
};

const buttonContainer = {
  padding: "27px 0 27px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#ec4899",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const footer = {
  borderTop: "1px solid #e5e7eb",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#9ca3af",
};