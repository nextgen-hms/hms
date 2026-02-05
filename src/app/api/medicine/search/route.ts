import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/database/db';
import { ApiResponse, Medicine } from '@/src/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('query');
    const searchType = searchParams.get('type') || 'name';

    if (!searchQuery) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    let sql: string;
    let params: any[];

    switch (searchType) {
      case 'barcode':
        sql = `
          SELECT * FROM v_medicine_pos 
          WHERE barcode = $1
          LIMIT 10
        `;
        params = [searchQuery];
        break;

      case 'sku':
        sql = `
          SELECT * FROM v_medicine_pos 
          WHERE sku = $1
          LIMIT 10
        `;
        params = [searchQuery];
        break;

      case 'name':
      default:
        sql = `
          SELECT * FROM v_medicine_pos 
          WHERE search_vector @@ plainto_tsquery('english', $1)
             OR generic_name ILIKE $2
             OR brand_name ILIKE $2
          ORDER BY 
            CASE 
              WHEN generic_name ILIKE $2 THEN 1
              WHEN brand_name ILIKE $2 THEN 2
              ELSE 3
            END
          LIMIT 20
        `;
        params = [searchQuery, `%${searchQuery}%`];
        break;
    }

    const result = await query(sql, params);

    return NextResponse.json<ApiResponse<{ medicines: Medicine[]; total: number }>>({
      success: true,
      data: {
        medicines: result.rows,
        total: result.rowCount || 0
      }
    });

  } catch (error) {
    console.error('Medicine search error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to search medicines'
    }, { status: 500 });
  }
}