import React, { useState } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Shield,
  Key,
  CheckCircle,
  XCircle,
  X,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { LocalDB } from '../services/storage';
import { ApiService } from '../services/api';

interface UsersViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ currentUser, onRefresh }) => {
  const users = LocalDB.getUsers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');

  const handleRoleChange = async (targetUser: User, role: UserRole) => {
    if (targetUser.id === currentUser.id && role !== 'super_admin') {
      alert('Anda tidak dapat menurunkan peran Super Admin pada akun Anda sendiri.');
      return;
    }

    const ok = await ApiService.updateUserRole(targetUser.id, role, currentUser);
    if (ok) {
      setToastMsg(`Peran user ${targetUser.name} diubah menjadi ${role}`);
      onRefresh();
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.id === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun yang sedang digunakan saat ini.');
      return;
    }

    const ok = await ApiService.toggleUserActive(targetUser.id, currentUser);
    if (ok) {
      setToastMsg(`Status akun ${targetUser.name} berhasil diperbarui`);
      onRefresh();
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) return;

    const existing = users.find((u) => u.username.toLowerCase() === newUsername.trim().toLowerCase());
    if (existing) {
      alert('Nama pengguna (username) sudah digunakan. Pilih username lain.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: newName,
      username: newUsername.toLowerCase(),
      email: newEmail,
      role: newRole,
      is_active: 1,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      avatar_bg: newRole === 'super_admin' ? '#1d3b6b' : '#126b50',
    };

    LocalDB.saveUsers([...users, newUser]);

    ApiService.recordAuditLog(
      currentUser.id,
      currentUser.name,
      'create_user',
      'user',
      `Menambahkan pengguna baru ${newUser.name} (@${newUser.username}) dengan peran ${newUser.role}`,
      newUser.id
    );

    setToastMsg(`Pengguna baru ${newUser.name} berhasil ditambahkan!`);
    setIsAddModalOpen(false);
    setNewName('');
    setNewUsername('');
    setNewEmail('');
    onRefresh();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#dce6f5] text-[#1d3b6b] flex items-center justify-center">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">
              Manajemen Pengguna (Super Admin)
            </h2>
            <p className="text-xs text-[#717e79]">
              Kelola akun staf, hak akses pintu, dan status aktif
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold text-white bg-[#1d3b6b] hover:bg-[#152c50] active:scale-95 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah User</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {users.map((u) => {
          const isCurrent = u.id === currentUser.id;
          const isUserSuper = u.role === 'super_admin';

          return (
            <div
              key={u.id}
              className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isUserSuper ? '#1d3b6b' : '#126b50' }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-[#18211e] flex items-center gap-1.5 truncate">
                      <span>{u.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                          (Anda)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#788580] font-mono">@{u.username}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    u.is_active === 1
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {u.is_active === 1 ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              {/* Roles switcher */}
              <div className="pt-2 border-t border-[#edf1ef] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-bold text-gray-700 text-[11px]">Peran Akses:</span>
                </div>

                <div className="flex items-center gap-1">
                  {(['super_admin', 'user', 'viewer'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleChange(u, r)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                        u.role === r
                          ? r === 'super_admin'
                            ? 'bg-[#1d3b6b] text-white'
                            : 'bg-[#126b50] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {r === 'super_admin' ? 'Super Admin' : r === 'user' ? 'Pengguna' : 'Hanya Lihat'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Action */}
              {!isCurrent && (
                <div className="pt-1 flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      u.is_active === 1
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {u.is_active === 1 ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-sm text-[#18211e]">Tambah Pengguna Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="mis. Hendra Wijaya"
                  className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Username Login</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="mis. hendra_staff"
                  className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-mono font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="mis. hendra@finora.id"
                  className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Peran Hak Akses</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-bold"
                >
                  <option value="user">Pengguna (Mengajukan data ke Super Admin)</option>
                  <option value="super_admin">Super Admin (Pintu Admin, Menyetujui data)</option>
                  <option value="viewer">Hanya Lihat (Read-Only)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1d3b6b] text-white font-black text-xs hover:bg-[#152c50] active:scale-98 transition shadow-xs"
              >
                Buat Akun Pengguna
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
