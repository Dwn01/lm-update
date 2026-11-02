export type UserRole = 'super_admin' | 'user' | 'viewer';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: number;
  created_at: string;
  last_login_at?: string;
  avatar_bg?: string;
}

export interface TailscaleProfile {
  id: string;
  name: string;
  ip: string;
  userPort: number;
  adminPort: number;
  useHttps: boolean;
  isDefault?: boolean;
  lastPingMs?: number;
  lastPingStatus?: 'online' | 'offline' | 'checking';
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  plate_number: string;
  color: string;
  transmission: 'Manual' | 'Otomatis';
  fuel: string;
  mileage: number;
  purchase_price: number;
  selling_price: number;
  status: 'tersedia' | 'dipesan' | 'terjual';
  description: string;
  photo_url?: string;
  sold_at?: string;
  sold_price?: number;
  buyer_name?: string;
  sold_account_id?: number;
  sold_received?: number;
  sold_note?: string;
  purchase_account_id?: number;
  purchase_paid?: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  name: string;
  type: 'income' | 'expense';
  category_id: number;
  category_name: string;
  account_id: number;
  account_name: string;
  amount: number;
  tx_date: string;
  note: string;
  car_id?: number;
  ref_key?: string;
  created_by?: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  created_at: string;
}

export interface Account {
  id: number;
  name: string;
  kind: 'bank' | 'cash' | 'card';
  number_label: string;
  balance: number;
  created_at: string;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  month: string;
  amount: number;
  spent: number;
}

export interface Invoice {
  id: number;
  number: string;
  kind: 'receivable' | 'payable';
  contact_name: string;
  issue_date: string;
  due_date: string;
  amount: number;
  status: 'unpaid' | 'paid';
  note: string;
}

export interface ChangeRequest {
  id: number;
  entity: 'car' | 'transaction' | 'budget' | 'category' | 'account';
  action: 'create' | 'update' | 'delete' | 'sell';
  entity_id?: number;
  summary: string;
  payload: any;
  before_data?: any;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: number;
  requested_by_name: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name: string;
  action: string;
  entity: string;
  entity_id?: number;
  detail: string;
  ip: string;
  created_at: string;
}

export interface AppSettings {
  company_name: string;
  app_name: string;
  session_idle_minutes: number;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  telegram_notify_login: boolean;
  telegram_notify_approval: boolean;
  allowed_admin_ips?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  loginAt: string;
  portalMode: 'admin' | 'user';
  serverProfileId: string;
}
