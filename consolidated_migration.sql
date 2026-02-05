-- CONSOLIDATED HMS MIGRATION SCRIPT (FIXED)
-- Purpose: Apply schema typo fixes and integrate batch tracking into stock logic.
-- Instructions: Run using `psql -U postgres -d hms -f consolidated_migration.sql`

BEGIN;

-- 1. SCHEMA TYPO CORRECTIONS
DO $$ 
BEGIN 
    -- Fix current_pregnancy
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='current_pregnancy' AND column_name='pregnanacy_id') THEN
        ALTER TABLE current_pregnancy RENAME COLUMN pregnanacy_id TO pregnancy_id;
    END IF;
    
    -- Fix Sequences
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname='current_pregnancy_pregnanacy_id_seq') THEN
        ALTER SEQUENCE current_pregnancy_pregnanacy_id_seq RENAME TO current_pregnancy_pregnancy_id_seq;
    END IF;

    -- Fix doctor
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='doctor' AND column_name='consultaion_fee') THEN
        ALTER TABLE doctor RENAME COLUMN consultaion_fee TO consultation_fee;
    END IF;
END $$;


-- 2. UPDATE TRIGGER FUNCTIONS (Batch Aware & Fixed Column Names)

-- Purchase Detail -> Transaction
CREATE OR REPLACE FUNCTION public.fn_tg_purchase_detail_to_txn() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(medicine_id, txn_type, quantity, sub_quantity, amount_per_unit, ref_purchase_id, batch_id)
    VALUES (NEW.medicine_id, 'purchase', NEW.quantity, COALESCE(NEW.sub_quantity, 0), NEW.unit_cost, NEW.purchase_id, NEW.batch_id);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET quantity = NEW.quantity, sub_quantity = COALESCE(NEW.sub_quantity, 0), amount_per_unit = NEW.unit_cost, batch_id = NEW.batch_id
    WHERE ref_purchase_id = NEW.purchase_id AND medicine_id = NEW.medicine_id AND txn_type = 'purchase';
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_purchase_id = OLD.purchase_id AND medicine_id = OLD.medicine_id AND txn_type = 'purchase';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Purchase Return Detail -> Transaction
CREATE OR REPLACE FUNCTION public.fn_tg_purchase_return_detail_to_txn() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(medicine_id, txn_type, quantity, sub_quantity, amount_per_unit, ref_purchase_return_id, batch_id)
    VALUES (NEW.medicine_id, 'purchase_return', NEW.quantity, COALESCE(NEW.sub_quantity, 0), NEW.unit_cost, NEW.purchase_return_id, NEW.batch_id);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET medicine_id = NEW.medicine_id, quantity = NEW.quantity, sub_quantity = COALESCE(NEW.sub_quantity, 0), amount_per_unit = NEW.unit_cost, batch_id = NEW.batch_id
    WHERE ref_purchase_return_id = OLD.purchase_return_id AND medicine_id = OLD.medicine_id AND txn_type = 'purchase_return';
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_purchase_return_id = OLD.purchase_return_id AND medicine_id = OLD.medicine_id AND txn_type = 'purchase_return';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Sale Detail -> Transaction
CREATE OR REPLACE FUNCTION public.fn_tg_sale_detail_to_txn() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(medicine_id, txn_type, quantity, sub_quantity, amount_per_unit, ref_sale_id, batch_id)
    VALUES (NEW.medicine_id, 'sale', NEW.quantity, COALESCE(NEW.sub_quantity, 0), NEW.unit_sale_price, NEW.sale_id, NEW.batch_id);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET quantity = NEW.quantity, sub_quantity = COALESCE(NEW.sub_quantity, 0), amount_per_unit = NEW.unit_sale_price, batch_id = NEW.batch_id
    WHERE ref_sale_id = NEW.sale_id AND medicine_id = NEW.medicine_id AND txn_type = 'sale';
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_sale_id = OLD.sale_id AND medicine_id = OLD.medicine_id AND txn_type = 'sale';
  END IF;
  RETURN NULL;
END;
$$;

-- Sale Return Detail -> Transaction
CREATE OR REPLACE FUNCTION public.fn_tg_sale_return_detail_to_txn() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(medicine_id, txn_type, quantity, sub_quantity, amount_per_unit, ref_sale_return, batch_id)
    VALUES (NEW.medicine_id, 'sale_return', NEW.quantity, COALESCE(NEW.sub_quantity, 0), NEW.unit_sale_price, NEW.return_id, NEW.batch_id);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET quantity = NEW.quantity, sub_quantity = COALESCE(NEW.sub_quantity, 0), amount_per_unit = NEW.unit_sale_price, batch_id = NEW.batch_id
    WHERE ref_sale_return = NEW.return_id AND medicine_id = NEW.medicine_id AND txn_type = 'sale_return';
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_sale_return = OLD.return_id AND medicine_id = OLD.medicine_id AND txn_type = 'sale_return';
  END IF;
  RETURN NEW;
END;
$$;

-- 3. CORE STOCK SYNC LOGIC
CREATE OR REPLACE FUNCTION public.fn_tg_stockquantity_generic() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_sign INTEGER;
    v_sub_units_per_unit INTEGER;
    v_total_sub_units_change INTEGER;
    v_medicine_id INTEGER;
BEGIN
    v_medicine_id := COALESCE(NEW.medicine_id, OLD.medicine_id);

    SELECT sub_units_per_unit INTO v_sub_units_per_unit
    FROM medicine WHERE medicine_id = v_medicine_id;
    
    IF v_sub_units_per_unit IS NULL OR v_sub_units_per_unit = 0 THEN
        v_sub_units_per_unit := 1;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        IF NEW.txn_type IN ('purchase', 'sale_return') THEN v_sign := 1;
        ELSIF NEW.txn_type IN ('sale', 'purchase_return') THEN v_sign := -1;
        ELSIF NEW.txn_type = 'adjustment' THEN v_sign := 1;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.txn_type IN ('purchase', 'sale_return') THEN v_sign := 1;
        ELSE v_sign := -1;
        END IF;
    END IF;

    IF TG_OP = 'INSERT' THEN
        v_total_sub_units_change := (NEW.quantity * v_sub_units_per_unit) + COALESCE(NEW.sub_quantity, 0);
        UPDATE medicine SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE medicine_id = v_medicine_id;
        IF NEW.batch_id IS NOT NULL THEN
            UPDATE medicine_batch SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE batch_id = NEW.batch_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_total_sub_units_change := (OLD.quantity * v_sub_units_per_unit) + COALESCE(OLD.sub_quantity, 0);
        UPDATE medicine SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE medicine_id = v_medicine_id;
        IF OLD.batch_id IS NOT NULL THEN
            UPDATE medicine_batch SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE batch_id = OLD.batch_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        v_total_sub_units_change := (OLD.quantity * v_sub_units_per_unit) + COALESCE(OLD.sub_quantity, 0);
        UPDATE medicine SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE medicine_id = v_medicine_id;
        IF OLD.batch_id IS NOT NULL THEN
            UPDATE medicine_batch SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE batch_id = OLD.batch_id;
        END IF;
        v_total_sub_units_change := (NEW.quantity * v_sub_units_per_unit) + COALESCE(NEW.sub_quantity, 0);
        UPDATE medicine SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE medicine_id = v_medicine_id;
        IF NEW.batch_id IS NOT NULL THEN
            UPDATE medicine_batch SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE batch_id = NEW.batch_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

COMMIT;
