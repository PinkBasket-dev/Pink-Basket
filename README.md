# Pink Basket Database & Logic

This project contains the database schema and business logic implementation for the "Pink Basket" MVP.

## Files

1.  **`schema.sql`**: The raw PostgreSQL SQL commands to create the tables, relationships, types (enums), and initial data.
2.  **`prisma/schema.prisma`**: A [Prisma](https://www.prisma.io/) schema file. This is recommended for Node.js/TypeScript projects as it provides type-safety and easy migrations.
3.  **`src/logic.ts`**: TypeScript implementation of the "Free Delivery" algorithm and Inventory management logic.

## Prerequisites

-   **Node.js** (for Prisma and Logic)
-   **PostgreSQL** (Database)

## Setup Instructions

### 1. Database Setup (SQL approach)

If you prefer using raw SQL or another language:

1.  Create a PostgreSQL database (e.g., `pink_basket`).
2.  Run the contents of `schema.sql` in your database query tool (like pgAdmin, DBeaver, or `psql`).

```bash
psql -d pink_basket -f schema.sql
```

### 2. Database Setup (Prisma approach - Recommended)

If you are using Node.js:

1.  Install dependencies (if not already installed):
    ```bash
    npm install
    npm install prisma --save-dev
    ```
2.  Set your `DATABASE_URL` in a `.env` file:
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/pink_basket?schema=public"
    ```
3.  Push the schema to your database:
    ```bash
    npx prisma db push
    ```

### 3. Logic Implementation

The business logic is located in `src/logic.ts`.

-   **Free Delivery**: Checks if the cart subtotal exceeds the threshold defined in the `settings` table.
-   **Inventory**: Deducts stock when an order is confirmed and automatically deactivates products if stock reaches 0.

To use this logic, you would typically integrate it into your API controllers (e.g., inside an Express route handler).
