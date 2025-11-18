import {Party} from './types'

export async function getAllPartiesName(){
  const res=await fetch('/api/party');
  if(!res.ok) throw new Error("Failed to fetch Data from  /api/party");
  const data= await res.json();
  const parties=data.map((p:Party)=>{
    return(
      {
        id:p.party_id,
        name:p.name,
      }
    )
  })
  return(parties);
}


