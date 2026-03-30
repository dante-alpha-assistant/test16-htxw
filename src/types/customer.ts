export type CustomerStatus = "active" | "inactive" | "lead" | "prospect";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: CustomerStatus;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  notes: string;
}
