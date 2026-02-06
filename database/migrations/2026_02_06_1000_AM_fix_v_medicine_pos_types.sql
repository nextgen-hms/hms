-- Migration: Fix v_medicine_pos naming and types
-- Date: 2026-02-06 10:00 AM
-- Purpose: 
-- 1. Alias medicine_id as 'id' and global_price as 'price' to match frontend interfaces.
-- 2. Cast NUMERIC prices to float8 to ensure JS returns them as numbers, fixing .toFixed() errors.

BEGIN;

DROP VIEW IF EXISTS public.v_medicine_pos;

CREATE VIEW public.v_medicine_pos AS
 SELECT 
    m.medicine_id AS id,
    m.generic_name,
    m.brand_name,
    m.category,
    m.dosage_value::float8,
    m.dosage_unit,
    m.form,
    m.price::float8 AS price,
    m.stock_quantity AS total_stock_quantity,
    m.stock_sub_quantity AS total_stock_sub_quantity,
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
    mb.sale_price::float8 AS batch_sale_price,
    mb.sale_sub_unit_price::float8 AS batch_sale_sub_unit_price,
    m.price::float8 AS global_price -- Keeping global_price for backward compatibility if needed
   FROM public.medicine m
   LEFT JOIN public.medicine_batch mb ON m.medicine_id = mb.medicine_id
   WHERE m.is_active = true
   AND (mb.expiry_date > CURRENT_DATE OR mb.expiry_date IS NULL);

ALTER VIEW public.v_medicine_pos OWNER TO postgres;

COMMIT;
