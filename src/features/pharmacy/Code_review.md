# Pharmacy Module Code Review

## Summary

This review covers the pharmacy module from four perspectives:

1. Backend/API correctness against the live HMS PostgreSQL schema
2. Frontend workflow safety across retail, purchase, purchase-return, and return flows
3. Cross-layer drift between UI payloads, route SQL, and trigger-driven stock logic
4. QA/static validation using targeted linting on pharmacy codepaths

Context reviewed before this pass:

- `src/features/reception/Code_review.md`
- `src/features/reception/fixes.md`

That reception hardening work matters here because the same root pattern appears in pharmacy too: UI state and route payloads often drift away from the visit- and trigger-anchored database design.

Scope reviewed:

- `src/app/pharmacy/*`
- `src/features/pharmacy/medicines/*`
- `src/features/pharmacy/purchase/*`
- `src/features/pharmacy/purchaseReturn/*`
- `src/features/pharmacy/retail/*`
- `src/features/pharmacy/returnMedicine/*`
- Pharmacy-relevant APIs under `src/app/api/*`
- Database references in:
  - `DATABASE.md`
  - `documentation/database.md`
  - `db_structure.sql`

## Findings

### 1. High: purchase-return route is not actually transactional

Files:

- `src/app/api/pharmacy/purchase/return/route.ts`
- `database/db.ts`

Evidence:

- The route calls `await query("BEGIN")`, then several `await query(...)` statements, then `await query("COMMIT")`.
- `query(...)` is just `pool.query(...)`, not a dedicated client transaction.

Why this is wrong:

- `pool.query(...)` does not guarantee all statements run on the same connection.
- A failure after the header insert can leave `purchase_return` rows, partial detail rows, or stock-trigger side effects in inconsistent states.

Impact:

- Purchase returns can partially apply.
- Inventory and accounting can drift apart.
- Rollback is not reliable in the current implementation.

### 2. High: medicine dispense route inserts into columns that do not exist

Files:

- `src/app/api/medicine/dispenseMedicine/route.ts`
- `db_structure.sql`

Evidence:

- The route inserts into `pharmacy_sale_detail(sale_id, medicine_id, qty, unit_price, total_price)`.
- Live schema defines `pharmacy_sale_detail` with:
  - `quantity`
  - `unit_sale_price`
  - `line_total`
  - `sub_quantity`
  - `sub_unit_sale_price`
  - `batch_id`

Why this is wrong:

- `qty`, `unit_price`, and `total_price` are not valid columns in the live table.
- The route will fail before the sale-detail trigger chain can update `medicine_transaction`.

Impact:

- The dispense flow is runtime-broken.
- No stock movement is recorded through the intended trigger path.
- Prescription dispensing cannot complete reliably.

### 3. High: sale-return flow is broken end-to-end by stale column names

Files:

- `src/app/api/medicine/returnMedicine/currentMeds/[patientId]/route.ts`
- `src/app/api/medicine/returnMedicine/route.ts`
- `db_structure.sql`

Evidence:

- The read route selects `psd.unit_price`, but live `pharmacy_sale_detail` uses `unit_sale_price`.
- The write route inserts `sale_return_detail(return_id, medicine_id, qty, unit_price)`.
- Live `sale_return_detail` uses:
  - `returned_quantity`
  - `returned_unit_price`
  - `returned_sub_quantity`
  - `returned_sub_unit_price`

Why this is wrong:

- The returnable-medicines fetch can fail on an invalid column.
- Even if it did not, the POST route writes to non-existent columns.

Impact:

- Pharmacist sale returns are currently blocked.
- Restocking through `sale_return_detail` triggers cannot happen.
- Billing and prescription-dispense reversal logic does not complete.

### 4. High: dispense and return flows still target the patient’s latest visit instead of an explicit encounter

Files:

- `src/app/api/medicine/dispenseMedicine/currentMeds/[patientId]/route.ts`
- `src/app/api/medicine/returnMedicine/currentMeds/[patientId]/route.ts`
- `src/features/pharmacy/returnMedicine/hooks/useReturnMedicine.ts`

Evidence:

- Both API routes fetch `visit_id` using `ORDER BY visit_timestamp DESC LIMIT 1`.
- The return UI only carries `patientId`, then calls `/api/medicine/returnMedicine/currentMeds/${patientId}`.

Why this is wrong:

- A patient can have multiple visits, including same-day visits.
- Pharmacy actions should anchor to an explicit `visit_id` or `sale_id`, not “whoever is latest”.

Impact:

- Pharmacists can dispense or return against the wrong encounter.
- Historical or concurrent visits can be mixed up.
- This is the same class of bug that was already fixed in reception workflows.

### 5. Medium: held-transaction retrieval is broken and the GET handler leaks a DB client

Files:

- `src/features/pharmacy/retail/api.ts`
- `src/app/api/transactions/hold/route.ts`

