# Lab Parameter Schema

## Core structure

### `lab_test`

Defines the test catalog entry.

### `lab_test_parameters`

Defines parameter-level structure for a test.

Important live columns:

- `parameter_name`
- `parameter_code`
- `unit`
- `input_type`
- `reference_range_min`
- `reference_range_max`
- `reference_value_text`
- `display_order`
- `is_critical`
- `is_required`

### `lab_order`

Connects a visit to a lab test and carries workflow state.

Important live columns:

- `ordered_by`
- `performed_by`
- `status`
- `urgency`
- `results_entered_at`
- `results_entered_by`
- `finalized_at`
- `finalized_by`

### `lab_test_results`

Stores parameter-level result values for a specific order.

### `lab_result`

Stores higher-level report/result metadata for an order.

### `lab_result_approvals`

Tracks approval/finalization steps for lab output.

## Important caution

The live schema is verified, but live lab tables currently have sparse or zero rows. Use the table relationships and constraints as truth, but do not claim mature production usage patterns unless you verify fresh data.
