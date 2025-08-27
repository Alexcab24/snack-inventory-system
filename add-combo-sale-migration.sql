-- Migration: add combo sale fields to snack
-- Adds sale_type (unit/combo), combo_units, combo_price with constraints

ALTER TABLE snack
ADD COLUMN IF NOT EXISTS sale_type TEXT NOT NULL DEFAULT 'unit',
ADD COLUMN IF NOT EXISTS combo_units INTEGER,
ADD COLUMN IF NOT EXISTS combo_price NUMERIC(10,2);

-- Ensure allowed values for sale_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'snack_sale_type_check'
    ) THEN
        ALTER TABLE snack
        ADD CONSTRAINT snack_sale_type_check
        CHECK (sale_type IN ('unit', 'combo'));
    END IF;
END$$;

-- Validate combo fields depending on sale_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'snack_combo_fields_check'
    ) THEN
        ALTER TABLE snack
        ADD CONSTRAINT snack_combo_fields_check
        CHECK (
            (sale_type = 'unit' AND combo_units IS NULL AND combo_price IS NULL)
            OR
            (sale_type = 'combo' AND combo_units IS NOT NULL AND combo_units > 0 AND combo_price IS NOT NULL AND combo_price > 0)
        );
    END IF;
END$$;

-- Backfill: set sale_type to 'unit' for existing rows (default already ensures this)
UPDATE snack SET sale_type = 'unit' WHERE sale_type IS NULL;

-- Note: unit_sale_price will continue to store the derived price-per-unit for combos.

