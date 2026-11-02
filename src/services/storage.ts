import {
  User,
  TailscaleProfile,
  Car,
  Transaction,
  Category,
  Account,
  Budget,
  Invoice,
  ChangeRequest,
  AuditLog,
  AppSettings,
  AuthSession,
} from '../types';

const STORAGE_KEYS = {
  AUTH_SESSION: 'finora_auth_session',
  REMEMBER_ME: 'finora_remember_me',
  SAVED_CREDENTIALS: 'finora_saved_credentials',
  QUICK_PIN: 'finora_quick_pin',
  PIN_ENABLED: 'finora_pin_enabled',
  TAILSCALE_PROFILES: 'finora_tailscale_profiles',
  ACTIVE_PROFILE_ID: 'finora_active_profile_id',
  USERS: 'finora_data_users',
  CARS: 'finora_data_cars',
  TRANSACTIONS: 'finora_data_transactions',
  CATEGORIES: 'finora_data_categories',
  ACCOUNTS: 'finora_data_accounts',
  BUDGETS: 'finora_data_budgets',
  INVOICES: 'finora_data_invoices',
  CHANGE_REQUESTS: 'finora_data_change_requests',
  AUDIT_LOGS: 'finora_data_audit_logs',
  SETTINGS: 'finora_data_settings',
};

// Initial default Tailscale server profiles
export const DEFAULT_TAILSCALE_PROFILES: TailscaleProfile[] = [
  {
    id: 'ts-default',
    name: 'Node Tailscale Utama',
    ip: '100.84.12.90',
    userPort: 8080,
    adminPort: 8081,
    useHttps: false,
    isDefault: true,
    lastPingStatus: 'online',
    lastPingMs: 42,
  },
  {
    id: 'ts-office',
    name: 'Server Kantor / Localhost',
    ip: '127.0.0.1',
    userPort: 8080,
    adminPort: 8081,
    useHttps: false,
    isDefault: false,
    lastPingStatus: 'online',
    lastPingMs: 12,
  },
];

// Initial default Users
export const DEFAULT_USERS: User[] = [
  {
    id: 1,
    name: 'Super Administrator',
    username: 'superadmin',
    email: 'admin@finora.id',
    role: 'super_admin',
    is_active: 1,
    created_at: '2026-10-20 10:00:00',
    last_login_at: '2026-11-02 09:30:15',
    avatar_bg: '#1d3b6b',
  },
  {
    id: 2,
    name: 'Budi Santoso (Staff Keuangan)',
    username: 'budi_user',
    email: 'budi@finora.id',
    role: 'user',
    is_active: 1,
    created_at: '2026-10-21 11:15:00',
    last_login_at: '2026-11-02 08:45:00',
    avatar_bg: '#126b50',
  },
  {
    id: 3,
    name: 'Siti Rahma (Auditor / Viewer)',
    username: 'siti_viewer',
    email: 'siti@finora.id',
    role: 'viewer',
    is_active: 1,
    created_at: '2026-10-22 14:00:00',
    last_login_at: '2026-10-31 16:20:00',
    avatar_bg: '#6a58a6',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  company_name: 'PT Karya Nusantara Finance',
  app_name: 'Finora LM Finance',
  session_idle_minutes: 120,
  telegram_bot_token: '7129841284:AAH9...',
  telegram_chat_id: '-10082736412',
  telegram_notify_login: true,
  telegram_notify_approval: true,
  allowed_admin_ips: '100.64.0.0/10, 127.0.0.1',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Penjualan Mobil', type: 'income', color: 'green', created_at: '2026-10-20 10:00:00' },
  { id: 2, name: 'Jasa & Konsultasi', type: 'income', color: 'green', created_at: '2026-10-20 10:00:00' },
  { id: 3, name: 'Pembelian Mobil', type: 'expense', color: 'red', created_at: '2026-10-20 10:00:00' },
  { id: 4, name: 'Operasional Showroom', type: 'expense', color: 'yellow', created_at: '2026-10-20 10:00:00' },
  { id: 5, name: 'Gaji & Bonus Karyawan', type: 'expense', color: 'blue', created_at: '2026-10-20 10:00:00' },
  { id: 6, name: 'Pemasaran & Iklan', type: 'expense', color: 'purple', created_at: '2026-10-20 10:00:00' },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 1, name: 'Bank BCA Operasional', kind: 'bank', number_label: '5420-1928-88', balance: 345000000, created_at: '2026-10-20 10:00:00' },
  { id: 2, name: 'Bank Mandiri Escrow', kind: 'bank', number_label: '137-00-9821-44', balance: 180000000, created_at: '2026-10-20 10:00:00' },
  { id: 3, name: 'Kas Kasir Showroom', kind: 'cash', number_label: 'Petty Cash', balance: 25000000, created_at: '2026-10-20 10:00:00' },
];

