-- Migration: unify pharmacy sale details with the live HMS schema
-- Notes:
-- - This is the canonical local representation of the March 19 sale-detail unification.
-- - `2026_03_19_retail_stock_visibility.sql` only rebuilds `v_medicine_pos`; it does not
--   own the override-table removal.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_detail'
      AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_detail'
      AND column_name = 'pharmacy_sale_detail_id'
  ) THEN
    ALTER TABLE public.pharmacy_sale_detail
      RENAME COLUMN id TO pharmacy_sale_detail_id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_detail'
      AND column_name = 'qty'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_detail'
      AND column_name = 'quantity'
  ) THEN
    ALTER TABLE public.pharmacy_sale_detail
      RENAME COLUMN qty TO quantity;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_detail'
      AND column_name = 'unit_price'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_detail'
      AND column_name = 'unit_sale_price'
  ) THEN
    ALTER TABLE public.pharmacy_sale_detail
      RENAME COLUMN unit_price TO unit_sale_price;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_detail'
      AND column_name = 'total_price'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_detail'
      AND column_name = 'line_total'
  ) THEN
    ALTER TABLE public.pharmacy_sale_detail
      RENAME COLUMN total_price TO line_total;
  END IF;
END $$;

ALTER TABLE public.pharmacy_sale_detail
  ADD COLUMN IF NOT EXISTS sub_unit_sale_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS batch_id integer REFERENCES public.medicine_batch(batch_id),
  ADD COLUMN IF NOT EXISTS prescription_medicine_id integer REFERENCES public.prescription_medicines(prescription_medicine_id),
  ADD COLUMN IF NOT EXISTS reason_code text,
  ADD COLUMN IF NOT EXISTS reason_note text,
  ADD COLUMN IF NOT EXISTS handled_by integer REFERENCES public.staff(staff_id),
  ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'pharmacy_sale_override_detail'
  ) THEN
    INSERT INTO public.pharmacy_sale_detail (
      sale_id,
      medicine_id,
      quantity,
      unit_sale_price,
      line_total,
      prescription_medicine_id,
      reason_code,
      reason_note,
      handled_by,
      created_at
    )
    SELECT
      sale_id,
      medicine_id,
      quantity,
      unit_sale_price,
      line_total,
      prescription_medicine_id,
      reason_code,
      reason_note,
      handled_by,
      created_at
    FROM public.pharmacy_sale_override_detail;
  END IF;
END $$;

DROP TABLE IF EXISTS public.pharmacy_sale_override_detail;

COMMIT;
