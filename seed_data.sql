-- HMS Database Seeding Script
-- Comprehensive consistent dummy data across all 38 tables

BEGIN;

-- 1. Cleanup everything
TRUNCATE 
    public.patient,
    public.doctor,
    public.staff,
    public.party,
    public.medicine,
    public.lab_test,
    public.pos_receipt_config,
    public.pharmacy_customer,
    public.pos_session
RESTART IDENTITY CASCADE;

-- 2. Parties (Suppliers) - id manually provided since some tables lack defaults
INSERT INTO public.party (party_id, name, contact_number, address) VALUES
(1, 'GSK Pharmaceuticals', '021-3234567', 'West Wharf Rd, Karachi'),
(2, 'Getz Pharma', '021-3864313', 'Korangi, Karachi'),
(3, 'Searle Company', '021-3506922', 'Port Qasim, Karachi'),
(4, 'Abbott Pakistan', '021-1112226', 'Landhi, Karachi'),
(5, 'Sami Pharmaceuticals', '021-3453341', 'F.B Area, Karachi');

-- 3. Staff
INSERT INTO public.staff (staff_id, user_code, password, name, role, education, contact_number, email) VALUES
(1, 'STF001', 'password123', 'Sara Ahmed', 'Receptionist', 'BA', '03001110001', 'sara.ahmed@example.com'),
(2, 'STF002', 'password123', 'Naveed Khan', 'Pharmacist', 'BPharm', '03001110002', 'naveed.khan@example.com'),
(3, 'STF003', 'password123', 'Ayesha Malik', 'Lab_Technician', 'BS Lab Tech', '03001110003', 'ayesha.malik@example.com'),
(4, 'STF004', 'password123', 'Imran Ali', 'Cashier', 'BBA', '03001110004', 'imran.ali@example.com'),
(5, 'STF005', 'password123', 'Hina Shah', 'Nurse', 'BSc Nursing', '03001110005', 'hina.shah@example.com'),
(6, 'STF006', 'password123', 'Bilal Raza', 'Admin', 'MBA', '03001110006', 'admin@hms.com');

-- 4. Doctors
INSERT INTO public.doctor (doctor_id, user_code, password, doctor_name, specialization, education, consultation_fee, emergency_fee, contact_number, email) VALUES
(1, 'DOC001', 'password123', 'Dr. Ahmed Khan', 'Gynecology', 'MBBS, FCPS', 1500.00, 3000.00, '03001230001', 'ahmed.khan@example.com'),
(2, 'DOC002', 'password123', 'Dr. Fatima Ali', 'Cardiology', 'MBBS, MD', 2000.00, 4000.00, '03001230002', 'fatima.ali@example.com'),
(3, 'DOC003', 'password123', 'Dr. Ali Raza', 'General Medicine', 'MBBS', 1000.00, 2000.00, '03001230003', 'ali.raza@example.com'),
(4, 'DOC004', 'password123', 'Dr. Sara Malik', 'Pediatrics', 'MBBS, FCPS', 1200.00, 2500.00, '03001230004', 'sara.malik@example.com'),
(5, 'DOC005', 'password123', 'Dr. Omar Siddiqui', 'Orthopedics', 'MBBS, MS', 1800.00, 3500.00, '03001230005', 'omar.siddiqui@example.com');

-- 5. Medicines
INSERT INTO public.medicine (medicine_id, generic_name, brand_name, category, dosage_value, dosage_unit, form, price, barcode, sku, manufacturer, sub_unit, sub_units_per_unit, sub_unit_price, allow_sub_unit_sale) VALUES
(1, 'Paracetamol', 'Panadol', 'Analgesic', 500.00, 'mg', 'Tablet', 15.00, 'PAN001', 'MD-001', 'GSK', 'Blister', 10, 1.50, true),
(2, 'Amoxicillin', 'Amoxil', 'Antibiotic', 250.00, 'mg', 'Capsule', 25.00, 'AMX001', 'MD-002', 'GSK', 'Blister', 10, 2.50, true),
(3, 'Cefixime', 'Suprax', 'Antibiotic', 200.00, 'mg', 'Tablet', 40.00, 'SUP001', 'MD-003', 'Getz', 'Strip', 10, 4.00, true),
(4, 'Ibuprofen', 'Brufen', 'Analgesic', 400.00, 'mg', 'Tablet', 20.00, 'BRU001', 'MD-004', 'Abbott', 'Strip', 10, 2.00, true),
(5, 'Metformin', 'Glucophage', 'Anti-diabetic', 500.00, 'mg', 'Tablet', 50.00, 'GLU001', 'MD-005', 'Searle', 'Blister', 10, 5.00, true),
(6, 'Omeprazole', 'Losec', 'Gastroprotective', 20.00, 'mg', 'Capsule', 30.00, 'LOS001', 'MD-006', 'Getz', 'Strip', 10, 3.00, true),
(7, 'Salbutamol', 'Ventolin', 'Bronchodilator', 100.00, 'mcg', 'Inhaler', 250.00, 'VEN001', 'MD-007', 'GSK', 'Inhaler', 1, 250.00, false),
(8, 'Cetirizine', 'Zyrtec', 'Antihistamine', 10.00, 'mg', 'Tablet', 18.00, 'ZYR001', 'MD-008', 'GSK', 'Blister', 10, 1.80, true);

