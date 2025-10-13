--
-- PostgreSQL database dump
--

\restrict Cd8CFZnUKKdzpANVaPVWo4csnhaqMuDx1MkdGJF3ASHgjrXOM3Ja3Qf20o28VYo

-- Dumped from database version 17.5
-- Dumped by pg_dump version 18.0

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

COPY public.medicine (medicine_id, generic_name, brand_name, category, dosage_value, dosage_unit, form, stock_quantity, price, created_at) FROM stdin;
1	Paracetamol	Panadol	Analgesic	500.00	mg	Tablet	200	15.00	2025-09-07 13:04:08.818759
2	Amoxicillin	Amoxil	Antibiotic	250.00	mg	Capsule	150	25.00	2025-09-07 13:04:08.818759
3	Cefixime	Suprax	Antibiotic	200.00	mg	Tablet	100	40.00	2025-09-07 13:04:08.818759
4	Ibuprofen	Brufen	Analgesic	400.00	mg	Tablet	120	20.00	2025-09-07 13:04:08.818759
5	Metformin	Glucophage	Anti-diabetic	500.00	mg	Tablet	80	50.00	2025-09-07 13:04:08.818759
6	Amlodipine	Norvasc	Antihypertensive	5.00	mg	Tablet	90	35.00	2025-09-07 13:04:08.818759
7	Omeprazole	Losec	Gastroprotective	20.00	mg	Capsule	70	30.00	2025-09-07 13:04:08.818759
8	Salbutamol	Ventolin	Bronchodilator	100.00	mcg	Inhaler	60	250.00	2025-09-07 13:04:08.818759
9	Cetirizine	Zyrtec	Antihistamine	10.00	mg	Tablet	110	18.00	2025-09-07 13:04:08.818759
10	Lorazepam	Ativan	Sedative	1.00	mg	Tablet	50	45.00	2025-09-07 13:04:08.818759
11	Diclofenac	Voltaren	NSAID	50.00	mg	Tablet	130	22.00	2025-09-07 13:04:08.818759
13	Ranitidine	Zantac	Gastroprotective	150.00	mg	Tablet	100	28.00	2025-09-07 13:04:08.818759
14	Furosemide	Lasix	Diuretic	40.00	mg	Tablet	90	20.00	2025-09-07 13:04:08.818759
15	Ciprofloxacin	Cipro	Antibiotic	500.00	mg	Tablet	75	55.00	2025-09-07 13:04:08.818759
16	Hydrochlorothiazide	Esidrex	Diuretic	25.00	mg	Tablet	60	18.00	2025-09-07 13:04:08.818759
18	Clindamycin	Dalacin	Antibiotic	300.00	mg	Capsule	50	70.00	2025-09-07 13:04:08.818759
19	Levocetirizine	Xyzal	Antihistamine	5.00	mg	Tablet	100	25.00	2025-09-07 13:04:08.818759
20	Metoprolol	Lopressor	Antihypertensive	50.00	mg	Tablet	80	40.00	2025-09-07 13:04:08.818759
12	Prednisolone	Prednisone	Steroid	10.00	mg	Tablet	39	60.00	2025-09-07 13:04:08.818759
17	Azithromycin	Zithromax	Antibiotic	500.00	mg	Tablet	85	65.00	2025-09-07 13:04:08.818759
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
-- Data for Name: medicine_purchase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_purchase (purchase_id, party_id, invoice_no, invoice_timestamp, total_amount, payment_status, created_at) FROM stdin;
1	1	INV-1001	2025-09-07 13:08:19.434238	5000.00	Paid	2025-09-07 13:08:19.434238
2	2	INV-1002	2025-09-07 13:08:19.434238	7500.00	Partial	2025-09-07 13:08:19.434238
3	3	INV-1003	2025-09-07 13:08:19.434238	3000.00	Unpaid	2025-09-07 13:08:19.434238
4	1	INV-1004	2025-09-07 13:08:19.434238	12000.00	Paid	2025-09-07 13:08:19.434238
5	4	INV-1005	2025-09-07 13:08:19.434238	4500.00	Partial	2025-09-07 13:08:19.434238
6	5	INV-1006	2025-09-07 13:08:19.434238	6000.00	Paid	2025-09-07 13:08:19.434238
7	2	INV-1007	2025-09-07 13:08:19.434238	8000.00	Unpaid	2025-09-07 13:08:19.434238
8	3	INV-1008	2025-09-07 13:08:19.434238	3500.00	Paid	2025-09-07 13:08:19.434238
9	4	INV-1009	2025-09-07 13:08:19.434238	7000.00	Partial	2025-09-07 13:08:19.434238
10	5	INV-1010	2025-09-07 13:08:19.434238	9000.00	Paid	2025-09-07 13:08:19.434238
\.


