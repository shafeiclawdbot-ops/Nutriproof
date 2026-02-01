-- User Profiles Migration
-- Adds user accounts, preferences, and scan history sync

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    allergens TEXT[] DEFAULT '{}',
    dietary_preferences TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    contribution_count INTEGER DEFAULT 0,
    scans_synced INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan history (synced from device)
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    barcode TEXT NOT NULL,
    product_name TEXT,
    brand TEXT,
    image_url TEXT,
    scanned_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, barcode, scanned_at)
);

-- Favorite products
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    barcode TEXT NOT NULL,
    product_name TEXT,
    brand TEXT,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, barcode)
);

-- Product comparisons saved by user
CREATE TABLE IF NOT EXISTS saved_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT,
    barcodes TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_barcode ON scan_history(barcode);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_comparisons ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own scan history" ON scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" ON scan_history
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own comparisons" ON saved_comparisons
    FOR ALL USING (auth.uid() = user_id);

-- Function to update contribution count
CREATE OR REPLACE FUNCTION update_contribution_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles 
    SET contribution_count = contribution_count + 1,
        updated_at = NOW()
    WHERE id = NEW.contributor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update contribution count
DROP TRIGGER IF EXISTS on_contribution_approved ON contributions;
CREATE TRIGGER on_contribution_approved
    AFTER UPDATE OF status ON contributions
    FOR EACH ROW
    WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
    EXECUTE FUNCTION update_contribution_count();
