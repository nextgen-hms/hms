export async function getObstetricHistory(patientId: string) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/obstetric/${patientId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch obstetric history");
  return data;
}

export async function addObstetricHistory(data: any) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/obstetric`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || "Failed to add obstetric history");
  return resData;
}

export async function updateObstetricHistory(data: any) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/obstetric`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || "Failed to update obstetric history");
  return resData;
}
