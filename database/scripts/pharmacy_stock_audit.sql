-- Pharmacy stock audit helpers for the HMS sample environment.
-- Run sections independently in Supabase SQL editor or psql.

-- 1. POS-facing stock status overview
select
  id as medicine_id,
  brand_name,
  batch_id,
  batch_number,
  min_stock_level,
  batch_stock_quantity,
  batch_stock_sub_quantity,
  total_stock_quantity,
  total_stock_sub_quantity,
  is_out_of_stock,
  is_low_stock
from public.v_medicine_pos
order by brand_name, batch_number nulls last;

-- 2. Negative or zero stock batches in the raw table
select
  m.medicine_id,
  m.brand_name,
  mb.batch_id,
  mb.batch_number,
  mb.stock_quantity,
  mb.stock_sub_quantity,
  mb.expiry_date
from public.medicine_batch mb
join public.medicine m on m.medicine_id = mb.medicine_id
where coalesce(mb.stock_quantity, 0) < 0
   or coalesce(mb.stock_sub_quantity, 0) < 0
   or (
     coalesce(mb.stock_quantity, 0) = 0
     and coalesce(mb.stock_sub_quantity, 0) = 0
   )
order by m.brand_name, mb.batch_number;

-- 3. Active medicines that currently have no active batch row
select
  m.medicine_id,
  m.brand_name,
  m.generic_name,
  m.category,
  m.form,
  m.min_stock_level
from public.medicine m
where m.is_active = true
  and not exists (
    select 1
    from public.medicine_batch mb
    where mb.medicine_id = m.medicine_id
      and (mb.expiry_date > current_date or mb.expiry_date is null)
  )
order by m.brand_name;

-- 4. Ledger vs current batch stock reconciliation
with ledger_net as (
  select
    mt.medicine_id,
    mt.batch_id,
    coalesce(m.sub_units_per_unit, 1) as sub_units_per_unit,
    sum(
      case
        when mt.txn_type in ('purchase', 'sale_return', 'adjustment') then
          ((mt.quantity * coalesce(m.sub_units_per_unit, 1)) + coalesce(mt.sub_quantity, 0))
        when mt.txn_type in ('sale', 'purchase_return') then
          -1 * ((mt.quantity * coalesce(m.sub_units_per_unit, 1)) + coalesce(mt.sub_quantity, 0))
        else 0
      end
    ) as net_sub_units
  from public.medicine_transaction mt
  join public.medicine m on m.medicine_id = mt.medicine_id
  group by mt.medicine_id, mt.batch_id, coalesce(m.sub_units_per_unit, 1)
)
select
  l.medicine_id,
  m.brand_name,
  l.batch_id,
  mb.batch_number,
  (l.net_sub_units / l.sub_units_per_unit)::int as ledger_units,
  (l.net_sub_units % l.sub_units_per_unit)::int as ledger_sub_units,
  coalesce(mb.stock_quantity, 0) as batch_units,
  coalesce(mb.stock_sub_quantity, 0) as batch_sub_units,
  ((l.net_sub_units / l.sub_units_per_unit)::int - coalesce(mb.stock_quantity, 0)) as unit_diff,
  ((l.net_sub_units % l.sub_units_per_unit)::int - coalesce(mb.stock_sub_quantity, 0)) as sub_unit_diff
from ledger_net l
join public.medicine_batch mb on mb.batch_id = l.batch_id
join public.medicine m on m.medicine_id = l.medicine_id
where ((l.net_sub_units / l.sub_units_per_unit)::int <> coalesce(mb.stock_quantity, 0))
   or ((l.net_sub_units % l.sub_units_per_unit)::int <> coalesce(mb.stock_sub_quantity, 0))
order by m.brand_name, mb.batch_number;

-- 5. Recent stock-affecting adjustments
select
  txn_id,
  medicine_id,
  batch_id,
  txn_type,
  quantity,
  sub_quantity,
  amount_per_unit,
  created_at
from public.medicine_transaction
where txn_type = 'adjustment'
order by created_at desc, txn_id desc
limit 50;
