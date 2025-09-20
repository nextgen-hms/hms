import { NextRequest,NextResponse } from "next/server";

export async function GET(req:NextRequest,{params}:{params:Promise<{userCode:string}>}){
   const code=(await params).userCode;
   let data={}
   if(code.includes('DOC')){

     data={
           name:"Fouzia Ishaq",
           designation:"Gynecologist"
          }
}
else{
     data={
           name:"Yumna",
           designation:"Receptionsit"
          }
}
   return NextResponse.json(data);
}