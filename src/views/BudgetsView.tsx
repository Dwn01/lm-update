import React from 'react';
import { PieChart, AlertCircle } from 'lucide-react';
import { LocalDB } from '../services/storage';

export const BudgetsView: React.FC = () => {
  const budgets = LocalDB.getBudgets();
  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">Plafon Anggaran Bulanan</h2>
            <p className="text-xs text-[#717e79]">Batas pengeluaran per kategori operasional</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.amount) * 100));
          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-[#18211e]">{b.category_name}</h3>
                <span className="text-[11px] font-bold text-gray-500">{pct}% terpakai</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#717e79]">
                <div>
                  Terpakai: <span className="font-bold text-[#18211e]">{formatRupiah(b.spent)}</span>
                </div>
                <div>
                  Plafon: <span className="font-bold text-[#18211e]">{formatRupiah(b.amount)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
