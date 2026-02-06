    --
    -- PostgreSQL database dump
    --



    --
    -- Name: check_stock_available(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
    --

    CREATE FUNCTION public.check_stock_available(required_medicine_id integer, required_quantity integer, required_sub_quantity integer) RETURNS boolean
        LANGUAGE plpgsql
        AS $$
    declare
    available_quantity integer := 0;
    available_sub_quantity integer :=0;
    f_sub_units_per_unit integer :=0;
    total_available_sub_unit integer :=0;
    total_requested_sub_unit integer :=0;
    r record;
    begin
    select COALESCE(sub_units_per_unit,1) into  f_sub_units_per_unit from medicine where medicine_id=required_medicine_id;
    --i want to fetch all entries from medicine_batch which is not expired and check the stock avlaibility 
    --step 1 convert input into only subunits
    total_requested_sub_unit:=(required_quantity * f_sub_units_per_unit)+required_sub_quantity;
    --step 2 convert and summ alll avlaaible subunits 
    --step 3 then compare them
    
    for r in 
            select quantity,sub_quantity from medicine_batch where medicine_id=required_medicine_id and expiry_date > NOW()
    loop 
        available_quantity:=available_quantity+coalesce(r.quantity,0);
        available_sub_quantity:=available_sub_quantity+coalesce(r.sub_quantity,0);
    end loop;
        total_available_sub_unit:=(available_quantity * f_sub_units_per_unit)+(available_sub_quantity );


        return total_available_sub_unit >= total_requested_sub_unit;
    end;
    $$;


    ALTER FUNCTION public.check_stock_available(required_medicine_id integer, required_quantity integer, required_sub_quantity integer) OWNER TO postgres;

    --
    -- Name: fn_tg_purchase_detail_to_txn(); Type: FUNCTION; Schema: public; Owner: postgres
    --

    CREATE FUNCTION public.fn_tg_purchase_detail_to_txn() RETURNS trigger
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


    ALTER FUNCTION public.fn_tg_purchase_detail_to_txn() OWNER TO postgres;

    --
    -- Name: fn_tg_purchase_return_detail_to_txn(); Type: FUNCTION; Schema: public; Owner: postgres
    --

    CREATE FUNCTION public.fn_tg_purchase_return_detail_to_txn() RETURNS trigger
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


    ALTER FUNCTION public.fn_tg_purchase_return_detail_to_txn() OWNER TO postgres;

    --
    -- Name: fn_tg_sale_detail_to_txn(); Type: FUNCTION; Schema: public; Owner: postgres
    --

    CREATE FUNCTION public.fn_tg_sale_detail_to_txn() RETURNS trigger
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


    ALTER FUNCTION public.fn_tg_sale_detail_to_txn() OWNER TO postgres;

    --
    -- Name: fn_tg_sale_return_detail_to_txn(); Type: FUNCTION; Schema: public; Owner: postgres
    --

    CREATE FUNCTION public.fn_tg_sale_return_detail_to_txn() RETURNS trigger
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
        pregnancy_id integer CONSTRAINT current_pregnancy_pregnanacy_id_not_null NOT NULL,
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
    -- Name: current_pregnancy_pregnancy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
    --

    CREATE SEQUENCE public.current_pregnancy_pregnancy_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;


    ALTER SEQUENCE public.current_pregnancy_pregnancy_id_seq OWNER TO postgres;

    --
    -- Name: current_pregnancy_pregnancy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
    --

    ALTER SEQUENCE public.current_pregnancy_pregnancy_id_seq OWNED BY public.current_pregnancy.pregnancy_id;


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
        consultation_fee numeric(10,2) CONSTRAINT doctor_consultaion_fee_not_null NOT NULL,
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
        batch_id integer,
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
        CONSTRAINT check_total_price CHECK ((line_total = round(((((quantity)::numeric * unit_sale_price) + ((sub_quantity)::numeric * COALESCE(sub_unit_sale_price, (0)::numeric))) - discount_amount), 2)))
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
        returned_sub_unit_price numeric(10,2),
        batch_id integer
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
        returned_quantity integer CONSTRAINT sale_return_detail_qty_not_null NOT NULL,
        returned_unit_price numeric(10,2),
        batch_id integer,
        returned_sub_quantity integer,
        returned_sub_unit_price numeric(10,2)
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
    -- Name: v_medicine_pos; Type: VIEW; Schema: public; Owner: postgres
    --

    CREATE VIEW public.v_medicine_pos AS
    SELECT m.medicine_id AS id,
        m.generic_name,
        m.brand_name,
        m.category,
        (m.dosage_value)::double precision AS dosage_value,
        m.dosage_unit,
        m.form,
        (m.price)::double precision AS price,
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
        (mb.sale_price)::double precision AS batch_sale_price,
        (mb.sale_sub_unit_price)::double precision AS batch_sale_sub_unit_price,
        (m.price)::double precision AS global_price
    FROM (public.medicine m
        LEFT JOIN public.medicine_batch mb ON ((m.medicine_id = mb.medicine_id)))
    WHERE ((m.is_active = true) AND ((mb.expiry_date > CURRENT_DATE) OR (mb.expiry_date IS NULL)));


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
    -- Name: current_pregnancy pregnancy_id; Type: DEFAULT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.current_pregnancy ALTER COLUMN pregnancy_id SET DEFAULT nextval('public.current_pregnancy_pregnancy_id_seq'::regclass);


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
    \.


    --
    -- Data for Name: bill_item; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.bill_item (item_id, bill_id, description, amount, quantity, created_at) FROM stdin;
    \.


    --
    -- Data for Name: current_pregnancy; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.current_pregnancy (pregnancy_id, patient_id, visit_id, multiple_pregnancy, complications, ultrasound_findings, fetal_heart_rate_bpm, placenta_position, presentation, gestational_age_weeks, notes) FROM stdin;
    \.


    --
    -- Data for Name: doctor; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.doctor (doctor_id, user_code, password, doctor_name, specialization, education, consultation_fee, emergency_fee, contact_number, email, created_at) FROM stdin;
    1	DOC001	password123	Dr. Ahmed Khan	Gynecology	MBBS, FCPS	1500.00	3000.00	03001230001	ahmed.khan@example.com	2026-02-06 11:42:40.173912
    2	DOC002	password123	Dr. Fatima Ali	Cardiology	MBBS, MD	2000.00	4000.00	03001230002	fatima.ali@example.com	2026-02-06 11:42:40.173912
    3	DOC003	password123	Dr. Ali Raza	General Medicine	MBBS	1000.00	2000.00	03001230003	ali.raza@example.com	2026-02-06 11:42:40.173912
    4	DOC004	password123	Dr. Sara Malik	Pediatrics	MBBS, FCPS	1200.00	2500.00	03001230004	sara.malik@example.com	2026-02-06 11:42:40.173912
    5	DOC005	password123	Dr. Omar Siddiqui	Orthopedics	MBBS, MS	1800.00	3500.00	03001230005	omar.siddiqui@example.com	2026-02-06 11:42:40.173912
    \.


    --
    -- Data for Name: lab_order; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.lab_order (order_id, visit_id, test_id, ordered_by, performed_by, status, created_at, urgency, results_entered_at, results_entered_by, finalized_at, finalized_by) FROM stdin;
    \.


    --
    -- Data for Name: lab_result; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.lab_result (order_id, lab_result, reported_by, reported_at, result_id) FROM stdin;
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
    1	Complete Blood Count	Hematology	800.00	Comprehensive blood panel
    2	Blood Glucose	Biochemistry	300.00	Fasting or Random sugar test
    3	Pregnancy Test (Urine)	Serology	500.00	Urine HCG test
    4	Lipid Profile	Biochemistry	1500.00	Cholesterol, HDL, LDL, Triglycerides
    \.


    --
    -- Data for Name: lab_test_parameters; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.lab_test_parameters (parameter_id, test_id, parameter_name, parameter_code, unit, input_type, reference_range_min, reference_range_max, reference_value_text, display_order, is_critical, is_required, created_at) FROM stdin;
    1	1	Haemoglobin	HB	g/dL	number	12.00	16.00	\N	0	f	t	2026-02-06 11:42:40.173912
    2	1	WBC Count	WBC	x10^9/L	number	4.00	11.00	\N	0	f	t	2026-02-06 11:42:40.173912
    3	2	Glucose (Fasting)	GLU_F	mg/dL	number	70.00	110.00	\N	0	f	t	2026-02-06 11:42:40.173912
    4	3	HCG Status	HCG	\N	select	\N	\N	\N	0	f	t	2026-02-06 11:42:40.173912
    \.


    --
    -- Data for Name: lab_test_results; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.lab_test_results (result_id, order_id, parameter_id, result_value, is_abnormal, technician_notes, entered_by, entered_at, verified_by, verified_at) FROM stdin;
    \.


    --
    -- Data for Name: medicine; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.medicine (medicine_id, generic_name, brand_name, category, dosage_value, dosage_unit, form, stock_quantity, price, created_at, barcode, sku, manufacturer, min_stock_level, max_stock_level, is_active, requires_prescription, search_vector, sub_unit, sub_units_per_unit, sub_unit_price, allow_sub_unit_sale, stock_sub_quantity) FROM stdin;
    1	Paracetamol	Panadol	Analgesic	500.00	mg	Tablet	0	15.00	2026-02-06 11:42:40.173912	PAN001	MD-001	GSK	10	1000	t	f	'analges':3B 'panadol':2A 'paracetamol':1A	Blister	10	1.50	t	0
    2	Amoxicillin	Amoxil	Antibiotic	250.00	mg	Capsule	0	25.00	2026-02-06 11:42:40.173912	AMX001	MD-002	GSK	10	1000	t	f	'amoxicillin':1A 'amoxil':2A 'antibiot':3B	Blister	10	2.50	t	0
    3	Cefixime	Suprax	Antibiotic	200.00	mg	Tablet	0	40.00	2026-02-06 11:42:40.173912	SUP001	MD-003	Getz	10	1000	t	f	'antibiot':3B 'cefixim':1A 'suprax':2A	Strip	10	4.00	t	0
    4	Ibuprofen	Brufen	Analgesic	400.00	mg	Tablet	0	20.00	2026-02-06 11:42:40.173912	BRU001	MD-004	Abbott	10	1000	t	f	'analges':3B 'brufen':2A 'ibuprofen':1A	Strip	10	2.00	t	0
    5	Metformin	Glucophage	Anti-diabetic	500.00	mg	Tablet	0	50.00	2026-02-06 11:42:40.173912	GLU001	MD-005	Searle	10	1000	t	f	'anti':4B 'anti-diabet':3B 'diabet':5B 'glucophag':2A 'metformin':1A	Blister	10	5.00	t	0
    6	Omeprazole	Losec	Gastroprotective	20.00	mg	Capsule	0	30.00	2026-02-06 11:42:40.173912	LOS001	MD-006	Getz	10	1000	t	f	'gastroprotect':3B 'losec':2A 'omeprazol':1A	Strip	10	3.00	t	0
    7	Salbutamol	Ventolin	Bronchodilator	100.00	mcg	Inhaler	0	250.00	2026-02-06 11:42:40.173912	VEN001	MD-007	GSK	10	1000	t	f	'bronchodil':3B 'salbutamol':1A 'ventolin':2A	Inhaler	1	250.00	f	0
    8	Cetirizine	Zyrtec	Antihistamine	10.00	mg	Tablet	0	18.00	2026-02-06 11:42:40.173912	ZYR001	MD-008	GSK	10	1000	t	f	'antihistamin':3B 'cetirizin':1A 'zyrtec':2A	Blister	10	1.80	t	0
    \.


    --
    -- Data for Name: medicine_batch; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.medicine_batch (batch_id, medicine_id, stock_quantity, stock_sub_quantity, purchase_price, purchase_sub_unit_price, sale_price, sale_sub_unit_price, expiry_date, batch_number, received_date, party_id) FROM stdin;
    1	1	100	0	10.00	1.00	15.00	1.50	2026-12-31	BCH001	2026-02-06 11:42:40.173912	1
    2	2	50	0	18.00	1.80	25.00	2.50	2026-06-30	BCH002	2026-02-06 11:42:40.173912	1
    3	3	30	0	30.00	3.00	40.00	4.00	2027-01-15	BCH003	2026-02-06 11:42:40.173912	2
    4	4	80	0	15.00	1.50	20.00	2.00	2026-09-20	BCH004	2026-02-06 11:42:40.173912	4
    5	5	40	0	35.00	3.50	50.00	5.00	2026-11-11	BCH005	2026-02-06 11:42:40.173912	3
    \.


    --
    -- Data for Name: medicine_purchase; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.medicine_purchase (purchase_id, party_id, invoice_no, invoice_timestamp, total_amount, payment_status, created_at, created_by) FROM stdin;
    \.


    --
    -- Data for Name: medicine_purchase_detail; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.medicine_purchase_detail (id, purchase_id, medicine_id, quantity, unit_cost, sub_quantity, sub_unit_cost, batch_id) FROM stdin;
    \.


    --
    -- Data for Name: medicine_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.medicine_transaction (txn_id, medicine_id, txn_type, quantity, amount_per_unit, ref_purchase_id, ref_sale_id, ref_purchase_return, ref_sale_return, created_at, sub_quantity, batch_id) FROM stdin;
    \.


    --
    -- Data for Name: menstrual_history; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.menstrual_history (menstrual_history_id, patient_id, menarch_age, cycle_length_days, bleeding_days, menstrual_regular, contraception_history, gynecologic_surgeries, medical_conditions, menopause_status, notes) FROM stdin;
    \.


    --
    -- Data for Name: obstetric_history; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.obstetric_history (obstetric_history_id, patient_id, is_first_pregnancy, married_years, gravida, para, abortions, edd, last_menstrual_cycle, notes) FROM stdin;
    \.


    --
    -- Data for Name: para_details; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.para_details (para_id, obstetric_history_id, para_number, birth_year, birth_month, gender, delivery_type, alive, birth_weight_grams, complications, notes, gestational_age_weeks) FROM stdin;
    \.


    --
    -- Data for Name: party; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.party (party_id, name, contact_number, address, created_at) FROM stdin;
    1	GSK Pharmaceuticals	021-3234567	West Wharf Rd, Karachi	2026-02-06 11:42:40.173912
    2	Getz Pharma	021-3864313	Korangi, Karachi	2026-02-06 11:42:40.173912
    3	Searle Company	021-3506922	Port Qasim, Karachi	2026-02-06 11:42:40.173912
    4	Abbott Pakistan	021-1112226	Landhi, Karachi	2026-02-06 11:42:40.173912
    5	Sami Pharmaceuticals	021-3453341	F.B Area, Karachi	2026-02-06 11:42:40.173912
    \.


    --
    -- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.patient (patient_id, patient_name, age, gender, contact_number, cnic, address, created_at) FROM stdin;
    1	Alice Johnson	28	Female	03001234567	42101-1234567-1	Karachi	2026-02-06 11:42:40.173912
    2	Bob Smith	35	Male	03007654321	42101-7654321-2	Lahore	2026-02-06 11:42:40.173912
    3	Charlie Brown	42	Male	03009876543	42101-9876543-3	Islamabad	2026-02-06 11:42:40.173912
    4	Diana Prince	30	Female	03005554444	42101-5555444-4	Rawalpindi	2026-02-06 11:42:40.173912
    5	Eve Adams	25	Female	03001112233	42101-1112233-5	Karachi	2026-02-06 11:42:40.173912
    \.


    --
    -- Data for Name: patient_vitals; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.patient_vitals (vital_id, visit_id, blood_pressure, heart_rate, temperature, weight, height, recorded_at, blood_group) FROM stdin;
    1	1	120/80	72	99	65	165	2026-02-06 11:42:40.173912	A+
    2	2	130/85	80	102	75	175	2026-02-06 11:42:40.173912	B+
    3	3	110/70	85	98	82	180	2026-02-06 11:42:40.173912	O-
    4	4	115/75	76	99	68	162	2026-02-06 11:42:40.173912	AB+
    5	5	100/60	95	99	12	90	2026-02-06 11:42:40.173912	O+
    \.


    --
    -- Data for Name: pharmacy_customer; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.pharmacy_customer (customer_id, name, phone, email, address, loyalty_points, created_at, last_purchase_date) FROM stdin;
    \.


    --
    -- Data for Name: pharmacy_sale; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.pharmacy_sale (sale_id, visit_id, bill_id, sale_timestamp, handled_by, total_amount, status, payment_type, payment_reference, paid_amount, due_amount, change_amount, discount_percent, discount_amount, tax_amount, is_prescription_sale, prescription_id, notes, customer_id) FROM stdin;
    \.


    --
    -- Data for Name: pharmacy_sale_detail; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.pharmacy_sale_detail (pharmacy_sale_detail_id, sale_id, medicine_id, quantity, unit_sale_price, line_total, discount_percent, discount_amount, sub_unit_sale_price, sub_quantity, batch_id) FROM stdin;
    \.


    --
    -- Data for Name: pos_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.pos_audit_log (log_id, staff_id, action_type, sale_id, description, ip_address, user_agent, created_at) FROM stdin;
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
    1	Dr Bablu Clinic & Pharmacy	Main Road, Bhakkar	034567654321	\N	\N	Welcome to our Clinic	Get Well Soon	\N	\N	80mm	t	2026-02-06 11:42:40.173912
    \.


    --
    -- Data for Name: pos_session; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.pos_session (session_id, staff_id, opening_time, closing_time, opening_balance, closing_balance, expected_balance, cash_sales_total, card_sales_total, total_sales_count, notes, status) FROM stdin;
    1	4	2026-02-06 11:42:40.173912	\N	5000.00	\N	\N	0.00	0.00	0	\N	open
    \.


    --
    -- Data for Name: prescription; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.prescription (prescription_id, visit_id, doctor_id, created_at) FROM stdin;
    \.


    --
    -- Data for Name: prescription_medicines; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.prescription_medicines (prescription_medicine_id, prescription_id, medicine_id, duration, instructions, dispensed_by, frequency, prescribed_quantity, dispensed_quantity, dispensed_at, created_at, updated_at, prescribed_sub_quantity, dispensed_sub_quantity) FROM stdin;
    \.


    --
    -- Data for Name: purchase_return; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.purchase_return (return_id, purchase_id, reason, return_timestamp, created_by) FROM stdin;
    \.


    --
    -- Data for Name: purchase_return_detail; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.purchase_return_detail (id, return_id, medicine_id, quantity, sub_quantity, returned_unit_price, returned_sub_unit_price, batch_id) FROM stdin;
    \.


    --
    -- Data for Name: sale_return; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.sale_return (return_id, sale_id, reason, return_timestamp, created_by) FROM stdin;
    \.


    --
    -- Data for Name: sale_return_detail; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.sale_return_detail (id, return_id, medicine_id, returned_quantity, returned_unit_price, batch_id, returned_sub_quantity, returned_sub_unit_price) FROM stdin;
    \.


    --
    -- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.staff (staff_id, user_code, password, name, role, education, contact_number, email, created_at) FROM stdin;
    1	STF001	password123	Sara Ahmed	Receptionist	BA	03001110001	sara.ahmed@example.com	2026-02-06 11:42:40.173912
    2	STF002	password123	Naveed Khan	Pharmacist	BPharm	03001110002	naveed.khan@example.com	2026-02-06 11:42:40.173912
    3	STF003	password123	Ayesha Malik	Lab_Technician	BS Lab Tech	03001110003	ayesha.malik@example.com	2026-02-06 11:42:40.173912
    4	STF004	password123	Imran Ali	Cashier	BBA	03001110004	imran.ali@example.com	2026-02-06 11:42:40.173912
    5	STF005	password123	Hina Shah	Nurse	BSc Nursing	03001110005	hina.shah@example.com	2026-02-06 11:42:40.173912
    6	STF006	password123	Bilal Raza	Admin	MBA	03001110006	admin@hms.com	2026-02-06 11:42:40.173912
    \.


    --
    -- Data for Name: visit; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.visit (visit_id, patient_id, doctor_id, visit_timestamp, visit_type, clinic_number, status, reason, is_deleted) FROM stdin;
    1	1	1	2026-02-06 11:42:40.173912	OPD	1001	waiting	Regular Gynaecology Checkup	f
    2	2	3	2026-02-06 11:42:40.173912	OPD	1002	seen_by_doctor	Fever and Bodyache	f
    3	3	5	2026-02-06 11:42:40.173912	Emergency	2001	discharged	Fracture in right arm	f
    4	4	1	2026-02-06 11:42:40.173912	OPD	1003	waiting	Prenatal Scan	f
    5	5	4	2026-02-06 11:42:40.173912	OPD	1004	waiting	Child Vaccination	f
    \.


    --
    -- Data for Name: visit_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.visit_status_history (visit_status_id, visit_id, status, updated_by_doctor, updated_by_staff, updated_at) FROM stdin;
    \.


    --
    -- Name: bill_bill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.bill_bill_id_seq', 1, false);


    --
    -- Name: bill_item_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.bill_item_item_id_seq', 1, false);


    --
    -- Name: current_pregnancy_pregnancy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.current_pregnancy_pregnancy_id_seq', 1, false);


    --
    -- Name: doctor_doctor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.doctor_doctor_id_seq', 5, true);


    --
    -- Name: lab_order_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.lab_order_order_id_seq', 1, false);


    --
    -- Name: lab_result_approvals_approval_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.lab_result_approvals_approval_id_seq', 1, false);


    --
    -- Name: lab_result_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.lab_result_result_id_seq', 1, false);


    --
    -- Name: lab_test_parameters_parameter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.lab_test_parameters_parameter_id_seq', 1, false);


    --
    -- Name: lab_test_results_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.lab_test_results_result_id_seq', 1, false);


    --
    -- Name: medicine_batch_batch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.medicine_batch_batch_id_seq', 1, false);


    --
    -- Name: medicine_medicine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.medicine_medicine_id_seq', 8, true);


    --
    -- Name: medicine_purchase_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.medicine_purchase_detail_id_seq', 1, false);


    --
    -- Name: medicine_purchase_purchase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.medicine_purchase_purchase_id_seq', 1, false);


    --
    -- Name: medicine_transaction_txn_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.medicine_transaction_txn_id_seq', 1, false);


    --
    -- Name: menstrual_history_menstrual_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.menstrual_history_menstrual_history_id_seq', 1, false);


    --
    -- Name: obstetric_history_obstetric_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.obstetric_history_obstetric_history_id_seq', 1, false);


    --
    -- Name: para_details_para_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.para_details_para_id_seq', 1, false);


    --
    -- Name: party_party_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.party_party_id_seq', 5, true);


    --
    -- Name: patient_patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.patient_patient_id_seq', 5, true);


    --
    -- Name: patient_vitals_vital_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.patient_vitals_vital_id_seq', 5, true);


    --
    -- Name: pharmacy_customer_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.pharmacy_customer_customer_id_seq', 1, false);


    --
    -- Name: pharmacy_sale_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.pharmacy_sale_detail_id_seq', 1, false);


    --
    -- Name: pharmacy_sale_sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.pharmacy_sale_sale_id_seq', 1, false);


    --
    -- Name: pos_audit_log_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.pos_audit_log_log_id_seq', 1, false);


    --
    -- Name: pos_held_transaction_detail_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.pos_held_transaction_detail_detail_id_seq', 1, false);


    --
    -- Name: pos_held_transaction_hold_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.pos_held_transaction_hold_id_seq', 1, false);


    --
    -- Name: pos_receipt_config_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.pos_receipt_config_config_id_seq', 1, false);


    --
    -- Name: pos_session_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.pos_session_session_id_seq', 1, false);


    --
    -- Name: prescription_medicines_prescription_medicine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.prescription_medicines_prescription_medicine_id_seq', 1, false);


    --
    -- Name: prescription_prescription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.prescription_prescription_id_seq', 1, false);


    --
    -- Name: purchase_return_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.purchase_return_detail_id_seq', 1, false);


    --
    -- Name: purchase_return_return_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.purchase_return_return_id_seq', 1, false);


    --
    -- Name: sale_return_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.sale_return_detail_id_seq', 1, false);


    --
    -- Name: sale_return_return_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.sale_return_return_id_seq', 1, false);


    --
    -- Name: staff_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.staff_staff_id_seq', 6, true);


    --
    -- Name: visit_status_history_visit_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.visit_status_history_visit_status_id_seq', 1, false);


    --
    -- Name: visit_visit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.visit_visit_id_seq', 5, true);


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
        ADD CONSTRAINT current_pregnancy_pkey PRIMARY KEY (pregnancy_id);


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
    -- Name: medicine_transaction medicine_transaction_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.medicine_transaction
        ADD CONSTRAINT medicine_transaction_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.medicine_batch(batch_id);


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
    -- Name: purchase_return_detail purchase_return_detail_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.purchase_return_detail
        ADD CONSTRAINT purchase_return_detail_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.medicine_batch(batch_id);


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
    -- Name: sale_return_detail sale_return_detail_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.sale_return_detail
        ADD CONSTRAINT sale_return_detail_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.medicine_batch(batch_id);


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

    \unrestrict T3vTq76rgCS2gsWcFYbJQJ0yRxcGy68wPEeB4xfasPwXiL3hWZ6aQlk5NEdGJqK