-- 6. Batches
INSERT INTO public.medicine_batch (batch_id, medicine_id, stock_quantity, stock_sub_quantity, purchase_price, purchase_sub_unit_price, sale_price, sale_sub_unit_price, expiry_date, batch_number, received_date, party_id) VALUES
(1, 1, 100, 0, 10.00, 1.00, 15.00, 1.50, '2026-12-31', 'BCH001', NOW(), 1),
(2, 2, 50, 0, 18.00, 1.80, 25.00, 2.50, '2026-06-30', 'BCH002', NOW(), 1),
(3, 3, 30, 0, 30.00, 3.00, 40.00, 4.00, '2027-01-15', 'BCH003', NOW(), 2),
(4, 4, 80, 0, 15.00, 1.50, 20.00, 2.00, '2026-09-20', 'BCH004', NOW(), 4),
(5, 5, 40, 0, 35.00, 3.50, 50.00, 5.00, '2026-11-11', 'BCH005', NOW(), 3);

-- 7. Patients
INSERT INTO public.patient (patient_id, patient_name, age, gender, contact_number, cnic, address) VALUES
(1, 'Alice Johnson', 28, 'Female', '03001234567', '42101-1234567-1', 'Karachi'),
(2, 'Bob Smith', 35, 'Male', '03007654321', '42101-7654321-2', 'Lahore'),
(3, 'Charlie Brown', 42, 'Male', '03009876543', '42101-9876543-3', 'Islamabad'),
(4, 'Diana Prince', 30, 'Female', '03005554444', '42101-5555444-4', 'Rawalpindi'),
(5, 'Eve Adams', 25, 'Female', '03001112233', '42101-1112233-5', 'Karachi');

-- 8. Visits
INSERT INTO public.visit (visit_id, patient_id, doctor_id, visit_type, clinic_number, status, reason) VALUES
(1, 1, 1, 'OPD', 1001, 'waiting', 'Regular Gynaecology Checkup'),
(2, 2, 3, 'OPD', 1002, 'seen_by_doctor', 'Fever and Bodyache'),
(3, 3, 5, 'Emergency', 2001, 'discharged', 'Fracture in right arm'),
(4, 4, 1, 'OPD', 1003, 'waiting', 'Prenatal Scan'),
(5, 5, 4, 'OPD', 1004, 'waiting', 'Child Vaccination');

-- 9. Vitals
INSERT INTO public.patient_vitals (vital_id, visit_id, blood_pressure, heart_rate, temperature, weight, height, blood_group) VALUES
(1, 1, '120/80', 72, 98.6, 65.0, 165.0, 'A+'),
(2, 2, '130/85', 80, 101.5, 75.0, 175.0, 'B+'),
(3, 3, '110/70', 85, 98.4, 82.0, 180.0, 'O-'),
(4, 4, '115/75', 76, 98.8, 68.0, 162.0, 'AB+'),
(5, 5, '100/60', 95, 99.2, 12.0, 90.0, 'O+');

-- 10. Lab Tests (Manual ID)
INSERT INTO public.lab_test (test_id, test_name, category, price, description) VALUES
(1, 'Complete Blood Count', 'Hematology', 800.00, 'Comprehensive blood panel'),
(2, 'Blood Glucose', 'Biochemistry', 300.00, 'Fasting or Random sugar test'),
(3, 'Pregnancy Test (Urine)', 'Serology', 500.00, 'Urine HCG test'),
(4, 'Lipid Profile', 'Biochemistry', 1500.00, 'Cholesterol, HDL, LDL, Triglycerides');

-- 11. Lab Parameters (Manual ID)
INSERT INTO public.lab_test_parameters (parameter_id, test_id, parameter_name, parameter_code, unit, input_type, reference_range_min, reference_range_max) VALUES
(1, 1, 'Haemoglobin', 'HB', 'g/dL', 'number', 12.00, 16.00),
(2, 1, 'WBC Count', 'WBC', 'x10^9/L', 'number', 4.00, 11.00),
(3, 2, 'Glucose (Fasting)', 'GLU_F', 'mg/dL', 'number', 70.00, 110.00),
(4, 3, 'HCG Status', 'HCG', NULL, 'select', NULL, NULL);

-- 12. POS Session
INSERT INTO public.pos_session (session_id, staff_id, opening_time, opening_balance, status) VALUES
(1, 4, NOW(), 5000.00, 'open');

-- 13. Receipt Config
INSERT INTO public.pos_receipt_config (config_id, clinic_name, clinic_address, clinic_phone, receipt_header, receipt_footer, is_active) VALUES
(1, 'Fouzia Ishaq Clinic & Pharmacy', 'Main Road, Bhakkar', '034567654321', 'Welcome to our Clinic', 'Get Well Soon', true);

-- 14. Adjust Sequences for future auto-increments
SELECT setval('public.patient_patient_id_seq', (SELECT MAX(patient_id) FROM public.patient));
SELECT setval('public.doctor_doctor_id_seq', (SELECT MAX(doctor_id) FROM public.doctor));
SELECT setval('public.staff_staff_id_seq', (SELECT MAX(staff_id) FROM public.staff));
SELECT setval('public.party_party_id_seq', (SELECT MAX(party_id) FROM public.party));
SELECT setval('public.medicine_medicine_id_seq', (SELECT MAX(medicine_id) FROM public.medicine));
SELECT setval('public.visit_visit_id_seq', (SELECT MAX(visit_id) FROM public.visit));
SELECT setval('public.patient_vitals_vital_id_seq', (SELECT MAX(vital_id) FROM public.patient_vitals));

COMMIT;
