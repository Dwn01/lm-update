import React from 'react';
import {
  LayoutDashboard,
  Car,
  ArrowLeftRight,
  CheckCircle2,
  Inbox,
  Menu,
} from 'lucide-react';
import { User } from '../../types';

interface BottomNavProps {
  activeTab: string;
  user: User;
  pendingCount: number;
  onNavigate: (tab: string) => void;
  onOpenSidebar: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  user,
  pendingCount,
  onNavigate,
  onOpenSidebar,
}) => {
  const isSuper = user.role === 'super_admin';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e2e8e5] pb-[env(safe-area-inset-bottom)] shadow-lg">
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 transition ${
            activeTab === 'dashboard'
              ? isSuper ? 'text-[#1d3b6b]' : 'text-[#126b50]'
              : 'text-[#7d8b85] hover:text-[#323d38]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>

        {/* 2. Stok Mobil */}
        <button
          type="button"
          onClick={() => onNavigate('cars')}
          className={`flex flex-col items-center justify-center gap-1 transition ${
            activeTab === 'cars'
              ? isSuper ? 'text-[#1d3b6b]' : 'text-[#126b50]'
              : 'text-[#7d8b85] hover:text-[#323d38]'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] font-bold">Stok Mobil</span>
        </button>

        {/* 3. Transaksi */}
        <button
          type="button"
          onClick={() => onNavigate('transactions')}
          className={`flex flex-col items-center justify-center gap-1 transition ${
            activeTab === 'transactions'
              ? isSuper ? 'text-[#1d3b6b]' : 'text-[#126b50]'
              : 'text-[#7d8b85] hover:text-[#323d38]'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] font-bold">Transaksi</span>
        </button>

        {/* 4. Persetujuan (Admin) / Permintaan (User) */}
        {isSuper ? (
          <button
            type="button"
            onClick={() => onNavigate('approvals')}
            className={`relative flex flex-col items-center justify-center gap-1 transition ${
              activeTab === 'approvals' ? 'text-[#1d3b6b]' : 'text-[#7d8b85] hover:text-[#323d38]'
            }`}
          >
            <div className="relative">
              <CheckCircle2 className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-3.5 bg-[#df544d] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Persetujuan</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('my_requests')}
            className={`relative flex flex-col items-center justify-center gap-1 transition ${
              activeTab === 'my_requests' ? 'text-[#126b50]' : 'text-[#7d8b85] hover:text-[#323d38]'
            }`}
          >
            <div className="relative">
              <Inbox className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-3.5 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Permintaan</span>
          </button>
        )}

        {/* 5. Menu / Lainnya */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center gap-1 text-[#7d8b85] hover:text-[#323d38] transition"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-bold">Menu</span>
        </button>
      </div>
    </nav>
  );
};
