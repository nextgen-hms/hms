import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/database/db';
import { ApiResponse } from '@/src/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicineId, quantity, subQuantity, batchId } = body;

    if (!medicineId || (quantity === undefined && subQuantity === undefined)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Medicine ID and at least one quantity (quantity or subQuantity) are required'
      }, { status: 400 });
    }

    let sql = '';
    let params = [];

    if (batchId) {
      sql = `
        SELECT m.sub_units_per_unit, mb.stock_quantity, mb.stock_sub_quantity 
        FROM medicine_batch mb
        JOIN medicine m ON mb.medicine_id = m.medicine_id
        WHERE mb.batch_id = $1 AND mb.medicine_id = $2
      `;
      params = [batchId, medicineId];
    } else {
      sql = `
        SELECT sub_units_per_unit, stock_quantity, stock_sub_quantity 
        FROM medicine 
        WHERE medicine_id = $1 AND is_active = true 
      `;
      params = [medicineId];
    }

    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: batchId ? 'Batch not found' : 'Medicine not found'
      }, { status: 404 });
    }

    const subUnitsPerUnit = rows[0].sub_units_per_unit || 1;
    const currentStockUnits = rows[0].stock_quantity || 0;
    const currentStockSubUnits = rows[0].stock_sub_quantity || 0;

    // Correct availability check: Convert everything to sub-units
    const totalAvailableSubUnits = (currentStockUnits * subUnitsPerUnit) + currentStockSubUnits;
    const totalRequestedSubUnits = ((quantity || 0) * subUnitsPerUnit) + (subQuantity || 0);

    const available = totalAvailableSubUnits >= totalRequestedSubUnits;

    return NextResponse.json<ApiResponse<{
      available: boolean;
      currentStock: number;
      currentSubStock: number;
      totalAvailableSubUnits: number;
    }>>({
      success: true,
      data: {
        available,
        currentStock: currentStockUnits,
        currentSubStock: currentStockSubUnits,
        totalAvailableSubUnits
      }
    });


  } catch (error) {
    console.error('Check stock error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to check stock'
    }, { status: 500 });
  }
}