--
-- Data for Name: medicine_purchase_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_purchase_detail (id, purchase_id, medicine_id, qty, unit_cost, batch_no, expiry_date) FROM stdin;
1	1	1	50	12.00	B101	2026-05-01
2	1	2	30	20.00	B102	2025-12-01
3	2	3	40	35.00	B201	2026-03-15
4	2	4	25	18.00	B202	2025-11-30
5	3	5	20	45.00	B301	2026-01-20
6	3	6	15	30.00	B302	2025-10-10
7	4	7	10	220.00	B401	2026-08-05
8	4	8	18	60.00	B402	2026-02-28
9	5	9	30	15.00	B501	2025-09-15
10	5	10	25	40.00	B502	2025-12-20
11	6	11	50	18.00	B601	2026-04-01
12	6	12	30	55.00	B602	2026-06-10
13	7	13	40	28.00	B701	2025-11-05
14	7	14	20	15.00	B702	2025-10-15
15	8	15	35	60.00	B801	2026-03-01
16	8	16	25	12.00	B802	2025-12-05
17	9	17	30	65.00	B901	2026-01-15
18	9	18	20	70.00	B902	2026-05-10
19	10	19	25	25.00	B1001	2026-07-01
20	10	20	40	35.00	B1002	2026-06-20
\.