Evidence:

- Frontend calls `GET /api/transactions/held`.
- The repo exposes `GET /api/transactions/hold`.
- In the handler, `const client = await pool.connect()` is used in `GET`, but there is no `finally { client.release(); }`.

Why this is wrong:

- The frontend path does not match the available route, so held transactions cannot be fetched.
- If the route is called directly, each request can leak a connection.

Impact:

- Hold/resume workflows are incomplete.
- Repeated use can exhaust the Postgres pool over time.

### 6. Medium: retail medicine-search cache preload never succeeds

Files:

- `src/features/pharmacy/retail/hooks/useMedicineSearch.ts`
- `src/app/api/medicine/search/route.ts`

Evidence:

- The hook preloads with `searchMedicines('', 'name')`.
- The backend returns `400` when `query` is empty.

Why this is wrong:

- The “warm cache for instant client-side filtering” path is dead on arrival.
- Search always falls back to live API requests instead of the intended hybrid strategy.

Impact:

- POS search is slower than designed.
- Search behavior does not match implementation comments.
- Developers may assume a cache exists when it does not.

### 7. Medium: pharmacy return workflows hardcode or trust `created_by = 1`

Files:

- `src/features/pharmacy/returnMedicine/hooks/useReturnMedicine.ts`
- `src/features/pharmacy/purchaseReturn/hooks/usePurchaseReturn.ts`
- `src/app/api/medicine/returnMedicine/route.ts`
- `src/app/api/pharmacy/purchase/return/route.ts`

Evidence:

- The frontend sends `created_by: 1` in both return flows.
- The backend routes trust `created_by` from the request body instead of deriving it from the authenticated session.

Why this is wrong:

- Audit attribution is user-controlled.
- This conflicts with the safer pattern already used elsewhere in HMS via `getCurrentStaffId()`.

Impact:

- Stock-affecting actions can be attributed to the wrong staff member.
- Audit logs are not trustworthy.
- A malicious or buggy caller can spoof another staff ID.

### 8. Low: pharmacy layout contains an unreachable return-medicine slot and overlapping return implementations

Files:

- `src/app/pharmacy/layout.tsx`
- `src/app/pharmacy/@returnMedicine/page.tsx`

Evidence:

- The layout accepts a `returnMedicine` parallel-route prop.
- No tab ever renders `returnMedicine`.
- Instead, the layout imports and mounts `PurchaseReturn` directly.

Why this is wrong:

- One implemented route is effectively dead.
- The module now has overlapping return concepts:
  - retail return mode
  - sale-return page under `@returnMedicine`
  - purchase return component mounted directly

Impact:

- Maintenance overhead increases.
- It is unclear which return path is authoritative.
- Refactors are more likely to fix the wrong flow or leave dead code behind.

## QA Validation Notes

Focused static validation run:

```bash
pnpm exec eslint src/app/api/medicine src/app/api/pharmacy src/app/api/transactions src/app/api/inventory/check-stock/route.ts src/app/api/print/receipt/route.ts src/app/api/email/receipt/route.ts src/app/api/hardware/cash-drawer/route.ts src/features/pharmacy --ext .ts,.tsx
```

Observed result:

- `5` eslint errors
- `46` eslint warnings

Most important lint-backed issues:

- `react/display-name` errors in several retail components using `forwardRef`
- hook dependency warnings in retail, purchase, and return flows
- multiple unused codepaths and legacy module drift

These are secondary to the schema/API breakages above, but they confirm the pharmacy module still has significant hygiene debt.

## Drift Report

Main drift themes found:

1. Several pharmacy routes no longer match live table/view column names.
2. Some workflows still operate on `patientId` or “latest visit” where the real system needs `visit_id` or `sale_id`.
3. Trigger-driven stock integrity is assumed in comments, but broken SQL prevents those triggers from firing.
4. Authenticated staff attribution is inconsistent across modules.

## Recommended Fix Order

1. Fix schema drift in:
   - `src/app/api/medicine/dispenseMedicine/route.ts`
   - `src/app/api/medicine/returnMedicine/currentMeds/[patientId]/route.ts`
   - `src/app/api/medicine/returnMedicine/route.ts`
2. Refactor purchase-return to use a dedicated pooled client transaction, not `query("BEGIN")` on the helper.
3. Move dispense/return selection from `patientId` to explicit `visit_id` or `sale_id`.
4. Replace body-supplied `created_by` with session-derived staff IDs.
5. Unify the return UX so only one authoritative sale-return path remains.

## Residual Risks / Gaps

- This pass was static plus lint-driven; I did not run live browser workflows against a seeded pharmacy dataset.
- There is no pharmacy-focused automated test suite covering these APIs today.
- Because the worktree already contains unrelated in-progress changes, this review intentionally avoids assuming all current modifications are part of one clean branch.
