-- Nutriproof Database Schema
-- Run this in Supabase SQL Editor after creating project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table (approved community contributions)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT,
    image_url TEXT,
    ingredients_text TEXT,
    ingredients_parsed JSONB DEFAULT '[]'::jsonb,
    nutrition JSONB DEFAULT '{}'::jsonb,
    categories JSONB DEFAULT '[]'::jsonb,
    allergens JSONB DEFAULT '[]'::jsonb,
    additives JSONB DEFAULT '[]'::jsonb,
    source TEXT DEFAULT 'community', -- 'community' or 'openfoodfacts'
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contributions table (pending user submissions)
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode TEXT NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT,
    image_url TEXT,
    ingredients_text TEXT,
    ingredients_parsed JSONB DEFAULT '[]'::jsonb,
    contributor_id UUID,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    upvotes INTEGER DEFAULT 0,
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Users table (optional, for tracking contributors)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT UNIQUE,
    nickname TEXT,
    contributions_count INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_contributions_barcode ON contributions(barcode);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);

-- Function to increment upvotes
CREATE OR REPLACE FUNCTION increment_upvotes(contribution_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE contributions 
    SET upvotes = upvotes + 1 
    WHERE id = contribution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve contribution and create product
CREATE OR REPLACE FUNCTION approve_contribution(contrib_id UUID)
RETURNS void AS $$
DECLARE
    contrib contributions%ROWTYPE;
BEGIN
    -- Get the contribution
    SELECT * INTO contrib FROM contributions WHERE id = contrib_id;
    
    -- Insert into products (or update if exists)
    INSERT INTO products (barcode, product_name, brand, image_url, ingredients_text, ingredients_parsed, source)
    VALUES (contrib.barcode, contrib.product_name, contrib.brand, contrib.image_url, contrib.ingredients_text, contrib.ingredients_parsed, 'community')
    ON CONFLICT (barcode) DO UPDATE SET
        product_name = EXCLUDED.product_name,
        brand = EXCLUDED.brand,
        image_url = COALESCE(EXCLUDED.image_url, products.image_url),
        ingredients_text = EXCLUDED.ingredients_text,
        ingredients_parsed = EXCLUDED.ingredients_parsed,
        updated_at = NOW();
    
    -- Update contribution status
    UPDATE contributions SET status = 'approved', reviewed_at = NOW() WHERE id = contrib_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved products
CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (status = 'approved');

-- Allow anyone to insert contributions
CREATE POLICY "Anyone can submit contributions" ON contributions
    FOR INSERT WITH CHECK (true);

-- Allow anyone to read contributions (for upvoting display)
CREATE POLICY "Contributions are publicly readable" ON contributions
    FOR SELECT USING (true);

-- Storage bucket for product images
-- Run in Supabase Dashboard > Storage > Create bucket: "product-images" (public)

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT, INSERT ON contributions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_upvotes TO anon, authenticated;
