BEGIN;

DROP VIEW IF EXISTS public.v_medicine_pos;

CREATE VIEW public.v_medicine_pos AS
SELECT
  m.medicine_id AS id,
  m.generic_name,
  m.brand_name,
  m.category,
  m.dosage_value::float8 AS dosage_value,
  m.dosage_unit,
  m.form,
  COALESCE(mb.sale_price, mb.purchase_price)::float8 AS price,
  (
    (
      SUM(
        (COALESCE(mb.stock_quantity, 0) * COALESCE(NULLIF(m.sub_units_per_unit, 0), 1)) +
        COALESCE(mb.stock_sub_quantity, 0)
      ) OVER (PARTITION BY m.medicine_id)
    ) / COALESCE(NULLIF(m.sub_units_per_unit, 0), 1)
  )::integer AS total_stock_quantity,
  (
    (
      SUM(
        (COALESCE(mb.stock_quantity, 0) * COALESCE(NULLIF(m.sub_units_per_unit, 0), 1)) +
        COALESCE(mb.stock_sub_quantity, 0)
      ) OVER (PARTITION BY m.medicine_id)
    ) % COALESCE(NULLIF(m.sub_units_per_unit, 0), 1)
  )::integer AS total_stock_sub_quantity,
  m.barcode,
  m.sku,
  m.manufacturer,
  m.requires_prescription,
  m.search_vector,
  m.sub_unit,
  COALESCE(m.sub_units_per_unit, 1) AS sub_units_per_unit,
  m.allow_sub_unit_sale,
  COALESCE(m.min_stock_level, 0) AS min_stock_level,
  mb.batch_id,
  mb.batch_number,
  mb.expiry_date,
  COALESCE(mb.stock_quantity, 0) AS batch_stock_quantity,
  COALESCE(mb.stock_sub_quantity, 0) AS batch_stock_sub_quantity,
  mb.sale_price::float8 AS batch_sale_price,
  mb.sale_sub_unit_price::float8 AS batch_sale_sub_unit_price,
  mb.sale_price::float8 AS global_price,
  (
    (
      COALESCE(mb.stock_quantity, 0) * COALESCE(NULLIF(m.sub_units_per_unit, 0), 1)
    ) + COALESCE(mb.stock_sub_quantity, 0)
  ) <= 0 AS is_out_of_stock,
  (
    (
      (
        COALESCE(mb.stock_quantity, 0) * COALESCE(NULLIF(m.sub_units_per_unit, 0), 1)
      ) + COALESCE(mb.stock_sub_quantity, 0)
    ) > 0
    AND (
      (
        COALESCE(mb.stock_quantity, 0) * COALESCE(NULLIF(m.sub_units_per_unit, 0), 1)
      ) + COALESCE(mb.stock_sub_quantity, 0)
    ) <= (COALESCE(m.min_stock_level, 0) * COALESCE(NULLIF(m.sub_units_per_unit, 0), 1))
  ) AS is_low_stock
FROM public.medicine m
LEFT JOIN public.medicine_batch mb
  ON m.medicine_id = mb.medicine_id
WHERE
  m.is_active = true
  AND (mb.expiry_date > CURRENT_DATE OR mb.expiry_date IS NULL);

ALTER VIEW public.v_medicine_pos OWNER TO postgres;

COMMIT;
