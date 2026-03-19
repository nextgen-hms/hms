import { NextResponse } from "next/server";
import { query } from "@/database/db";

export async function GET() {
  try {
    // 1. Overall Summary
    const summary = await query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(current_stock * purchase_price) as total_value,
        COUNT(*) FILTER (WHERE current_stock <= low_stock_threshold) as low_stock_count,
        COUNT(*) FILTER (WHERE expiry_date <= NOW() + INTERVAL '90 days') as soon_expiring_count
      FROM medicine_stock
      WHERE is_active = true
    `);

    // 2. Low Stock Details
    const lowStock = await query(`
      SELECT 
        m.name,
        m.generic_name,
        ms.current_stock,
        ms.low_stock_threshold,
        ms.unit
      FROM medicine_stock ms
      JOIN medicine m ON ms.medicine_id = m.medicine_id
      WHERE ms.current_stock <= ms.low_stock_threshold
        AND ms.is_active = true
      ORDER BY ms.current_stock ASC
      LIMIT 10
    `);

    // 3. Expiry Alerts
    const expiringSoon = await query(`
      SELECT 
        m.name,
        ms.batch_number,
        ms.expiry_date,
        ms.current_stock
      FROM medicine_stock ms
      JOIN medicine m ON ms.medicine_id = m.medicine_id
      WHERE ms.expiry_date <= NOW() + INTERVAL '90 days'
        AND ms.is_active = true
        AND ms.current_stock > 0
      ORDER BY ms.expiry_date ASC
      LIMIT 10
    `);

    // 4. Category Distribution
    const categories = await query(`
      SELECT 
        c.name as category,
        COUNT(ms.stock_id) as item_count,
        SUM(ms.current_stock * ms.purchase_price) as value
      FROM medicine_category c
      JOIN medicine m ON c.category_id = m.category_id
      JOIN medicine_stock ms ON m.medicine_id = ms.medicine_id
      WHERE ms.is_active = true
      GROUP BY c.name
      ORDER BY value DESC
    `);

    return NextResponse.json({
      summary: summary.rows[0],
      lowStock: lowStock.rows,
      expiringSoon: expiringSoon.rows,
      categories: categories.rows
    });
  } catch (error: any) {
    console.error("Inventory API Error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory data" }, { status: 500 });
  }
}
