-- Migration script to update snack table for container-based purchasing and unit-based selling
-- Run this script in your Supabase SQL editor

-- Step 1: Add new columns to the snack table
ALTER TABLE snack 
ADD COLUMN purchase_type VARCHAR(10) DEFAULT 'box',
ADD COLUMN units_per_container INTEGER DEFAULT 1,
ADD COLUMN container_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN containers_purchased INTEGER DEFAULT 1,
ADD COLUMN unit_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN unit_sale_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN profit_margin_per_unit DECIMAL(10,2) DEFAULT 0;

-- Step 2: Migrate existing data
-- For existing snacks, we'll set default values based on current data
UPDATE snack 
SET 
    purchase_type = 'box',
    units_per_container = 1,
    container_cost = purchase_price,
    containers_purchased = 1,
    unit_cost = purchase_price,
    unit_sale_price = sale_price,
    profit_margin_per_unit = sale_price - purchase_price
WHERE units_per_container IS NULL;

-- Step 3: Drop old columns (optional - you can keep them for backup)
-- ALTER TABLE snack DROP COLUMN purchase_price;
-- ALTER TABLE snack DROP COLUMN sale_price;
-- ALTER TABLE snack DROP COLUMN profit_margin;

-- Step 4: Add constraints
ALTER TABLE snack 
ALTER COLUMN purchase_type SET NOT NULL,
ALTER COLUMN units_per_container SET NOT NULL,
ALTER COLUMN container_cost SET NOT NULL,
ALTER COLUMN containers_purchased SET NOT NULL,
ALTER COLUMN unit_cost SET NOT NULL,
ALTER COLUMN unit_sale_price SET NOT NULL,
ALTER COLUMN profit_margin_per_unit SET NOT NULL;

-- Step 5: Add check constraints for data integrity
ALTER TABLE snack 
ADD CONSTRAINT check_purchase_type_valid CHECK (purchase_type IN ('box', 'bag')),
ADD CONSTRAINT check_units_per_container_positive CHECK (units_per_container > 0),
ADD CONSTRAINT check_container_cost_positive CHECK (container_cost > 0),
ADD CONSTRAINT check_containers_purchased_positive CHECK (containers_purchased > 0),
ADD CONSTRAINT check_unit_cost_positive CHECK (unit_cost > 0),
ADD CONSTRAINT check_unit_sale_price_positive CHECK (unit_sale_price > 0);

-- Step 6: Create a function to automatically calculate unit_cost, profit_margin_per_unit, and stock
CREATE OR REPLACE FUNCTION calculate_snack_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate unit cost
    NEW.unit_cost = NEW.container_cost / NEW.units_per_container;
    
    -- Calculate profit margin per unit
    NEW.profit_margin_per_unit = NEW.unit_sale_price - NEW.unit_cost;
    
    -- Calculate stock (total units available)
    NEW.stock = NEW.containers_purchased * NEW.units_per_container;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to automatically update calculations
CREATE TRIGGER trigger_calculate_snack_metrics
    BEFORE INSERT OR UPDATE ON snack
    FOR EACH ROW
    EXECUTE FUNCTION calculate_snack_metrics();

-- Step 8: Update all existing records to recalculate metrics
UPDATE snack SET 
    unit_cost = container_cost / units_per_container,
    profit_margin_per_unit = unit_sale_price - (container_cost / units_per_container),
    stock = containers_purchased * units_per_container;

-- Verification queries (run these to check the migration)
-- SELECT id_snack, name, purchase_type, units_per_container, containers_purchased, container_cost, unit_cost, unit_sale_price, profit_margin_per_unit, stock FROM snack LIMIT 5;
