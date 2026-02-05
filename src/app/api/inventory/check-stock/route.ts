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
        SELECT stock_quantity, stock_sub_quantity 
        FROM medicine_batch 
        WHERE batch_id = $1 AND medicine_id = $2
      `;
      params = [batchId, medicineId];
    } else {
      sql = `
        SELECT stock_quantity, stock_sub_quantity 
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

    const currentStockUnits = rows[0].stock_quantity;
    const currentStockSubUnits = rows[0].stock_sub_quantity || 0;

    // Simple availability check (could be more complex if we need to convert units)
    // For now, we assume POS specifies exact quantity/sub-quantity needed
    const available = (currentStockUnits > (quantity || 0)) ||
      (currentStockUnits === (quantity || 0) && currentStockSubUnits >= (subQuantity || 0));

    return NextResponse.json<ApiResponse<{
      available: boolean;
      currentStock: number;
      currentSubStock: number;
    }>>({
      success: true,
      data: {
        available,
        currentStock: currentStockUnits,
        currentSubStock: currentStockSubUnits
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