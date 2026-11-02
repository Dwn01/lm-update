import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Radio,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  Info,
  Server,
} from 'lucide-react';
import { TailscaleProfile } from '../types';
import { ApiService } from '../services/api';
import { LocalDB } from '../services/storage';

interface LoginViewProps {
  activeProfile: TailscaleProfile;
  onLoginSuccess: () => void;
  onOpenTailscaleConfig: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  activeProfile,
  onLoginSuccess,
  onOpenTailscaleConfig,
}) => {
  const [mode, setMode] = useState<'admin' | 'user'>('user');
  const [username, setUsername] = useState('budi_user');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(LocalDB.isRememberMeEnabled());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = mode === 'admin';

  const handleModeSwitch = (newMode: 'admin' | 'user') => {
    setMode(newMode);
    setErrorMsg(null);
    if (newMode === 'admin') {
      setUsername('superadmin');
    } else {
      setUsername('budi_user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Silakan masukkan nama pengguna.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await ApiService.login(username, mode, rememberMe);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(res.message || 'Login gagal.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6] flex flex-col justify-between p-4 sm:p-6 text-[#18211e]">
      {/* Top Bar: Tailscale Server IP info */}
      <div className="w-full max-w-md mx-auto mb-3">
        <div className="bg-white rounded-2xl p-3 border border-[#e5ebe7] shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-extrabold text-[#788580] tracking-wider">
                Target Tailscale IP
              </div>
              <div className="text-xs font-mono font-bold text-[#18211e] truncate">
                {activeProfile.ip}
                <span className="text-[#8e9894] font-sans font-normal ml-1">
                  (Port: {isAdmin ? activeProfile.adminPort : activeProfile.userPort})
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTailscaleConfig}
            className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 shrink-0 transition active:scale-95"
          >
            Ubah IP
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[#e6ece8] shadow-xl">
        {/* Brand Emblem */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-extrabold text-white text-2xl shadow-md transition-colors"
            style={{ backgroundColor: isAdmin ? '#1d3b6b' : '#126b50' }}
          >
            F
          </div>
          <h1 className="text-xl font-extrabold text-[#18211e] mt-3 tracking-tight">
            LM Finance Mobile
          </h1>
          <p className="text-xs text-[#7d8b85] mt-1">
            Manajemen Keuangan & Stok Kendaraan
          </p>
        </div>

        {/* Door Selector: Super Admin vs Pengguna */}
        <div className="mb-5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#798580] mb-1.5 text-center">
            Pilih Pintu Masuk Hak Akses
          </label>
          <div className="grid grid-cols-2 p-1 bg-[#edf2ef] rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleModeSwitch('user')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                !isAdmin
                  ? 'bg-white text-[#126b50] shadow-xs'
                  : 'text-[#62706b] hover:text-[#232d29]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pengguna Biasa</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('admin')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isAdmin
                  ? 'bg-[#1d3b6b] text-white shadow-xs'
                  : 'text-[#62706b] hover:text-[#232d29]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        {/* Portal Notice */}
        <div
          className={`p-3 rounded-xl mb-4 text-xs flex items-start gap-2.5 border ${
            isAdmin
              ? 'bg-[#eef3fb] text-[#1c3a68] border-[#d2def3]'
              : 'bg-[#eaf6f1] text-[#0f5f46] border-[#cbe8dc]'
          }`}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-tight">
            {isAdmin ? (
              <span>
                <strong>Mode Super Admin:</strong> Memiliki akses penuh ke menu Persetujuan, Pengguna, Audit Log, dan Pengaturan.
              </span>
            ) : (
              <span>
                <strong>Mode Pengguna:</strong> Input transaksi dan stok mobil diajukan ke antrean persetujuan Super Admin.
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#44524d] mb-1.5">
              Nama Pengguna (Username)
            </label>
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 text-[#8a9691] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mis. budi_user atau superadmin"
                className="w-full bg-[#f8faf9] border border-[#dbe2de] focus:border-[#126b50] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium text-[#18211e] outline-none transition focus:ring-2 focus:ring-[#126b50]/15"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#44524d] mb-1.5">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#8a9691] absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f8faf9] border border-[#dbe2de] focus:border-[#126b50] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium text-[#18211e] outline-none transition focus:ring-2 focus:ring-[#126b50]/15"
                required
              />
            </div>
          </div>

          {/* FITUR PENYIMPANAN LOGIN: Tetap masuk / Remember Me */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded-xs"
              />
              <div className="text-xs">
                <span className="font-bold text-[#27332f]">
                  Simpan Sesi Login di Perangkat Ini
                </span>
                <p className="text-[11px] text-[#7d8b85] leading-snug mt-0.5">
                  Pengguna tidak perlu memasukkan username & sandi berulang kali saat membuka aplikasi mobile ini.
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-extrabold text-xs text-white shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: isAdmin ? '#1d3b6b' : '#126b50' }}
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="mt-6 pt-5 border-t border-[#edf0ee]">
          <div className="text-[11px] font-bold text-[#717e79] text-center mb-2.5">
            ⚡ Tombol Cepat Akun Demo:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                handleModeSwitch('admin');
                setUsername('superadmin');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-[11px] font-bold text-[#1d3b6b] text-left transition"
            >
              👑 Super Admin
              <span className="block text-[10px] font-normal text-blue-700">Akses Penuh + Approval</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleModeSwitch('user');
                setUsername('budi_user');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-[11px] font-bold text-[#126b50] text-left transition"
            >
              💼 Pengguna Biasa
              <span className="block text-[10px] font-normal text-emerald-700">Staff Keuangan / Stok</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full max-w-md mx-auto text-center mt-4 text-[11px] text-[#86928e]">
        Finora LM Finance APK &middot; Terkoneksi Tailscale VPN &middot; Sesi Terenkripsi
      </div>
    </div>
  );
};
