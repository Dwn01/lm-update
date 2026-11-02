import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  User,
  Sparkles,
} from 'lucide-react';
import { User as UserType } from '../types';
import { LocalDB } from '../services/storage';
import { ApiService } from '../services/api';

interface ApprovalsViewProps {
  user: UserType;
  onRefresh: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ user, onRefresh }) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const requests = LocalDB.getChangeRequests();

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleApprove = async (id: number) => {
    const res = await ApiService.processChangeRequest(id, 'approved', 'Disetujui via mobile', user);
    if (res.success) {
      setToastMsg('Pengajuan berhasil disetujui & otomatis dibukukan ke sistem!');
      onRefresh();
    }
  };

  const handleOpenReject = (req: any) => {
    setSelectedRequest(req);
    setRejectNote('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    const res = await ApiService.processChangeRequest(selectedRequest.id, 'rejected', rejectNote, user);
    if (res.success) {
      setToastMsg('Pengajuan telah ditolak.');
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#dce6f5] text-[#1d3b6b] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">
              Antrean Persetujuan (Super Admin)
            </h2>
            <p className="text-xs text-[#717e79]">
              Validasi sebelum data perubahan pengguna diterapkan ke database keuangan & stok
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'pending', label: 'Menunggu', count: requests.filter((r) => r.status === 'pending').length },
            { id: 'approved', label: 'Disetujui', count: requests.filter((r) => r.status === 'approved').length },
            { id: 'rejected', label: 'Ditolak', count: requests.filter((r) => r.status === 'rejected').length },
            { id: 'all', label: 'Semua Riwayat', count: requests.length },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                filter === item.id
                  ? 'bg-[#1d3b6b] text-white shadow-xs'
                  : 'bg-[#f0f3f1] text-[#5c6964] hover:bg-[#e4eae6]'
              }`}
            >
              {item.label}
              <span className="ml-1.5 text-[10px] opacity-80 font-black">({item.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toast Notice */}
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

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">Tidak ada pengajuan dalam status ini.</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3"
              >
                {/* Meta info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#74827d]">
                      <span className="font-bold text-[#18211e]">#{req.id}</span>
                      <span>&bull;</span>
                      <span>{req.created_at}</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-emerald-800 uppercase tracking-wider">
                        {req.entity}
                      </span>
                    </div>
                    <h3 className="font-black text-xs text-[#18211e] mt-0.5 leading-snug">
                      {req.summary}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      isPending
                        ? 'bg-amber-100 text-amber-800'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Submitter */}
                <div className="text-[11px] text-[#55635e] bg-[#f8faf9] p-2.5 rounded-xl border border-[#edf1ef]">
                  <span className="text-[#899590]">Diajukan oleh: </span>
                  <span className="font-bold text-[#18211e]">{req.requested_by_name}</span>
                </div>

                {/* Payload comparison / Details */}
                <div className="bg-[#f5f8f6] p-3 rounded-xl text-xs space-y-1.5 border border-[#e5ece8]">
                  <div className="font-extrabold text-[10px] text-[#717e79] uppercase tracking-wider">
                    Rincian Perubahan Data:
                  </div>

                  {req.payload && (
                    <div className="space-y-1 text-xs">
                      {req.payload.brand && (
                        <div>
                          <span className="text-[#7c8783]">Kendaraan: </span>
                          <span className="font-bold">{req.payload.brand} {req.payload.model}</span>
                        </div>
                      )}
                      {req.payload.plate_number && (
                        <div>
                          <span className="text-[#7c8783]">Nomor Polisi: </span>
                          <span className="font-mono font-bold">{req.payload.plate_number}</span>
                        </div>
                      )}
                      {req.payload.purchase_price && (
                        <div>
                          <span className="text-[#7c8783]">Harga Beli: </span>
                          <span className="font-bold text-[#18211e]">
                            Rp {req.payload.purchase_price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                      {req.payload.sold_price && (
                        <div>
                          <span className="text-[#7c8783]">Harga Jual Deal: </span>
                          <span className="font-bold text-emerald-700">
                            Rp {req.payload.sold_price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                      {req.payload.buyer_name && (
                        <div>
                          <span className="text-[#7c8783]">Nama Pembeli: </span>
                          <span className="font-bold">{req.payload.buyer_name}</span>
                        </div>
                      )}
                      {req.payload.amount && (
                        <div>
                          <span className="text-[#7c8783]">Nominal: </span>
                          <span className="font-bold">
                            Rp {req.payload.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {req.review_note && (
                    <div className="pt-1.5 border-t border-gray-200 text-rose-700 font-medium">
                      Catatan Admin: {req.review_note}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Pending */}
                {isPending && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenReject(req)}
                      className="py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      className="py-2.5 rounded-xl bg-[#126b50] hover:bg-[#0e543e] text-white font-black text-xs flex items-center justify-center gap-1.5 active:scale-98 transition shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl text-xs space-y-3">
            <h3 className="font-black text-sm text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Tolak Pengajuan #{selectedRequest.id}</span>
            </h3>
            <p className="text-gray-600">
              Masukkan alasan penolakan agar staf dapat merevisi pengajuan ini:
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="mis. Dokumen belum lengkap atau harga tidak sesuai kesepakatan..."
              className="w-full p-2 bg-[#f8faf9] border rounded-xl outline-none focus:border-rose-500"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-gray-100 font-bold text-gray-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
