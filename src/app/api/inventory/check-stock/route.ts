import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/database/db';
import { ApiResponse } from '@/src/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicineId, quantity } = body;

    if (!medicineId || quantity === undefined) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Medicine ID and quantity are required'
      }, { status: 400 });
    }

    const sql = `
      SELECT stock_quantity 
      FROM medicine 
      WHERE medicine_id = $1 AND is_active = true 
    `;

    const result = await query(sql, [medicineId]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Medicine not found'
      }, { status: 404 });
    }

    const currentStock = result.rows[0].stock_quantity;
    const available = currentStock >= quantity;

    return NextResponse.json<ApiResponse<{ available: boolean; currentStock: number }>>({
      success: true,
      data: {
        available,
        currentStock
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