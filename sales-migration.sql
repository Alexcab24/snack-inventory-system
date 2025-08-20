-- Migration to support multiple items per sale
-- This creates a new sale_item table and updates the sale table structure

-- Create sale_item table
CREATE TABLE IF NOT EXISTS sale_item (
    id_sale_item UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES sale(id_sale) ON DELETE CASCADE,
    snack_id UUID NOT NULL REFERENCES snack(id_snack) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sale_item_sale_id ON sale_item(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_item_snack_id ON sale_item(snack_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sale_item_updated_at 
    BEFORE UPDATE ON sale_item 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing sales data to new structure
-- This will create sale_item records for existing sales
INSERT INTO sale_item (sale_id, snack_id, quantity, unit_price, subtotal)
SELECT 
    s.id_sale,
    s.snack_id,
    s.quantity,
    sn.unit_sale_price,
    s.total
FROM sale s
JOIN snack sn ON s.snack_id = sn.id_snack
WHERE NOT EXISTS (
    SELECT 1 FROM sale_item si WHERE si.sale_id = s.id_sale
);

-- Remove old columns from sale table (after migration)
-- Note: This should be done carefully and only after confirming the migration worked
-- ALTER TABLE sale DROP COLUMN IF EXISTS snack_id;
-- ALTER TABLE sale DROP COLUMN IF EXISTS quantity;
