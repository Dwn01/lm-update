import React, { useState } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  FileText,
  AlertCircle,
  Info,
} from 'lucide-react';
import { User } from '../types';
import { LocalDB } from '../services/storage';

interface MyRequestsViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({ user, onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const allRequests = LocalDB.getChangeRequests();

  // Filter requests submitted by this user (or show all staff submissions for demo convenience)
  const myRequests = allRequests.filter((r) => r.requested_by === user.id || user.role === 'user');

  const filtered = myRequests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#18211e]">Permintaan Saya</h2>
              <p className="text-xs text-[#717e79]">
                Pantau status pengajuan stok mobil & transaksi keuangan Anda
              </p>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="mt-3 p-3 rounded-xl bg-[#eaf6f1] border border-[#cbe8dc] text-xs text-[#0f5f46] flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
          <p>
            Setiap penambahan atau perubahan data yang Anda ajukan akan diverifikasi terlebih dahulu oleh Super Admin sebelum dicatat ke laporan resmi.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Semua', count: myRequests.length },
            { id: 'pending', label: 'Menunggu', count: myRequests.filter((r) => r.status === 'pending').length },
            { id: 'approved', label: 'Disetujui', count: myRequests.filter((r) => r.status === 'approved').length },
            { id: 'rejected', label: 'Ditolak', count: myRequests.filter((r) => r.status === 'rejected').length },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                filter === item.id
                  ? 'bg-[#126b50] text-white shadow-xs'
                  : 'bg-[#f0f3f1] text-[#5c6964] hover:bg-[#e4eae6]'
              }`}
            >
              {item.label}
              <span className="ml-1 text-[10px] opacity-80 font-black">({item.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">Belum ada riwayat pengajuan.</p>
          </div>
        ) : (
          filtered.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#788580] font-bold">
                      #{req.id} &bull; {req.created_at}
                    </div>
                    <h3 className="font-extrabold text-xs text-[#18211e] mt-0.5">
                      {req.summary}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-100 text-amber-900'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {isPending && <Clock className="w-3 h-3 text-amber-700" />}
                    {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                    {!isPending && !isApproved && <XCircle className="w-3 h-3 text-rose-700" />}
                    <span>{req.status}</span>
                  </span>
                </div>

                {/* Details box */}
                <div className="bg-[#f8faf9] p-2.5 rounded-xl text-xs text-[#55635e] border border-[#edf1ef]">
                  <div className="font-bold text-[10px] text-[#717e79] uppercase">Status Review:</div>
                  <div className="mt-1">
                    {isPending && (
                      <span className="text-amber-800 font-medium">
                        Menunggu tinjauan dari Super Admin showroom...
                      </span>
                    )}
                    {isApproved && (
                      <span className="text-emerald-800 font-medium">
                        Disetujui oleh {req.reviewed_by_name || 'Super Admin'} pada {req.reviewed_at}
                      </span>
                    )}
                    {!isPending && !isApproved && (
                      <div className="text-rose-800 font-semibold">
                        Ditolak. Catatan: {req.review_note || 'Tidak ada keterangan tambahan.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
