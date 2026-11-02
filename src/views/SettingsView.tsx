import React, { useState } from 'react';
import { Settings, Building, Send, Shield, Check, Sparkles } from 'lucide-react';
import { User, AppSettings } from '../types';
import { LocalDB } from '../services/storage';

interface SettingsViewProps {
  currentUser: User;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  const [settings, setSettings] = useState<AppSettings>(LocalDB.getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    LocalDB.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#dce6f5] text-[#1d3b6b] flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">
              Pengaturan Sistem (Super Admin)
            </h2>
            <p className="text-xs text-[#717e79]">
              Profil perusahaan, notifikasi Telegram, dan parameter keamanan
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Company Profile */}
        <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3">
          <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#1d3b6b]" />
            <span>Profil Perusahaan</span>
          </h3>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Nama Perusahaan / Showroom</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-bold"
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Nama Aplikasi</label>
            <input
              type="text"
              value={settings.app_name}
              onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl"
            />
          </div>
        </div>

        {/* Telegram Notifications */}
        <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3">
          <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-4 h-4 text-sky-600" />
            <span>Notifikasi Bot Telegram</span>
          </h3>
          <p className="text-gray-500 text-[11px]">
            Kirim peringatan instan ke grup Telegram saat login atau pengajuan persetujuan baru.
          </p>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Telegram Bot Token</label>
            <input
              type="text"
              value={settings.telegram_bot_token || ''}
              onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
              placeholder="7129841284:AAH..."
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-mono text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Telegram Chat ID</label>
            <input
              type="text"
              value={settings.telegram_chat_id || ''}
              onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
              placeholder="-10082736412"
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-mono text-xs"
            />
          </div>

          <div className="pt-1 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.telegram_notify_login}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_notify_login: e.target.checked })
                }
                className="rounded text-emerald-600"
              />
              <span className="font-medium text-gray-700">Kirim notifikasi setiap login berhasil</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.telegram_notify_approval}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_notify_approval: e.target.checked })
                }
                className="rounded text-emerald-600"
              />
              <span className="font-medium text-gray-700">Kirim notifikasi pengajuan baru</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#1d3b6b] text-white font-extrabold text-xs shadow-xs active:scale-98 transition"
        >
          Simpan Semua Pengaturan
        </button>
      </form>
    </div>
  );
};
