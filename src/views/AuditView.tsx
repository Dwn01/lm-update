import React, { useState } from 'react';
import { FileText, Shield, Search, Radio, User, Clock } from 'lucide-react';
import { User as UserType } from '../types';
import { LocalDB } from '../services/storage';

interface AuditViewProps {
  currentUser: UserType;
}

export const AuditView: React.FC<AuditViewProps> = () => {
  const [search, setSearch] = useState('');
  const logs = LocalDB.getAuditLogs();

  const filtered = logs.filter((l) => {
    if (!search.trim()) return true;
    return `${l.user_name} ${l.action} ${l.detail} ${l.ip}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#dce6f5] text-[#1d3b6b] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">
              Log Audit Keamanan (Super Admin)
            </h2>
            <p className="text-xs text-[#717e79]">
              Rekam jejak setiap aktivitas login, persetujuan data, dan transaksi keuangan
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas atau nama user..."
            className="w-full bg-[#f6f8f7] border border-[#dce3df] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18211e] outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">Belum ada catatan log audit.</p>
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl p-3.5 border border-[#e2e8e5] shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] text-[#717e79]">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-extrabold text-[#18211e]">{log.user_name}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <Radio className="w-3 h-3 text-emerald-600" />
                  <span>{log.ip}</span>
                </div>
              </div>

              <div className="text-xs text-[#283531] font-medium leading-snug">
                {log.detail}
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                <span className="font-mono uppercase font-bold text-gray-500">{log.action}</span>
                <span>{log.created_at}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
