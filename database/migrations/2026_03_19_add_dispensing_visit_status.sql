BEGIN;

ALTER TABLE public.visit
  DROP CONSTRAINT IF EXISTS visit_status_check;

ALTER TABLE public.visit
  ADD CONSTRAINT visit_status_check
  CHECK (
    (status)::text = ANY (
      ARRAY[
        'waiting'::character varying,
        'seen_by_doctor'::character varying,
        'dispensing'::character varying,
        'medicines_dispensed'::character varying,
        'lab_tests_done'::character varying,
        'payment_done'::character varying,
        'completed'::character varying,
        'admitted'::character varying,
        'discharged'::character varying
      ]::text[]
    )
  );

ALTER TABLE public.visit_status_history
  DROP CONSTRAINT IF EXISTS visit_status_history_status_check;

ALTER TABLE public.visit_status_history
  ADD CONSTRAINT visit_status_history_status_check
  CHECK (
    (status)::text = ANY (
      ARRAY[
        'waiting'::character varying,
        'seen_by_doctor'::character varying,
        'dispensing'::character varying,
        'medicines_dispensed'::character varying,
        'lab_tests_done'::character varying,
        'payment_done'::character varying,
        'admitted'::character varying,
        'discharged'::character varying
      ]::text[]
    )
  );

COMMIT;
