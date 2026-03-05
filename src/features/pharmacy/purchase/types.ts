
export type Party = {
    id: number;
    name: string;
};

export type PurchaseItem = {
    medicine_id: number;
    medicine_name: string;
    quantity: number;
    sub_quantity: number;
    unit_cost: number;
    sub_unit_cost: number;
    batch_number: string;
    expiry_date: string;
    sale_price: number;
    sale_sub_unit_price: number;
};

export type PurchaseInvoice = {
    party_id: number;
    invoice_no: string;
    total_amount: number;
    payment_status: string;
    items: PurchaseItem[];
};

export type Medicine = {
    id: number;
    generic_name: string;
    brand_name: string;
    category: string;
    dosage_value: number;
    dosage_unit: string;
    form: string;
    price: number;
    stock_quantity: number;
    stock_sub_quantity: number;
    sub_unit: string;
    sub_units_per_unit: number;
    sub_unit_price: number;
    allow_sub_unit_sale: boolean;
    barcode: string;
    sku: string;
    manufacturer: string;
};