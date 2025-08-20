-- Migration to add sale_date column to sale table
-- This allows users to specify the date of the sale separately from the creation date

-- Add sale_date column to sale table
ALTER TABLE sale ADD COLUMN IF NOT EXISTS sale_date DATE DEFAULT CURRENT_DATE;

-- Update existing sales to have sale_date = created_at if sale_date is null
UPDATE sale SET sale_date = DATE(created_at) WHERE sale_date IS NULL;

-- Make sale_date NOT NULL after updating existing records
ALTER TABLE sale ALTER COLUMN sale_date SET NOT NULL;

-- Add index for better performance when querying by date
CREATE INDEX IF NOT EXISTS idx_sale_sale_date ON sale(sale_date);

-- Add constraint to ensure sale_date is not in the future
ALTER TABLE sale ADD CONSTRAINT check_sale_date_not_future CHECK (sale_date <= CURRENT_DATE);
