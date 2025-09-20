import { NextRequest, NextResponse } from "next/server";



export async function GET(req:NextRequest,{params}:{params:{patientId:string}}){
  const id=(await params).patientId;

  const data=[
  {
    "patientId": "1",
    "name": "Ali Khan",
    "prescriptions": [
      {
        "orderDate": "2025-09-01",
        "category": "Medicine",
        "generic": "Paracetamol",
        "brandName": "Panadol",
        "dose": "500mg",
        "quantity":"14",
        "frequency": "Twice a day",
        "duration": "5",
        "unit": "days",
        "prescribedBy": "Dr. Ahmed"
      },
      {
        "orderDate": "2025-09-01",
        "category": "Medicine",
        "generic": "Ibuprofen",
        "brandName": "Brufen",
        "dose": "400mg",
        "quantity":"10",
        "frequency": "Thrice a day",
        "duration": "3",
        "unit": "days",
        "prescribedBy": "Dr. Ahmed"
      }
    ]
  },
  {
    "patientId": "2",
    "name": "Fatima Noor",
    "prescriptions": [
      {
        "orderDate": "2025-09-02",
        "category": "Antibiotic",
        "generic": "Amoxicillin",
        "brandName": "Amoxil",
        "dose": "250mg",
        "quantity":"8",
        "frequency": "Twice a day",
        "duration": "7",
        "unit": "days",
        "prescribedBy": "Dr. Sara"
      }
    ]
  },
  {
    "patientId": "3",
    "name": "Hamza Ali",
    "prescriptions": [
      {
        "orderDate": "2025-09-03",
        "category": "Vitamin",
        "generic": "Vitamin D",
        "brandName": "Calci-D",
        "dose": "1000 IU",
        "quantity":"19",
        "frequency": "Once a day",
        "duration": "30",
        "unit": "days",
        "prescribedBy": "Dr. Zain"
      }
    ]
  }
]


 return NextResponse.json(data.filter((d)=> d.patientId === id)[0])

}