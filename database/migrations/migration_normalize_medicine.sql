-- Migration: Normalize Medicine Schema (v2 - Robust)
-- Purpose: Remove redundant stock/price columns from 'medicine' and make 'medicine_batch' the source of truth.

BEGIN;

-- 0. Force drop views to avoid column type/count conflicts
DROP VIEW IF EXISTS public.v_medicine_pos CASCADE;
DROP VIEW IF EXISTS public.v_low_stock_medicines CASCADE;

-- 1. Refactor fn_tg_stockquantity_generic trigger function
CREATE OR REPLACE FUNCTION public.fn_tg_stockquantity_generic()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_sign INTEGER;
    v_sub_units_per_unit INTEGER;
    v_total_sub_units_change INTEGER;
    v_medicine_id INTEGER;
BEGIN
    v_medicine_id := COALESCE(NEW.medicine_id, OLD.medicine_id);
    
    SELECT COALESCE(sub_units_per_unit, 1) INTO v_sub_units_per_unit FROM medicine WHERE medicine_id = v_medicine_id;
    IF v_sub_units_per_unit <= 0 THEN v_sub_units_per_unit := 1; END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        IF NEW.txn_type IN ('purchase', 'sale_return') THEN v_sign := 1;
        ELSIF NEW.txn_type IN ('sale', 'purchase_return') THEN v_sign := -1;
        ELSIF NEW.txn_type = 'adjustment' THEN v_sign := 1;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.txn_type IN ('purchase', 'sale_return') THEN v_sign := -1;
        ELSE v_sign := 1;
        END IF;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.batch_id IS NOT NULL THEN
            v_total_sub_units_change := (NEW.quantity * v_sub_units_per_unit) + COALESCE(NEW.sub_quantity, 0);
            UPDATE medicine_batch 
            SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, 
                stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit 
            WHERE batch_id = NEW.batch_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.batch_id IS NOT NULL THEN
            v_total_sub_units_change := (OLD.quantity * v_sub_units_per_unit) + COALESCE(OLD.sub_quantity, 0);
            UPDATE medicine_batch 
            SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, 
                stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit 
            WHERE batch_id = OLD.batch_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.batch_id IS NOT NULL THEN
            v_total_sub_units_change := (OLD.quantity * v_sub_units_per_unit) + COALESCE(OLD.sub_quantity, 0);
            UPDATE medicine_batch 
            SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, 
                stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit 
            WHERE batch_id = OLD.batch_id;
        END IF;
        IF NEW.batch_id IS NOT NULL THEN
            v_total_sub_units_change := (NEW.quantity * v_sub_units_per_unit) + COALESCE(NEW.sub_quantity, 0);
            UPDATE medicine_batch 
            SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, 
                stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit 
            WHERE batch_id = NEW.batch_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2. Update get_stock_display function
CREATE OR REPLACE FUNCTION public.get_stock_display(p_medicine_id integer)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
 DECLARE
     v_stock_qty INT;
     v_sub_qty INT;
     v_form VARCHAR;
     v_sub_unit VARCHAR;
     v_sub_units_per_unit INT;
     v_total_sub_units BIGINT;
     v_result TEXT;
 BEGIN
     SELECT form, sub_unit, COALESCE(sub_units_per_unit, 1)
     INTO v_form, v_sub_unit, v_sub_units_per_unit
     FROM medicine
     WHERE medicine_id = p_medicine_id;

     SELECT 
        SUM((stock_quantity * v_sub_units_per_unit) + COALESCE(stock_sub_quantity, 0))
     INTO v_total_sub_units
     FROM medicine_batch
     WHERE medicine_id = p_medicine_id AND (expiry_date > CURRENT_DATE OR expiry_date IS NULL);

     v_total_sub_units := COALESCE(v_total_sub_units, 0);
     v_stock_qty := (v_total_sub_units / v_sub_units_per_unit)::integer;
     v_sub_qty := (v_total_sub_units % v_sub_units_per_unit)::integer;

     IF v_sub_units_per_unit <= 1 OR v_sub_qty = 0 THEN
         v_result := v_stock_qty || ' ' || COALESCE(v_form, 'units');
     ELSE
         v_result := v_stock_qty || ' ' || COALESCE(v_form, 'units') || 
                     ' + ' || v_sub_qty || ' ' || COALESCE(v_sub_unit, 'sub-units');
     END IF;

     RETURN v_result;
 END;
 $function$;

