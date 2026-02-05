--
-- PostgreSQL database dump
--

\restrict nFr35flgY3gt8bSRWLytketQazXTRBljZWGLGFvrdhdzLWhw5mUgTO3JwS6YtP0

-- Dumped from database version 18.1 (Ubuntu 18.1-1.pgdg24.04+2)
-- Dumped by pg_dump version 18.1 (Ubuntu 18.1-1.pgdg24.04+2)

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
    CONSTRAINT bill_payment_status_check CHECK (((payment_status)::text = ANY (ARRAY[('Paid'::character varying)::text, ('Unpaid'::character varying)::text, ('Partial'::character varying)::text])))
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
    CONSTRAINT lab_order_status_check CHECK (((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Performed'::character varying)::text, ('Completed'::character varying)::text]))),
    CONSTRAINT lab_order_urgency_check CHECK (((urgency)::text = ANY (ARRAY[('STAT'::character varying)::text, ('Urgent'::character varying)::text, ('Routine'::character varying)::text, ('Timed'::character varying)::text])))
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
-- Name: medicine_batch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine_batch (
    batch_id integer NOT NULL,
    medicine_id integer,
    stock_quantity integer,
    stock_sub_quantity integer,
    purchase_price numeric(10,2),
    purchase_sub_unit_price numeric(10,2),
    sale_price numeric(10,2),
    sale_sub_unit_price numeric(10,2),
    expiry_date date,
    batch_number text,
    received_date timestamp without time zone DEFAULT now(),
    party_id integer
);


ALTER TABLE public.medicine_batch OWNER TO postgres;

--
-- Name: medicine_batch_batch_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicine_batch_batch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_batch_batch_id_seq OWNER TO postgres;

--
-- Name: medicine_batch_batch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicine_batch_batch_id_seq OWNED BY public.medicine_batch.batch_id;


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
    CONSTRAINT medicine_purchase_payment_status_check CHECK (((payment_status)::text = ANY (ARRAY[('Paid'::character varying)::text, ('Unpaid'::character varying)::text, ('Partial'::character varying)::text])))
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
    sub_quantity integer DEFAULT 0,
    sub_unit_cost numeric(10,1) DEFAULT 0,
    batch_id integer
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
    CONSTRAINT medicine_transaction_txn_type_check CHECK (((txn_type)::text = ANY (ARRAY[('purchase'::character varying)::text, ('sale'::character varying)::text, ('purchase_return'::character varying)::text, ('sale_return'::character varying)::text, ('adjustment'::character varying)::text])))
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
    CONSTRAINT para_details_gender_check CHECK (((gender)::text = ANY (ARRAY[('Male'::character varying)::text, ('Female'::character varying)::text])))
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
    CONSTRAINT patient_gender_check CHECK (((gender)::text = ANY (ARRAY[('Male'::character varying)::text, ('Female'::character varying)::text, ('Other'::character varying)::text])))
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
    CONSTRAINT patient_vitals_blood_group_check CHECK (((blood_group)::text = ANY (ARRAY[('A+'::character varying)::text, ('A-'::character varying)::text, ('B+'::character varying)::text, ('B-'::character varying)::text, ('O+'::character varying)::text, ('O-'::character varying)::text, ('AB+'::character varying)::text, ('AB-'::character varying)::text])))
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
    CONSTRAINT pharmacy_sale_payment_type_check CHECK (((payment_type)::text = ANY (ARRAY[('CASH'::character varying)::text, ('CARD'::character varying)::text, ('INSURANCE'::character varying)::text, ('MOBILE'::character varying)::text, ('SPLIT'::character varying)::text]))),
    CONSTRAINT pharmacy_sale_status_check CHECK (((status)::text = ANY (ARRAY[('Completed'::character varying)::text, ('Returned'::character varying)::text, ('Cancelled'::character varying)::text])))
);


ALTER TABLE public.pharmacy_sale OWNER TO postgres;

--
-- Name: pharmacy_sale_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_sale_detail (
    pharmacy_sale_detail_id integer CONSTRAINT pharmacy_sale_detail_id_not_null NOT NULL,
    sale_id integer NOT NULL,
    medicine_id integer NOT NULL,
    quantity integer CONSTRAINT pharmacy_sale_detail_qty_not_null NOT NULL,
    unit_sale_price numeric(10,2),
    line_total numeric(10,2),
    discount_percent numeric(5,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    sub_unit_sale_price numeric(10,2),
    sub_quantity integer DEFAULT 0,
    batch_id integer,
    CONSTRAINT check_total_price CHECK ((line_total = (((quantity)::numeric * unit_sale_price) - discount_amount)))
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

ALTER SEQUENCE public.pharmacy_sale_detail_id_seq OWNED BY public.pharmacy_sale_detail.pharmacy_sale_detail_id;


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
    CONSTRAINT pos_held_status_check CHECK (((status)::text = ANY (ARRAY[('held'::character varying)::text, ('retrieved'::character varying)::text, ('cancelled'::character varying)::text])))
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
    CONSTRAINT pos_session_status_check CHECK (((status)::text = ANY (ARRAY[('open'::character varying)::text, ('closed'::character varying)::text])))
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
    sub_quantity integer DEFAULT 0,
    returned_unit_price numeric(10,2),
    returned_sub_unit_price numeric(10,2)
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
    CONSTRAINT staff_role_check CHECK (((role)::text = ANY (ARRAY[('Receptionist'::character varying)::text, ('Lab_Technician'::character varying)::text, ('Admin'::character varying)::text, ('Cashier'::character varying)::text, ('Pharmacist'::character varying)::text, ('Nurse'::character varying)::text])))
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
    CONSTRAINT visit_status_check CHECK (((status)::text = ANY (ARRAY[('waiting'::character varying)::text, ('seen_by_doctor'::character varying)::text, ('medicines_dispensed'::character varying)::text, ('lab_tests_done'::character varying)::text, ('payment_done'::character varying)::text, ('completed'::character varying)::text, ('admitted'::character varying)::text, ('discharged'::character varying)::text]))),
    CONSTRAINT visit_visit_type_check CHECK (((visit_type)::text = ANY (ARRAY[('OPD'::character varying)::text, ('Emergency'::character varying)::text])))
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
    CONSTRAINT visit_status_history_status_check CHECK (((status)::text = ANY (ARRAY[('waiting'::character varying)::text, ('seen_by_doctor'::character varying)::text, ('medicines_dispensed'::character varying)::text, ('lab_tests_done'::character varying)::text, ('payment_done'::character varying)::text, ('admitted'::character varying)::text, ('discharged'::character varying)::text])))
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
-- Name: medicine_batch batch_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_batch ALTER COLUMN batch_id SET DEFAULT nextval('public.medicine_batch_batch_id_seq'::regclass);


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
-- Name: pharmacy_sale_detail pharmacy_sale_detail_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_detail ALTER COLUMN pharmacy_sale_detail_id SET DEFAULT nextval('public.pharmacy_sale_detail_id_seq'::regclass);


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
-- Data for Name: bill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill (bill_id, patient_id, visit_id, total_amount, payment_status, created_at) FROM stdin;
1	1	1	1500.00	Paid	2025-09-07 13:10:16.813985
2	2	2	2500.00	Partial	2025-09-07 13:10:16.813985
3	3	3	1800.00	Unpaid	2025-09-07 13:10:16.813985
4	4	4	3200.00	Paid	2025-09-07 13:10:16.813985
5	5	5	1200.00	Partial	2025-09-07 13:10:16.813985
6	6	6	2700.00	Paid	2025-09-07 13:10:16.813985
7	7	7	3500.00	Unpaid	2025-09-07 13:10:16.813985
8	8	8	2100.00	Paid	2025-09-07 13:10:16.813985
9	9	9	4000.00	Partial	2025-09-07 13:10:16.813985
10	10	10	2900.00	Paid	2025-09-07 13:10:16.813985
11	11	11	3300.00	Paid	2025-09-07 13:10:16.813985
12	12	12	3100.00	Partial	2025-09-07 13:10:16.813985
13	1	38	0.00	Unpaid	2025-09-27 19:47:56.327931
14	1	39	0.00	Unpaid	2025-09-28 07:11:18.510154
15	1	40	0.00	Unpaid	2025-10-01 11:02:30.294197
16	1	41	0.00	Unpaid	2025-10-02 16:14:26.741966
17	1	42	0.00	Unpaid	2025-10-03 06:34:28.085712
18	1	43	0.00	Unpaid	2025-10-05 12:24:06.682284
19	1	44	0.00	Unpaid	2025-10-06 16:19:21.326544
20	1	45	0.00	Unpaid	2025-10-11 14:23:01.380428
\.


--
-- Data for Name: bill_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_item (item_id, bill_id, description, amount, quantity, created_at) FROM stdin;
1	1	Consultation Fee	500.00	1	2025-09-07 13:10:52.722122
2	1	CBC Test	300.00	1	2025-09-07 13:10:52.722122
3	1	Paracetamol	200.00	2	2025-09-07 13:10:52.722122
4	2	Consultation Fee	600.00	1	2025-09-07 13:10:52.722122
5	2	Liver Function Test	400.00	1	2025-09-07 13:10:52.722122
6	2	Antibiotic	300.00	3	2025-09-07 13:10:52.722122
7	3	Consultation Fee	550.00	1	2025-09-07 13:10:52.722122
8	3	Blood Glucose Test	250.00	1	2025-09-07 13:10:52.722122
9	3	Painkiller	200.00	2	2025-09-07 13:10:52.722122
10	4	Consultation Fee	700.00	1	2025-09-07 13:10:52.722122
11	4	Urine Routine	200.00	1	2025-09-07 13:10:52.722122
12	4	Vitamin D	500.00	1	2025-09-07 13:10:52.722122
13	5	Consultation Fee	450.00	1	2025-09-07 13:10:52.722122
14	5	Thyroid Panel	750.00	1	2025-09-07 13:10:52.722122
15	5	Supplement	150.00	2	2025-09-07 13:10:52.722122
16	6	Consultation Fee	650.00	1	2025-09-07 13:10:52.722122
17	6	Renal Function Test	650.00	1	2025-09-07 13:10:52.722122
18	6	Antibiotic	300.00	2	2025-09-07 13:10:52.722122
19	7	Consultation Fee	700.00	1	2025-09-07 13:10:52.722122
20	7	Pregnancy Test	400.00	1	2025-09-07 13:10:52.722122
21	7	Vitamin	300.00	1	2025-09-07 13:10:52.722122
22	8	Consultation Fee	600.00	1	2025-09-07 13:10:52.722122
23	8	CBC Test	300.00	1	2025-09-07 13:10:52.722122
24	8	Painkiller	200.00	2	2025-09-07 13:10:52.722122
25	9	Consultation Fee	750.00	1	2025-09-07 13:10:52.722122
26	9	Lipid Profile	800.00	1	2025-09-07 13:10:52.722122
27	9	Supplement	250.00	2	2025-09-07 13:10:52.722122
28	10	Consultation Fee	650.00	1	2025-09-07 13:10:52.722122
29	10	Blood Glucose Test	300.00	1	2025-09-07 13:10:52.722122
30	10	Antibiotic	200.00	3	2025-09-07 13:10:52.722122
\.


--
-- Data for Name: current_pregnancy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.current_pregnancy (pregnanacy_id, patient_id, visit_id, multiple_pregnancy, complications, ultrasound_findings, fetal_heart_rate_bpm, placenta_position, presentation, gestational_age_weeks, notes) FROM stdin;
2	4	4	t	Gestational diabetes	Twin pregnancy, both healthy	145	Posterior	Cephalic	24	High-risk twin pregnancy
3	5	5	f	Mild anemia	Normal	138	Anterior	Breech	18	Monitor diet
4	7	7	f	None	Normal	142	Anterior	Cephalic	22	Regular follow-up
5	13	13	f	Hypertension	Normal	136	Posterior	Cephalic	26	Monitor blood pressure
6	9	8	f	None	Normal	140	Anterior	Cephalic	12	First trimester checkup
1	1	1	f	None	Normal fetal growth 1	140	Anterior	Cephalic	20	Routine checkup
7	1	29	f	None	Normal fetal growth 1	140	Anterior	Cephalic	20	Routine checkup
\.


--
-- Data for Name: doctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor (doctor_id, user_code, password, doctor_name, specialization, education, consultaion_fee, emergency_fee, contact_number, email, created_at) FROM stdin;
1	DOC001	pass1	Dr. Ahmed Khan	Gynecology	MBBS, FCPS	1500.00	3000.00	03001230001	ahmed.khan@example.com	2025-09-07 12:57:18.982786
2	DOC002	pass2	Dr. Fatima Ali	Cardiology	MBBS, MD	2000.00	4000.00	03001230002	fatima.ali@example.com	2025-09-07 12:57:18.982786
3	DOC003	pass3	Dr. Ali Raza	General Medicine	MBBS	1000.00	2000.00	03001230003	ali.raza@example.com	2025-09-07 12:57:18.982786
4	DOC004	pass4	Dr. Sara Malik	Pediatrics	MBBS, FCPS	1200.00	2500.00	03001230004	sara.malik@example.com	2025-09-07 12:57:18.982786
5	DOC005	pass5	Dr. Omar Siddiqui	Orthopedics	MBBS, MS	1800.00	3500.00	03001230005	omar.siddiqui@example.com	2025-09-07 12:57:18.982786
6	DOC006	pass6	Dr. Nadia Hassan	Dermatology	MBBS, FCPS	1300.00	2700.00	03001230006	nadia.hassan@example.com	2025-09-07 12:57:18.982786
7	DOC007	pass7	Dr. Imran Shah	ENT	MBBS, FCPS	1100.00	2300.00	03001230007	imran.shah@example.com	2025-09-07 12:57:18.982786
8	DOC008	pass8	Dr. Ayesha Khan	Neurology	MBBS, MD	2200.00	4500.00	03001230008	ayesha.khan@example.com	2025-09-07 12:57:18.982786
9	DOC009	pass9	Dr. Bilal Ahmed	Psychiatry	MBBS, FCPS	1400.00	2800.00	03001230009	bilal.ahmed@example.com	2025-09-07 12:57:18.982786
10	DOC010	pass10	Dr. Hina Qureshi	Ophthalmology	MBBS, FCPS	1500.00	3000.00	03001230010	hina.qureshi@example.com	2025-09-07 12:57:18.982786
\.


--
-- Data for Name: lab_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_order (order_id, visit_id, test_id, ordered_by, performed_by, status, created_at, urgency, results_entered_at, results_entered_by, finalized_at, finalized_by) FROM stdin;
1	1	1	1	2	Pending	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
2	1	4	1	3	Performed	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
3	2	2	2	4	Completed	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
4	2	3	2	5	Pending	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
5	3	5	3	6	Performed	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
6	3	6	3	1	Completed	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
7	4	7	1	2	Pending	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
8	5	8	2	3	Completed	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
9	6	9	5	4	Performed	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
10	7	10	4	5	Pending	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
11	8	1	6	6	Completed	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
12	9	2	7	1	Performed	2025-09-24 19:26:54.826527	Routine	\N	\N	\N	\N
14	36	1	1	\N	Pending	2025-09-24 22:06:04.184445	Routine	\N	\N	\N	\N
15	36	1	1	\N	Pending	2025-09-24 22:14:16.881634	Routine	\N	\N	\N	\N
\.


--
-- Data for Name: lab_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_result (order_id, lab_result, reported_by, reported_at, result_id) FROM stdin;
1	Hemoglobin: 13.5 g/dL, WBC: 6.8 x10^3/uL, Platelets: 250 x10^3/uL	2	2025-09-07 13:07:45.229352	1
2	Urine: Normal, no infection	3	2025-09-07 13:07:45.229352	2
3	Fasting Glucose: 95 mg/dL	4	2025-09-07 13:07:45.229352	3
5	ALT: 35 U/L, AST: 30 U/L, Bilirubin: 1.2 mg/dL	6	2025-09-07 13:07:45.229352	4
6	Creatinine: 1.0 mg/dL, BUN: 14 mg/dL	1	2025-09-07 13:07:45.229352	5
7	Pregnancy Test: Positive	2	2025-09-07 13:07:45.229352	6
8	TSH: 2.5 mIU/L, T3: 1.2 nmol/L, T4: 12.0 pmol/L	3	2025-09-07 13:07:45.229352	7
9	COVID-19 PCR: Negative	4	2025-09-07 13:07:45.229352	8
10	Vitamin D: 35 ng/mL	5	2025-09-07 13:07:45.229352	9
11	Hemoglobin: 12.8 g/dL, WBC: 7.0 x10^3/uL, Platelets: 230 x10^3/uL	6	2025-09-07 13:07:45.229352	10
\.


--
-- Data for Name: lab_result_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_result_approvals (approval_id, order_id, approved_by, approval_status, approval_notes, approved_at, signature_data) FROM stdin;
\.


--
-- Data for Name: lab_test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_test (test_id, test_name, category, price, description) FROM stdin;
1	Complete Blood Count	Hematology	500.00	Measures overall health and detects disorders
2	Blood Glucose Fasting	Biochemistry	300.00	Measures blood sugar after fasting
3	Lipid Profile	Biochemistry	800.00	Measures cholesterol and triglycerides
4	Urine Routine	Urinalysis	200.00	Checks urine for various disorders
5	Liver Function Test	Biochemistry	700.00	Evaluates liver health
6	Renal Function Test	Biochemistry	650.00	Checks kidney function
7	Pregnancy Test	Hormonal	400.00	Detects pregnancy hormone hCG
8	Thyroid Panel	Endocrinology	750.00	Measures thyroid hormone levels
9	COVID-19 PCR	Virology	1200.00	Detects presence of SARS-CoV-2
10	Vitamin D	Biochemistry	600.00	Measures Vitamin D levels in blood
\.


--
-- Data for Name: lab_test_parameters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_test_parameters (parameter_id, test_id, parameter_name, parameter_code, unit, input_type, reference_range_min, reference_range_max, reference_value_text, display_order, is_critical, is_required, created_at) FROM stdin;
1	1	White Blood Cell Count	WBC	cells/μL	number	4000.00	11000.00	\N	1	t	t	2025-10-08 11:58:52.734889
2	1	Red Blood Cell Count	RBC	million cells/μL	number	4.50	5.90	\N	2	f	t	2025-10-08 11:58:52.734889
3	1	Hemoglobin	HGB	g/dL	number	13.50	17.50	\N	3	t	t	2025-10-08 11:58:52.734889
4	1	Hematocrit	HCT	%	number	38.30	48.60	\N	4	f	t	2025-10-08 11:58:52.734889
5	1	Mean Corpuscular Volume	MCV	fL	number	80.00	100.00	\N	5	f	t	2025-10-08 11:58:52.734889
6	1	Mean Corpuscular Hemoglobin	MCH	pg	number	27.00	31.00	\N	6	f	t	2025-10-08 11:58:52.734889
7	1	Mean Corpuscular Hemoglobin Concentration	MCHC	g/dL	number	32.00	36.00	\N	7	f	t	2025-10-08 11:58:52.734889
8	1	Red Cell Distribution Width	RDW	%	number	11.50	14.50	\N	8	f	t	2025-10-08 11:58:52.734889
9	1	Platelet Count	PLT	cells/μL	number	150000.00	400000.00	\N	9	t	t	2025-10-08 11:58:52.734889
10	1	Mean Platelet Volume	MPV	fL	number	7.50	11.50	\N	10	f	f	2025-10-08 11:58:52.734889
11	1	Neutrophils	NEUT	%	number	40.00	70.00	\N	11	f	t	2025-10-08 11:58:52.734889
12	1	Lymphocytes	LYMPH	%	number	20.00	40.00	\N	12	f	t	2025-10-08 11:58:52.734889
13	1	Monocytes	MONO	%	number	2.00	8.00	\N	13	f	t	2025-10-08 11:58:52.734889
14	1	Eosinophils	EOS	%	number	1.00	4.00	\N	14	f	t	2025-10-08 11:58:52.734889
15	1	Basophils	BASO	%	number	0.50	1.00	\N	15	f	t	2025-10-08 11:58:52.734889
16	2	Fasting Blood Glucose	FBG	mg/dL	number	70.00	100.00	\N	1	t	t	2025-10-08 11:58:53.086958
17	2	Fasting Status	FAST_STATUS		select	\N	\N	Yes - 8+ hours, Yes - 12+ hours, No - Less than 8 hours, Unknown	2	f	t	2025-10-08 11:58:53.086958
18	2	Sample Quality	SAMPLE_QUALITY		select	\N	\N	Good, Hemolyzed, Lipemic, Clotted	3	f	t	2025-10-08 11:58:53.086958
19	3	Total Cholesterol	CHOL	mg/dL	number	0.00	200.00	\N	1	f	t	2025-10-08 11:58:53.104158
20	3	Triglycerides	TRIG	mg/dL	number	0.00	150.00	\N	2	f	t	2025-10-08 11:58:53.104158
21	3	HDL Cholesterol	HDL	mg/dL	number	40.00	60.00	\N	3	f	t	2025-10-08 11:58:53.104158
22	3	LDL Cholesterol	LDL	mg/dL	number	0.00	100.00	\N	4	t	t	2025-10-08 11:58:53.104158
23	3	VLDL Cholesterol	VLDL	mg/dL	number	5.00	40.00	\N	5	f	t	2025-10-08 11:58:53.104158
24	3	Total Cholesterol/HDL Ratio	CHOL_HDL_RATIO		number	0.00	5.00	\N	6	f	t	2025-10-08 11:58:53.104158
25	3	LDL/HDL Ratio	LDL_HDL_RATIO		number	0.00	3.50	\N	7	f	f	2025-10-08 11:58:53.104158
26	3	Fasting Status	FAST_STATUS		select	\N	\N	Yes - 12+ hours, Yes - 9-11 hours, No - Less than 9 hours	8	f	t	2025-10-08 11:58:53.104158
27	4	Color	COLOR		select	\N	\N	Pale Yellow, Yellow, Dark Yellow, Amber, Red, Brown, Green, Colorless	1	f	t	2025-10-08 11:58:53.358145
28	4	Appearance	APPEAR		select	\N	\N	Clear, Slightly Cloudy, Cloudy, Turbid	2	f	t	2025-10-08 11:58:53.358145
29	4	Volume	VOLUME	mL	number	\N	\N	\N	3	f	f	2025-10-08 11:58:53.358145
30	4	pH	PH		number	4.50	8.00	\N	4	f	t	2025-10-08 11:58:53.358145
31	4	Specific Gravity	SG		number	1.01	1.03	\N	5	f	t	2025-10-08 11:58:53.358145
32	4	Protein	PROTEIN		select	\N	\N	Negative, Trace, 1+, 2+, 3+, 4+	6	t	t	2025-10-08 11:58:53.358145
33	4	Glucose	GLUCOSE		select	\N	\N	Negative, Trace, 1+, 2+, 3+, 4+	7	t	t	2025-10-08 11:58:53.358145
34	4	Ketones	KETONES		select	\N	\N	Negative, Trace, Small, Moderate, Large	8	f	t	2025-10-08 11:58:53.358145
35	4	Blood	BLOOD		select	\N	\N	Negative, Trace, Small, Moderate, Large	9	t	t	2025-10-08 11:58:53.358145
36	4	Bilirubin	BILI		select	\N	\N	Negative, 1+, 2+, 3+	10	f	t	2025-10-08 11:58:53.358145
37	4	Urobilinogen	UROB		select	\N	\N	Normal, 1+, 2+, 3+, 4+	11	f	t	2025-10-08 11:58:53.358145
38	4	Nitrite	NITRITE		select	\N	\N	Negative, Positive	12	t	t	2025-10-08 11:58:53.358145
39	4	Leukocyte Esterase	LE		select	\N	\N	Negative, Trace, Small, Moderate, Large	13	f	t	2025-10-08 11:58:53.358145
40	4	RBC (Red Blood Cells)	URBC	cells/HPF	number	0.00	2.00	\N	14	f	t	2025-10-08 11:58:53.358145
41	4	WBC (White Blood Cells)	UWBC	cells/HPF	number	0.00	5.00	\N	15	f	t	2025-10-08 11:58:53.358145
42	4	Epithelial Cells	EPI	cells/HPF	select	\N	\N	Few, Moderate, Many	16	f	t	2025-10-08 11:58:53.358145
43	4	Bacteria	BACT		select	\N	\N	None, Few, Moderate, Many	17	f	t	2025-10-08 11:58:53.358145
44	4	Crystals	CRYST		text	\N	\N	\N	18	f	f	2025-10-08 11:58:53.358145
45	4	Casts	CASTS		text	\N	\N	\N	19	f	f	2025-10-08 11:58:53.358145
46	5	Alanine Aminotransferase	ALT	U/L	number	7.00	56.00	\N	1	t	t	2025-10-08 11:58:53.396213
47	5	Aspartate Aminotransferase	AST	U/L	number	10.00	40.00	\N	2	t	t	2025-10-08 11:58:53.396213
48	5	Alkaline Phosphatase	ALP	U/L	number	44.00	147.00	\N	3	f	t	2025-10-08 11:58:53.396213
49	5	Gamma-Glutamyl Transferase	GGT	U/L	number	9.00	48.00	\N	4	f	t	2025-10-08 11:58:53.396213
50	5	Total Bilirubin	TBIL	mg/dL	number	0.30	1.20	\N	5	t	t	2025-10-08 11:58:53.396213
51	5	Direct Bilirubin	DBIL	mg/dL	number	0.00	0.30	\N	6	f	t	2025-10-08 11:58:53.396213
52	5	Indirect Bilirubin	IBIL	mg/dL	number	0.20	0.90	\N	7	f	t	2025-10-08 11:58:53.396213
53	5	Total Protein	TP	g/dL	number	6.40	8.30	\N	8	f	t	2025-10-08 11:58:53.396213
54	5	Albumin	ALB	g/dL	number	3.50	5.50	\N	9	t	t	2025-10-08 11:58:53.396213
55	5	Globulin	GLOB	g/dL	number	2.30	3.50	\N	10	f	t	2025-10-08 11:58:53.396213
56	5	Albumin/Globulin Ratio	AG_RATIO		number	1.10	2.20	\N	11	f	f	2025-10-08 11:58:53.396213
57	6	Blood Urea Nitrogen	BUN	mg/dL	number	7.00	20.00	\N	1	t	t	2025-10-08 11:58:53.411744
58	6	Serum Creatinine	CREAT	mg/dL	number	0.70	1.30	\N	2	t	t	2025-10-08 11:58:53.411744
59	6	Uric Acid	URIC	mg/dL	number	3.50	7.20	\N	3	f	t	2025-10-08 11:58:53.411744
60	6	BUN/Creatinine Ratio	BUN_CREAT		number	10.00	20.00	\N	4	f	t	2025-10-08 11:58:53.411744
61	6	Estimated GFR	eGFR	mL/min/1.73m²	number	90.00	120.00	\N	5	t	t	2025-10-08 11:58:53.411744
62	6	Sodium	NA	mmol/L	number	136.00	145.00	\N	6	t	t	2025-10-08 11:58:53.411744
63	6	Potassium	K	mmol/L	number	3.50	5.10	\N	7	t	t	2025-10-08 11:58:53.411744
64	6	Chloride	CL	mmol/L	number	98.00	107.00	\N	8	f	t	2025-10-08 11:58:53.411744
65	6	Bicarbonate	HCO3	mmol/L	number	22.00	29.00	\N	9	t	t	2025-10-08 11:58:53.411744
66	6	Calcium	CA	mg/dL	number	8.50	10.50	\N	10	t	t	2025-10-08 11:58:53.411744
67	6	Phosphorus	PHOS	mg/dL	number	2.50	4.50	\N	11	f	t	2025-10-08 11:58:53.411744
68	7	hCG Qualitative Result	HCG_QUAL		select	\N	\N	Positive, Negative, Inconclusive	1	f	t	2025-10-08 11:58:53.425388
69	7	Test Method	METHOD		select	\N	\N	Urine Strip, Serum Quantitative, Serum Qualitative	2	f	t	2025-10-08 11:58:53.425388
70	7	hCG Quantitative Level	HCG_QUANT	mIU/mL	number	0.00	5.00	\N	3	f	f	2025-10-08 11:58:53.425388
71	7	Sample Type	SAMPLE		select	\N	\N	Urine - Morning, Urine - Random, Serum	4	f	t	2025-10-08 11:58:53.425388
72	7	Clinical Notes	NOTES		text	\N	\N	\N	5	f	f	2025-10-08 11:58:53.425388
73	8	Thyroid Stimulating Hormone	TSH	μIU/mL	number	0.40	4.00	\N	1	t	t	2025-10-08 11:58:53.438588
74	8	Free T4 (Thyroxine)	FT4	ng/dL	number	0.80	1.80	\N	2	t	t	2025-10-08 11:58:53.438588
75	8	Free T3 (Triiodothyronine)	FT3	pg/mL	number	2.30	4.20	\N	3	f	t	2025-10-08 11:58:53.438588
76	8	Total T4	TT4	μg/dL	number	5.00	12.00	\N	4	f	f	2025-10-08 11:58:53.438588
77	8	Total T3	TT3	ng/dL	number	80.00	200.00	\N	5	f	f	2025-10-08 11:58:53.438588
78	8	Anti-TPO Antibodies	ANTI_TPO	IU/mL	number	0.00	34.00	\N	6	f	f	2025-10-08 11:58:53.438588
79	8	Thyroglobulin Antibodies	ANTI_TG	IU/mL	number	0.00	115.00	\N	7	f	f	2025-10-08 11:58:53.438588
80	9	SARS-CoV-2 Result	COVID_RESULT		select	\N	\N	Detected (Positive), Not Detected (Negative), Inconclusive	1	t	t	2025-10-08 11:58:53.459684
81	9	Ct Value - Gene 1	CT_GENE1		number	\N	\N	\N	2	f	f	2025-10-08 11:58:53.459684
82	9	Ct Value - Gene 2	CT_GENE2		number	\N	\N	\N	3	f	f	2025-10-08 11:58:53.459684
83	9	Ct Value - Gene 3	CT_GENE3		number	\N	\N	\N	4	f	f	2025-10-08 11:58:53.459684
84	9	Sample Type	SAMPLE_TYPE		select	\N	\N	Nasopharyngeal Swab, Oropharyngeal Swab, Nasal Swab, Saliva, Sputum	5	f	t	2025-10-08 11:58:53.459684
85	9	Sample Quality	SAMPLE_QUALITY		select	\N	\N	Adequate, Inadequate - Retest Required	6	f	t	2025-10-08 11:58:53.459684
86	9	Internal Control	IC		select	\N	\N	Valid, Invalid	7	f	t	2025-10-08 11:58:53.459684
87	9	Test Kit Used	KIT		text	\N	\N	\N	8	f	f	2025-10-08 11:58:53.459684
88	9	Laboratory Notes	LAB_NOTES		text	\N	\N	\N	9	f	f	2025-10-08 11:58:53.459684
89	10	25-Hydroxyvitamin D	VIT_D	ng/mL	number	30.00	100.00	\N	1	t	t	2025-10-08 11:58:53.474769
90	10	Vitamin D Status	VIT_D_STATUS		select	\N	\N	Sufficient (30-100 ng/mL), Insufficient (20-29 ng/mL), Deficient (<20 ng/mL), Toxicity (>100 ng/mL)	2	f	t	2025-10-08 11:58:53.474769
91	10	Test Method	METHOD		select	\N	\N	ELISA, HPLC, LC-MS/MS, Chemiluminescence	3	f	f	2025-10-08 11:58:53.474769
92	10	Clinical Interpretation Notes	INTERP		text	\N	\N	\N	4	f	f	2025-10-08 11:58:53.474769
\.


--
-- Data for Name: lab_test_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_test_results (result_id, order_id, parameter_id, result_value, is_abnormal, technician_notes, entered_by, entered_at, verified_by, verified_at) FROM stdin;
1	1	1	7500	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
2	1	2	5.2	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
3	1	3	15.5	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
4	1	4	45.2	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
5	1	5	88	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
6	1	6	29	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
7	1	7	34	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
8	1	8	13.0	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
9	1	9	250000	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
10	1	10	9.5	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
11	1	11	55	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
12	1	12	30	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
13	1	13	5	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
14	1	14	2	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
15	1	15	0.8	f	\N	1	2025-10-08 12:02:37.946047	\N	\N
\.


--
-- Data for Name: medicine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine (medicine_id, generic_name, brand_name, category, dosage_value, dosage_unit, form, stock_quantity, price, created_at, barcode, sku, manufacturer, min_stock_level, max_stock_level, is_active, requires_prescription, search_vector, sub_unit, sub_units_per_unit, sub_unit_price, allow_sub_unit_sale, stock_sub_quantity) FROM stdin;
1	Paracetamol	Panadol	Analgesic	500.00	mg	Tablet	197	15.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'analges':3B 'panadol':2A 'paracetamol':1A	\N	0	\N	f	0
2	Amoxicillin	Amoxil	Antibiotic	250.00	mg	Capsule	150	25.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'amoxicillin':1A 'amoxil':2A 'antibiot':3B	\N	0	\N	f	0
3	Cefixime	Suprax	Antibiotic	200.00	mg	Tablet	100	40.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'antibiot':3B 'cefixim':1A 'suprax':2A	\N	0	\N	f	0
4	Ibuprofen	Brufen	Analgesic	400.00	mg	Tablet	120	20.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'analges':3B 'brufen':2A 'ibuprofen':1A	\N	0	\N	f	0
5	Metformin	Glucophage	Anti-diabetic	500.00	mg	Tablet	80	50.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'anti':4B 'anti-diabet':3B 'diabet':5B 'glucophag':2A 'metformin':1A	\N	0	\N	f	0
6	Amlodipine	Norvasc	Antihypertensive	5.00	mg	Tablet	90	35.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'amlodipin':1A 'antihypertens':3B 'norvasc':2A	\N	0	\N	f	0
7	Omeprazole	Losec	Gastroprotective	20.00	mg	Capsule	70	30.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'gastroprotect':3B 'losec':2A 'omeprazol':1A	\N	0	\N	f	0
8	Salbutamol	Ventolin	Bronchodilator	100.00	mcg	Inhaler	60	250.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'bronchodil':3B 'salbutamol':1A 'ventolin':2A	\N	0	\N	f	0
9	Cetirizine	Zyrtec	Antihistamine	10.00	mg	Tablet	110	18.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'antihistamin':3B 'cetirizin':1A 'zyrtec':2A	\N	0	\N	f	0
10	Lorazepam	Ativan	Sedative	1.00	mg	Tablet	50	45.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'ativan':2A 'lorazepam':1A 'sedat':3B	\N	0	\N	f	0
11	Diclofenac	Voltaren	NSAID	50.00	mg	Tablet	130	22.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'diclofenac':1A 'nsaid':3B 'voltaren':2A	\N	0	\N	f	0
13	Ranitidine	Zantac	Gastroprotective	150.00	mg	Tablet	100	28.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'gastroprotect':3B 'ranitidin':1A 'zantac':2A	\N	0	\N	f	0
14	Furosemide	Lasix	Diuretic	40.00	mg	Tablet	90	20.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'diuret':3B 'furosemid':1A 'lasix':2A	\N	0	\N	f	0
15	Ciprofloxacin	Cipro	Antibiotic	500.00	mg	Tablet	75	55.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'antibiot':3B 'cipro':2A 'ciprofloxacin':1A	\N	0	\N	f	0
16	Hydrochlorothiazide	Esidrex	Diuretic	25.00	mg	Tablet	60	18.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'diuret':3B 'esidrex':2A 'hydrochlorothiazid':1A	\N	0	\N	f	0
18	Clindamycin	Dalacin	Antibiotic	300.00	mg	Capsule	50	70.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'antibiot':3B 'clindamycin':1A 'dalacin':2A	\N	0	\N	f	0
19	Levocetirizine	Xyzal	Antihistamine	5.00	mg	Tablet	100	25.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'antihistamin':3B 'levocetirizin':1A 'xyzal':2A	\N	0	\N	f	0
20	Metoprolol	Lopressor	Antihypertensive	50.00	mg	Tablet	80	40.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'antihypertens':3B 'lopressor':2A 'metoprolol':1A	\N	0	\N	f	0
12	Prednisolone	Prednisone	Steroid	10.00	mg	Tablet	39	60.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'prednisolon':1A 'prednison':2A 'steroid':3B	\N	0	\N	f	0
17	Azithromycin	Zithromax	Antibiotic	500.00	mg	Tablet	85	65.00	2025-09-07 13:04:08.818759	\N	\N	\N	10	1000	t	f	'antibiot':3B 'azithromycin':1A 'zithromax':2A	\N	0	\N	f	0
\.


--
-- Data for Name: medicine_batch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_batch (batch_id, medicine_id, stock_quantity, stock_sub_quantity, purchase_price, purchase_sub_unit_price, sale_price, sale_sub_unit_price, expiry_date, batch_number, received_date, party_id) FROM stdin;
\.


--
-- Data for Name: medicine_purchase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_purchase (purchase_id, party_id, invoice_no, invoice_timestamp, total_amount, payment_status, created_at, created_by) FROM stdin;
1	1	INV-1001	2025-09-07 13:08:19.434238	5000.00	Paid	2025-09-07 13:08:19.434238	\N
2	2	INV-1002	2025-09-07 13:08:19.434238	7500.00	Partial	2025-09-07 13:08:19.434238	\N
3	3	INV-1003	2025-09-07 13:08:19.434238	3000.00	Unpaid	2025-09-07 13:08:19.434238	\N
4	1	INV-1004	2025-09-07 13:08:19.434238	12000.00	Paid	2025-09-07 13:08:19.434238	\N
5	4	INV-1005	2025-09-07 13:08:19.434238	4500.00	Partial	2025-09-07 13:08:19.434238	\N
6	5	INV-1006	2025-09-07 13:08:19.434238	6000.00	Paid	2025-09-07 13:08:19.434238	\N
7	2	INV-1007	2025-09-07 13:08:19.434238	8000.00	Unpaid	2025-09-07 13:08:19.434238	\N
8	3	INV-1008	2025-09-07 13:08:19.434238	3500.00	Paid	2025-09-07 13:08:19.434238	\N
9	4	INV-1009	2025-09-07 13:08:19.434238	7000.00	Partial	2025-09-07 13:08:19.434238	\N
10	5	INV-1010	2025-09-07 13:08:19.434238	9000.00	Paid	2025-09-07 13:08:19.434238	\N
\.


--
-- Data for Name: medicine_purchase_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_purchase_detail (id, purchase_id, medicine_id, quantity, unit_cost, sub_quantity, sub_unit_cost, batch_id) FROM stdin;
1	1	1	50	12.00	0	0.0	\N
2	1	2	30	20.00	0	0.0	\N
3	2	3	40	35.00	0	0.0	\N
4	2	4	25	18.00	0	0.0	\N
5	3	5	20	45.00	0	0.0	\N
6	3	6	15	30.00	0	0.0	\N
7	4	7	10	220.00	0	0.0	\N
8	4	8	18	60.00	0	0.0	\N
9	5	9	30	15.00	0	0.0	\N
10	5	10	25	40.00	0	0.0	\N
11	6	11	50	18.00	0	0.0	\N
12	6	12	30	55.00	0	0.0	\N
13	7	13	40	28.00	0	0.0	\N
14	7	14	20	15.00	0	0.0	\N
15	8	15	35	60.00	0	0.0	\N
16	8	16	25	12.00	0	0.0	\N
17	9	17	30	65.00	0	0.0	\N
18	9	18	20	70.00	0	0.0	\N
19	10	19	25	25.00	0	0.0	\N
20	10	20	40	35.00	0	0.0	\N
\.


--
-- Data for Name: medicine_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_transaction (txn_id, medicine_id, txn_type, quantity, amount_per_unit, ref_purchase_id, ref_sale_id, ref_purchase_return, ref_sale_return, created_at, sub_quantity) FROM stdin;
1	1	purchase	50	12.00	1	\N	\N	\N	2025-09-07 13:13:16.605281	0
2	2	purchase	30	20.00	1	\N	\N	\N	2025-09-07 13:13:16.605281	0
3	3	purchase	40	35.00	2	\N	\N	\N	2025-09-07 13:13:16.605281	0
4	4	purchase	25	18.00	2	\N	\N	\N	2025-09-07 13:13:16.605281	0
5	5	purchase	20	45.00	3	\N	\N	\N	2025-09-07 13:13:16.605281	0
6	1	sale	5	12.00	\N	1	\N	\N	2025-09-07 13:13:16.605281	0
7	2	sale	10	20.00	\N	1	\N	\N	2025-09-07 13:13:16.605281	0
8	3	sale	5	28.00	\N	3	\N	\N	2025-09-07 13:13:16.605281	0
9	4	sale	6	18.00	\N	2	\N	\N	2025-09-07 13:13:16.605281	0
10	5	sale	3	45.00	\N	5	\N	\N	2025-09-07 13:13:16.605281	0
11	1	purchase_return	10	12.00	\N	\N	1	\N	2025-09-07 13:13:16.605281	0
12	2	purchase_return	5	20.00	\N	\N	1	\N	2025-09-07 13:13:16.605281	0
13	3	purchase_return	8	35.00	\N	\N	2	\N	2025-09-07 13:13:16.605281	0
14	4	purchase_return	6	18.00	\N	\N	2	\N	2025-09-07 13:13:16.605281	0
15	5	purchase_return	4	45.00	\N	\N	3	\N	2025-09-07 13:13:16.605281	0
16	1	sale_return	1	12.00	\N	\N	\N	7	2025-09-07 13:13:16.605281	0
17	2	sale_return	2	20.00	\N	\N	\N	8	2025-09-07 13:13:16.605281	0
18	3	sale_return	2	28.00	\N	\N	\N	1	2025-09-07 13:13:16.605281	0
19	4	sale_return	1	18.00	\N	\N	\N	1	2025-09-07 13:13:16.605281	0
20	5	sale_return	3	45.00	\N	\N	\N	5	2025-09-07 13:13:16.605281	0
21	6	adjustment	5	30.00	\N	\N	\N	\N	2025-09-07 13:13:16.605281	0
23	12	sale	1	60.00	\N	20	\N	\N	2025-09-28 08:27:55.720514	0
25	12	sale_return	1	60.00	\N	\N	\N	15	2025-09-28 09:58:14.126306	0
26	12	sale	1	60.00	\N	21	\N	\N	2025-09-28 09:58:46.935709	0
27	12	sale	1	60.00	\N	21	\N	\N	2025-09-28 09:58:46.935709	0
28	12	sale_return	1	60.00	\N	\N	\N	17	2025-09-28 11:38:45.219157	0
29	12	sale	1	60.00	\N	22	\N	\N	2025-09-28 11:38:53.023284	0
30	12	sale_return	1	60.00	\N	\N	\N	18	2025-09-28 11:39:06.23702	0
31	17	sale	2	65.00	\N	23	\N	\N	2025-10-02 16:15:43.973502	0
32	17	sale_return	2	65.00	\N	\N	\N	19	2025-10-02 16:16:04.805063	0
45	1	sale	1	15.00	\N	37	\N	\N	2025-11-14 07:49:54.354203	0
46	1	sale	1	15.00	\N	38	\N	\N	2025-11-14 07:50:31.550842	0
47	1	sale	1	15.00	\N	39	\N	\N	2025-11-14 07:51:08.466045	0
\.


--
-- Data for Name: menstrual_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menstrual_history (menstrual_history_id, patient_id, menarch_age, cycle_length_days, bleeding_days, menstrual_regular, contraception_history, gynecologic_surgeries, medical_conditions, menopause_status, notes) FROM stdin;
14	5	13	28	6	t	None	None	None	f	Regular cycles, no issues
\.


--
-- Data for Name: obstetric_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.obstetric_history (obstetric_history_id, patient_id, is_first_pregnancy, married_years, gravida, para, abortions, edd, last_menstrual_cycle, notes) FROM stdin;
2	4	f	7	3	2	1	2025-11-20	2025-04-15	High-risk twin pregnancy
3	5	t	2	1	2	0	2025-12-25	2025-06-01	First pregnancy, monitor anemia
4	7	f	4	2	2	0	2025-12-30	2025-05-15	Postpartum follow-up
5	9	t	1	1	2	0	2025-12-15	2025-08-01	First trimester checkup
6	13	f	6	2	2	0	2025-12-05	2025-03-10	Monitor blood pressure
7	10	t	3	1	2	0	2025-12-28	2025-07-15	First pregnancy
8	12	f	5	2	2	0	2025-12-18	2025-05-25	Monitor gestational diabetes risk
1	1	f	6	2	1	0	2025-12-09	2025-04-30	Routine second pregnancy follow-up
\.


--
-- Data for Name: para_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.para_details (para_id, obstetric_history_id, para_number, birth_year, birth_month, gender, delivery_type, alive, birth_weight_grams, complications, notes, gestational_age_weeks) FROM stdin;
15	2	1	2019	8	Male	Normal	t	3100	None	First child	\N
16	2	2	2021	7	Female	Normal	t	3300	None	Second child	\N
17	2	3	2023	6	Female	C-section	t	3500	Gestational diabetes	High-risk pregnancy	\N
18	4	1	2018	3	Male	Normal	t	3000	None	First child	\N
19	4	2	2020	4	Female	C-section	t	3200	None	Second child	\N
20	5	1	2023	6	Male	Normal	t	3300	None	First pregnancy	\N
21	6	1	2024	2	Female	Normal	t	3100	None	First pregnancy	\N
22	7	1	2019	5	Male	Normal	t	3200	None	First child	\N
23	7	2	2021	8	Female	C-section	t	3400	Hypertension	Second child	\N
24	8	1	2020	9	Male	Normal	t	3300	None	First pregnancy	\N
29	3	1	2021	5	Male		f	3300	None		50
32	3	2	2003	23	Male	Normal	f	3400	None	wwewed	50
13	1	1	2020	5	Female	Normal	f	3200	None	Healthy baby	\N
\.


--
-- Data for Name: party; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.party (party_id, name, contact_number, address, created_at) FROM stdin;
1	MedSuppliers Karachi	03001230010	Karachi	2025-09-07 12:59:09.3863
2	HealthPlus Lahore	03001230011	Lahore	2025-09-07 12:59:09.3863
3	PharmaSource Islamabad	03001230012	Islamabad	2025-09-07 12:59:09.3863
4	GlobalMed Quetta	03001230013	Quetta	2025-09-07 12:59:09.3863
5	Wellness Supplies Peshawar	03001230014	Peshawar	2025-09-07 12:59:09.3863
6	CarePoint Faisalabad	03001230015	Faisalabad	2025-09-07 12:59:09.3863
7	HealthMart Hyderabad	03001230016	Hyderabad	2025-09-07 12:59:09.3863
8	MediLink Multan	03001230017	Multan	2025-09-07 12:59:09.3863
9	BioPharm Karachi	03001230018	Karachi	2025-09-07 12:59:09.3863
10	TopMed Lahore	03001230019	Lahore	2025-09-07 12:59:09.3863
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient (patient_id, patient_name, age, gender, contact_number, cnic, address, created_at) FROM stdin;
1	Alice Johnson	28	Female	03001234567	42101-1234567-1	Karachi	2025-09-07 12:54:59.933911
2	Bob Smith	35	Male	03007654321	42101-7654321-2	Lahore	2025-09-07 12:54:59.933911
3	Charlie Brown	42	Male	03009876543	42101-9876543-3	Islamabad	2025-09-07 12:54:59.933911
4	Diana Prince	30	Female	03005554444	42101-5555444-4	Rawalpindi	2025-09-07 12:54:59.933911
5	Eve Adams	25	Other	03001112233	42101-1112233-5	Karachi	2025-09-07 12:54:59.933911
6	Frank Wright	50	Male	03009998877	42101-9988776-6	Multan	2025-09-07 12:54:59.933911
7	Grace Lee	32	Female	03004443322	42101-4433221-7	Peshawar	2025-09-07 12:54:59.933911
8	Hassan Khan	29	Male	03006667788	42101-6677883-8	Karachi	2025-09-07 12:54:59.933911
9	Ivy Chen	24	Female	03003332211	42101-3322110-9	Lahore	2025-09-07 12:54:59.933911
10	Jack O'Neil	45	Male	03008889999	42101-8889990-10	Islamabad	2025-09-07 12:54:59.933911
11	Kiran Malik	38	Female	03007776655	42101-7776655-11	Quetta	2025-09-07 12:54:59.933911
12	Leo Martinez	31	Male	03006665544	42101-6665544-12	Karachi	2025-09-07 12:54:59.933911
13	Mona Ali	27	Female	03005556677	42101-5556677-13	Faisalabad	2025-09-07 12:54:59.933911
14	Nadia Hassan	22	Female	03004445566	42101-4445566-14	Rawalpindi	2025-09-07 12:54:59.933911
15	Omar Siddiqui	40	Male	03003334455	42101-3334455-15	Hyderabad	2025-09-07 12:54:59.933911
16	saad	18	Male	234567654321	42591-9847539-1	Islamabad	2025-09-09 08:04:35.969443
17	saad don	18	Male	234567654321	42591-9847539-1	Islamabad	2025-09-09 08:12:51.73195
18	Kamran	50	Male	234567654321	42591-9847539-1	home1	2025-09-09 08:14:06.849702
19	usama	19	Male	234567654321	42591-9847539-1	layyah	2025-09-09 18:09:49.337863
20	talha habib	28	Male	234567654321	42591-9847539-1	bhakkar	2025-09-09 18:12:20.051398
\.


--
-- Data for Name: patient_vitals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_vitals (vital_id, visit_id, blood_pressure, heart_rate, temperature, weight, height, recorded_at, blood_group) FROM stdin;
1	1	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
2	2	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
3	3	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
4	4	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
5	5	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
6	6	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
7	7	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
8	8	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
9	9	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
10	10	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
11	11	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
12	12	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
13	13	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
14	14	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
15	15	1700	700	120	800	50	2025-09-07 13:00:48.593826	A+
19	30	170	70	120	80	5	2025-09-13 20:15:35.801045	A+
20	29	130	80	120	90	50	2025-09-13 21:35:06.652516	A+
\.


--
-- Data for Name: pharmacy_customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_customer (customer_id, name, phone, email, address, loyalty_points, created_at, last_purchase_date) FROM stdin;
1	Alice Johnson	555-0101	alice.j@example.com	123 Main St, Anytown	250	2024-01-15 10:00:00	2025-10-20 14:30:00
2	Bob Smith	555-0102	bob.s@example.com	456 Oak Ave, Somewhere City	80	2024-03-20 15:30:00	2025-11-01 09:00:00
3	Charlie Brown	555-0103	charlie.b@test.com	789 Pine Ln, Otherplace	500	2023-12-01 08:00:00	2025-11-10 18:00:00
4	Diana Prince	555-0104	diana.p@hero.org	321 River Rd, Metropolis	10	2025-05-01 12:00:00	2025-05-01 12:00:00
5	Ethan Hunt	555-0105	ethan.h@agent.net	987 Mountain View, Spyville	0	2025-11-13 17:00:00	2025-11-13 17:00:00
\.


--
-- Data for Name: pharmacy_sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_sale (sale_id, visit_id, bill_id, sale_timestamp, handled_by, total_amount, status, payment_type, payment_reference, paid_amount, due_amount, change_amount, discount_percent, discount_amount, tax_amount, is_prescription_sale, prescription_id, notes, customer_id) FROM stdin;
1	1	1	2025-09-07 13:11:22.775195	1	400.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
2	2	2	2025-09-07 13:11:22.775195	2	600.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
3	3	3	2025-09-07 13:11:22.775195	3	450.00	Returned	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
4	4	4	2025-09-07 13:11:22.775195	4	700.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
5	5	5	2025-09-07 13:11:22.775195	5	500.00	Cancelled	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
6	6	6	2025-09-07 13:11:22.775195	1	550.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
7	7	7	2025-09-07 13:11:22.775195	2	600.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
8	8	8	2025-09-07 13:11:22.775195	3	450.00	Returned	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
9	9	9	2025-09-07 13:11:22.775195	4	800.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
10	10	10	2025-09-07 13:11:22.775195	5	550.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
11	11	11	2025-09-07 13:11:22.775195	1	650.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
12	12	12	2025-09-07 13:11:22.775195	2	600.00	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
21	39	14	2025-09-28 09:58:46.935709	1	\N	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
22	39	14	2025-09-28 11:38:53.023284	1	\N	Completed	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
20	39	14	2025-09-28 08:27:55.720514	1	\N	Returned	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
23	41	16	2025-10-02 16:15:43.973502	1	\N	Returned	CASH	\N	0.00	0.00	0.00	0.00	0.00	0.00	f	\N	\N	\N
37	\N	\N	2025-11-14 07:49:54.354203	1	15.00	Completed	CASH	TXN-1763088591249-316	1000.00	0.00	985.00	0.00	0.00	0.00	f	\N	\N	1
38	\N	\N	2025-11-14 07:50:31.550842	1	15.00	Completed	CASH	TXN-1763088630799-168	1000.00	0.00	985.00	0.00	0.00	0.00	f	\N	\N	1
39	\N	\N	2025-11-14 07:51:08.466045	1	15.00	Completed	CASH	TXN-1763088667593-870	500.00	0.00	485.00	0.00	0.00	0.00	f	\N	\N	1
\.


--
-- Data for Name: pharmacy_sale_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_sale_detail (pharmacy_sale_detail_id, sale_id, medicine_id, quantity, unit_sale_price, line_total, discount_percent, discount_amount, sub_unit_sale_price, sub_quantity, batch_id) FROM stdin;
1	1	1	5	12.00	60.00	0.00	0.00	\N	0	\N
2	1	2	10	20.00	200.00	0.00	0.00	\N	0	\N
3	1	3	5	28.00	140.00	0.00	0.00	\N	0	\N
4	2	4	6	18.00	108.00	0.00	0.00	\N	0	\N
5	2	5	5	45.00	225.00	0.00	0.00	\N	0	\N
6	2	6	4	30.00	120.00	0.00	0.00	\N	0	\N
7	3	7	2	220.00	440.00	0.00	0.00	\N	0	\N
8	3	8	1	60.00	60.00	0.00	0.00	\N	0	\N
9	4	9	5	15.00	75.00	0.00	0.00	\N	0	\N
10	4	10	3	40.00	120.00	0.00	0.00	\N	0	\N
11	5	11	4	18.00	72.00	0.00	0.00	\N	0	\N
12	5	12	2	55.00	110.00	0.00	0.00	\N	0	\N
13	6	13	5	28.00	140.00	0.00	0.00	\N	0	\N
14	6	14	6	15.00	90.00	0.00	0.00	\N	0	\N
15	7	15	4	60.00	240.00	0.00	0.00	\N	0	\N
16	7	16	3	12.00	36.00	0.00	0.00	\N	0	\N
17	8	17	2	65.00	130.00	0.00	0.00	\N	0	\N
18	8	18	1	70.00	70.00	0.00	0.00	\N	0	\N
19	9	19	3	25.00	75.00	0.00	0.00	\N	0	\N
20	9	20	5	35.00	175.00	0.00	0.00	\N	0	\N
21	10	1	6	12.00	72.00	0.00	0.00	\N	0	\N
22	10	2	4	20.00	80.00	0.00	0.00	\N	0	\N
23	11	3	5	28.00	140.00	0.00	0.00	\N	0	\N
24	11	4	6	18.00	108.00	0.00	0.00	\N	0	\N
25	12	5	7	45.00	315.00	0.00	0.00	\N	0	\N
29	20	12	1	60.00	60.00	0.00	0.00	\N	0	\N
30	21	12	1	60.00	60.00	0.00	0.00	\N	0	\N
31	21	12	1	60.00	60.00	0.00	0.00	\N	0	\N
32	22	12	1	60.00	60.00	0.00	0.00	\N	0	\N
33	23	17	2	65.00	130.00	0.00	0.00	\N	0	\N
46	37	1	1	15.00	NaN	0.00	NaN	15.00	0	\N
47	38	1	1	15.00	NaN	0.00	NaN	15.00	0	\N
48	39	1	1	15.00	NaN	0.00	NaN	15.00	0	\N
\.


--
-- Data for Name: pos_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_audit_log (log_id, staff_id, action_type, sale_id, description, ip_address, user_agent, created_at) FROM stdin;
1	1	SALE_COMPLETED	37	Completed sale TXN-1763088591249-316 with 1 items	\N	\N	2025-11-14 07:49:54.354203
2	1	SALE_COMPLETED	38	Completed sale TXN-1763088630799-168 with 1 items	\N	\N	2025-11-14 07:50:31.550842
3	1	RECEIPT_PRINTED	38	Receipt printed for sale TXN-1763088630799-168	\N	\N	2025-11-14 07:50:32.221651
4	1	CASH_DRAWER_OPENED	\N	Cash drawer manually opened	\N	\N	2025-11-14 07:50:33.455287
5	1	SALE_COMPLETED	39	Completed sale TXN-1763088667593-870 with 1 items	\N	\N	2025-11-14 07:51:08.466045
6	1	RECEIPT_PRINTED	39	Receipt printed for sale TXN-1763088667593-870	\N	\N	2025-11-14 07:51:09.324495
7	1	CASH_DRAWER_OPENED	\N	Cash drawer manually opened	\N	\N	2025-11-14 07:51:10.011501
\.


--
-- Data for Name: pos_held_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_held_transaction (hold_id, staff_id, customer_name, customer_phone, hold_timestamp, retrieved_timestamp, total_amount, status, notes) FROM stdin;
\.


--
-- Data for Name: pos_held_transaction_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_held_transaction_detail (detail_id, hold_id, medicine_id, qty, sub_qty, unit_price, discount_percent, line_total) FROM stdin;
\.


--
-- Data for Name: pos_receipt_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_receipt_config (config_id, clinic_name, clinic_address, clinic_phone, clinic_email, tax_registration_number, receipt_header, receipt_footer, logo_url, printer_name, paper_size, is_active, created_at) FROM stdin;
1	Your Clinic Name	Your Clinic Address	Your Phone Number	\N	\N	\N	Thank you for your visit!	\N	\N	80mm	t	2025-10-14 10:16:25.779778
\.


--
-- Data for Name: pos_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_session (session_id, staff_id, opening_time, closing_time, opening_balance, closing_balance, expected_balance, cash_sales_total, card_sales_total, total_sales_count, notes, status) FROM stdin;
\.


--
-- Data for Name: prescription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription (prescription_id, visit_id, doctor_id, created_at) FROM stdin;
1	1	1	2025-09-07 13:04:33.63867
2	2	2	2025-09-07 13:04:33.63867
3	3	3	2025-09-07 13:04:33.63867
4	4	1	2025-09-07 13:04:33.63867
5	5	2	2025-09-07 13:04:33.63867
6	6	5	2025-09-07 13:04:33.63867
7	7	4	2025-09-07 13:04:33.63867
8	8	6	2025-09-07 13:04:33.63867
9	9	7	2025-09-07 13:04:33.63867
10	10	5	2025-09-07 13:04:33.63867
19	36	1	2025-09-24 19:02:01.599964
20	39	1	2025-09-28 07:58:01.296136
23	41	1	2025-10-02 16:15:19.944547
\.


--
-- Data for Name: prescription_medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_medicines (prescription_medicine_id, prescription_id, medicine_id, duration, instructions, dispensed_by, frequency, prescribed_quantity, dispensed_quantity, dispensed_at, created_at, updated_at, prescribed_sub_quantity, dispensed_sub_quantity) FROM stdin;
9	5	8	As needed	Use inhaler when short of breath	3	Unspecified	9	9	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
14	7	14	As needed	Take one tablet in morning	2	Once daily (morning)	14	14	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
16	8	16	As needed	Take one tablet in morning	4	Once daily (morning)	4	4	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
3	2	2	10 days	Take one capsule every 12 hours	3	Every 12 hours	17	17	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
4	2	4	5 days	Take one tablet after meals	4	Unspecified	7	7	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
5	3	3	7 days	Take one tablet every 12 hours	5	Every 12 hours	12	12	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
2	1	9	7 days	Take one tablet at night	1	Once daily (night)	4	4	2025-09-27 20:16:21.44961	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
1	1	1	5 days	Take one tablet every 8 hours	1	Every 8 hours	19	19	2025-09-27 20:16:21.449871	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
6	3	5	30 days	Take one tablet twice a day	6	Twice daily	9	9	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
7	4	6	30 days	Take one tablet daily in morning	1	Once daily (morning)	16	16	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
8	4	7	14 days	Take one capsule before breakfast	2	Unspecified	17	17	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
10	5	10	7 days	Take one tablet before sleep	4	Unspecified	18	18	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
11	6	11	5 days	Take one tablet every 8 hours	5	Every 8 hours	5	5	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
12	6	12	7 days	Take one tablet in morning	6	Once daily (morning)	16	16	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
13	7	13	14 days	Take one tablet before meal	1	Unspecified	15	15	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
15	8	15	10 days	Take one tablet every 12 hours	3	Every 12 hours	3	3	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
17	9	17	5 days	Take one tablet every 12 hours	5	Every 12 hours	18	18	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
18	9	18	7 days	Take one tablet at night	6	Once daily (night)	9	9	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
19	10	19	7 days	Take one tablet in morning	1	Once daily (morning)	20	20	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
20	10	20	30 days	Take one tablet daily	2	Once daily	6	6	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	0	0
26	19	2	7 days	chill kar	1	tow times a day	1	1	2025-09-27 20:16:21.436338	2025-09-24 19:02:01.599964	2025-09-24 19:02:01.599964	0	0
27	20	12	7 days	chill kar	\N	tow times a day	1	0	\N	2025-09-28 07:58:01.296136	2025-09-28 07:58:01.296136	0	0
29	23	17	7 days	chill kar	\N	tow times a day	2	0	\N	2025-10-02 16:15:19.944547	2025-10-02 16:15:19.944547	0	0
\.


--
-- Data for Name: purchase_return; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_return (return_id, purchase_id, reason, return_timestamp, created_by) FROM stdin;
1	1	Damaged packaging	2025-09-07 13:09:32.656789	1
2	2	Expired stock	2025-09-07 13:09:32.656789	2
3	3	Wrong quantity delivered	2025-09-07 13:09:32.656789	3
4	4	Incorrect medicine delivered	2025-09-07 13:09:32.656789	4
5	5	Defective batch	2025-09-07 13:09:32.656789	5
6	6	Supplier error	2025-09-07 13:09:32.656789	1
7	7	Overstocked item	2025-09-07 13:09:32.656789	2
8	8	Packaging issue	2025-09-07 13:09:32.656789	3
\.


--
-- Data for Name: purchase_return_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_return_detail (id, return_id, medicine_id, quantity, sub_quantity, returned_unit_price, returned_sub_unit_price) FROM stdin;
1	1	1	10	0	\N	\N
2	1	2	5	0	\N	\N
3	2	3	8	0	\N	\N
4	2	4	6	0	\N	\N
5	3	5	4	0	\N	\N
6	3	6	3	0	\N	\N
7	4	7	2	0	\N	\N
8	5	8	5	0	\N	\N
9	6	9	6	0	\N	\N
10	7	10	4	0	\N	\N
11	8	11	5	0	\N	\N
12	8	12	3	0	\N	\N
\.


--
-- Data for Name: sale_return; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_return (return_id, sale_id, reason, return_timestamp, created_by) FROM stdin;
1	3	Expired medicine	2025-09-07 13:12:15.744547	2
2	8	Wrong medicine delivered	2025-09-07 13:12:15.744547	3
3	5	Damaged packaging	2025-09-07 13:12:15.744547	1
4	12	Customer changed mind	2025-09-07 13:12:15.744547	4
5	2	Overstocked item	2025-09-07 13:12:15.744547	5
6	7	Defective batch	2025-09-07 13:12:15.744547	2
7	1	Incorrect dosage dispensed	2025-09-07 13:12:15.744547	3
8	10	Returned due to allergy	2025-09-07 13:12:15.744547	1
15	20	dsds	2025-09-28 09:58:14.126306	1
17	20	aisa hi wapis karwa rha hon	2025-09-28 11:38:45.219157	1
18	20	aisa hi wapis karwa rha hon	2025-09-28 11:39:06.23702	1
19	23	return kar le	2025-10-02 16:16:04.805063	1
\.


--
-- Data for Name: sale_return_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_return_detail (id, return_id, medicine_id, qty, unit_price) FROM stdin;
1	1	3	2	28.00
2	2	17	1	65.00
3	3	11	1	18.00
4	4	20	2	35.00
5	5	5	3	45.00
6	6	15	2	60.00
7	7	1	1	12.00
8	8	2	2	20.00
9	1	4	1	18.00
10	2	18	1	70.00
11	3	12	2	55.00
12	4	19	1	25.00
16	15	12	1	60.00
18	17	12	1	60.00
19	18	12	1	60.00
20	19	17	2	65.00
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (staff_id, user_code, password, name, role, education, contact_number, email, created_at) FROM stdin;
1	STF001	pass1	Sara Ahmed	Receptionist	BA	03001110001	sara.ahmed@example.com	2025-09-07 12:58:31.969695
2	STF002	pass2	Naveed Khan	Pharmacist	BPharm	03001110002	naveed.khan@example.com	2025-09-07 12:58:31.969695
3	STF003	pass3	Ayesha Malik	Lab_Technician	BS Lab Technology	03001110003	ayesha.malik@example.com	2025-09-07 12:58:31.969695
4	STF004	pass4	Imran Ali	Cashier	BBA	03001110004	imran.ali@example.com	2025-09-07 12:58:31.969695
5	STF005	pass5	Hina Shah	Nurse	BSc Nursing	03001110005	hina.shah@example.com	2025-09-07 12:58:31.969695
6	STF006	pass6	Bilal Raza	Admin	MBA	03001110006	bilal.raza@example.com	2025-09-07 12:58:31.969695
7	STF007	pass7	Fatima Khan	Receptionist	BA	03001110007	fatima.khan@example.com	2025-09-07 12:58:31.969695
8	STF008	pass8	Omar Siddiqui	Pharmacist	BPharm	03001110008	omar.siddiqui@example.com	2025-09-07 12:58:31.969695
9	STF009	pass9	Aliya Malik	Lab_Technician	BS Lab Technology	03001110009	aliya.malik@example.com	2025-09-07 12:58:31.969695
10	STF010	pass10	Usman Qureshi	Nurse	BSc Nursing	03001110010	usman.qureshi@example.com	2025-09-07 12:58:31.969695
\.


--
-- Data for Name: visit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visit (visit_id, patient_id, doctor_id, visit_timestamp, visit_type, clinic_number, status, reason, is_deleted) FROM stdin;
7	7	4	2025-09-07 12:59:49.897428	OPD	107	waiting	Child vaccination follow-up	f
9	9	7	2025-09-07 12:59:49.897428	OPD	109	waiting	Ear pain and sinus infection	f
10	10	8	2025-09-07 12:59:49.897428	Emergency	110	waiting	Seizure episode	f
11	11	9	2025-09-07 12:59:49.897428	OPD	111	waiting	Anxiety and stress management	f
13	13	1	2025-09-07 12:59:49.897428	OPD	113	waiting	Follow-up gynecology consultation	f
14	14	3	2025-09-07 12:59:49.897428	Emergency	114	waiting	High fever and dehydration	f
15	15	5	2025-09-07 12:59:49.897428	OPD	115	waiting	Knee pain and arthritis assessment	f
40	1	2	2025-10-01 11:02:30.242314	OPD	1	waiting	Head pain	f
41	1	5	2025-10-02 16:14:26.730026	OPD	1	waiting	Mouth pain	f
2	2	2	2025-09-07 12:59:49.897428	Emergency	102	waiting	Chest pain and shortness of breath	t
19	2	5	2025-09-12 17:58:35.40997	OPD	2	waiting	Head pain	t
4	4	1	2025-09-07 12:59:49.897428	OPD	104	waiting	Pregnancy consultation	t
22	4	3	2025-09-12 17:59:46.81908	OPD	5	waiting	Heart pain	t
6	6	5	2025-09-07 12:59:49.897428	OPD	106	waiting	Back pain and joint issues	t
23	6	3	2025-09-12 18:30:46.46716	Emergency	6	waiting	Head pain	t
42	1	3	2025-10-03 06:34:28.058052	OPD	1	waiting	Head pain	f
43	1	4	2025-10-05 12:24:06.64895	OPD	1	waiting	Pain	f
44	1	2	2025-10-06 16:19:21.303975	OPD	1	waiting	pregnancy	f
45	1	7	2025-10-11 14:23:01.336873	OPD	1	waiting	pain	f
3	3	3	2025-09-07 12:59:49.897428	Emergency	3	waiting	Mouth pain	f
20	3	3	2025-09-12 17:59:21.403553	Emergency	3	waiting	Mouth pain	f
8	8	6	2025-09-07 12:59:49.897428	OPD	108	waiting	Skin rash and irritation	t
24	8	5	2025-09-12 18:36:35.447956	Emergency	7	waiting	Mouth pain	t
26	15	5	2025-09-12 20:52:35.9955	Emergency	9	waiting	Heart pain	f
17	17	3	2025-09-11 14:28:23.175159	Emergency	1	waiting	Head pain	t
27	17	3	2025-09-12 22:52:29.028052	OPD	10	waiting	Head pain	t
5	5	2	2025-09-07 12:59:49.897428	Emergency	105	waiting	Severe headache	t
21	5	4	2025-09-12 17:59:34.226128	OPD	4	waiting	Head pain	t
12	12	10	2025-09-07 12:59:49.897428	OPD	112	waiting	Eye redness and irritation	t
25	12	4	2025-09-12 18:37:50.00936	Emergency	8	waiting	Head pain	t
30	2	4	2025-09-13 20:05:09.064129	Emergency	2	waiting	Head pain	f
1	1	1	2025-09-07 12:59:49.897428	OPD	101	waiting	Routine gynecology checkup	t
18	1	3	2025-09-12 17:58:08.290421	OPD	1	waiting	Head pain	t
28	1	3	2025-09-12 22:55:44.778019	OPD	11	waiting	Heart pain	t
29	1	4	2025-09-13 08:56:38.733627	OPD	1	waiting	Head pain	t
31	1	3	2025-09-18 07:44:34.265976	OPD	1	waiting	Head pain	t
32	1	3	2025-09-18 22:10:44.26289	OPD	1	waiting	Head pain	f
33	1	2	2025-09-19 09:51:09.963439	OPD	1	waiting	Head pain	f
34	1	3	2025-09-20 10:52:20.339557	OPD	1	waiting	Head pain	f
35	1	2	2025-09-23 14:18:16.194544	OPD	1	seen_by_doctor	Head pain	f
36	1	2	2025-09-24 18:41:35.920454	OPD	1	waiting	Head pain	f
37	1	2	2025-09-25 12:39:19.149948	OPD	1	waiting	Head pain	f
38	1	3	2025-09-27 19:47:56.310928	OPD	1	waiting	Head pain	f
39	1	2	2025-09-28 07:11:18.461194	OPD	1	waiting	Heart pain	f
\.


--
-- Data for Name: visit_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visit_status_history (visit_status_id, visit_id, status, updated_by_doctor, updated_by_staff, updated_at) FROM stdin;
1	1	waiting	\N	1	2025-09-07 13:00:16.793521
2	2	waiting	\N	1	2025-09-07 13:00:16.793521
3	3	waiting	\N	1	2025-09-07 13:00:16.793521
4	4	waiting	\N	1	2025-09-07 13:00:16.793521
5	5	waiting	\N	1	2025-09-07 13:00:16.793521
6	6	waiting	\N	2	2025-09-07 13:00:16.793521
7	7	waiting	\N	3	2025-09-07 13:00:16.793521
8	8	waiting	\N	3	2025-09-07 13:00:16.793521
9	9	waiting	\N	4	2025-09-07 13:00:16.793521
10	10	waiting	\N	5	2025-09-07 13:00:16.793521
11	11	waiting	\N	5	2025-09-07 13:00:16.793521
12	12	waiting	\N	6	2025-09-07 13:00:16.793521
13	13	waiting	\N	1	2025-09-07 13:00:16.793521
14	14	waiting	\N	2	2025-09-07 13:00:16.793521
15	15	waiting	\N	4	2025-09-07 13:00:16.793521
16	35	waiting	2	\N	2025-09-23 20:56:17.174652
17	35	waiting	2	\N	2025-09-23 20:58:11.931775
18	35	waiting	2	\N	2025-09-23 20:59:12.684955
19	35	waiting	2	\N	2025-09-23 21:05:35.452231
20	35	seen_by_doctor	2	\N	2025-09-23 21:05:38.050951
21	35	waiting	2	\N	2025-09-23 21:05:53.25457
22	35	seen_by_doctor	2	\N	2025-09-23 21:06:09.834887
23	35	waiting	2	\N	2025-09-23 21:07:23.341572
24	35	seen_by_doctor	2	\N	2025-09-23 21:08:29.435491
25	35	seen_by_doctor	2	\N	2025-09-23 21:09:52.056674
26	35	waiting	2	\N	2025-09-23 21:09:56.12327
27	35	seen_by_doctor	2	\N	2025-09-23 21:10:06.305951
\.


--
-- Name: bill_bill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_bill_id_seq', 20, true);


--
-- Name: bill_item_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_item_item_id_seq', 35, true);


--
-- Name: current_pregnancy_pregnanacy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.current_pregnancy_pregnanacy_id_seq', 11, true);


--
-- Name: doctor_doctor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctor_doctor_id_seq', 10, true);


--
-- Name: lab_order_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_order_order_id_seq', 15, true);


--
-- Name: lab_result_approvals_approval_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_result_approvals_approval_id_seq', 1, false);


--
-- Name: lab_result_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_result_result_id_seq', 10, true);


--
-- Name: lab_test_parameters_parameter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_test_parameters_parameter_id_seq', 92, true);


--
-- Name: lab_test_results_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_test_results_result_id_seq', 15, true);


--
-- Name: medicine_batch_batch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicine_batch_batch_id_seq', 1, false);


--
-- Name: medicine_medicine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicine_medicine_id_seq', 20, true);


--
-- Name: medicine_purchase_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicine_purchase_detail_id_seq', 20, true);


--
-- Name: medicine_purchase_purchase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicine_purchase_purchase_id_seq', 10, true);


--
-- Name: medicine_transaction_txn_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicine_transaction_txn_id_seq', 47, true);


--
-- Name: menstrual_history_menstrual_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menstrual_history_menstrual_history_id_seq', 14, true);


--
-- Name: obstetric_history_obstetric_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obstetric_history_obstetric_history_id_seq', 8, true);


--
-- Name: para_details_para_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.para_details_para_id_seq', 33, true);


--
-- Name: party_party_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.party_party_id_seq', 10, true);


--
-- Name: patient_patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_patient_id_seq', 20, true);


--
-- Name: patient_vitals_vital_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_vitals_vital_id_seq', 27, true);


--
-- Name: pharmacy_customer_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_customer_customer_id_seq', 1, false);


--
-- Name: pharmacy_sale_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_sale_detail_id_seq', 48, true);


--
-- Name: pharmacy_sale_sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_sale_sale_id_seq', 39, true);


--
-- Name: pos_audit_log_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pos_audit_log_log_id_seq', 7, true);


--
-- Name: pos_held_transaction_detail_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pos_held_transaction_detail_detail_id_seq', 2, true);


--
-- Name: pos_held_transaction_hold_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pos_held_transaction_hold_id_seq', 2, true);


--
-- Name: pos_receipt_config_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pos_receipt_config_config_id_seq', 1, true);


--
-- Name: pos_session_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pos_session_session_id_seq', 1, false);


--
-- Name: prescription_medicines_prescription_medicine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescription_medicines_prescription_medicine_id_seq', 29, true);


--
-- Name: prescription_prescription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescription_prescription_id_seq', 23, true);


--
-- Name: purchase_return_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_return_detail_id_seq', 12, true);


--
-- Name: purchase_return_return_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_return_return_id_seq', 8, true);


--
-- Name: sale_return_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_return_detail_id_seq', 20, true);


--
-- Name: sale_return_return_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_return_return_id_seq', 19, true);


--
-- Name: staff_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_staff_id_seq', 10, true);


--
-- Name: visit_status_history_visit_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visit_status_history_visit_status_id_seq', 27, true);


--
-- Name: visit_visit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visit_visit_id_seq', 45, true);


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
-- Name: medicine_batch medicine_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_batch
    ADD CONSTRAINT medicine_batch_pkey PRIMARY KEY (batch_id);


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
    ADD CONSTRAINT pharmacy_sale_detail_pkey PRIMARY KEY (pharmacy_sale_detail_id);


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
-- Name: medicine_batch medicine_batch_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_batch
    ADD CONSTRAINT medicine_batch_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicine(medicine_id);


--
-- Name: medicine_batch medicine_batch_party_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_batch
    ADD CONSTRAINT medicine_batch_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.party(party_id);


--
-- Name: medicine_purchase medicine_purchase_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase
    ADD CONSTRAINT medicine_purchase_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(staff_id);


--
-- Name: medicine_purchase_detail medicine_purchase_detail_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_purchase_detail
    ADD CONSTRAINT medicine_purchase_detail_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.medicine_batch(batch_id);


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
-- Name: pharmacy_sale_detail pharmacy_sale_detail_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_detail
    ADD CONSTRAINT pharmacy_sale_detail_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.medicine_batch(batch_id);


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

\unrestrict nFr35flgY3gt8bSRWLytketQazXTRBljZWGLGFvrdhdzLWhw5mUgTO3JwS6YtP0

