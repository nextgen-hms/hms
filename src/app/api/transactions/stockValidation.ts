import type { PoolClient } from "pg";
import type { CartItem } from "@/src/lib/types";
import { formatStockQuantity, toStockBreakdown } from "@/src/features/pharmacy/retail/stock";

type InventoryItem = CartItem & {
  batchId?: number;
  batchNumber?: string;
};

interface ExistingSaleDetailRow {
  medicine_id: number;
  batch_id: number | null;
  quantity: number;
  sub_quantity: number;
}

interface AggregatedItem {
  medicineId: number;
  batchId: number;
  quantity: number;
  subQuantity: number;
  medicine: InventoryItem["medicine"];
}

function inventoryKey(medicineId: number, batchId: number) {
  return `${medicineId}:${batchId}`;
}

function getInventoryItems(items: CartItem[]): InventoryItem[] {
  return items.filter(
    (item) => item.isBillable !== false && item.isInventoryBacked !== false && item.fulfillmentMode !== "override"
  );
}

function aggregateInventoryItems(items: InventoryItem[]): AggregatedItem[] {
  const grouped = new Map<string, AggregatedItem>();

  for (const item of items) {
    const medicineId = Number(item.medicine.medicine_id ?? item.medicine.id);
    const batchId = Number(item.batchId ?? item.medicine.batch_id ?? 0);

    if (!medicineId || !batchId) {
      throw new Error(`Inventory-backed sale items require a valid medicine batch for ${item.medicine.brand_name}`);
    }

    const key = inventoryKey(medicineId, batchId);
    const current = grouped.get(key);

    if (current) {
      current.quantity += Number(item.quantity || 0);
      current.subQuantity += Number(item.subQuantity || 0);
      continue;
    }

    grouped.set(key, {
      medicineId,
      batchId,
      quantity: Number(item.quantity || 0),
      subQuantity: Number(item.subQuantity || 0),
      medicine: item.medicine,
    });
  }

  return [...grouped.values()];
}

function aggregateExistingSaleDetails(rows: ExistingSaleDetailRow[]): Map<string, { quantity: number; subQuantity: number }> {
  const grouped = new Map<string, { quantity: number; subQuantity: number }>();

  for (const row of rows) {
    if (!row.batch_id) {
      continue;
    }

    const key = inventoryKey(Number(row.medicine_id), Number(row.batch_id));
    const current = grouped.get(key) ?? { quantity: 0, subQuantity: 0 };
    current.quantity += Number(row.quantity || 0);
    current.subQuantity += Number(row.sub_quantity || 0);
    grouped.set(key, current);
  }

  return grouped;
}

function buildStockErrorMessage(
  medicine: AggregatedItem["medicine"],
  availableQty: number,
  availableSubQty: number
) {
  const available = toStockBreakdown(
    availableQty,
    availableSubQty,
    Number(medicine.sub_units_per_unit || 1)
  );
  return `Only ${formatStockQuantity(available, medicine)} available${medicine.batch_number ? ` in batch ${medicine.batch_number}` : ""}`;
}

export class StockValidationError extends Error {
  status = 409;
  details: {
    medicineId: number;
    batchId: number;
    requestedQuantity: number;
    requestedSubQuantity: number;
    availableQuantity: number;
    availableSubQuantity: number;
  };

  constructor(
    message: string,
    details: StockValidationError["details"]
  ) {
    super(message);
    this.name = "StockValidationError";
    this.details = details;
  }
}

export async function validateInventoryItemsForSale(
  client: Pick<PoolClient, "query">,
  items: CartItem[],
  existingSaleDetails: ExistingSaleDetailRow[] = []
) {
  const inventoryItems = getInventoryItems(items);
  if (inventoryItems.length === 0) {
    return;
  }

  const requestedByBatch = aggregateInventoryItems(inventoryItems);
  const existingReserved = aggregateExistingSaleDetails(existingSaleDetails);

  for (const item of requestedByBatch) {
    const batchResult = await client.query(
      `
        SELECT
          mb.batch_id,
          mb.batch_number,
          COALESCE(mb.stock_quantity, 0) AS stock_quantity,
          COALESCE(mb.stock_sub_quantity, 0) AS stock_sub_quantity,
          COALESCE(m.sub_units_per_unit, 1) AS sub_units_per_unit,
          m.form,
          m.sub_unit
        FROM medicine_batch mb
        JOIN medicine m ON m.medicine_id = mb.medicine_id
        WHERE mb.batch_id = $1
          AND mb.medicine_id = $2
          AND (mb.expiry_date > CURRENT_DATE OR mb.expiry_date IS NULL)
        FOR UPDATE
      `,
      [item.batchId, item.medicineId]
    );

    if (batchResult.rows.length === 0) {
      throw new StockValidationError("Selected batch is no longer available", {
        medicineId: item.medicineId,
        batchId: item.batchId,
        requestedQuantity: item.quantity,
        requestedSubQuantity: item.subQuantity,
        availableQuantity: 0,
        availableSubQuantity: 0,
      });
    }

    const batchRow = batchResult.rows[0];
    const key = inventoryKey(item.medicineId, item.batchId);
    const existing = existingReserved.get(key) ?? { quantity: 0, subQuantity: 0 };
    const subUnitsPerUnit = Number(batchRow.sub_units_per_unit || 1);

    const availableNow = toStockBreakdown(
      Number(batchRow.stock_quantity || 0),
      Number(batchRow.stock_sub_quantity || 0),
      subUnitsPerUnit
    );
    const reservedByCurrentSale = toStockBreakdown(existing.quantity, existing.subQuantity, subUnitsPerUnit);
    const effectiveAvailable = toStockBreakdown(
      availableNow.units + reservedByCurrentSale.units,
      availableNow.subUnits + reservedByCurrentSale.subUnits,
      subUnitsPerUnit
    );
    const requested = toStockBreakdown(item.quantity, item.subQuantity, subUnitsPerUnit);

    if (requested.totalSubUnits > effectiveAvailable.totalSubUnits) {
      throw new StockValidationError(
        buildStockErrorMessage(
          {
            ...item.medicine,
            batch_number: batchRow.batch_number,
            sub_units_per_unit: subUnitsPerUnit,
            form: batchRow.form,
            sub_unit: batchRow.sub_unit,
          },
          effectiveAvailable.units,
          effectiveAvailable.subUnits
        ),
        {
          medicineId: item.medicineId,
          batchId: item.batchId,
          requestedQuantity: item.quantity,
          requestedSubQuantity: item.subQuantity,
          availableQuantity: effectiveAvailable.units,
          availableSubQuantity: effectiveAvailable.subUnits,
        }
      );
    }
  }
}