-- 3. Update v_medicine_pos view
CREATE VIEW public.v_medicine_pos AS
 SELECT m.medicine_id AS id,
    m.generic_name,
    m.brand_name,
    m.category,
    m.dosage_value::double precision AS dosage_value,
    m.dosage_unit,
    m.form,
    COALESCE(mb.sale_price, mb.purchase_price)::double precision AS price, 
    -- Calculate totals per medicine
    ((SUM((mb.stock_quantity * COALESCE(m.sub_units_per_unit, 1)) + COALESCE(mb.stock_sub_quantity, 0)) OVER(PARTITION BY m.medicine_id)) / COALESCE(NULLIF(m.sub_units_per_unit, 0), 1))::integer AS total_stock_quantity,
    ((SUM((mb.stock_quantity * COALESCE(m.sub_units_per_unit, 1)) + COALESCE(mb.stock_sub_quantity, 0)) OVER(PARTITION BY m.medicine_id)) % COALESCE(NULLIF(m.sub_units_per_unit, 0), 1))::integer AS total_stock_sub_quantity,
    m.barcode,
    m.sku,
    m.manufacturer,
    m.requires_prescription,
    m.search_vector,
    m.sub_unit,
    m.sub_units_per_unit,
    m.allow_sub_unit_sale,
    mb.batch_id,
    mb.batch_number,
    mb.expiry_date,
    mb.stock_quantity AS batch_stock_quantity,
    mb.stock_sub_quantity AS batch_stock_sub_quantity,
    mb.sale_price::double precision AS batch_sale_price,
    mb.sale_sub_unit_price::double precision AS batch_sale_sub_unit_price,
    mb.sale_price::double precision AS global_price
   FROM medicine m
     LEFT JOIN medicine_batch mb ON m.medicine_id = mb.medicine_id
  WHERE m.is_active = true AND (mb.expiry_date > CURRENT_DATE OR mb.expiry_date IS NULL);

-- 4. Update v_low_stock_medicines view
CREATE VIEW public.v_low_stock_medicines AS
 WITH aggregate_stock AS (
    SELECT 
        medicine_id,
        SUM((stock_quantity * COALESCE((SELECT sub_units_per_unit FROM medicine m WHERE m.medicine_id = mb.medicine_id), 1)) + COALESCE(stock_sub_quantity, 0)) as total_sub_units
    FROM medicine_batch mb
    WHERE expiry_date > CURRENT_DATE OR expiry_date IS NULL
    GROUP BY medicine_id
 )
 SELECT m.medicine_id,
    m.brand_name,
    m.generic_name,
    m.category,
    m.min_stock_level,
    public.get_stock_display(m.medicine_id) AS stock_display
   FROM medicine m
   LEFT JOIN aggregate_stock ast ON m.medicine_id = ast.medicine_id
  WHERE m.is_active = true 
    AND COALESCE(ast.total_sub_units, 0) <= (m.min_stock_level * COALESCE(m.sub_units_per_unit, 1))::bigint
  ORDER BY COALESCE(ast.total_sub_units, 0);

-- 5. Drop redundant columns
ALTER TABLE medicine DROP COLUMN IF EXISTS stock_quantity;
ALTER TABLE medicine DROP COLUMN IF EXISTS stock_sub_quantity;
ALTER TABLE medicine DROP COLUMN IF EXISTS price;

COMMIT;
