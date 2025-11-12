import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/database/db';
import { ApiResponse } from '@/src/lib/types';
import { getCurrentStaffId } from '@/src/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // TODO: Integrate with actual cash drawer hardware
    // Usually done via ESC/POS commands through USB or serial port
    console.log('Opening cash drawer...');

    // Log the action
    const staffId = getCurrentStaffId();
    await query(`
      INSERT INTO pos_audit_log (
        staff_id,
        action_type,
        description
      ) VALUES ($1, $2, $3)
    `, [
      staffId,
      'CASH_DRAWER_OPENED',
      'Cash drawer manually opened'
    ]);

    return NextResponse.json<ApiResponse<{ opened: boolean }>>({
      success: true,
      data: { opened: true },
      message: 'Cash drawer opened'
    });

  } catch (error) {
    console.error('Open cash drawer error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to open cash drawer'
    }, { status: 500 });
  }
}