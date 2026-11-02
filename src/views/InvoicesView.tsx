import React, { useState } from 'react';
import { Receipt, Calendar, User, CheckCircle, Clock } from 'lucide-react';
import { LocalDB } from '../services/storage';

export const InvoicesView: React.FC = () => {
  const [tab, setTab] = useState<'receivable' | 'payable'>('receivable');
  const invoices = LocalDB.getInvoices();

  const filtered = invoices.filter((i) => i.kind === tab);
  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">Piutang & Utang Tagihan</h2>
            <p className="text-xs text-[#717e79]">Jatuh tempo penagihan pembeli & tagihan rekanan</p>
          </div>
        </div>

        <div className="grid grid-cols-2 p-1 bg-[#edf2ef] rounded-xl gap-1 mt-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('receivable')}
            className={`py-2 rounded-lg transition ${
              tab === 'receivable' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'
            }`}
          >
            Piutang (Konsumen)
          </button>
          <button
            type="button"
            onClick={() => setTab('payable')}
            className={`py-2 rounded-lg transition ${
              tab === 'payable' ? 'bg-white text-rose-800 shadow-xs' : 'text-gray-600'
            }`}
          >
            Utang (Kewajiban)
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((inv) => (
          <div
            key={inv.id}
            className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-gray-500 font-bold">{inv.number}</span>
                <h3 className="font-extrabold text-xs text-[#18211e] mt-0.5">{inv.contact_name}</h3>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {inv.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
              <div className="text-[11px] text-gray-500">
                Jatuh Tempo: <span className="font-bold text-[#18211e]">{inv.due_date}</span>
              </div>
              <div className="font-black text-xs text-[#18211e]">{formatRupiah(inv.amount)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
