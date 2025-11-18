
export type  Party={
    party_id:number,
    name:string,
    contact_number:string,
    address:string,
    created_at:string
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
