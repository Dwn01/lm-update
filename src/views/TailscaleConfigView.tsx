import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Check,
  Server,
  Zap,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { TailscaleProfile } from '../types';
import { LocalDB } from '../services/storage';
import { ApiService } from '../services/api';

interface TailscaleConfigViewProps {
  activeProfile: TailscaleProfile;
  onProfileChanged: (profile: TailscaleProfile) => void;
}

export const TailscaleConfigView: React.FC<TailscaleConfigViewProps> = ({
  activeProfile,
  onProfileChanged,
}) => {
  const [profiles, setProfiles] = useState<TailscaleProfile[]>(LocalDB.getTailscaleProfiles());
  const [currentId, setCurrentId] = useState(activeProfile.id);

  // Form states for adding or editing
  const [editingProfile, setEditingProfile] = useState<TailscaleProfile>({ ...activeProfile });
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Ping test states
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; latency: number; msg: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestPing = async (profileToTest: TailscaleProfile) => {
    setTestingPing(true);
    setPingResult(null);

    const res = await ApiService.testTailscaleConnection(profileToTest);
    setTestingPing(false);

    if (res.ok) {
      setPingResult({
        ok: true,
        latency: res.latencyMs,
        msg: `Node Tailscale aktif dan merespons dalam ${res.latencyMs} ms!`,
      });
    } else {
      setPingResult({
        ok: false,
        latency: 0,
        msg: res.error || 'Gagal terhubung ke host Tailscale ini.',
      });
    }
  };

  const handleSelectProfile = (p: TailscaleProfile) => {
    setCurrentId(p.id);
    setEditingProfile({ ...p });
    LocalDB.setActiveProfileId(p.id);
    onProfileChanged(p);
  };

  const handleSaveCurrent = () => {
    if (!editingProfile.ip.trim()) {
      alert('Alamat IP Tailscale wajib diisi.');
      return;
    }

    let updated = [...profiles];
    if (isAddingNew) {
      const newP: TailscaleProfile = {
        ...editingProfile,
        id: 'ts-' + Date.now(),
      };
      updated.push(newP);
      setIsAddingNew(false);
      setCurrentId(newP.id);
      setEditingProfile(newP);
      onProfileChanged(newP);
    } else {
      updated = updated.map((p) => (p.id === editingProfile.id ? { ...editingProfile } : p));
      onProfileChanged(editingProfile);
    }

    setProfiles(updated);
    LocalDB.saveTailscaleProfiles(updated);
    LocalDB.setActiveProfileId(editingProfile.id);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      alert('Minimal harus ada 1 profil server.');
      return;
    }
    const next = profiles.filter((p) => p.id !== id);
    setProfiles(next);
    LocalDB.saveTailscaleProfiles(next);

    if (currentId === id) {
      handleSelectProfile(next[0]);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#18211e]">
                Konfigurasi IP & Jaringan Tailscale
              </h2>
              <p className="text-xs text-[#717e79]">
                Kelola IP server Tailscale untuk koneksi aman smartphone Android Anda
              </p>
            </div>
          </div>
        </div>

        {/* Live Active Pill */}
        <div className="mt-3 p-3 rounded-xl bg-[#f0f8f4] border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">
                Server Aktif Saat Ini
              </span>
              <span className="font-mono font-extrabold text-[#126b50] text-sm">
                {editingProfile.ip}
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-gray-600">
            <div>User: :{editingProfile.userPort}</div>
            <div>Admin: :{editingProfile.adminPort}</div>
          </div>
        </div>
      </div>

      {/* Profile Selector List */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider">
            Daftar Profil Server Tailscale
          </h3>
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(true);
              setEditingProfile({
                id: 'new',
                name: 'Server Baru',
                ip: '100.x.y.z',
                userPort: 8080,
                adminPort: 8081,
                useHttps: false,
              });
            }}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Server</span>
          </button>
        </div>

        <div className="space-y-2">
          {profiles.map((p) => {
            const isSelected = p.id === currentId && !isAddingNew;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectProfile(p)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#eaf6f1] border-emerald-500 text-[#0c6b4e]'
                    : 'bg-[#fafbfa] border-[#e4eae6] hover:bg-white text-[#33403b]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs truncate">{p.name}</div>
                    <div className="font-mono text-[11px] opacity-80 truncate">
                      {p.ip} &bull; Ports: {p.userPort}/{p.adminPort}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {p.lastPingMs && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70 border border-emerald-200">
                      {p.lastPingMs} ms
                    </span>
                  )}
                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProfile(p.id);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Hapus profil ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider">
            {isAddingNew ? 'Tambah Node Tailscale Baru' : 'Edit Parameter IP & Port'}
          </h3>
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Tersimpan!
            </span>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Nama Label Profil</label>
            <input
              type="text"
              value={editingProfile.name}
              onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
              placeholder="mis. Node Tailscale Showroom"
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-medium outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              IP Tailscale / Hostname Server
            </label>
            <input
              type="text"
              value={editingProfile.ip}
              onChange={(e) => setEditingProfile({ ...editingProfile, ip: e.target.value })}
              placeholder="mis. 100.84.12.90 atau finora.tailnet.ts.net"
              className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-mono font-bold text-emerald-950 outline-none focus:border-emerald-600"
              required
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Dapat menggunakan IP VPN Tailscale (biasanya berawalan 100.x.y.z) atau MagicDNS hostname.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Port Pintu User (Default 8080)
              </label>
              <input
                type="number"
                value={editingProfile.userPort}
                onChange={(e) =>
                  setEditingProfile({ ...editingProfile, userPort: Number(e.target.value) })
                }
                className="w-full p-2 bg-[#f8faf9] border rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Port Pintu Super Admin (Default 8081)
              </label>
              <input
                type="number"
                value={editingProfile.adminPort}
                onChange={(e) =>
                  setEditingProfile({ ...editingProfile, adminPort: Number(e.target.value) })
                }
                className="w-full p-2 bg-[#f8faf9] border rounded-xl font-mono font-bold text-[#1d3b6b]"
              />
            </div>
          </div>

          {/* HTTPS Switch */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProfile.useHttps}
                onChange={(e) =>
                  setEditingProfile({ ...editingProfile, useHttps: e.target.checked })
                }
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-gray-700">
                Gunakan HTTPS / SSL (MagicDNS TLS)
              </span>
            </label>
          </div>

          {/* Ping test status */}
          {pingResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold ${
                pingResult.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>{pingResult.msg}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              disabled={testingPing}
              onClick={() => handleTestPing(editingProfile)}
              className="py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold flex items-center justify-center gap-1.5 active:scale-98 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
              <span>{testingPing ? 'Memeriksa...' : 'Tes Ping Koneksi'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCurrent}
              className="py-2.5 rounded-xl bg-[#126b50] hover:bg-[#0e543e] text-white font-extrabold flex items-center justify-center gap-1.5 active:scale-98 transition shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'Tambahkan Profil' : 'Simpan Konfigurasi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Card for Android */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-2.5 text-xs">
        <h3 className="font-extrabold text-xs text-[#18211e] flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>Langkah Menghubungkan Tailscale di Ponsel Android</span>
        </h3>
        <ol className="list-decimal pl-4 space-y-1.5 text-[#525f5a] leading-relaxed">
          <li>
            Pastikan aplikasi <strong>Tailscale</strong> sudah terpasang dari Play Store di HP Anda.
          </li>
          <li>
            Masuk dengan akun Tailscale yang sama dengan perangkat server tempat Finora berjalan.
          </li>
          <li>
            Nyalakan switch VPN Tailscale di HP Anda sampai berstatus <strong>Connected</strong>.
          </li>
          <li>
            Salin IP Tailscale server Anda (misalnya: <code className="font-mono bg-gray-100 px-1 rounded">100.84.12.90</code>) lalu masukkan ke kolom di atas.
          </li>
          <li>
            Aplikasi APK Finora akan langsung berkomunikasi secara peer-to-peer dan aman terenkripsi!
          </li>
        </ol>
      </div>
    </div>
  );
};
