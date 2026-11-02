import React from 'react';
import { Wallet, Building, CreditCard, Banknote, ArrowUpRight } from 'lucide-react';
import { LocalDB } from '../services/storage';

export const AccountsView: React.FC = () => {
  const accounts = LocalDB.getAccounts();
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">Rekening & Kas Showroom</h2>
            <p className="text-xs text-[#717e79]">Saldo likuiditas kas operasional & rekening bank</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-xs">
          <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
            Total Saldo Kas & Bank
          </div>
          <div className="text-xl font-black mt-1 tracking-tight">
            {formatRupiah(totalBalance)}
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                {acc.kind === 'bank' ? (
                  <Building className="w-5 h-5 text-blue-600" />
                ) : (
                  <Banknote className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-[#18211e]">{acc.name}</h3>
                <div className="text-[11px] font-mono text-[#76847f]">{acc.number_label}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-black text-[#18211e]">{formatRupiah(acc.balance)}</div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase">Tersedia</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
