import { query } from "@/database/db";

export type MedicineMasterType = "category" | "manufacturer" | "form";

type MasterConfig = {
  table: string;
  idColumn: string;
};

type MasterRecord = {
  id: number;
  name: string;
};

const MASTER_CONFIG: Record<MedicineMasterType, MasterConfig> = {
  category: {
    table: "medicine_category",
    idColumn: "category_id",
  },
  manufacturer: {
    table: "medicine_manufacturer",
    idColumn: "manufacturer_id",
  },
  form: {
    table: "medicine_form",
    idColumn: "form_id",
  },
};

function normalizeName(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function isMedicineMasterType(value: string): value is MedicineMasterType {
  return value === "category" || value === "manufacturer" || value === "form";
}

export async function fetchMedicineMasterSuggestions(type: MedicineMasterType, term: string, limit = 6): Promise<string[]> {
  const records = await fetchMedicineMasters(type, term, limit);
  return records.map((record) => record.name);
}

export async function fetchMedicineMasters(type: MedicineMasterType, term: string, limit = 20): Promise<MasterRecord[]> {
  const config = MASTER_CONFIG[type];
  const normalizedTerm = normalizeName(term);
  const params: Array<string | number> = [];

  let sql = `
    SELECT ${config.idColumn} AS id, name
    FROM ${config.table}
    WHERE is_active = true
  `;

  if (normalizedTerm) {
    params.push(`%${normalizedTerm}%`);
    sql += ` AND name ILIKE $${params.length}`;
  }

  params.push(limit);
  sql += ` ORDER BY name ASC LIMIT $${params.length}`;

  const result = await query(sql, params);
  return result.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
  }));
}

export async function getMedicineMasterById(type: MedicineMasterType, id: number): Promise<MasterRecord | null> {
  const config = MASTER_CONFIG[type];
  const result = await query(
    `
      SELECT ${config.idColumn} AS id, name
      FROM ${config.table}
      WHERE ${config.idColumn} = $1
        AND is_active = true
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  return row ? { id: Number(row.id), name: String(row.name) } : null;
}

export async function ensureMedicineMaster(type: MedicineMasterType, rawName: string): Promise<MasterRecord> {
  const config = MASTER_CONFIG[type];
  const name = normalizeName(rawName);

  if (!name) {
    throw new Error(`${type} name is required`);
  }

  const existing = await query(
    `
      SELECT ${config.idColumn} AS id, name
      FROM ${config.table}
      WHERE LOWER(BTRIM(name)) = LOWER(BTRIM($1))
      LIMIT 1
    `,
    [name],
  );

  const row = existing.rows[0];
  if (row) {
    return { id: Number(row.id), name: String(row.name) };
  }

  const inserted = await query(
    `
      INSERT INTO ${config.table} (name)
      VALUES ($1)
      RETURNING ${config.idColumn} AS id, name
    `,
    [name],
  );

  return {
    id: Number(inserted.rows[0].id),
    name: String(inserted.rows[0].name),
  };
}

export async function resolveMedicineMaster(
  type: MedicineMasterType,
  id: number | null | undefined,
  name: string | null | undefined,
): Promise<MasterRecord | null> {
  if (typeof id === "number" && Number.isFinite(id)) {
    const record = await getMedicineMasterById(type, id);
    if (record) {
      return record;
    }
  }

  const normalizedName = normalizeName(name);
  if (!normalizedName) {
    return null;
  }

  return ensureMedicineMaster(type, normalizedName);
}

export async function archiveMedicineMaster(type: MedicineMasterType, id: number): Promise<MasterRecord | null> {
  const config = MASTER_CONFIG[type];

  const result = await query(
    `
      WITH archived AS (
        UPDATE ${config.table}
        SET is_active = false
        WHERE ${config.idColumn} = $1
          AND is_active = true
        RETURNING ${config.idColumn} AS id, name
      ),
      existing AS (
        SELECT ${config.idColumn} AS id, name
        FROM ${config.table}
        WHERE ${config.idColumn} = $1
        LIMIT 1
      )
      SELECT id, name
      FROM archived
      UNION ALL
      SELECT id, name
      FROM existing
      WHERE NOT EXISTS (SELECT 1 FROM archived)
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  return row
    ? {
        id: Number(row.id),
        name: String(row.name),
      }
    : null;
}
