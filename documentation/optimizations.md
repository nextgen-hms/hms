# Pharmacy POS Optimizations

This document tracks planned optimizations and known issues in the Pharmacy POS (Retail) system.

## Performance & UX

### 1. Cached Medicine Search Stale Data
- **Issue**: The medicine search now uses a client-side cache for instant results. However, when a sale is finalized, the actual stock quantities in the database change, but the local search cache doesn't reflect these changes immediately.
- **Current Behavior**: The cache has a 5-minute TTL. The displayed available quantity in the search results may be slightly outdated until the cache is refreshed or invalidated.
- **Proposed Optimization**: 
    - Automatically call `invalidateCache()` from the `useMedicineSearch` hook after a successful transaction.
    - Alternatively, implement a mechanism to subtract sold quantities from the local cache immediately after adding to cart or finalizing sale.
    - Consider using a shared state management solution (e.g., Zustand or React Query) for the medicine list to ensure consistency across the application.

## Database & Inventory

### 1. Positive Stock Constraint
- **Issue**: The current trigger-based stock management allows stock to drop below zero if requested quantity exceeds available quantity.
- **Proposed Optimization**: Add a `CHECK` constraint to the `medicine_batch` table to prevent negative stock values.
    ```sql
    ALTER TABLE medicine_batch ADD CONSTRAINT chk_stock_non_negative 
    CHECK (stock_quantity >= 0 AND stock_sub_quantity >= 0);
    ```




we should also show manufactureer of medicine in the sale screen in the search bar.