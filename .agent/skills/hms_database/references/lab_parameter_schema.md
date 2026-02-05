# Lab Parameter & Results Schema

The Laboratory module uses a dynamic parameter system to handle various test types (Hematology, Biochemistry, etc.).

## Table Relationships

### `lab_test`
The root table defining the test name (e.g., "Complete Blood Count").

### `lab_test_parameters`
Defines the individual markers within a test.
- **Key Columns**:
    - `input_type`: number, select, or text.
    - `unit`: e.g., mg/dL, units/L.
    - `reference_range_min/max`: Used for abnormal flagging.
    - `is_critical`: Boolean flag for high-priority alerts.
    - `display_order`: Ensures consistent UI ordering.

### `lab_test_results`
Stores the actual patient data.
- Linked to `lab_order` and `lab_test_parameters`.
- **Logic**:
    - High-level overview in `lab_result` (concatenated string).
    - Detailed, structured data in `lab_test_results`.

## Operational States
- `Pending`: Order created but not processed.
- `Performed`: Results entered by technician.
- `Completed`: Results verified and finalized.

## Approvals
The `lab_result_approvals` table tracks technician/doctor sign-offs on specific lab orders.
