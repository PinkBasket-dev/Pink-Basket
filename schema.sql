-- Database Schema for Pink Basket (PostgreSQL)

-- Enable UUID extension if we decide to use UUIDs later (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    default_address_id INT -- Placeholder for future addresses table
);

-- 2. Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    display_order INT DEFAULT 0,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_cents INT NOT NULL, -- Stored in cents to avoid rounding errors
    image_url VARCHAR(255) NOT NULL,
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sku VARCHAR(50)
);

-- 4. Settings Table
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

-- Initial Data for Settings
INSERT INTO settings (key, value) VALUES
('free_delivery_threshold_cents', '10000'), -- LSL100.00
('base_delivery_fee_cents', '1500'),      -- LSL15.00
('store_pickup_enabled', 'true'),
('delivery_enabled', 'true');

-- Enums for Orders
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE order_type_enum AS ENUM ('pickup', 'delivery');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed');

-- 5. Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    status order_status_enum NOT NULL,
    order_type order_type_enum NOT NULL,
    subtotal_cents INT NOT NULL,
    delivery_fee_cents INT NOT NULL,
    total_cents INT NOT NULL,
    payment_status payment_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    price_at_purchase_cents INT NOT NULL -- Snapshot of price
);

-- Indexes for performance (optional but recommended)
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
