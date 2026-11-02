import React from 'react';
import {
  LayoutDashboard,
  Car,
  ArrowLeftRight,
  CheckCircle2,
  Inbox,
  Users,
  FileText,
  Tags,
  Wallet,
  Receipt,
  PieChart,
  BarChart3,
  Settings,
  Shield,
  Radio,
  Download,
  X,
  LogOut,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { User, TailscaleProfile } from '../../types';

interface MobileSidebarProps {
  isOpen: boolean;
  activeTab: string;
  user: User;
  activeProfile: TailscaleProfile;
  pendingCount: number;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  activeTab,
  user,
  activeProfile,
  pendingCount,
  onClose,
  onNavigate,
  onLogout,
}) => {
  const isSuper = user.role === 'super_admin';

  // Navigation config separated by role
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cars', label: 'Stok Mobil', icon: Car },
    { id: 'transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { id: 'categories', label: 'Kategori', icon: Tags },
    { id: 'accounts', label: 'Akun Bank & Kas', icon: Wallet },
    { id: 'invoices', label: 'Piutang & Utang', icon: Receipt },
    { id: 'budgets', label: 'Anggaran', icon: PieChart },
    { id: 'analytics', label: 'Analitik & Laporan', icon: BarChart3 },
  ];

  // Specific admin or user section
  const roleNavItems = isSuper
    ? [
        { id: 'approvals', label: 'Persetujuan', icon: CheckCircle2, count: pendingCount, highlight: true },
        { id: 'users', label: 'Pengguna', icon: Users, count: 0 },
        { id: 'audit', label: 'Log Audit', icon: FileText, count: 0 },
        { id: 'settings', label: 'Pengaturan Sistem', icon: Settings, count: 0 },
      ]
    : [
        { id: 'my_requests', label: 'Permintaan Saya', icon: Inbox, count: pendingCount, highlight: true },
      ];

  const systemNavItems = [
    { id: 'tailscale', label: 'IP & Node Tailscale', icon: Radio, sub: activeProfile.ip },
    { id: 'apk', label: 'Unduh Paket APK', icon: Download, badge: 'Android' },
    { id: 'security', label: 'Keamanan Akun', icon: Shield },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="relative flex flex-col w-[290px] max-w-[85vw] h-full bg-white shadow-2xl z-50 text-[#18211e] overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#edf0ee]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-black text-lg shadow-sm"
              style={{ backgroundColor: isSuper ? '#1d3b6b' : '#126b50' }}
            >
              F
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight leading-none text-[#18211e]">
                LM Finance
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-wider mt-1"
                style={{ color: isSuper ? '#3a63a8' : '#126b50' }}
              >
                {isSuper ? 'Panel Super Admin' : 'Portal Pengguna'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7c8783] hover:bg-[#f2f5f3]"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-3.5 mt-3 p-3 rounded-xl bg-[#f5f8f6] border border-[#e5ebe7] flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center shrink-0"
            style={{ backgroundColor: isSuper ? '#1d3b6b' : '#126b50' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs truncate text-[#18211e]">{user.name}</div>
            <div className="text-[11px] text-[#717e79] truncate">@{user.username}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: isSuper ? '#3b75ac' : '#147858' }}
              />
              <span className="text-[10px] font-extrabold uppercase text-[#5a6662]">
                {isSuper ? 'Super Admin' : 'Pengguna Biasa'}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {/* Main Navigation */}
          <div className="px-2 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#9ba5a1]">
            Menu Utama
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                  isActive
                    ? isSuper
                      ? 'bg-[#eaf0fa] text-[#1d3b6b] font-bold'
                      : 'bg-[#eaf6f1] text-[#0b7454] font-bold'
                    : 'text-[#5f6c67] hover:bg-[#f5f8f6] hover:text-[#26312d]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isSuper ? 'text-[#1d3b6b]' : 'text-[#0b7454]') : 'text-[#7e8c87]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Role Differentiated Section */}
          <div className="pt-3 pb-1 px-2 text-[10px] font-extrabold uppercase tracking-wider text-[#9ba5a1] border-t border-[#edf0ee] mt-2">
            {isSuper ? 'Panel Administrasi Khusus' : 'Alur Persetujuan'}
          </div>

          {roleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                  isActive
                    ? isSuper
                      ? 'bg-[#eaf0fa] text-[#1d3b6b] font-bold'
                      : 'bg-[#eaf6f1] text-[#0b7454] font-bold'
                    : 'text-[#5f6c67] hover:bg-[#f5f8f6] hover:text-[#26312d]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isSuper ? 'text-[#1d3b6b]' : 'text-[#0b7454]') : 'text-[#7e8c87]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#fbeae8] text-[#cf4f47]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* System & Connectivity Section */}
          <div className="pt-3 pb-1 px-2 text-[10px] font-extrabold uppercase tracking-wider text-[#9ba5a1] border-t border-[#edf0ee] mt-2">
            Koneksi & APK
          </div>

          {systemNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                  isActive
                    ? isSuper
                      ? 'bg-[#eaf0fa] text-[#1d3b6b] font-bold'
                      : 'bg-[#eaf6f1] text-[#0b7454] font-bold'
                    : 'text-[#5f6c67] hover:bg-[#f5f8f6] hover:text-[#26312d]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className="w-4 h-4 shrink-0 text-[#7e8c87]" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.sub && (
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate max-w-[85px]">
                    {item.sub}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Tailscale quick helper banner */}
          <div className="mt-3 p-3 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-xs text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tailscale IP Dinamis</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
              IP Tailscale dapat diubah atau ditambah kapan saja sesuai kebutuhan server Anda.
            </p>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-[#edf0ee] bg-[#fafbfa]">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 active:scale-98 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Aplikasi</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
