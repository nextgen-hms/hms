import { PartyDetail, AddPartyInput, LedgerEntry } from './types';

export async function getAllParties(): Promise<PartyDetail[]> {
  const res = await fetch('/api/party');
  if (!res.ok) throw new Error('Failed to fetch parties');
  return res.json();
}

export async function addParty(input: AddPartyInput): Promise<PartyDetail> {
  const res = await fetch('/api/party', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to add party');
  const data = await res.json();
  return data.data;
}

export async function updateParty(
  party_id: number,
  input: Partial<AddPartyInput> & { status?: boolean }
): Promise<PartyDetail> {
  const res = await fetch('/api/party', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ party_id, ...input }),
  });
  if (!res.ok) throw new Error('Failed to update party');
  const data = await res.json();
  return data.data;
}

export async function getPartyLedger(partyId: number): Promise<LedgerEntry[]> {
  const res = await fetch(`/api/pharmacy/ledger?party_id=${partyId}`);
  if (!res.ok) throw new Error('Failed to fetch ledger');
  const data = await res.json();
  return data.data;
}

export async function recordPayment(payload: {
  party_id: number;
  amount: number;
  payment_method?: string;
  reference_note?: string;
}): Promise<void> {
  const res = await fetch('/api/pharmacy/ledger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to record payment');
}
