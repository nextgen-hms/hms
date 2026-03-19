import { CurrentPregnancyFormData } from "./types";

export async function getCurrentPregnancy(visitId: string) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/currentPregnancy/${visitId}`);
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch current pregnancy");
  return data;
}

export async function postCurrentPregnancy(data: CurrentPregnancyFormData) {
  const res = await fetch("/api/clinicalDetails/gynaecologist/currentPregnancy", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.error || "Failed to create current pregnancy");
  return response;
}

export async function updateCurrentPregnancy(data: CurrentPregnancyFormData) {
  const res = await fetch("/api/clinicalDetails/gynaecologist/currentPregnancy", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.error || "Failed to update current pregnancy");
  return response;
}
