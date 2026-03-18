# Pharmacy Stock Logic

## Trigger chain

### Level 1: detail tables

- `medicine_purchase_detail`
- `pharmacy_sale_detail`
- `purchase_return_detail`
- `sale_return_detail`

These tables do not just represent business events; they also feed inventory synchronization.

### Level 2: ledger synchronization

Detail-table triggers write mirrored rows into `medicine_transaction`:

- purchase -> `purchase`
- sale -> `sale`
- purchase return -> `purchase_return`
- sale return -> `sale_return`

### Level 3: stock recalculation

`tg_stockquantity_generic` on `medicine_transaction` executes `fn_tg_stockquantity_generic()`.

That function:

- reads `sub_units_per_unit` from `medicine`
- normalizes whole-unit + sub-unit values into a single sub-unit total
- applies sign rules by transaction type
- writes stock back to both `medicine` and `medicine_batch` when `batch_id` is present

## Sign rules

- `purchase`: add stock
- `sale`: subtract stock
- `purchase_return`: subtract stock
- `sale_return`: add stock
- `adjustment`: treated as additive in the current function

## Practical implications

- do not hand-edit aggregate stock unless intentionally bypassing the trigger system
- if route handlers insert wrong quantities or wrong batch IDs, stock math will still run and propagate bad data
- sub-unit sales are active in live data and must be preserved
