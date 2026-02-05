--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: check_stock_available(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_stock_available(p_medicine_id integer, p_requested_qty integer, p_requested_sub_qty integer DEFAULT 0) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_stock_qty INTEGER;
    v_sub_qty INTEGER;
    v_sub_units_per_unit INTEGER;
    v_total_available_sub_units INTEGER;
    v_total_requested_sub_units INTEGER;
BEGIN
    SELECT 
        stock_quantity, 
        stock_sub_quantity, 
        sub_units_per_unit
    INTO 
        v_stock_qty, 
        v_sub_qty, 
        v_sub_units_per_unit
    FROM medicine
    WHERE medicine_id = p_medicine_id;
    
    -- Handle medicines without sub-units
    IF v_sub_units_per_unit IS NULL OR v_sub_units_per_unit = 0 THEN
        v_sub_units_per_unit := 1;
    END IF;
    
    -- Convert everything to sub-units for comparison
    v_total_available_sub_units := (v_stock_qty * v_sub_units_per_unit) + COALESCE(v_sub_qty, 0);
    v_total_requested_sub_units := (p_requested_qty * v_sub_units_per_unit) + COALESCE(p_requested_sub_qty, 0);
    
    RETURN v_total_available_sub_units >= v_total_requested_sub_units;
END;
$$;


ALTER FUNCTION public.check_stock_available(p_medicine_id integer, p_requested_qty integer, p_requested_sub_qty integer) OWNER TO postgres;

--
-- Name: fn_tg_purchase_detail_to_txn(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_tg_purchase_detail_to_txn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(
      medicine_id, 
      txn_type, 
      quantity, 
      sub_quantity,
      amount_per_unit, 
      ref_purchase_id
    )
    VALUES (
      NEW.medicine_id, 
      'purchase', 
      NEW.quantity,
      COALESCE(NEW.sub_quantity, 0),
      NEW.unit_cost, 
      NEW.purchase_id
    );

  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET quantity = NEW.quantity,
        sub_quantity = COALESCE(NEW.sub_quantity, 0),
        amount_per_unit = NEW.unit_cost
    WHERE ref_purchase_id = NEW.purchase_id
      AND medicine_id = NEW.medicine_id
      AND txn_type = 'purchase';

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_purchase_id = OLD.purchase_id
      AND medicine_id = OLD.medicine_id
      AND txn_type = 'purchase';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.fn_tg_purchase_detail_to_txn() OWNER TO postgres;

--
-- Name: fn_tg_purchase_return_detail_to_txn(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_tg_purchase_return_detail_to_txn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(
      medicine_id, 
      txn_type, 
      quantity, 
      sub_quantity,
      amount_per_unit, 
      ref_purchase_return_id
    )
    VALUES (
      NEW.medicine_id, 
      'purchase_return', 
      NEW.quantity,
      COALESCE(NEW.sub_quantity, 0),
      NEW.unit_cost, 
      NEW.purchase_return_id
    );

  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET medicine_id = NEW.medicine_id,
        quantity = NEW.quantity,
        sub_quantity = COALESCE(NEW.sub_quantity, 0),
        amount_per_unit = NEW.unit_cost
    WHERE ref_purchase_return_id = OLD.purchase_return_id
      AND medicine_id = OLD.medicine_id
      AND txn_type = 'purchase_return';

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_purchase_return_id = OLD.purchase_return_id
      AND medicine_id = OLD.medicine_id
      AND txn_type = 'purchase_return';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.fn_tg_purchase_return_detail_to_txn() OWNER TO postgres;

--
-- Name: fn_tg_sale_detail_to_txn(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_tg_sale_detail_to_txn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(
      medicine_id, 
      txn_type, 
      quantity, 
      sub_quantity,
      amount_per_unit, 
      ref_sale_id
    )
    VALUES (
      NEW.medicine_id, 
      'sale', 
      NEW.qty,
      COALESCE(NEW.sub_quantity, 0),
      NEW.unit_price, 
      NEW.sale_id
    );
  
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET quantity = NEW.qty,
        sub_quantity = COALESCE(NEW.sub_quantity, 0),
        amount_per_unit = NEW.unit_price
    WHERE ref_sale_id = NEW.sale_id
      AND medicine_id = NEW.medicine_id
      AND txn_type = 'sale';

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_sale_id = OLD.sale_id
      AND medicine_id = OLD.medicine_id
      AND txn_type = 'sale';
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION public.fn_tg_sale_detail_to_txn() OWNER TO postgres;

--
-- Name: fn_tg_sale_return_detail_to_txn(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_tg_sale_return_detail_to_txn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(
      medicine_id,
      txn_type,
      quantity,
      sub_quantity,
      amount_per_unit,
      ref_sale_return
    )
    VALUES (
      NEW.medicine_id,
      'sale_return',
      NEW.qty,
      COALESCE(NEW.sub_quantity, 0),
      NEW.unit_price,
      NEW.return_id
    );
  
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET quantity = NEW.qty,
        sub_quantity = COALESCE(NEW.sub_quantity, 0),
        amount_per_unit = NEW.unit_price
    WHERE ref_sale_return = NEW.return_id
      AND medicine_id = NEW.medicine_id
      AND txn_type = 'sale_return';

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_sale_return = OLD.return_id
      AND medicine_id = OLD.medicine_id
      AND txn_type = 'sale_return';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_tg_sale_return_detail_to_txn() OWNER TO postgres;

--
-- Name: fn_tg_stockquantity_generic(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_tg_stockquantity_generic() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_sign INTEGER;
    v_sub_units_per_unit INTEGER;
    v_total_sub_units_change INTEGER;
    v_current_stock INTEGER;
    v_current_sub_stock INTEGER;
    v_current_total_sub_units INTEGER;
    v_new_total_sub_units INTEGER;
    v_new_full_units INTEGER;
    v_new_sub_units INTEGER;
BEGIN
    -- Get medicine configuration and current stock
    SELECT sub_units_per_unit, stock_quantity, stock_sub_quantity
    INTO v_sub_units_per_unit, v_current_stock, v_current_sub_stock
    FROM medicine 
    WHERE medicine_id = COALESCE(NEW.medicine_id, OLD.medicine_id);
    
    -- Handle medicines without sub-units (default to 1)
    IF v_sub_units_per_unit IS NULL OR v_sub_units_per_unit = 0 THEN
        v_sub_units_per_unit := 1;
    END IF;
    
    -- Determine sign based on transaction type
    IF NEW.txn_type = 'purchase' THEN 
        v_sign := 1;
    ELSIF NEW.txn_type = 'sale' THEN
        v_sign := -1;
    ELSIF NEW.txn_type = 'purchase_return' THEN 
        v_sign := -1;
    ELSIF NEW.txn_type = 'sale_return' THEN
        v_sign := 1;
    ELSE
        RAISE EXCEPTION 'Unknown txn_type: %', NEW.txn_type;
    END IF;

    IF TG_OP = 'INSERT' THEN
        -- Convert transaction to total sub-units
        v_total_sub_units_change := (NEW.quantity * v_sub_units_per_unit) + COALESCE(NEW.sub_quantity, 0);
        
        -- Calculate current total sub-units in stock
        v_current_total_sub_units := (v_current_stock * v_sub_units_per_unit) + COALESCE(v_current_sub_stock, 0);
        
        -- Apply the change
        v_new_total_sub_units := v_current_total_sub_units + (v_sign * v_total_sub_units_change);
        
        -- Split back into full units and remaining sub-units
        v_new_full_units := v_new_total_sub_units / v_sub_units_per_unit;
        v_new_sub_units := v_new_total_sub_units % v_sub_units_per_unit;
        
        -- Update stock
        UPDATE medicine 
        SET stock_quantity = v_new_full_units,
            stock_sub_quantity = v_new_sub_units
        WHERE medicine_id = NEW.medicine_id;

    ELSIF TG_OP = 'DELETE' THEN
        -- Convert OLD transaction to total sub-units
        v_total_sub_units_change := (OLD.quantity * v_sub_units_per_unit) + COALESCE(OLD.sub_quantity, 0);
        
        v_current_total_sub_units := (v_current_stock * v_sub_units_per_unit) + COALESCE(v_current_sub_stock, 0);
        v_new_total_sub_units := v_current_total_sub_units - (v_sign * v_total_sub_units_change);
        
        v_new_full_units := v_new_total_sub_units / v_sub_units_per_unit;
        v_new_sub_units := v_new_total_sub_units % v_sub_units_per_unit;
        
        UPDATE medicine
        SET stock_quantity = v_new_full_units,
            stock_sub_quantity = v_new_sub_units
        WHERE medicine_id = OLD.medicine_id;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Calculate OLD transaction effect
        v_total_sub_units_change := (OLD.quantity * v_sub_units_per_unit) + COALESCE(OLD.sub_quantity, 0);
        v_current_total_sub_units := (v_current_stock * v_sub_units_per_unit) + COALESCE(v_current_sub_stock, 0);
        
        -- Remove OLD effect
        v_current_total_sub_units := v_current_total_sub_units - (v_sign * v_total_sub_units_change);
        
        -- Calculate NEW transaction effect
        v_total_sub_units_change := (NEW.quantity * v_sub_units_per_unit) + COALESCE(NEW.sub_quantity, 0);
        
        -- Add NEW effect
        v_new_total_sub_units := v_current_total_sub_units + (v_sign * v_total_sub_units_change);
        
        v_new_full_units := v_new_total_sub_units / v_sub_units_per_unit;
        v_new_sub_units := v_new_total_sub_units % v_sub_units_per_unit;
        
        UPDATE medicine
        SET stock_quantity = v_new_full_units,
            stock_sub_quantity = v_new_sub_units
        WHERE medicine_id = NEW.medicine_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.fn_tg_stockquantity_generic() OWNER TO postgres;

--
-- Name: get_clinic_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clinic_number() RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare 
	v_max_clinic_number int;
	v_next_number int;
begin 
   select max(clinic_number)
   into v_max_clinic_number
   from visit
   where
   visit_timestamp >= current_date
   and 
   visit_timestamp < current_date + interval '1 day';

   if v_max_clinic_number is null then
   		v_next_number :=1;
	else
		v_next_number := v_max_clinic_number +1;
	end if;

	return v_next_number;
	
end;
$$;


ALTER FUNCTION public.get_clinic_number() OWNER TO postgres;

--
-- Name: get_clinic_number(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clinic_number(p_patient_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare 
	v_max_clinic_number int;
	v_next_number int;
begin 
   select max(clinic_number)
   into v_max_clinic_number
   from visit
   where
   visit_timestamp >= current_date
   and 
   visit_timestamp < current_date + interval '1 day';

   if v_max_clinic_number is null then
   		v_next_number :=1;
	else
		v_next_number := v_max_clinic_number +1;
	end if;

	return v_next_number;
	
end;
$$;


ALTER FUNCTION public.get_clinic_number(p_patient_id integer) OWNER TO postgres;

--
-- Name: get_stock_display(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_stock_display(p_medicine_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_stock_qty INTEGER;
    v_sub_qty INTEGER;
    v_form VARCHAR(50);
    v_sub_unit VARCHAR(20);
    v_sub_units_per_unit INTEGER;
    v_result TEXT;
BEGIN
    SELECT 
        stock_quantity, 
        stock_sub_quantity, 
        form, 
        sub_unit,
        sub_units_per_unit
    INTO 
        v_stock_qty, 
        v_sub_qty, 
        v_form, 
        v_sub_unit,
        v_sub_units_per_unit
    FROM medicine
    WHERE medicine_id = p_medicine_id;
    
    -- If no sub-units configured or no loose sub-units
    IF v_sub_units_per_unit IS NULL OR v_sub_units_per_unit = 0 OR v_sub_qty = 0 THEN
        v_result := v_stock_qty || ' ' || COALESCE(v_form, 'units');
    ELSE
        v_result := v_stock_qty || ' ' || COALESCE(v_form, 'units') || 
                    ' + ' || v_sub_qty || ' ' || COALESCE(v_sub_unit, 'sub-units');
    END IF;
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION public.get_stock_display(p_medicine_id integer) OWNER TO postgres;

--
-- Name: medicine_search_vector_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.medicine_search_vector_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.generic_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.brand_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.medicine_search_vector_update() OWNER TO postgres;

--
-- Name: update_and_log_visit_status(integer, character varying, integer, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.update_and_log_visit_status(IN p_visit_id integer, IN p_status character varying, IN p_updated_by_doctor integer, IN p_updated_by_staff integer)
    LANGUAGE plpgsql
    AS $$
begin
	update visit
	set status =p_status
	where visit_id =p_visit_id;

	insert into visit_status_history(visit_id,status,updated_by_staff,updated_by_doctor)
	values(
		p_visit_id,
		p_status,
		p_updated_by_doctor,
		p_updated_by_staff
	);
end;
$$;


ALTER PROCEDURE public.update_and_log_visit_status(IN p_visit_id integer, IN p_status character varying, IN p_updated_by_doctor integer, IN p_updated_by_staff integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill (
    bill_id integer NOT NULL,
    patient_id integer NOT NULL,
    visit_id integer NOT NULL,
    total_amount numeric(10,2),
    payment_status character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bill_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['Paid'::character varying, 'Unpaid'::character varying, 'Partial'::character varying])::text[])))
);


ALTER TABLE public.bill OWNER TO postgres;

--
-- Name: bill_bill_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bill_bill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bill_bill_id_seq OWNER TO postgres;

--
-- Name: bill_bill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bill_bill_id_seq OWNED BY public.bill.bill_id;


--
-- Name: bill_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_item (
    item_id integer NOT NULL,
    bill_id integer NOT NULL,
    description character varying(255),
    amount numeric(10,2) NOT NULL,
    quantity integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bill_item OWNER TO postgres;

--
-- Name: bill_item_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bill_item_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bill_item_item_id_seq OWNER TO postgres;

--
-- Name: bill_item_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bill_item_item_id_seq OWNED BY public.bill_item.item_id;


--
-- Name: current_pregnancy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.current_pregnancy (
    pregnanacy_id integer NOT NULL,
    patient_id integer NOT NULL,
    visit_id integer NOT NULL,
    multiple_pregnancy boolean,
    complications text,
    ultrasound_findings text,
    fetal_heart_rate_bpm integer,
    placenta_position character varying(50),
    presentation character varying(50),
    gestational_age_weeks integer,
    notes text
);


ALTER TABLE public.current_pregnancy OWNER TO postgres;

--
-- Name: current_pregnancy_pregnanacy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.current_pregnancy_pregnanacy_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.current_pregnancy_pregnanacy_id_seq OWNER TO postgres;

--
-- Name: current_pregnancy_pregnanacy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.current_pregnancy_pregnanacy_id_seq OWNED BY public.current_pregnancy.pregnanacy_id;


--
-- Name: doctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor (
    doctor_id integer NOT NULL,
    user_code character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    doctor_name character varying(50) NOT NULL,
    specialization character varying(100) NOT NULL,
    education character varying(255),
    consultaion_fee numeric(10,2) NOT NULL,
    emergency_fee numeric(10,2) NOT NULL,
    contact_number character varying(20),
    email character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctor OWNER TO postgres;

--
-- Name: doctor_doctor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_doctor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_doctor_id_seq OWNER TO postgres;

--
-- Name: doctor_doctor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_doctor_id_seq OWNED BY public.doctor.doctor_id;


--
-- Name: lab_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_order (
    order_id integer NOT NULL,
    visit_id integer NOT NULL,
    test_id integer NOT NULL,
    ordered_by integer NOT NULL,
    performed_by integer,
    status character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    urgency character varying(50) DEFAULT 'Routine'::character varying NOT NULL,
    results_entered_at timestamp without time zone,
    results_entered_by integer,
    finalized_at timestamp without time zone,
    finalized_by integer,
    CONSTRAINT lab_order_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Performed'::character varying, 'Completed'::character varying])::text[]))),
    CONSTRAINT lab_order_urgency_check CHECK (((urgency)::text = ANY ((ARRAY['STAT'::character varying, 'Urgent'::character varying, 'Routine'::character varying, 'Timed'::character varying])::text[])))
);


ALTER TABLE public.lab_order OWNER TO postgres;

--
-- Name: lab_order_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_order_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_order_order_id_seq OWNER TO postgres;

--
-- Name: lab_order_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_order_order_id_seq OWNED BY public.lab_order.order_id;


--
-- Name: lab_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_result (
    order_id integer NOT NULL,
    lab_result text,
    reported_by integer NOT NULL,
    reported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    result_id integer NOT NULL
);


ALTER TABLE public.lab_result OWNER TO postgres;

--
-- Name: lab_result_approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_result_approvals (
    approval_id integer NOT NULL,
    order_id integer NOT NULL,
    approved_by integer NOT NULL,
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    approval_notes text,
    approved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    signature_data text
);


ALTER TABLE public.lab_result_approvals OWNER TO postgres;

--
-- Name: lab_result_approvals_approval_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_result_approvals_approval_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_result_approvals_approval_id_seq OWNER TO postgres;

--
-- Name: lab_result_approvals_approval_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_result_approvals_approval_id_seq OWNED BY public.lab_result_approvals.approval_id;


--
-- Name: lab_result_result_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_result_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_result_result_id_seq OWNER TO postgres;

--
-- Name: lab_result_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_result_result_id_seq OWNED BY public.lab_result.result_id;


--
-- Name: lab_test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_test (
    test_id integer NOT NULL,
    test_name character varying(100) NOT NULL,
    category character varying(50),
    price numeric(10,2),
    description text
);


ALTER TABLE public.lab_test OWNER TO postgres;

--
-- Name: lab_test_parameters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_test_parameters (
    parameter_id integer NOT NULL,
    test_id integer NOT NULL,
    parameter_name character varying(100) NOT NULL,
    parameter_code character varying(50),
    unit character varying(50),
    input_type character varying(20) DEFAULT 'number'::character varying,
    reference_range_min numeric(10,2),
    reference_range_max numeric(10,2),
    reference_value_text text,
    display_order integer DEFAULT 0,
    is_critical boolean DEFAULT false,
    is_required boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lab_test_parameters OWNER TO postgres;

--
-- Name: lab_test_parameters_parameter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_test_parameters_parameter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_test_parameters_parameter_id_seq OWNER TO postgres;

--
-- Name: lab_test_parameters_parameter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_test_parameters_parameter_id_seq OWNED BY public.lab_test_parameters.parameter_id;


--
-- Name: lab_test_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_test_results (
    result_id integer NOT NULL,
    order_id integer NOT NULL,
    parameter_id integer NOT NULL,
    result_value character varying(255),
    is_abnormal boolean DEFAULT false,
    technician_notes text,
    entered_by integer,
    entered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verified_by integer,
    verified_at timestamp without time zone
);


ALTER TABLE public.lab_test_results OWNER TO postgres;

--
-- Name: lab_test_results_result_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_test_results_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_test_results_result_id_seq OWNER TO postgres;

--
-- Name: lab_test_results_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_test_results_result_id_seq OWNED BY public.lab_test_results.result_id;


--
-- Name: medicine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine (
    medicine_id integer NOT NULL,
    generic_name character varying(100) NOT NULL,
    brand_name character varying(100) NOT NULL,
    category character varying(100) NOT NULL,
    dosage_value numeric(10,2),
    dosage_unit character varying(20),
    form character varying(50),
    stock_quantity integer DEFAULT 0,
    price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    barcode character varying(50),
    sku character varying(50),
    manufacturer character varying(100),
    min_stock_level integer DEFAULT 10,
    max_stock_level integer DEFAULT 1000,
    is_active boolean DEFAULT true,
    requires_prescription boolean DEFAULT false,
    search_vector tsvector,
    sub_unit character varying(20),
    sub_units_per_unit integer,
    sub_unit_price numeric(10,2),
    allow_sub_unit_sale boolean DEFAULT false,
    stock_sub_quantity integer DEFAULT 0,
    CONSTRAINT check_sub_quantity_valid CHECK (((stock_sub_quantity >= 0) AND ((sub_units_per_unit IS NULL) OR (sub_units_per_unit = 0) OR (stock_sub_quantity < sub_units_per_unit))))
);


ALTER TABLE public.medicine OWNER TO postgres;

--
-- Name: medicine_medicine_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicine_medicine_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_medicine_id_seq OWNER TO postgres;

--
-- Name: medicine_medicine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicine_medicine_id_seq OWNED BY public.medicine.medicine_id;


--
-- Name: medicine_purchase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine_purchase (
    purchase_id integer NOT NULL,
    party_id integer NOT NULL,
    invoice_no character varying(100) NOT NULL,
    invoice_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_amount numeric(10,2),
    payment_status character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    CONSTRAINT medicine_purchase_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['Paid'::character varying, 'Unpaid'::character varying, 'Partial'::character varying])::text[])))
);


ALTER TABLE public.medicine_purchase OWNER TO postgres;

--
-- Name: medicine_purchase_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine_purchase_detail (
    id integer NOT NULL,
    purchase_id integer NOT NULL,
    medicine_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2),
    batch_no character varying(50),
    expiry_date date,
    sub_quantity integer DEFAULT 0,
    sub_unit_cost numeric(10,1) DEFAULT 0
);


ALTER TABLE public.medicine_purchase_detail OWNER TO postgres;

--
-- Name: medicine_purchase_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicine_purchase_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_purchase_detail_id_seq OWNER TO postgres;

--
-- Name: medicine_purchase_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicine_purchase_detail_id_seq OWNED BY public.medicine_purchase_detail.id;


--
-- Name: medicine_purchase_purchase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicine_purchase_purchase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_purchase_purchase_id_seq OWNER TO postgres;

--
-- Name: medicine_purchase_purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicine_purchase_purchase_id_seq OWNED BY public.medicine_purchase.purchase_id;


--
-- Name: medicine_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine_transaction (
    txn_id integer NOT NULL,
    medicine_id integer NOT NULL,
    txn_type character varying(100),
    quantity integer NOT NULL,
    amount_per_unit numeric(10,2) NOT NULL,
    ref_purchase_id integer,
    ref_sale_id integer,
    ref_purchase_return integer,
    ref_sale_return integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sub_quantity integer DEFAULT 0,
    CONSTRAINT medicine_transaction_txn_type_check CHECK (((txn_type)::text = ANY ((ARRAY['purchase'::character varying, 'sale'::character varying, 'purchase_return'::character varying, 'sale_return'::character varying, 'adjustment'::character varying])::text[])))
);


ALTER TABLE public.medicine_transaction OWNER TO postgres;

--
-- Name: medicine_transaction_txn_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicine_transaction_txn_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_transaction_txn_id_seq OWNER TO postgres;

--
-- Name: medicine_transaction_txn_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicine_transaction_txn_id_seq OWNED BY public.medicine_transaction.txn_id;


--
-- Name: menstrual_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menstrual_history (
    menstrual_history_id integer NOT NULL,
    patient_id integer NOT NULL,
    menarch_age integer,
    cycle_length_days integer,
    bleeding_days integer,
    menstrual_regular boolean,
    contraception_history text,
    gynecologic_surgeries text,
    medical_conditions text,
    menopause_status boolean,
    notes text
);


ALTER TABLE public.menstrual_history OWNER TO postgres;

--
-- Name: menstrual_history_menstrual_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menstrual_history_menstrual_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menstrual_history_menstrual_history_id_seq OWNER TO postgres;

--
-- Name: menstrual_history_menstrual_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menstrual_history_menstrual_history_id_seq OWNED BY public.menstrual_history.menstrual_history_id;


--
-- Name: obstetric_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.obstetric_history (
    obstetric_history_id integer NOT NULL,
    patient_id integer NOT NULL,
    is_first_pregnancy boolean,
    married_years integer,
    gravida integer,
    para integer,
    abortions integer,
    edd date,
    last_menstrual_cycle date,
    notes text
);


ALTER TABLE public.obstetric_history OWNER TO postgres;

--
-- Name: obstetric_history_obstetric_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.obstetric_history_obstetric_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.obstetric_history_obstetric_history_id_seq OWNER TO postgres;

--
-- Name: obstetric_history_obstetric_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.obstetric_history_obstetric_history_id_seq OWNED BY public.obstetric_history.obstetric_history_id;


--
-- Name: para_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.para_details (
    para_id integer NOT NULL,
    obstetric_history_id integer NOT NULL,
    para_number integer,
    birth_year integer,
    birth_month integer,
    gender character varying(20),
    delivery_type character varying(50),
    alive boolean,
    birth_weight_grams integer,
    complications text,
    notes text,
    gestational_age_weeks integer,
    CONSTRAINT para_details_gender_check CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying])::text[])))
);


ALTER TABLE public.para_details OWNER TO postgres;

--
-- Name: para_details_para_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.para_details_para_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.para_details_para_id_seq OWNER TO postgres;

--
-- Name: para_details_para_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.para_details_para_id_seq OWNED BY public.para_details.para_id;


--
-- Name: party; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.party (
    party_id integer NOT NULL,
    name character varying(100) NOT NULL,
    contact_number character varying(200),
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.party OWNER TO postgres;

--
-- Name: party_party_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.party_party_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.party_party_id_seq OWNER TO postgres;

--
-- Name: party_party_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.party_party_id_seq OWNED BY public.party.party_id;


--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient (
    patient_id integer NOT NULL,
    patient_name character varying(100) NOT NULL,
    age integer,
    gender character varying(26),
    contact_number character varying(20),
    cnic character varying(20),
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patient_gender_check CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying])::text[])))
);