export const DEFAULT_CARS: Car[] = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Kijang Innova Reborn 2.4 V Diesel AT',
    year: 2022,
    plate_number: 'B 1928 ABC',
    color: 'Hitam Metalik',
    transmission: 'Otomatis',
    fuel: 'Diesel',
    mileage: 32000,
    purchase_price: 360000000,
    selling_price: 395000000,
    status: 'tersedia',
    description: 'Kondisi istimewa, service record Auto2000, interior bersih, ban tebal 90%.',
    photo_url: '/uploads/cars/654224a3903832c220048d18acaac93cfa10.jpg',
    created_at: '2026-10-22 09:00:00',
  },
  {
    id: 2,
    brand: 'Mitsubishi',
    model: 'Pajero Sport Dakar 4x2 Ultimate',
    year: 2023,
    plate_number: 'B 2210 XYZ',
    color: 'Putih Mutiara',
    transmission: 'Otomatis',
    fuel: 'Diesel',
    mileage: 18500,
    purchase_price: 520000000,
    selling_price: 565000000,
    status: 'tersedia',
    description: 'Pajak hidup panjang sampai Desember 2027, tangan pertama dari baru, sunroof normal.',
    photo_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    created_at: '2026-10-24 14:30:00',
  },
  {
    id: 3,
    brand: 'Honda',
    model: 'HR-V 1.5 SE CVT',
    year: 2022,
    plate_number: 'D 1450 KL',
    color: 'Ignite Red Metallic',
    transmission: 'Otomatis',
    fuel: 'Bensin',
    mileage: 26000,
    purchase_price: 340000000,
    selling_price: 375000000,
    status: 'dipesan',
    description: 'Booking fee diterima Rp 10.000.000 dari Bapak Hendra. Menunggu pelunasan lusa.',
    photo_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
    created_at: '2026-10-25 16:00:00',
  },
  {
    id: 4,
    brand: 'Toyota',
    model: 'Avanza 1.5 G CVT TSS',
    year: 2021,
    plate_number: 'F 1089 DD',
    color: 'Silver Metallic',
    transmission: 'Otomatis',
    fuel: 'Bensin',
    mileage: 44000,
    purchase_price: 195000000,
    selling_price: 220000000,
    status: 'terjual',
    sold_at: '2026-10-30',
    sold_price: 220000000,
    buyer_name: 'Drs. Supriyanto',
    sold_account_id: 1,
    sold_received: 220000000,
    description: 'Unit sudah serah terima kunci & BPKB lengkap.',
    photo_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    created_at: '2026-10-18 10:00:00',
  },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    name: 'Penjualan Toyota Avanza (F 1089 DD)',
    type: 'income',
    category_id: 1,
    category_name: 'Penjualan Mobil',
    account_id: 1,
    account_name: 'Bank BCA Operasional',
    amount: 220000000,
    tx_date: '2026-10-30',
    note: 'Lunas transfer pelunasan pembeli Drs. Supriyanto',
    car_id: 4,
    ref_key: 'car:4:sale:1',
    created_at: '2026-10-30 14:00:00',
  },
  {
    id: 2,
    name: 'Pembayaran DP Toyota Avanza',
    type: 'income',
    category_id: 1,
    category_name: 'Penjualan Mobil',
    account_id: 3,
    account_name: 'Kas Kasir Showroom',
    amount: 10000000,
    tx_date: '2026-10-28',
    note: 'DP Booking fee Honda HR-V',
    created_at: '2026-10-28 11:20:00',
  },
  {
    id: 3,
    name: 'Gaji Karyawan Bulan Oktober',
    type: 'expense',
    category_id: 5,
    category_name: 'Gaji & Bonus Karyawan',
    account_id: 1,
    account_name: 'Bank BCA Operasional',
    amount: 28500000,
    tx_date: '2026-10-27',
    note: 'Payroll gaji 6 staf showroom dan mekanik',
    created_at: '2026-10-27 17:00:00',
  },
  {
    id: 4,
    name: 'Sewa Lahan & Listrik Showroom',
    type: 'expense',
    category_id: 4,
    category_name: 'Operasional Showroom',
    account_id: 1,
    account_name: 'Bank BCA Operasional',
    amount: 14500000,
    tx_date: '2026-10-25',
    note: 'Tagihan bulanan PLN & sewa gedung samping',
    created_at: '2026-10-25 09:30:00',
  },
];

