import { 
  Medicine, 
  Transaction, 
  ApiResponse, 
  SearchResponse,
  CartItem 
} from './types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * Search medicines by barcode, SKU, or name
 */
export const searchMedicines = async ( 
  query: string,
  type: 'barcode' | 'sku' | 'name' = 'name'
): Promise<ApiResponse<SearchResponse>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/medicine/search?query=${encodeURIComponent(query)}&type=${type}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to search medicines'
    };
  }
};

/**
 * Get medicine by ID
 */
export const getMedicineById = async (
  id: string
): Promise<ApiResponse<Medicine>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/medicine/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch medicine details'
    };
  }
};

/**
 * Check stock availability
 */
export const checkStock = async (
  medicineId: string,
  quantity: number
): Promise<ApiResponse<{ available: boolean; currentStock: number }>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/inventory/check-stock`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineId, quantity })
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to check stock'
    };
  }
};

/**
 * Submit transaction
 */
export const submitTransaction = async (
  transaction: Omit<Transaction, 'id' | 'timestamp'>
): Promise<ApiResponse<Transaction>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to submit transaction'
    };
  }
};

/**
 * Hold transaction
 */
export const holdTransaction = async (
  transaction: Omit<Transaction, 'id' | 'timestamp'>
): Promise<ApiResponse<{ holdId: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to hold transaction'
    };
  }
};

/**
 * Get held transactions
 */
export const getHeldTransactions = async (): Promise<ApiResponse<Transaction[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/held`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch held transactions'
    };
  }
};

/**
 * Print receipt
 */
export const printReceipt = async (
  transactionId: string,
  printerName?: string
): Promise<ApiResponse<{ printed: boolean }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/print/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, printerName })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to print receipt'
    };
  }
};

/**
 * Email receipt
 */
export const emailReceipt = async (
  transactionId: string,
  email: string
): Promise<ApiResponse<{ sent: boolean }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/email/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, email })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to email receipt'
    };
  }
};

/**
 * Open cash drawer
 */
export const openCashDrawer = async (): Promise<ApiResponse<{ opened: boolean }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hardware/cash-drawer`, {
      method: 'POST'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to open cash drawer'
    };
  }
};