ALTER TABLE public.patient OWNER TO postgres;

--
-- Name: patient_patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_patient_id_seq OWNER TO postgres;

--
-- Name: patient_patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_patient_id_seq OWNED BY public.patient.patient_id;


--
-- Name: patient_vitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_vitals (
    vital_id integer NOT NULL,
    visit_id integer NOT NULL,
    blood_pressure character varying(20),
    heart_rate integer,
    temperature integer,
    weight integer,
    height integer,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    blood_group character varying(20),
    CONSTRAINT patient_vitals_blood_group_check CHECK (((blood_group)::text = ANY ((ARRAY['A+'::character varying, 'A-'::character varying, 'B+'::character varying, 'B-'::character varying, 'O+'::character varying, 'O-'::character varying, 'AB+'::character varying, 'AB-'::character varying])::text[])))
);


ALTER TABLE public.patient_vitals OWNER TO postgres;

--
-- Name: patient_vitals_vital_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_vitals_vital_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_vitals_vital_id_seq OWNER TO postgres;

--
-- Name: patient_vitals_vital_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_vitals_vital_id_seq OWNED BY public.patient_vitals.vital_id;


--
-- Name: pharmacy_customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_customer (
    customer_id integer NOT NULL,
    name character varying(100),
    phone character varying(20),
    email character varying(100),
    address text,
    loyalty_points integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_purchase_date timestamp without time zone
);


