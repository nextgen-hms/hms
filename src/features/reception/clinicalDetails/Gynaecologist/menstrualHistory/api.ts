export async function getMenstrualHistory(patientId: string) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/menstrualHistory/${patientId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch menstrual history");
  return data;
}

export async function addMenstrualHistory(data: any) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/menstrualHistory`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || "Failed to add menstrual history");
  return resData;
}

export async function updateMenstrualHistory(data: any) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/menstrualHistory`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || "Failed to update menstrual history");
  return resData;
}