--
-- Data for Name: pharmacy_sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_sale (sale_id, visit_id, bill_id, sale_timestamp, handled_by, total_amount, status) FROM stdin;
1	1	1	2025-09-07 13:11:22.775195	1	400.00	Completed
2	2	2	2025-09-07 13:11:22.775195	2	600.00	Completed
3	3	3	2025-09-07 13:11:22.775195	3	450.00	Returned
4	4	4	2025-09-07 13:11:22.775195	4	700.00	Completed
5	5	5	2025-09-07 13:11:22.775195	5	500.00	Cancelled
6	6	6	2025-09-07 13:11:22.775195	1	550.00	Completed
7	7	7	2025-09-07 13:11:22.775195	2	600.00	Completed
8	8	8	2025-09-07 13:11:22.775195	3	450.00	Returned
9	9	9	2025-09-07 13:11:22.775195	4	800.00	Completed
10	10	10	2025-09-07 13:11:22.775195	5	550.00	Completed
11	11	11	2025-09-07 13:11:22.775195	1	650.00	Completed
12	12	12	2025-09-07 13:11:22.775195	2	600.00	Completed
21	39	14	2025-09-28 09:58:46.935709	1	\N	Completed
22	39	14	2025-09-28 11:38:53.023284	1	\N	Completed
20	39	14	2025-09-28 08:27:55.720514	1	\N	Returned
23	41	16	2025-10-02 16:15:43.973502	1	\N	Returned
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
-- Data for Name: medicine_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_transaction (txn_id, medicine_id, txn_type, qty, amount_per_unit, ref_purchase_id, ref_sale_id, ref_purchase_return, ref_sale_return, created_at) FROM stdin;
1	1	purchase	50	12.00	1	\N	\N	\N	2025-09-07 13:13:16.605281
2	2	purchase	30	20.00	1	\N	\N	\N	2025-09-07 13:13:16.605281
3	3	purchase	40	35.00	2	\N	\N	\N	2025-09-07 13:13:16.605281
4	4	purchase	25	18.00	2	\N	\N	\N	2025-09-07 13:13:16.605281
5	5	purchase	20	45.00	3	\N	\N	\N	2025-09-07 13:13:16.605281
6	1	sale	5	12.00	\N	1	\N	\N	2025-09-07 13:13:16.605281
7	2	sale	10	20.00	\N	1	\N	\N	2025-09-07 13:13:16.605281
8	3	sale	5	28.00	\N	3	\N	\N	2025-09-07 13:13:16.605281
9	4	sale	6	18.00	\N	2	\N	\N	2025-09-07 13:13:16.605281
10	5	sale	3	45.00	\N	5	\N	\N	2025-09-07 13:13:16.605281
11	1	purchase_return	10	12.00	\N	\N	1	\N	2025-09-07 13:13:16.605281
12	2	purchase_return	5	20.00	\N	\N	1	\N	2025-09-07 13:13:16.605281
13	3	purchase_return	8	35.00	\N	\N	2	\N	2025-09-07 13:13:16.605281
14	4	purchase_return	6	18.00	\N	\N	2	\N	2025-09-07 13:13:16.605281
15	5	purchase_return	4	45.00	\N	\N	3	\N	2025-09-07 13:13:16.605281
16	1	sale_return	1	12.00	\N	\N	\N	7	2025-09-07 13:13:16.605281
17	2	sale_return	2	20.00	\N	\N	\N	8	2025-09-07 13:13:16.605281
18	3	sale_return	2	28.00	\N	\N	\N	1	2025-09-07 13:13:16.605281
19	4	sale_return	1	18.00	\N	\N	\N	1	2025-09-07 13:13:16.605281
20	5	sale_return	3	45.00	\N	\N	\N	5	2025-09-07 13:13:16.605281
21	6	adjustment	5	30.00	\N	\N	\N	\N	2025-09-07 13:13:16.605281
23	12	sale	1	60.00	\N	20	\N	\N	2025-09-28 08:27:55.720514
25	12	sale_return	1	60.00	\N	\N	\N	15	2025-09-28 09:58:14.126306
26	12	sale	1	60.00	\N	21	\N	\N	2025-09-28 09:58:46.935709
27	12	sale	1	60.00	\N	21	\N	\N	2025-09-28 09:58:46.935709
28	12	sale_return	1	60.00	\N	\N	\N	17	2025-09-28 11:38:45.219157
29	12	sale	1	60.00	\N	22	\N	\N	2025-09-28 11:38:53.023284
30	12	sale_return	1	60.00	\N	\N	\N	18	2025-09-28 11:39:06.23702
31	17	sale	2	65.00	\N	23	\N	\N	2025-10-02 16:15:43.973502
32	17	sale_return	2	65.00	\N	\N	\N	19	2025-10-02 16:16:04.805063
\.


--
-- Data for Name: menstrual_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menstrual_history (menstrual_history_id, patient_id, menarch_age, cycle_length_days, bleeding_days, menstrual_regular, contraception_history, gynecologic_surgeries, medical_conditions, menopause_status, notes) FROM stdin;
12	1	13	28	6	t	None	None	None	f	Regular cycles, no issues
13	1	13	28	6	t	None	None	None	f	Regular cycles, no issues
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
-- Data for Name: pharmacy_sale_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_sale_detail (id, sale_id, medicine_id, qty, unit_price, total_price) FROM stdin;
1	1	1	5	12.00	60.00
2	1	2	10	20.00	200.00
3	1	3	5	28.00	140.00
4	2	4	6	18.00	108.00
5	2	5	5	45.00	225.00
6	2	6	4	30.00	120.00
7	3	7	2	220.00	440.00
8	3	8	1	60.00	60.00
9	4	9	5	15.00	75.00
10	4	10	3	40.00	120.00
11	5	11	4	18.00	72.00
12	5	12	2	55.00	110.00
13	6	13	5	28.00	140.00
14	6	14	6	15.00	90.00
15	7	15	4	60.00	240.00
16	7	16	3	12.00	36.00
17	8	17	2	65.00	130.00
18	8	18	1	70.00	70.00
19	9	19	3	25.00	75.00
20	9	20	5	35.00	175.00
21	10	1	6	12.00	72.00
22	10	2	4	20.00	80.00
23	11	3	5	28.00	140.00
24	11	4	6	18.00	108.00
25	12	5	7	45.00	315.00
29	20	12	1	60.00	60.00
30	21	12	1	60.00	60.00
31	21	12	1	60.00	60.00
32	22	12	1	60.00	60.00
33	23	17	2	65.00	130.00
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