ALTER TABLE public.pharmacy_customer OWNER TO postgres;

--
-- Name: pharmacy_customer_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_customer_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_customer_customer_id_seq OWNER TO postgres;

--
-- Name: pharmacy_customer_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_customer_customer_id_seq OWNED BY public.pharmacy_customer.customer_id;


--
-- Name: pharmacy_sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_sale (
    sale_id integer NOT NULL,
    visit_id integer,
    bill_id integer,
    sale_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    handled_by integer NOT NULL,
    total_amount numeric(10,2),
    status character varying(100),
    payment_type character varying(50) DEFAULT 'CASH'::character varying,
    payment_reference character varying(100),
    paid_amount numeric(10,2) DEFAULT 0,
    due_amount numeric(10,2) DEFAULT 0,
    change_amount numeric(10,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    is_prescription_sale boolean DEFAULT false,
    prescription_id integer,
    notes text,
    customer_id integer,
    CONSTRAINT pharmacy_sale_payment_type_check CHECK (((payment_type)::text = ANY ((ARRAY['CASH'::character varying, 'CARD'::character varying, 'INSURANCE'::character varying, 'MOBILE'::character varying, 'SPLIT'::character varying])::text[]))),
    CONSTRAINT pharmacy_sale_status_check CHECK (((status)::text = ANY ((ARRAY['Completed'::character varying, 'Returned'::character varying, 'Cancelled'::character varying])::text[])))
);


ALTER TABLE public.pharmacy_sale OWNER TO postgres;

--
-- Name: pharmacy_sale_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_sale_detail (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    medicine_id integer NOT NULL,
    qty integer NOT NULL,
    unit_price numeric(10,2),
    total_price numeric(10,2),
    discount_percent numeric(5,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    original_price numeric(10,2),
    sub_quantity integer DEFAULT 0,
    CONSTRAINT check_total_price CHECK ((total_price = (((qty)::numeric * unit_price) - discount_amount)))
);


ALTER TABLE public.pharmacy_sale_detail OWNER TO postgres;

--
-- Name: pharmacy_sale_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_sale_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_sale_detail_id_seq OWNER TO postgres;

--
-- Name: pharmacy_sale_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_sale_detail_id_seq OWNED BY public.pharmacy_sale_detail.id;


--
-- Name: pharmacy_sale_sale_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_sale_sale_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_sale_sale_id_seq OWNER TO postgres;

--
-- Name: pharmacy_sale_sale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_sale_sale_id_seq OWNED BY public.pharmacy_sale.sale_id;


--
-- Name: pos_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_audit_log (
    log_id integer NOT NULL,
    staff_id integer,
    action_type character varying(50) NOT NULL,
    sale_id integer,
    description text,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pos_audit_log OWNER TO postgres;

--
-- Name: pos_audit_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pos_audit_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pos_audit_log_log_id_seq OWNER TO postgres;

--
-- Name: pos_audit_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pos_audit_log_log_id_seq OWNED BY public.pos_audit_log.log_id;


--
-- Name: pos_held_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_held_transaction (
    hold_id integer NOT NULL,
    staff_id integer NOT NULL,
    customer_name character varying(100),
    customer_phone character varying(20),
    hold_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    retrieved_timestamp timestamp without time zone,
    total_amount numeric(10,2),
    status character varying(20) DEFAULT 'held'::character varying,
    notes text,
    CONSTRAINT pos_held_status_check CHECK (((status)::text = ANY ((ARRAY['held'::character varying, 'retrieved'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.pos_held_transaction OWNER TO postgres;

--
-- Name: pos_held_transaction_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_held_transaction_detail (
    detail_id integer NOT NULL,
    hold_id integer NOT NULL,
    medicine_id integer NOT NULL,
    qty integer NOT NULL,
    sub_qty integer DEFAULT 0,
    unit_price numeric(10,2) NOT NULL,
    discount_percent numeric(5,2) DEFAULT 0,
    line_total numeric(10,2) NOT NULL
);


ALTER TABLE public.pos_held_transaction_detail OWNER TO postgres;

--
-- Name: pos_held_transaction_detail_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pos_held_transaction_detail_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pos_held_transaction_detail_detail_id_seq OWNER TO postgres;

--
-- Name: pos_held_transaction_detail_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pos_held_transaction_detail_detail_id_seq OWNED BY public.pos_held_transaction_detail.detail_id;


--
-- Name: pos_held_transaction_hold_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pos_held_transaction_hold_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pos_held_transaction_hold_id_seq OWNER TO postgres;

--
-- Name: pos_held_transaction_hold_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pos_held_transaction_hold_id_seq OWNED BY public.pos_held_transaction.hold_id;


--
-- Name: pos_receipt_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_receipt_config (
    config_id integer NOT NULL,
    clinic_name character varying(200) NOT NULL,
    clinic_address text,
    clinic_phone character varying(50),
    clinic_email character varying(100),
    tax_registration_number character varying(50),
    receipt_header text,
    receipt_footer text,
    logo_url text,
    printer_name character varying(100),
    paper_size character varying(20) DEFAULT '80mm'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pos_receipt_config OWNER TO postgres;

--
-- Name: pos_receipt_config_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pos_receipt_config_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pos_receipt_config_config_id_seq OWNER TO postgres;

--
-- Name: pos_receipt_config_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pos_receipt_config_config_id_seq OWNED BY public.pos_receipt_config.config_id;


--
-- Name: pos_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_session (
    session_id integer NOT NULL,
    staff_id integer NOT NULL,
    opening_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closing_time timestamp without time zone,
    opening_balance numeric(10,2) DEFAULT 0 NOT NULL,
    closing_balance numeric(10,2),
    expected_balance numeric(10,2),
    cash_sales_total numeric(10,2) DEFAULT 0,
    card_sales_total numeric(10,2) DEFAULT 0,
    total_sales_count integer DEFAULT 0,
    notes text,
    status character varying(20) DEFAULT 'open'::character varying,
    CONSTRAINT pos_session_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'closed'::character varying])::text[])))
);


ALTER TABLE public.pos_session OWNER TO postgres;

--
-- Name: pos_session_session_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pos_session_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pos_session_session_id_seq OWNER TO postgres;

--
-- Name: pos_session_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pos_session_session_id_seq OWNED BY public.pos_session.session_id;


--
-- Name: prescription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription (
    prescription_id integer NOT NULL,
    visit_id integer NOT NULL,
    doctor_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prescription OWNER TO postgres;

--
-- Name: prescription_medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_medicines (
    prescription_medicine_id integer NOT NULL,
    prescription_id integer NOT NULL,
    medicine_id integer NOT NULL,
    duration character varying(50),
    instructions text,
    dispensed_by integer,
    frequency character varying(50),
    prescribed_quantity integer,
    dispensed_quantity integer,
    dispensed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    prescribed_sub_quantity integer DEFAULT 0,
    dispensed_sub_quantity integer DEFAULT 0
);


ALTER TABLE public.prescription_medicines OWNER TO postgres;

--
-- Name: prescription_medicines_prescription_medicine_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_medicines_prescription_medicine_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_medicines_prescription_medicine_id_seq OWNER TO postgres;

--
-- Name: prescription_medicines_prescription_medicine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_medicines_prescription_medicine_id_seq OWNED BY public.prescription_medicines.prescription_medicine_id;


--
-- Name: prescription_prescription_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_prescription_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_prescription_id_seq OWNER TO postgres;

--
-- Name: prescription_prescription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_prescription_id_seq OWNED BY public.prescription.prescription_id;


--
-- Name: purchase_return; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_return (
    return_id integer NOT NULL,
    purchase_id integer NOT NULL,
    reason text,
    return_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer NOT NULL
);


ALTER TABLE public.purchase_return OWNER TO postgres;

--
-- Name: purchase_return_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_return_detail (
    id integer NOT NULL,
    return_id integer NOT NULL,
    medicine_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    sub_quantity integer DEFAULT 0
);


ALTER TABLE public.purchase_return_detail OWNER TO postgres;

--
-- Name: purchase_return_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_return_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_return_detail_id_seq OWNER TO postgres;

--
-- Name: purchase_return_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_return_detail_id_seq OWNED BY public.purchase_return_detail.id;


--
-- Name: purchase_return_return_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_return_return_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_return_return_id_seq OWNER TO postgres;

--
-- Name: purchase_return_return_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_return_return_id_seq OWNED BY public.purchase_return.return_id;


--
-- Name: sale_return; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_return (
    return_id integer NOT NULL,
    sale_id integer NOT NULL,
    reason text,
    return_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer NOT NULL
);


ALTER TABLE public.sale_return OWNER TO postgres;

--
-- Name: sale_return_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_return_detail (
    id integer NOT NULL,
    return_id integer NOT NULL,
    medicine_id integer NOT NULL,
    qty integer NOT NULL,
    unit_price numeric(10,2)
);


ALTER TABLE public.sale_return_detail OWNER TO postgres;

--
-- Name: sale_return_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_return_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_return_detail_id_seq OWNER TO postgres;

--
-- Name: sale_return_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_return_detail_id_seq OWNED BY public.sale_return_detail.id;


--
-- Name: sale_return_return_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_return_return_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_return_return_id_seq OWNER TO postgres;

--
-- Name: sale_return_return_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_return_return_id_seq OWNED BY public.sale_return.return_id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    staff_id integer NOT NULL,
    user_code character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(50) NOT NULL,
    role character varying(50),
    education character varying(255),
    contact_number character varying(20),
    email character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT staff_role_check CHECK (((role)::text = ANY ((ARRAY['Receptionist'::character varying, 'Lab_Technician'::character varying, 'Admin'::character varying, 'Cashier'::character varying, 'Pharmacist'::character varying, 'Nurse'::character varying])::text[])))
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_staff_id_seq OWNER TO postgres;

--
-- Name: staff_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_staff_id_seq OWNED BY public.staff.staff_id;


--
-- Name: v_daily_sales_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_daily_sales_summary AS
 SELECT date(sale_timestamp) AS sale_date,
    count(sale_id) AS total_transactions,
    sum(total_amount) AS total_sales,
    sum(discount_amount) AS total_discounts,
    sum(
        CASE
            WHEN ((payment_type)::text = 'CASH'::text) THEN total_amount
            ELSE (0)::numeric
        END) AS cash_sales,
    sum(
        CASE
            WHEN ((payment_type)::text = 'CARD'::text) THEN total_amount
            ELSE (0)::numeric
        END) AS card_sales,
    sum(
        CASE
            WHEN is_prescription_sale THEN total_amount
            ELSE (0)::numeric
        END) AS prescription_sales,
    sum(
        CASE
            WHEN (is_prescription_sale = false) THEN total_amount
            ELSE (0)::numeric
        END) AS otc_sales
   FROM public.pharmacy_sale ps
  WHERE ((status)::text = 'Completed'::text)
  GROUP BY (date(sale_timestamp))
  ORDER BY (date(sale_timestamp)) DESC;


ALTER VIEW public.v_daily_sales_summary OWNER TO postgres;

--
-- Name: v_low_stock_medicines; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_low_stock_medicines AS
 SELECT medicine_id,
    generic_name,
    brand_name,
    stock_quantity,
    stock_sub_quantity,
    sub_units_per_unit,
    min_stock_level,
    ((stock_quantity * COALESCE(sub_units_per_unit, 1)) + COALESCE(stock_sub_quantity, 0)) AS total_sub_units,
    (min_stock_level * COALESCE(sub_units_per_unit, 1)) AS min_sub_units,
        CASE
            WHEN ((sub_units_per_unit > 0) AND (stock_sub_quantity > 0)) THEN ((((((stock_quantity || ' '::text) || (COALESCE(form, 'units'::character varying))::text) || ' + '::text) || stock_sub_quantity) || ' '::text) || (COALESCE(sub_unit, 'sub-units'::character varying))::text)
            ELSE ((stock_quantity || ' '::text) || (COALESCE(form, 'units'::character varying))::text)
        END AS stock_display
   FROM public.medicine
  WHERE ((is_active = true) AND (((stock_quantity * COALESCE(sub_units_per_unit, 1)) + COALESCE(stock_sub_quantity, 0)) <= (min_stock_level * COALESCE(sub_units_per_unit, 1))))
  ORDER BY ((stock_quantity * COALESCE(sub_units_per_unit, 1)) + COALESCE(stock_sub_quantity, 0));


ALTER VIEW public.v_low_stock_medicines OWNER TO postgres;

--
-- Name: v_medicine_pos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_medicine_pos AS
 SELECT m.medicine_id,
    m.generic_name,
    m.brand_name,
    m.category,
    m.dosage_value,
    m.dosage_unit,
    m.form,
    m.price,
    m.stock_quantity,
    m.barcode,
    m.sku,
    m.manufacturer,
    m.requires_prescription,
    m.search_vector,
    m.sub_unit_price,
    m.sub_units_per_unit,
    m.sub_unit,
    m.stock_sub_quantity,
    m.allow_sub_unit_sale,
    mpd_earliest.expiry_date
   FROM (public.medicine m
     LEFT JOIN ( SELECT medicine_purchase_detail.medicine_id,
            min(medicine_purchase_detail.expiry_date) AS expiry_date
           FROM public.medicine_purchase_detail
          WHERE (medicine_purchase_detail.quantity > 0)
          GROUP BY medicine_purchase_detail.medicine_id) mpd_earliest ON ((m.medicine_id = mpd_earliest.medicine_id)));


ALTER VIEW public.v_medicine_pos OWNER TO postgres;

--
-- Name: visit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visit (
    visit_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    visit_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    visit_type character varying(50),
    clinic_number integer,
    status character varying(50),
    reason text,
    is_deleted boolean DEFAULT false,
    CONSTRAINT visit_status_check CHECK (((status)::text = ANY ((ARRAY['waiting'::character varying, 'seen_by_doctor'::character varying, 'medicines_dispensed'::character varying, 'lab_tests_done'::character varying, 'payment_done'::character varying, 'completed'::character varying, 'admitted'::character varying, 'discharged'::character varying])::text[]))),
    CONSTRAINT visit_visit_type_check CHECK (((visit_type)::text = ANY ((ARRAY['OPD'::character varying, 'Emergency'::character varying])::text[])))
);


ALTER TABLE public.visit OWNER TO postgres;

--
-- Name: visit_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visit_status_history (
    visit_status_id integer NOT NULL,
    visit_id integer NOT NULL,
    status character varying(100),
    updated_by_doctor integer,
    updated_by_staff integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT visit_status_history_status_check CHECK (((status)::text = ANY ((ARRAY['waiting'::character varying, 'seen_by_doctor'::character varying, 'medicines_dispensed'::character varying, 'lab_tests_done'::character varying, 'payment_done'::character varying, 'admitted'::character varying, 'discharged'::character varying])::text[])))
);


ALTER TABLE public.visit_status_history OWNER TO postgres;

--
-- Name: visit_status_history_visit_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visit_status_history_visit_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visit_status_history_visit_status_id_seq OWNER TO postgres;

--
-- Name: visit_status_history_visit_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visit_status_history_visit_status_id_seq OWNED BY public.visit_status_history.visit_status_id;


--
-- Name: visit_visit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visit_visit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visit_visit_id_seq OWNER TO postgres;

--
-- Name: visit_visit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visit_visit_id_seq OWNED BY public.visit.visit_id;


--
-- Name: bill bill_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill ALTER COLUMN bill_id SET DEFAULT nextval('public.bill_bill_id_seq'::regclass);


--
-- Name: bill_item item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_item ALTER COLUMN item_id SET DEFAULT nextval('public.bill_item_item_id_seq'::regclass);


--
-- Name: current_pregnancy pregnanacy_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.current_pregnancy ALTER COLUMN pregnanacy_id SET DEFAULT nextval('public.current_pregnancy_pregnanacy_id_seq'::regclass);


--
-- Name: doctor doctor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor ALTER COLUMN doctor_id SET DEFAULT nextval('public.doctor_doctor_id_seq'::regclass);


--
-- Name: lab_order order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_order ALTER COLUMN order_id SET DEFAULT nextval('public.lab_order_order_id_seq'::regclass);


--
-- Name: lab_result result_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result ALTER COLUMN result_id SET DEFAULT nextval('public.lab_result_result_id_seq'::regclass);


--
-- Name: lab_result_approvals approval_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_approvals ALTER COLUMN approval_id SET DEFAULT nextval('public.lab_result_approvals_approval_id_seq'::regclass);


--
-- Name: lab_test_parameters parameter_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_parameters ALTER COLUMN parameter_id SET DEFAULT nextval('public.lab_test_parameters_parameter_id_seq'::regclass);


--
-- Name: lab_test_results result_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_results ALTER COLUMN result_id SET DEFAULT nextval('public.lab_test_results_result_id_seq'::regclass);


--
-- Name: medicine medicine_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine ALTER COLUMN medicine_id SET DEFAULT nextval('public.medicine_medicine_id_seq'::regclass);


--
-- Name: medicine_purchase purchase_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase ALTER COLUMN purchase_id SET DEFAULT nextval('public.medicine_purchase_purchase_id_seq'::regclass);


--
-- Name: medicine_purchase_detail id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase_detail ALTER COLUMN id SET DEFAULT nextval('public.medicine_purchase_detail_id_seq'::regclass);


--
-- Name: medicine_transaction txn_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_transaction ALTER COLUMN txn_id SET DEFAULT nextval('public.medicine_transaction_txn_id_seq'::regclass);


--
-- Name: menstrual_history menstrual_history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menstrual_history ALTER COLUMN menstrual_history_id SET DEFAULT nextval('public.menstrual_history_menstrual_history_id_seq'::regclass);


--
-- Name: obstetric_history obstetric_history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obstetric_history ALTER COLUMN obstetric_history_id SET DEFAULT nextval('public.obstetric_history_obstetric_history_id_seq'::regclass);


--
-- Name: para_details para_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.para_details ALTER COLUMN para_id SET DEFAULT nextval('public.para_details_para_id_seq'::regclass);


--
-- Name: party party_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.party ALTER COLUMN party_id SET DEFAULT nextval('public.party_party_id_seq'::regclass);


--
-- Name: patient patient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient ALTER COLUMN patient_id SET DEFAULT nextval('public.patient_patient_id_seq'::regclass);


--
-- Name: patient_vitals vital_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_vitals ALTER COLUMN vital_id SET DEFAULT nextval('public.patient_vitals_vital_id_seq'::regclass);


--
-- Name: pharmacy_customer customer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_customer ALTER COLUMN customer_id SET DEFAULT nextval('public.pharmacy_customer_customer_id_seq'::regclass);


--
-- Name: pharmacy_sale sale_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale ALTER COLUMN sale_id SET DEFAULT nextval('public.pharmacy_sale_sale_id_seq'::regclass);


--
-- Name: pharmacy_sale_detail id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_detail ALTER COLUMN id SET DEFAULT nextval('public.pharmacy_sale_detail_id_seq'::regclass);


--
-- Name: pos_audit_log log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_audit_log ALTER COLUMN log_id SET DEFAULT nextval('public.pos_audit_log_log_id_seq'::regclass);


--
-- Name: pos_held_transaction hold_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_held_transaction ALTER COLUMN hold_id SET DEFAULT nextval('public.pos_held_transaction_hold_id_seq'::regclass);


--
-- Name: pos_held_transaction_detail detail_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_held_transaction_detail ALTER COLUMN detail_id SET DEFAULT nextval('public.pos_held_transaction_detail_detail_id_seq'::regclass);


--
-- Name: pos_receipt_config config_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_receipt_config ALTER COLUMN config_id SET DEFAULT nextval('public.pos_receipt_config_config_id_seq'::regclass);


--
-- Name: pos_session session_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_session ALTER COLUMN session_id SET DEFAULT nextval('public.pos_session_session_id_seq'::regclass);


--
-- Name: prescription prescription_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription ALTER COLUMN prescription_id SET DEFAULT nextval('public.prescription_prescription_id_seq'::regclass);


--
-- Name: prescription_medicines prescription_medicine_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_medicines ALTER COLUMN prescription_medicine_id SET DEFAULT nextval('public.prescription_medicines_prescription_medicine_id_seq'::regclass);


--
-- Name: purchase_return return_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_return ALTER COLUMN return_id SET DEFAULT nextval('public.purchase_return_return_id_seq'::regclass);


--
-- Name: purchase_return_detail id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_return_detail ALTER COLUMN id SET DEFAULT nextval('public.purchase_return_detail_id_seq'::regclass);


--
-- Name: sale_return return_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_return ALTER COLUMN return_id SET DEFAULT nextval('public.sale_return_return_id_seq'::regclass);


--
-- Name: sale_return_detail id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_return_detail ALTER COLUMN id SET DEFAULT nextval('public.sale_return_detail_id_seq'::regclass);


--
-- Name: staff staff_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN staff_id SET DEFAULT nextval('public.staff_staff_id_seq'::regclass);


--
-- Name: visit visit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit ALTER COLUMN visit_id SET DEFAULT nextval('public.visit_visit_id_seq'::regclass);


--
-- Name: visit_status_history visit_status_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_status_history ALTER COLUMN visit_status_id SET DEFAULT nextval('public.visit_status_history_visit_status_id_seq'::regclass);


--
-- Name: bill_item bill_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_item
    ADD CONSTRAINT bill_item_pkey PRIMARY KEY (item_id);


--
-- Name: bill bill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT bill_pkey PRIMARY KEY (bill_id);


--
-- Name: current_pregnancy current_pregnancy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.current_pregnancy
    ADD CONSTRAINT current_pregnancy_pkey PRIMARY KEY (pregnanacy_id);


--
-- Name: doctor doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT doctor_pkey PRIMARY KEY (doctor_id);


--
-- Name: lab_order lab_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_order
    ADD CONSTRAINT lab_order_pkey PRIMARY KEY (order_id);


--
-- Name: lab_result_approvals lab_result_approvals_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_approvals
    ADD CONSTRAINT lab_result_approvals_order_id_key UNIQUE (order_id);


--
-- Name: lab_result_approvals lab_result_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_approvals
    ADD CONSTRAINT lab_result_approvals_pkey PRIMARY KEY (approval_id);


--
-- Name: lab_result lab_result_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result
    ADD CONSTRAINT lab_result_pkey PRIMARY KEY (result_id);


--
-- Name: lab_test_parameters lab_test_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_parameters
    ADD CONSTRAINT lab_test_parameters_pkey PRIMARY KEY (parameter_id);


--
-- Name: lab_test_parameters lab_test_parameters_test_id_parameter_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_parameters
    ADD CONSTRAINT lab_test_parameters_test_id_parameter_code_key UNIQUE (test_id, parameter_code);


--
-- Name: lab_test lab_test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test
    ADD CONSTRAINT lab_test_pkey PRIMARY KEY (test_id);


--
-- Name: lab_test_results lab_test_results_order_id_parameter_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_results
    ADD CONSTRAINT lab_test_results_order_id_parameter_id_key UNIQUE (order_id, parameter_id);


--
-- Name: lab_test_results lab_test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_results
    ADD CONSTRAINT lab_test_results_pkey PRIMARY KEY (result_id);


--
-- Name: medicine medicine_barcode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine
    ADD CONSTRAINT medicine_barcode_key UNIQUE (barcode);


--
-- Name: medicine medicine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine
    ADD CONSTRAINT medicine_pkey PRIMARY KEY (medicine_id);


--
-- Name: medicine_purchase_detail medicine_purchase_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase_detail
    ADD CONSTRAINT medicine_purchase_detail_pkey PRIMARY KEY (id);


--
-- Name: medicine_purchase medicine_purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase
    ADD CONSTRAINT medicine_purchase_pkey PRIMARY KEY (purchase_id);


--
-- Name: medicine medicine_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine
    ADD CONSTRAINT medicine_sku_key UNIQUE (sku);


--
-- Name: medicine_transaction medicine_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_transaction
    ADD CONSTRAINT medicine_transaction_pkey PRIMARY KEY (txn_id);


--
-- Name: menstrual_history menstrual_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menstrual_history
    ADD CONSTRAINT menstrual_history_pkey PRIMARY KEY (menstrual_history_id);


--
-- Name: obstetric_history obstetric_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obstetric_history
    ADD CONSTRAINT obstetric_history_pkey PRIMARY KEY (obstetric_history_id);


--
-- Name: para_details para_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.para_details
    ADD CONSTRAINT para_details_pkey PRIMARY KEY (para_id);


--
-- Name: party party_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.party
    ADD CONSTRAINT party_pkey PRIMARY KEY (party_id);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (patient_id);


--
-- Name: patient_vitals patient_vitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_vitals
    ADD CONSTRAINT patient_vitals_pkey PRIMARY KEY (vital_id);


--
-- Name: pharmacy_customer pharmacy_customer_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_customer
    ADD CONSTRAINT pharmacy_customer_phone_key UNIQUE (phone);


--
-- Name: pharmacy_customer pharmacy_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_customer
    ADD CONSTRAINT pharmacy_customer_pkey PRIMARY KEY (customer_id);


--
-- Name: pharmacy_sale_detail pharmacy_sale_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_detail
    ADD CONSTRAINT pharmacy_sale_detail_pkey PRIMARY KEY (id);


--
-- Name: pharmacy_sale pharmacy_sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale
    ADD CONSTRAINT pharmacy_sale_pkey PRIMARY KEY (sale_id);


--
-- Name: pos_audit_log pos_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_audit_log
    ADD CONSTRAINT pos_audit_log_pkey PRIMARY KEY (log_id);


--
-- Name: pos_held_transaction_detail pos_held_transaction_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_held_transaction_detail
    ADD CONSTRAINT pos_held_transaction_detail_pkey PRIMARY KEY (detail_id);


--
-- Name: pos_held_transaction pos_held_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_held_transaction
    ADD CONSTRAINT pos_held_transaction_pkey PRIMARY KEY (hold_id);


--
-- Name: pos_receipt_config pos_receipt_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_receipt_config
    ADD CONSTRAINT pos_receipt_config_pkey PRIMARY KEY (config_id);


--
-- Name: pos_session pos_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_session
    ADD CONSTRAINT pos_session_pkey PRIMARY KEY (session_id);


--
-- Name: prescription_medicines prescription_medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_medicines
    ADD CONSTRAINT prescription_medicines_pkey PRIMARY KEY (prescription_medicine_id);


--
-- Name: prescription prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_pkey PRIMARY KEY (prescription_id);


--
-- Name: purchase_return_detail purchase_return_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_return_detail
    ADD CONSTRAINT purchase_return_detail_pkey PRIMARY KEY (id);


--
-- Name: purchase_return purchase_return_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_return
    ADD CONSTRAINT purchase_return_pkey PRIMARY KEY (return_id);


--
-- Name: sale_return_detail sale_return_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_return_detail
    ADD CONSTRAINT sale_return_detail_pkey PRIMARY KEY (id);


--
-- Name: sale_return sale_return_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_return
    ADD CONSTRAINT sale_return_pkey PRIMARY KEY (return_id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);


--
-- Name: current_pregnancy uniqeue_visit_id_cp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.current_pregnancy
    ADD CONSTRAINT uniqeue_visit_id_cp UNIQUE (visit_id);


--
-- Name: para_details unique_obstetric_para; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.para_details
    ADD CONSTRAINT unique_obstetric_para UNIQUE (obstetric_history_id, para_number);


--
-- Name: obstetric_history unique_patient_id_obs_history; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obstetric_history
    ADD CONSTRAINT unique_patient_id_obs_history UNIQUE (patient_id);


--
-- Name: patient_vitals unique_patient_vitals; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_vitals
    ADD CONSTRAINT unique_patient_vitals UNIQUE (visit_id);


--
-- Name: prescription unique_visit_prescription; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT unique_visit_prescription UNIQUE (visit_id);


--
-- Name: menstrual_history uq_menstrual_history_patient_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menstrual_history
    ADD CONSTRAINT uq_menstrual_history_patient_id UNIQUE (patient_id);


--
-- Name: visit visit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit
    ADD CONSTRAINT visit_pkey PRIMARY KEY (visit_id);


--
-- Name: visit_status_history visit_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_status_history
    ADD CONSTRAINT visit_status_history_pkey PRIMARY KEY (visit_status_id);


--
-- Name: idx_medicine_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicine_active ON public.medicine USING btree (is_active);


--
-- Name: idx_medicine_barcode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicine_barcode ON public.medicine USING btree (barcode);


--
-- Name: idx_medicine_search_vector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicine_search_vector ON public.medicine USING gin (search_vector);


--
-- Name: idx_medicine_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medicine_sku ON public.medicine USING btree (sku);


--
-- Name: idx_pharmacy_customer_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pharmacy_customer_phone ON public.pharmacy_customer USING btree (phone);


--
-- Name: idx_pos_audit_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_audit_created ON public.pos_audit_log USING btree (created_at);


--
-- Name: idx_pos_audit_staff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_audit_staff ON public.pos_audit_log USING btree (staff_id);


--
-- Name: idx_pos_session_staff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_session_staff ON public.pos_session USING btree (staff_id);


--
-- Name: idx_pos_session_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_session_status ON public.pos_session USING btree (status);


--
-- Name: idx_visit_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_visit_timestamp ON public.visit USING btree (visit_timestamp);


--
-- Name: medicine medicine_search_vector_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER medicine_search_vector_trigger BEFORE INSERT OR UPDATE ON public.medicine FOR EACH ROW EXECUTE FUNCTION public.medicine_search_vector_update();


--
-- Name: medicine_purchase_detail tg_purchase_detail_to_txn; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tg_purchase_detail_to_txn AFTER INSERT OR DELETE OR UPDATE ON public.medicine_purchase_detail FOR EACH ROW EXECUTE FUNCTION public.fn_tg_purchase_detail_to_txn();


--
-- Name: purchase_return_detail tg_purchase_return_detail_to_txn; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tg_purchase_return_detail_to_txn AFTER INSERT OR DELETE OR UPDATE ON public.purchase_return_detail FOR EACH ROW EXECUTE FUNCTION public.fn_tg_purchase_return_detail_to_txn();


--
-- Name: pharmacy_sale_detail tg_sale_detail_to_txn; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tg_sale_detail_to_txn AFTER INSERT OR DELETE OR UPDATE ON public.pharmacy_sale_detail FOR EACH ROW EXECUTE FUNCTION public.fn_tg_sale_detail_to_txn();


--
-- Name: sale_return_detail tg_sale_return_detail_to_txn; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tg_sale_return_detail_to_txn AFTER INSERT OR DELETE OR UPDATE ON public.sale_return_detail FOR EACH ROW EXECUTE FUNCTION public.fn_tg_sale_return_detail_to_txn();


--
-- Name: medicine_transaction tg_stockquantity_generic; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tg_stockquantity_generic AFTER INSERT OR DELETE OR UPDATE ON public.medicine_transaction FOR EACH ROW EXECUTE FUNCTION public.fn_tg_stockquantity_generic();


--
-- Name: bill_item bill_item_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_item
    ADD CONSTRAINT bill_item_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bill(bill_id);


--
-- Name: bill bill_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT bill_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: bill bill_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT bill_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: current_pregnancy current_pregnancy_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.current_pregnancy
    ADD CONSTRAINT current_pregnancy_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: current_pregnancy current_pregnancy_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.current_pregnancy
    ADD CONSTRAINT current_pregnancy_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: lab_order lab_order_finalized_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_order
    ADD CONSTRAINT lab_order_finalized_by_fkey FOREIGN KEY (finalized_by) REFERENCES public.staff(staff_id);


--
-- Name: lab_order lab_order_ordered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_order
    ADD CONSTRAINT lab_order_ordered_by_fkey FOREIGN KEY (ordered_by) REFERENCES public.doctor(doctor_id);


--
-- Name: lab_order lab_order_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_order
    ADD CONSTRAINT lab_order_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.staff(staff_id);


--
-- Name: lab_order lab_order_results_entered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_order
    ADD CONSTRAINT lab_order_results_entered_by_fkey FOREIGN KEY (results_entered_by) REFERENCES public.staff(staff_id);


--
-- Name: lab_order lab_order_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_order
    ADD CONSTRAINT lab_order_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.lab_test(test_id);


--
-- Name: lab_order lab_order_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_order
    ADD CONSTRAINT lab_order_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: lab_result_approvals lab_result_approvals_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_approvals
    ADD CONSTRAINT lab_result_approvals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.staff(staff_id);


--
-- Name: lab_result_approvals lab_result_approvals_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_approvals
    ADD CONSTRAINT lab_result_approvals_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.lab_order(order_id);


--
-- Name: lab_result lab_result_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result
    ADD CONSTRAINT lab_result_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.lab_order(order_id);


--
-- Name: lab_result lab_result_reported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result
    ADD CONSTRAINT lab_result_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.staff(staff_id);


--
-- Name: lab_test_parameters lab_test_parameters_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_parameters
    ADD CONSTRAINT lab_test_parameters_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.lab_test(test_id);


--
-- Name: lab_test_results lab_test_results_entered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_results
    ADD CONSTRAINT lab_test_results_entered_by_fkey FOREIGN KEY (entered_by) REFERENCES public.staff(staff_id);


--
-- Name: lab_test_results lab_test_results_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_results
    ADD CONSTRAINT lab_test_results_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.lab_order(order_id);


--
-- Name: lab_test_results lab_test_results_parameter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_results
    ADD CONSTRAINT lab_test_results_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.lab_test_parameters(parameter_id);


--
-- Name: lab_test_results lab_test_results_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_results
    ADD CONSTRAINT lab_test_results_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.staff(staff_id);


--
-- Name: medicine_purchase medicine_purchase_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase
    ADD CONSTRAINT medicine_purchase_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(staff_id);


--
-- Name: medicine_purchase_detail medicine_purchase_detail_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase_detail
    ADD CONSTRAINT medicine_purchase_detail_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicine(medicine_id);


--
-- Name: medicine_purchase_detail medicine_purchase_detail_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase_detail
    ADD CONSTRAINT medicine_purchase_detail_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.medicine_purchase(purchase_id);


--
-- Name: medicine_purchase medicine_purchase_party_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase
    ADD CONSTRAINT medicine_purchase_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.party(party_id);


--
-- Name: medicine_transaction medicine_transaction_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_transaction
    ADD CONSTRAINT medicine_transaction_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicine(medicine_id);


--
-- Name: medicine_transaction medicine_transaction_ref_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_transaction
    ADD CONSTRAINT medicine_transaction_ref_purchase_id_fkey FOREIGN KEY (ref_purchase_id) REFERENCES public.medicine_purchase(purchase_id);


--
-- Name: medicine_transaction medicine_transaction_ref_purchase_return_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_transaction
    ADD CONSTRAINT medicine_transaction_ref_purchase_return_fkey FOREIGN KEY (ref_purchase_return) REFERENCES public.purchase_return(return_id);


--
-- Name: medicine_transaction medicine_transaction_ref_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_transaction
    ADD CONSTRAINT medicine_transaction_ref_sale_id_fkey FOREIGN KEY (ref_sale_id) REFERENCES public.pharmacy_sale(sale_id);


--
-- Name: medicine_transaction medicine_transaction_ref_sale_return_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_transaction
    ADD CONSTRAINT medicine_transaction_ref_sale_return_fkey FOREIGN KEY (ref_sale_return) REFERENCES public.sale_return(return_id);


--
-- Name: menstrual_history menstrual_history_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menstrual_history
    ADD CONSTRAINT menstrual_history_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: obstetric_history obstetric_history_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obstetric_history
    ADD CONSTRAINT obstetric_history_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: para_details para_details_obstetric_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.para_details
    ADD CONSTRAINT para_details_obstetric_history_id_fkey FOREIGN KEY (obstetric_history_id) REFERENCES public.obstetric_history(obstetric_history_id);


--
-- Name: patient_vitals patient_vitals_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_vitals
    ADD CONSTRAINT patient_vitals_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id) ON DELETE CASCADE;


--
-- Name: pharmacy_sale pharmacy_sale_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale
    ADD CONSTRAINT pharmacy_sale_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bill(bill_id);


--
-- Name: pharmacy_sale pharmacy_sale_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale
    ADD CONSTRAINT pharmacy_sale_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.pharmacy_customer(customer_id);


--
-- Name: pharmacy_sale_detail pharmacy_sale_detail_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_detail
    ADD CONSTRAINT pharmacy_sale_detail_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicine(medicine_id);


--
-- Name: pharmacy_sale_detail pharmacy_sale_detail_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_detail
    ADD CONSTRAINT pharmacy_sale_detail_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.pharmacy_sale(sale_id);


--
-- Name: pharmacy_sale pharmacy_sale_handled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale
    ADD CONSTRAINT pharmacy_sale_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.staff(staff_id);


--
-- Name: pharmacy_sale pharmacy_sale_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale
    ADD CONSTRAINT pharmacy_sale_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescription(prescription_id);


--
-- Name: pharmacy_sale pharmacy_sale_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale
    ADD CONSTRAINT pharmacy_sale_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: pos_audit_log pos_audit_log_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_audit_log
    ADD CONSTRAINT pos_audit_log_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.pharmacy_sale(sale_id);


--
-- Name: pos_audit_log pos_audit_log_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_audit_log
    ADD CONSTRAINT pos_audit_log_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);


--
-- Name: pos_held_transaction_detail pos_held_transaction_detail_hold_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_held_transaction_detail
    ADD CONSTRAINT pos_held_transaction_detail_hold_id_fkey FOREIGN KEY (hold_id) REFERENCES public.pos_held_transaction(hold_id) ON DELETE CASCADE;


--
-- Name: pos_held_transaction_detail pos_held_transaction_detail_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_held_transaction_detail
    ADD CONSTRAINT pos_held_transaction_detail_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicine(medicine_id);


--
-- Name: pos_held_transaction pos_held_transaction_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_held_transaction
    ADD CONSTRAINT pos_held_transaction_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);


--
-- Name: pos_session pos_session_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_session
    ADD CONSTRAINT pos_session_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);


--
-- Name: prescription prescription_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor(doctor_id);


--
-- Name: prescription_medicines prescription_medicines_dispensed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_medicines
    ADD CONSTRAINT prescription_medicines_dispensed_by_fkey FOREIGN KEY (dispensed_by) REFERENCES public.staff(staff_id);


--
-- Name: prescription_medicines prescription_medicines_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_medicines
    ADD CONSTRAINT prescription_medicines_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicine(medicine_id);


--
-- Name: prescription_medicines prescription_medicines_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_medicines
    ADD CONSTRAINT prescription_medicines_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescription(prescription_id);


--
-- Name: prescription prescription_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: purchase_return purchase_return_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_return
    ADD CONSTRAINT purchase_return_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(staff_id);


--
-- Name: purchase_return_detail purchase_return_detail_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_return_detail
    ADD CONSTRAINT purchase_return_detail_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicine(medicine_id);


--
-- Name: purchase_return_detail purchase_return_detail_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_return_detail
    ADD CONSTRAINT purchase_return_detail_return_id_fkey FOREIGN KEY (return_id) REFERENCES public.purchase_return(return_id);


--
-- Name: purchase_return purchase_return_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_return
    ADD CONSTRAINT purchase_return_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.medicine_purchase(purchase_id);


--
-- Name: sale_return sale_return_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_return
    ADD CONSTRAINT sale_return_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(staff_id);


--
-- Name: sale_return_detail sale_return_detail_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_return_detail
    ADD CONSTRAINT sale_return_detail_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicine(medicine_id);


--
-- Name: sale_return_detail sale_return_detail_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_return_detail
    ADD CONSTRAINT sale_return_detail_return_id_fkey FOREIGN KEY (return_id) REFERENCES public.sale_return(return_id);


--
-- Name: sale_return sale_return_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_return
    ADD CONSTRAINT sale_return_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.pharmacy_sale(sale_id);


--
-- Name: visit visit_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit
    ADD CONSTRAINT visit_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor(doctor_id);


--
-- Name: visit visit_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit
    ADD CONSTRAINT visit_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: visit_status_history visit_status_history_updated_by_doctor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_status_history
    ADD CONSTRAINT visit_status_history_updated_by_doctor_fkey FOREIGN KEY (updated_by_doctor) REFERENCES public.doctor(doctor_id);


--
-- Name: visit_status_history visit_status_history_updated_by_staff_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_status_history
    ADD CONSTRAINT visit_status_history_updated_by_staff_fkey FOREIGN KEY (updated_by_staff) REFERENCES public.staff(staff_id);


--
-- Name: visit_status_history visit_status_history_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_status_history
    ADD CONSTRAINT visit_status_history_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

