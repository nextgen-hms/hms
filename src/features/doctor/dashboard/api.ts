import {
  CheckedPatientRow,
  DashboardSummary,
  VisitHistoryResponse,
} from "./types";

type DateRange = {
  from: string;
  to: string;
};

function toQueryString(range: DateRange) {
  const params = new URLSearchParams({
    from: range.from,
    to: range.to,
  });

  return params.toString();
}

export async function fetchDashboardSummary(
  range: DateRange
): Promise<DashboardSummary> {
  const res = await fetch(`/api/doctor/dashboard/summary?${toQueryString(range)}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}

export async function fetchCheckedPatients(
  range: DateRange
): Promise<CheckedPatientRow[]> {
  const res = await fetch(
    `/api/doctor/dashboard/checked-patients?${toQueryString(range)}`
  );
  if (!res.ok) throw new Error("Failed to fetch checked patients");
  const data = await res.json();
  return data.rows ?? [];
}

export async function fetchVisitHistory(
  visitId: number
): Promise<VisitHistoryResponse> {
  const res = await fetch(`/api/doctor/dashboard/visit-history/${visitId}`);
  if (!res.ok) throw new Error("Failed to fetch visit history");
  return res.json();
}