COPY public.prescription_medicines (prescription_medicine_id, prescription_id, medicine_id, dosage, duration, instructions, dispensed_by, frequency, prescribed_quantity, dispensed_quantity, dispensed_at, created_at, updated_at) FROM stdin;
9	5	8	100 mcg	As needed	Use inhaler when short of breath	3	Unspecified	9	9	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
14	7	14	40 mg	As needed	Take one tablet in morning	2	Once daily (morning)	14	14	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
16	8	16	25 mg	As needed	Take one tablet in morning	4	Once daily (morning)	4	4	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
3	2	2	250 mg	10 days	Take one capsule every 12 hours	3	Every 12 hours	17	17	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
4	2	4	400 mg	5 days	Take one tablet after meals	4	Unspecified	7	7	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
5	3	3	200 mg	7 days	Take one tablet every 12 hours	5	Every 12 hours	12	12	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
2	1	9	10 mg	7 days	Take one tablet at night	1	Once daily (night)	4	4	2025-09-27 20:16:21.44961	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
1	1	1	500 mg	5 days	Take one tablet every 8 hours	1	Every 8 hours	19	19	2025-09-27 20:16:21.449871	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
6	3	5	500 mg	30 days	Take one tablet twice a day	6	Twice daily	9	9	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
7	4	6	5 mg	30 days	Take one tablet daily in morning	1	Once daily (morning)	16	16	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
8	4	7	20 mg	14 days	Take one capsule before breakfast	2	Unspecified	17	17	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
10	5	10	1 mg	7 days	Take one tablet before sleep	4	Unspecified	18	18	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
11	6	11	50 mg	5 days	Take one tablet every 8 hours	5	Every 8 hours	5	5	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
12	6	12	10 mg	7 days	Take one tablet in morning	6	Once daily (morning)	16	16	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
13	7	13	150 mg	14 days	Take one tablet before meal	1	Unspecified	15	15	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
15	8	15	500 mg	10 days	Take one tablet every 12 hours	3	Every 12 hours	3	3	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
17	9	17	500 mg	5 days	Take one tablet every 12 hours	5	Every 12 hours	18	18	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
18	9	18	5 mg	7 days	Take one tablet at night	6	Once daily (night)	9	9	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
19	10	19	5 mg	7 days	Take one tablet in morning	1	Once daily (morning)	20	20	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
20	10	20	50 mg	30 days	Take one tablet daily	2	Once daily	6	6	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588	2025-09-24 07:35:43.374588
26	19	2	250.00 mg	7 days	chill kar	1	tow times a day	1	1	2025-09-27 20:16:21.436338	2025-09-24 19:02:01.599964	2025-09-24 19:02:01.599964
27	20	12	10.00 mg	7 days	chill kar	\N	tow times a day	1	0	\N	2025-09-28 07:58:01.296136	2025-09-28 07:58:01.296136
29	23	17	500.00 mg	7 days	chill kar	\N	tow times a day	2	0	\N	2025-10-02 16:15:19.944547	2025-10-02 16:15:19.944547
\.


--
-- Data for Name: purchase_return_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_return_detail (id, return_id, medicine_id, qty, unit_cost) FROM stdin;
1	1	1	10	12.00
2	1	2	5	20.00
3	2	3	8	35.00
4	2	4	6	18.00
5	3	5	4	45.00
6	3	6	3	30.00
7	4	7	2	220.00
8	5	8	5	60.00
9	6	9	6	15.00
10	7	10	4	40.00
11	8	11	5	18.00
12	8	12	3	55.00
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

SELECT pg_catalog.setval('public.medicine_transaction_txn_id_seq', 32, true);


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
-- Name: pharmacy_sale_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_sale_detail_id_seq', 33, true);


--
-- Name: pharmacy_sale_sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_sale_sale_id_seq', 23, true);


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
-- PostgreSQL database dump complete
--

\unrestrict Cd8CFZnUKKdzpANVaPVWo4csnhaqMuDx1MkdGJF3ASHgjrXOM3Ja3Qf20o28VYo

