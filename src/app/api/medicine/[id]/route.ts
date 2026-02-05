import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/database/db';
import { ApiResponse, Medicine } from '@/src/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const medicineId = params.id;

    const sql = `
      SELECT * FROM v_medicine_pos 
      WHERE medicine_id = $1
    `;

    const result = await query(sql, [medicineId]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Medicine not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<Medicine>>({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get medicine error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch medicine'
    }, { status: 500 });
  }
}