-- Script para añadir las columnas faltantes a la tabla snack
-- Ejecutar esto en el editor SQL de Supabase

-- Verificar si las columnas ya existen antes de añadirlas
DO $$ 
BEGIN
    -- Añadir purchase_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'snack' AND column_name = 'purchase_type') THEN
        ALTER TABLE snack ADD COLUMN purchase_type VARCHAR(10) DEFAULT 'box';
    END IF;

    -- Añadir units_per_container si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'snack' AND column_name = 'units_per_container') THEN
        ALTER TABLE snack ADD COLUMN units_per_container INTEGER DEFAULT 1;
    END IF;

    -- Añadir container_cost si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'snack' AND column_name = 'container_cost') THEN
        ALTER TABLE snack ADD COLUMN container_cost DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Añadir containers_purchased si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'snack' AND column_name = 'containers_purchased') THEN
        ALTER TABLE snack ADD COLUMN containers_purchased INTEGER DEFAULT 1;
    END IF;

    -- Añadir unit_cost si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'snack' AND column_name = 'unit_cost') THEN
        ALTER TABLE snack ADD COLUMN unit_cost DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Añadir unit_sale_price si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'snack' AND column_name = 'unit_sale_price') THEN
        ALTER TABLE snack ADD COLUMN unit_sale_price DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Añadir profit_margin_per_unit si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'snack' AND column_name = 'profit_margin_per_unit') THEN
        ALTER TABLE snack ADD COLUMN profit_margin_per_unit DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Migrar datos existentes (solo si las columnas purchase_price y sale_price existen)
DO $$ 
BEGIN
    -- Verificar si las columnas antiguas existen
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'snack' AND column_name = 'purchase_price') AND
       EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'snack' AND column_name = 'sale_price') THEN
        
        -- Migrar datos existentes
        UPDATE snack 
        SET 
            purchase_type = 'box',
            units_per_container = 1,
            container_cost = purchase_price,
            containers_purchased = 1,
            unit_cost = purchase_price,
            unit_sale_price = sale_price,
            profit_margin_per_unit = sale_price - purchase_price
        WHERE units_per_container IS NULL OR units_per_container = 0;
    END IF;
END $$;

-- Crear o reemplazar la función para cálculos automáticos
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

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_calculate_snack_metrics ON snack;
CREATE TRIGGER trigger_calculate_snack_metrics
    BEFORE INSERT OR UPDATE ON snack
    FOR EACH ROW
    EXECUTE FUNCTION calculate_snack_metrics();

-- Actualizar todos los registros existentes
UPDATE snack SET 
    unit_cost = container_cost / units_per_container,
    profit_margin_per_unit = unit_sale_price - (container_cost / units_per_container),
    stock = containers_purchased * units_per_container
WHERE unit_cost = 0 OR profit_margin_per_unit = 0;

-- Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'snack' 
ORDER BY ordinal_position;
