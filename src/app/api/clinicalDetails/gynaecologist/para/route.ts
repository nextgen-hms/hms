import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
     const data=await req.json();
      const inserted=[];
    console.log(data);

 
   for (const p of data.para){
        try{

          const res=await query('insert into para_details(obstetric_history_id,para_number,birth_year,birth_month,gender,delivery_type,alive,birth_weight_grams,complications,notes,gestational_age_weeks) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)    ON CONFLICT (obstetric_history_id, para_number) DO NOTHING returning *',[p.obstetric_history_id,parseInt(p.para_number),parseInt(p.birth_year),parseInt(p.birth_month),p.gender,p.delivery_type,p.alive === "true",parseInt(p.birth_weight_grams),p.complications,p.notes,p.gestational_age_weeks])
          if(res.rows.length > 0){inserted.push(res.rows[0]);}   

     }catch(err){
          console.error(err);
          return NextResponse.json({error:`failed to insert ${err}`},{status:500})
        }
    }  
  console.log(inserted);
     try{
          console.log(data.para.length);
          
          const u_res=await query('update obstetric_history set para = $1 returning *',[data.para.length]);
           console.log(u_res.rows[0]);
           
     }
     catch(err){
          console.error(err);
          return NextResponse.json({error:"failed tou update para number "},{status:500})
     }
     return NextResponse.json(inserted,{status:200})
}


export async function PATCH(req: NextRequest) {
  const data = await req.json();
  let updated: any[] = [];

  try {
    // 1. Get all current para_numbers in DB for this obstetric_history_id
    const current = await query(
      `SELECT para_number FROM para_details WHERE obstetric_history_id = $1`,
      [data.para[0].obstetric_history_id]
    );
    const existingParaNumbers = current.rows.map((r) => r.para_number);

    // 2. Extract incoming para_numbers
    const incomingParaNumbers = data.para.map((p: any) =>
      parseInt(p.para_number)
    );

    // 3. Find which paras to delete (present in DB but not in incoming)
    const toDelete = existingParaNumbers.filter(
      (num) => !incomingParaNumbers.includes(num)
    );

    if (toDelete.length > 0) {
      await query(
        `DELETE FROM para_details 
         WHERE obstetric_history_id = $1 
         AND para_number = ANY($2::int[])`,
        [data.para[0].obstetric_history_id, toDelete]
      );
    }

    // 4. Upsert (insert new OR update existing)
    for (const p of data.para) {
      const res = await query(
        `INSERT INTO para_details(
            obstetric_history_id, para_number, birth_year, birth_month,
            gender, delivery_type, alive, birth_weight_grams,
            complications, notes, gestational_age_weeks
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (obstetric_history_id, para_number)
         DO UPDATE SET
            birth_year=$3, birth_month=$4, gender=$5, delivery_type=$6,
            alive=$7, birth_weight_grams=$8, complications=$9, notes=$10,
            gestational_age_weeks=$11
         RETURNING *`,
        [
          p.obstetric_history_id,
          parseInt(p.para_number),
          parseInt(p.birth_year),
          parseInt(p.birth_month),
          p.gender,
          p.delivery_type,
          p.alive === "true",
          parseInt(p.birth_weight_grams),
          p.complications,
          p.notes,
          p.gestational_age_weeks,
        ]
      );

      if (res.rows.length > 0) updated.push(res.rows[0]);
    }

    // 5. Update para count in obstetric_history
    const u_res = await query(
      `UPDATE obstetric_history SET para = $1 WHERE obstetric_history_id = $2 RETURNING *`,
      [data.para.length, data.para[0].obstetric_history_id]
    );

    return NextResponse.json(
      { updated, obstetric_history: u_res.rows[0] },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: `Failed: ${err}` }, { status: 500 });
  }
}
