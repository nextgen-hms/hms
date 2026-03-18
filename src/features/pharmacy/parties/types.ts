export type PartyDetail = {
  party_id: number;
  name: string;
  contact_number: string | null;
  address: string | null;
  email: string | null;
  gst_number: string | null;
  status: boolean;
  created_at: string;
};

export type PartyWithStats = PartyDetail & {
  total_purchases: number;
  purchase_count: number;
};

export type AddPartyInput = {
  name: string;
  contact_number?: string;
  address?: string;
  email?: string;
  gst_number?: string;
};

export type LedgerEntry = {
  id: number;
  type: 'Purchase' | 'Return' | 'Payment';
  reference: string | null;
  date: string;
  debit: number;
  credit: number;
};
