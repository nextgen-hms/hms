import { CurrentPregnancyFormData } from "./types";

export async function getVisitId(patientId: string) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/currentPregnancy/getVisitId/${patientId}`);
  return res.json();
}

export async function getCurrentPregnancy(patientId: string) {
  const res = await fetch(`/api/clinicalDetails/gynaecologist/currentPregnancy/${patientId}`);
  return res.json();
}

export async function postCurrentPregnancy(data: CurrentPregnancyFormData) {
  const res = await fetch("/api/clinicalDetails/gynaecologist/currentPregnancy", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCurrentPregnancy(data: CurrentPregnancyFormData) {
  const res = await fetch("/api/clinicalDetails/gynaecologist/currentPregnancy", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.json();
}