export const DEFAULT_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 1,
    entity: 'car',
    action: 'create',
    summary: 'Tambah Stok: Honda Brio RS Urbanite 2023 (Rp 185.000.000)',
    payload: {
      brand: 'Honda',
      model: 'Brio RS Urbanite Edition',
      year: 2023,
      plate_number: 'B 2991 STZ',
      color: 'Carnival Yellow',
      transmission: 'Otomatis',
      fuel: 'Bensin',
      mileage: 12000,
      purchase_price: 172000000,
      selling_price: 195000000,
      purchase_paid: 172000000,
      purchase_account_id: 1,
      description: 'Mobil simpanan km low, cat full original, surat ready.',
    },
    status: 'pending',
    requested_by: 2,
    requested_by_name: 'Budi Santoso (Staff Keuangan)',
    created_at: '2026-11-02 09:15:00',
  },
  {
    id: 2,
    entity: 'car',
    action: 'sell',
    entity_id: 3,
    summary: 'Tandai Terjual: Honda HR-V 1.5 SE CVT (Rp 375.000.000)',
    payload: {
      sold_at: '2026-11-02',
      sold_price: 375000000,
      sold_received: 375000000,
      sold_account_id: 1,
      buyer_name: 'Bapak Hendra Gunawan',
      sold_note: 'Pelunasan transfer BCA',
    },
    before_data: {
      status: 'dipesan',
      selling_price: 375000000,
    },
    status: 'pending',
    requested_by: 2,
    requested_by_name: 'Budi Santoso (Staff Keuangan)',
    created_at: '2026-11-02 10:10:00',
  },
  {
    id: 3,
    entity: 'transaction',
    action: 'create',
    summary: 'Pemasaran: Biaya Iklan Instagram & TikTok Showroom (Rp 3.500.000)',
    payload: {
      name: 'Iklan Ads Meta & TikTok Nov 2026',
      type: 'expense',
      category_id: 6,
      category_name: 'Pemasaran & Iklan',
      account_id: 1,
      amount: 3500000,
      tx_date: '2026-11-02',
      note: 'Target leads pembeli mobil keluarga',
    },
    status: 'pending',
    requested_by: 2,
    requested_by_name: 'Budi Santoso (Staff Keuangan)',
    created_at: '2026-11-02 10:30:00',
  },
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Super Administrator',
    action: 'login',
    entity: 'session',
    detail: 'Login berhasil via Pintu Admin (Tailscale 100.84.12.90)',
    ip: '100.84.12.90',
    created_at: '2026-11-02 09:30:15',
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Budi Santoso',
    action: 'create_request',
    entity: 'car',
    entity_id: 1,
    detail: 'Mengajukan stok baru Honda Brio RS Urbanite 2023',
    ip: '100.84.12.95',
    created_at: '2026-11-02 09:15:00',
  },
  {
    id: 3,
    user_id: 1,
    user_name: 'Super Administrator',
    action: 'approve',
    entity: 'car',
    entity_id: 4,
    detail: 'Menyetujui penjualan Toyota Avanza Rp 220.000.000',
    ip: '100.84.12.90',
    created_at: '2026-10-30 14:00:00',
  },
];

export const DEFAULT_BUDGETS: Budget[] = [
  { id: 1, category_id: 4, category_name: 'Operasional Showroom', month: '2026-11', amount: 30000000, spent: 14500000 },
  { id: 2, category_id: 5, category_name: 'Gaji & Bonus Karyawan', month: '2026-11', amount: 35000000, spent: 28500000 },
  { id: 3, category_id: 6, category_name: 'Pemasaran & Iklan', month: '2026-11', amount: 15000000, spent: 6500000 },
];

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 1,
    number: 'INV-2026-001',
    kind: 'receivable',
    contact_name: 'Bapak Hendra Gunawan',
    issue_date: '2026-10-25',
    due_date: '2026-11-05',
    amount: 365000000,
    status: 'unpaid',
    note: 'Pelunasan sisa unit Honda HR-V 2022',
  },
  {
    id: 2,
    number: 'BILL-2026-004',
    kind: 'payable',
    contact_name: 'Asuransi Garda Oto Rekanan',
    issue_date: '2026-10-28',
    due_date: '2026-11-12',
    amount: 8500000,
    status: 'unpaid',
    note: 'Premi asuransi all-risk stok unit baru',
  },
];

