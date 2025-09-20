import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest,{params}:{params:{category:string}}){
     const ctg=(await params).category;

     const data=[
         { category: "iron", generic: "Ferrous Sulfate", brandName: "FeroSul", dose: "325mg" },
  { category: "iron", generic: "Ferrous Gluconate", brandName: "Fergon", dose: "240mg" },
  { category: "iron", generic: "Iron Polysaccharide", brandName: "Niferex", dose: "150mg" },
  { category: "iron", generic: "Carbonyl Iron", brandName: "Feosol", dose: "45mg" },
  { category: "iron", generic: "Iron Sucrose", brandName: "Venofer", dose: "100mg/5mL" },
  { category: "iron", generic: "Ferric Carboxymaltose", brandName: "Injectafer", dose: "750mg/15mL" },
  { category: "iron", generic: "Iron Dextran", brandName: "INFeD", dose: "50mg/mL" },
  { category: "iron", generic: "Ferric Citrate", brandName: "Auryxia", dose: "210mg" },
  { category: "iron", generic: "Ferrous Fumarate", brandName: "Hemocyte", dose: "325mg" },
  { category: "iron", generic: "Heme Iron Polypeptide", brandName: "Proferrin", dose: "12mg" },

  // 🔹 Antibiotic Category
  { category: "antibiotic", generic: "Amoxicillin", brandName: "Amoxil", dose: "500mg" },
  { category: "antibiotic", generic: "Ciprofloxacin", brandName: "Cipro", dose: "500mg" },
  { category: "antibiotic", generic: "Azithromycin", brandName: "Zithromax", dose: "250mg" },
  { category: "antibiotic", generic: "Clarithromycin", brandName: "Biaxin", dose: "500mg" },
  { category: "antibiotic", generic: "Doxycycline", brandName: "Vibramycin", dose: "100mg" },
  { category: "antibiotic", generic: "Cephalexin", brandName: "Keflex", dose: "500mg" },
  { category: "antibiotic", generic: "Metronidazole", brandName: "Flagyl", dose: "400mg" },
  { category: "antibiotic", generic: "Levofloxacin", brandName: "Levaquin", dose: "500mg" },
  { category: "antibiotic", generic: "Vancomycin", brandName: "Vancocin", dose: "1g" },
  { category: "antibiotic", generic: "Penicillin V", brandName: "Pen VK", dose: "250mg" },

  // 🔹 Sugar (Diabetes Drugs) Category
  { category: "sugar drugs", generic: "Metformin", brandName: "Glucophage", dose: "500mg" },
  { category: "sugar drugs", generic: "Gliclazide", brandName: "Diamicron", dose: "80mg" },
  { category: "sugar drugs", generic: "Insulin Glargine", brandName: "Lantus", dose: "100 IU/mL" },
  { category: "sugar drugs", generic: "Insulin Lispro", brandName: "Humalog", dose: "100 IU/mL" },
  { category: "sugar drugs", generic: "Empagliflozin", brandName: "Jardiance", dose: "10mg" },
  { category: "sugar drugs", generic: "Sitagliptin", brandName: "Januvia", dose: "100mg" },
  { category: "sugar drugs", generic: "Glimepiride", brandName: "Amaryl", dose: "2mg" },
  { category: "sugar drugs", generic: "Insulin Aspart", brandName: "Novolog", dose: "100 IU/mL" },
  { category: "sugar drugs", generic: "Pioglitazone", brandName: "Actos", dose: "30mg" },
  { category: "sugar drugs", generic: "Vildagliptin", brandName: "Galvus", dose: "50mg" }
     ]
   return NextResponse.json(data.filter((d)=> d.category === ctg));
}