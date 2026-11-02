import React from 'react';
import { Menu, Bell, Shield, LogOut, Radio, Download, ChevronRight } from 'lucide-react';
import { User, TailscaleProfile } from '../../types';

interface MobileHeaderProps {
  user: User;
  activeProfile: TailscaleProfile;
  activeTab: string;
  pendingCount: number;
  onOpenSidebar: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  activeProfile,
  activeTab,
  pendingCount,
  onOpenSidebar,
  onNavigate,
  onLogout,
}) => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const isSuper = user.role === 'super_admin';

  // Format tab title for breadcrumbs
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'cars': return 'Stok Mobil';
      case 'transactions': return 'Transaksi';
      case 'approvals': return 'Persetujuan';
      case 'my_requests': return 'Permintaan Saya';
      case 'users': return 'Pengguna';
      case 'audit': return 'Log Audit';
      case 'accounts': return 'Akun Bank & Kas';
      case 'invoices': return 'Piutang & Utang';
      case 'budgets': return 'Anggaran';
      case 'analytics': return 'Analitik & Laporan';
      case 'settings': return 'Pengaturan';
      case 'tailscale': return 'Koneksi Tailscale';
      case 'apk': return 'Unduh APK Android';
      case 'security': return 'Keamanan Akun';
      default: return 'Finora';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e7ebe9] px-3.5 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Hamburger & Brand Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#55635e] hover:bg-[#f2f5f3] active:scale-95 transition"
            aria-label="Buka navigasi menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb info */}
          <div className="flex items-center gap-1.5 text-xs text-[#8e9894] truncate">
            <span className="font-semibold text-[#18211e] truncate max-w-[110px] sm:max-w-[160px]">
              Finora
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-bold text-[#2e3b37] truncate">
              {getTabLabel(activeTab)}
            </span>
          </div>
        </div>

        {/* Right Actions: Tailscale Quick Pill, Notif Bell, Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Tailscale Status Pill */}
          <button
            type="button"
            onClick={() => onNavigate('tailscale')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition active:scale-95 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            title="Klik untuk ubah IP Tailscale"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Radio className="w-3 h-3 text-emerald-600 hidden xs:inline" />
            <span className="font-mono tracking-tight text-[11px] max-w-[95px] sm:max-w-[130px] truncate">
              {activeProfile.ip}
            </span>
          </button>

          {/* Pending Notifications Bell */}
          <button
            type="button"
            onClick={() => onNavigate(isSuper ? 'approvals' : 'my_requests')}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#55635e] hover:bg-[#f2f5f3] active:scale-95 transition"
            title={isSuper ? 'Persetujuan Menunggu' : 'Permintaan Saya'}
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#df544d] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Profile Popover Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-lg hover:bg-gray-100 active:scale-95 transition"
            >
              <div
                className="w-7 h-7 rounded-lg text-white font-extrabold text-xs flex items-center justify-center shadow-xs"
                style={{ backgroundColor: isSuper ? '#1d3b6b' : '#126b50' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white shadow-xl border border-gray-100 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-bold text-[#18211e] truncate">{user.name}</p>
                    <p className="text-[#7c8783] text-[11px] font-mono">@{user.username}</p>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider"
                      style={{
                        backgroundColor: isSuper ? '#dce6f5' : '#dcefe8',
                        color: isSuper ? '#1d3b6b' : '#116c50',
                      }}
                    >
                      {isSuper ? 'Super Admin' : 'Pengguna Biasa'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('tailscale');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#f5f8f6] flex items-center gap-2.5 text-[#3d4744]"
                    >
                      <Radio className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-semibold">Konfigurasi Tailscale</div>
                        <div className="text-[10px] text-gray-500 font-mono">{activeProfile.ip}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('apk');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#f5f8f6] flex items-center gap-2.5 text-[#3d4744]"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold">Unduh / Pasang APK</div>
                        <div className="text-[10px] text-gray-500">Android APK & PWA</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('security');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#f5f8f6] flex items-center gap-2.5 text-[#3d4744]"
                    >
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold">Keamanan & Password</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar Aplikasi</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
