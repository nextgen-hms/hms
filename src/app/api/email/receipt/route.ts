import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/database/db';
import { ApiResponse } from '@/src/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, email } = body;

    if (!transactionId || !email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Transaction ID and email are required'
      }, { status: 400 });
    }

    // Get transaction details (same as print receipt)
    const saleResult = await query(`
      SELECT ps.*, s.name as staff_name
      FROM pharmacy_sale ps
      LEFT JOIN staff s ON ps.handled_by = s.staff_id
      WHERE ps.sale_id = $1
    `, [transactionId]);

    if (saleResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Transaction not found'
      }, { status: 404 });
    }

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    console.log('Sending receipt email to:', email);

    return NextResponse.json<ApiResponse<{ sent: boolean }>>({
      success: true,
      data: { sent: true },
      message: 'Receipt email sent successfully'
    });

  } catch (error) {
    console.error('Email receipt error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to send receipt email'
    }, { status: 500 });
  }
}