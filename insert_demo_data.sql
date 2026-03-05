DO $$
DECLARE
    new_patient_id INT;
    new_visit_id INT;
    new_obs_id INT;
BEGIN
    -- 1. Insert Patient
    INSERT INTO public.patient (patient_name, age, gender, contact_number, cnic, address)
    VALUES ('Sarah Connor', 28, 'Female', '03001234567', '42101-1234567-8', '123 Sky Net Lane')
    RETURNING patient_id INTO new_patient_id;

    -- 2. Insert Visit (Assigned to Dr. Ahmed Khan ID 1)
    INSERT INTO public.visit (patient_id, doctor_id, visit_type, clinic_number, status, reason)
    VALUES (new_patient_id, 1, 'OPD', 101, 'waiting', 'First trimester checkup')
    RETURNING visit_id INTO new_visit_id;

    -- 3. Insert Vitals
    INSERT INTO public.patient_vitals (visit_id, blood_pressure, heart_rate, temperature, weight, height, blood_group)
    VALUES (new_visit_id, '120/80', 72, 98, 65, 165, 'O+');

    -- 4. Insert Menstrual History
    INSERT INTO public.menstrual_history (patient_id, menarch_age, cycle_length_days, bleeding_days, menstrual_regular, contraception_history, notes)
    VALUES (new_patient_id, 13, 28, 5, true, 'None', 'Normal cycles');

    -- 5. Insert Obstetric History
    INSERT INTO public.obstetric_history (patient_id, is_first_pregnancy, married_years, gravida, para, abortions, edd, last_menstrual_cycle, notes)
    VALUES (new_patient_id, false, 4, 2, 1, 0, CURRENT_DATE + INTERVAL '6 months', CURRENT_DATE - INTERVAL '3 months', 'Second pregnancy')
    RETURNING obstetric_history_id INTO new_obs_id;

    -- 6. Insert Current Pregnancy Details
    INSERT INTO public.current_pregnancy (patient_id, visit_id, gestational_age_weeks, fetal_heart_rate_bpm, placenta_position, presentation, notes)
    VALUES (new_patient_id, new_visit_id, 12, 150, 'Anterior', 'Cephalic', 'Baby is doing great');

    -- 7. Insert Para Details (Previous pregnancy)
    INSERT INTO public.para_details (obstetric_history_id, para_number, birth_year, birth_month, gender, delivery_type, alive, birth_weight_grams, gestational_age_weeks)
    VALUES (new_obs_id, 1, 2022, 5, 'Female', 'SVD', true, 3200, 39);

    RAISE NOTICE 'Demo data inserted successfully for Patient ID: %', new_patient_id;
END $$;
