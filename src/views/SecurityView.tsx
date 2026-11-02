import React, { useState } from 'react';
import { Shield, Key, Lock, Check, Smartphone, Sparkles } from 'lucide-react';
import { User } from '../types';
import { LocalDB } from '../services/storage';

interface SecurityViewProps {
  user: User;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ user }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);

  // Quick PIN states
  const [pinEnabled, setPinEnabled] = useState(LocalDB.isPinEnabled());
  const [pinValue, setPinValue] = useState(LocalDB.getQuickPin() || '');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      alert('Kata sandi minimal 6 karakter.');
      return;
    }
    if (newPass !== confirmPass) {
      alert('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setPassMsg('Kata sandi berhasil diperbarui.');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassMsg(null), 3000);
  };

  const handlePinToggle = (enabled: boolean) => {
    setPinEnabled(enabled);
    if (!enabled) {
      LocalDB.setQuickPin(null);
    }
  };

  const handleSavePin = () => {
    if (pinValue.length !== 4) {
      alert('PIN harus terdiri dari 4 digit angka.');
      return;
    }
    LocalDB.setQuickPin(pinValue);
    alert('PIN pembuka cepat berhasil disimpan!');
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">Keamanan Akun & PIN</h2>
            <p className="text-xs text-[#717e79]">Ganti kata sandi & pengaturan kunci cepat</p>
          </div>
        </div>
      </div>

      {passMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{passMsg}</span>
        </div>
      )}

      {/* Change Password Form */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3">
        <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider flex items-center gap-1.5">
          <Key className="w-4 h-4 text-gray-500" />
          <span>Ubah Kata Sandi</span>
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Kata Sandi Saat Ini</label>
            <input
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Kata Sandi Baru</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#126b50] hover:bg-[#0e543e] text-white font-bold text-xs"
          >
            Simpan Kata Sandi Baru
          </button>
        </form>
      </div>

      {/* Quick PIN Setup for Mobile App */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3 text-xs">
        <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Kunci PIN Cepat (Aplikasi Mobile)</span>
        </h3>

        <p className="text-gray-500 leading-relaxed text-[11px]">
          Aktifkan PIN 4-digit agar Anda dapat membuka aplikasi kembali secara instan tanpa mengetik sandi panjang.
        </p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={pinEnabled}
            onChange={(e) => handlePinToggle(e.target.checked)}
            className="rounded text-emerald-600"
          />
          <span className="font-bold text-gray-800">Gunakan Kunci PIN Cepat</span>
        </label>

        {pinEnabled && (
          <div className="pt-2 space-y-2">
            <label className="font-bold text-gray-700 block mb-1">Masukkan 4-Digit PIN Baru</label>
            <input
              type="password"
              maxLength={4}
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-mono text-center text-lg tracking-widest font-black"
            />
            <button
              type="button"
              onClick={handleSavePin}
              className="w-full py-2 rounded-xl bg-gray-900 text-white font-bold text-xs"
            >
              Simpan PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
