# Pharmacy Stock Logic & Trigger Chain

The HMS Pharmacy module uses a sophisticated trigger system to maintain inventory levels and an immutable audit trail.

## The Trigger Chain

### Step 1: Detail Tables
Action starts at one of the following detail tables:
- `medicine_purchase_detail`
- `pharmacy_sale_detail`
- `purchase_return_detail`
- `sale_return_detail`

### Step 2: Synchronization to `medicine_transaction`
Triggers on the detail tables (e.g., `tg_purchase_detail_to_txn`) automatically sync data into `medicine_transaction`.
- This ensures every stock movement has a matching transaction record.
- Links are maintained via `ref_purchase_id`, `ref_sale_id`, etc.

### Step 3: Global Stock Update
The `tg_stockquantity_generic` trigger on `medicine_transaction` executes `fn_tg_stockquantity_generic()`.
- **Retrieves Medicine Configuration**: Gets `sub_units_per_unit` from the `medicine` table.
- **Sub-unit Normalization**:
    - `total_sub_units = (units * sub_units_per_unit) + remainder_sub_units`
- **Sign Logic**:
    - `purchase`: +1
    - `sale`: -1
    - `purchase_return`: -1
    - `sale_return`: +1
- **Final Update**: Updates `stock_quantity` and `stock_sub_quantity` in the `medicine` table.

## Constraints
- `check_sub_quantity_valid`: Ensures `stock_sub_quantity` is always non-negative and less than `sub_units_per_unit`.
- Medicines with no sub-units default `sub_units_per_unit` to 1 in the logic.
