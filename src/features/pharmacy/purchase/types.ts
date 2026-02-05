
export type  Party={
    party_id:number,
    name:string,
}

export type PurchaseForm={
    party:string,
    medicine:string,
    quantity:number,
    sub_quantity:number,
    unit_cost:number,
    sub_unit_cost:number,
    batch_number:number,
    expiry_date:string
}
export type Medicine={
    medicine_id:number,
    generic_name:string,
    brand_name:string,
    category:string,
    dosage_value:string,
    dosage_unit:string,
    form:string,
    stock_quantity:string,
    price:string,
    created_at:string,
    barcode:string,
    sku:string,
    manufacturer:string,
    min_stock_level:number,
    is_active:boolean,
    requires_prescription:boolean,
    search_vector:string,
    sub_unit:string,
    sub_units_per_unit:number,
    sub_unit_price:number,
    allow_sub_unit_sale:boolean,
    stock_sub_quantity:number;

}