// Helper to safely access and seed localStorage
export const LocalDB = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('Failed to remove from localStorage:', err);
    }
  },

  // Auth & Session
  getAuthSession(): AuthSession | null {
    return this.get<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
  },

  setAuthSession(session: AuthSession | null): void {
    if (session) {
      this.set(STORAGE_KEYS.AUTH_SESSION, session);
    } else {
      this.remove(STORAGE_KEYS.AUTH_SESSION);
    }
  },

  isRememberMeEnabled(): boolean {
    return this.get<boolean>(STORAGE_KEYS.REMEMBER_ME, true); // default true for convenience
  },

  setRememberMeEnabled(enabled: boolean): void {
    this.set(STORAGE_KEYS.REMEMBER_ME, enabled);
  },

  getSavedCredentials(): { username: string; token: string; mode: 'admin' | 'user' } | null {
    return this.get(STORAGE_KEYS.SAVED_CREDENTIALS, null);
  },

  setSavedCredentials(data: { username: string; token: string; mode: 'admin' | 'user' } | null): void {
    if (data) {
      this.set(STORAGE_KEYS.SAVED_CREDENTIALS, data);
    } else {
      this.remove(STORAGE_KEYS.SAVED_CREDENTIALS);
    }
  },

  // Quick PIN
  getQuickPin(): string | null {
    return this.get<string | null>(STORAGE_KEYS.QUICK_PIN, null);
  },

  setQuickPin(pin: string | null): void {
    if (pin) {
      this.set(STORAGE_KEYS.QUICK_PIN, pin);
      this.set(STORAGE_KEYS.PIN_ENABLED, true);
    } else {
      this.remove(STORAGE_KEYS.QUICK_PIN);
      this.set(STORAGE_KEYS.PIN_ENABLED, false);
    }
  },

  isPinEnabled(): boolean {
    return this.get<boolean>(STORAGE_KEYS.PIN_ENABLED, false);
  },

  // Tailscale Profiles
  getTailscaleProfiles(): TailscaleProfile[] {
    return this.get<TailscaleProfile[]>(STORAGE_KEYS.TAILSCALE_PROFILES, DEFAULT_TAILSCALE_PROFILES);
  },

  saveTailscaleProfiles(profiles: TailscaleProfile[]): void {
    this.set(STORAGE_KEYS.TAILSCALE_PROFILES, profiles);
  },

  getActiveProfileId(): string {
    return this.get<string>(STORAGE_KEYS.ACTIVE_PROFILE_ID, 'ts-default');
  },

  setActiveProfileId(id: string): void {
    this.set(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
  },

  getActiveProfile(): TailscaleProfile {
    const profiles = this.getTailscaleProfiles();
    const activeId = this.getActiveProfileId();
    return profiles.find((p) => p.id === activeId) || profiles[0] || DEFAULT_TAILSCALE_PROFILES[0];
  },

  // Data Collections
  getCars(): Car[] {
    return this.get<Car[]>(STORAGE_KEYS.CARS, DEFAULT_CARS);
  },
  saveCars(cars: Car[]): void {
    this.set(STORAGE_KEYS.CARS, cars);
  },

  getTransactions(): Transaction[] {
    return this.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  },
  saveTransactions(txs: Transaction[]): void {
    this.set(STORAGE_KEYS.TRANSACTIONS, txs);
  },

  getChangeRequests(): ChangeRequest[] {
    return this.get<ChangeRequest[]>(STORAGE_KEYS.CHANGE_REQUESTS, DEFAULT_CHANGE_REQUESTS);
  },
  saveChangeRequests(requests: ChangeRequest[]): void {
    this.set(STORAGE_KEYS.CHANGE_REQUESTS, requests);
  },

  getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },
  saveUsers(users: User[]): void {
    this.set(STORAGE_KEYS.USERS, users);
  },

  getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  },
  saveAuditLogs(logs: AuditLog[]): void {
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  getCategories(): Category[] {
    return this.get<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },
  getAccounts(): Account[] {
    return this.get<Account[]>(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  },
  saveAccounts(accounts: Account[]): void {
    this.set(STORAGE_KEYS.ACCOUNTS, accounts);
  },

  getBudgets(): Budget[] {
    return this.get<Budget[]>(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  },
  getInvoices(): Invoice[] {
    return this.get<Invoice[]>(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
  },
  getSettings(): AppSettings {
    return this.get<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  },
};
