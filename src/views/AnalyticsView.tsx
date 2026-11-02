import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { LocalDB } from '../services/storage';

export const AnalyticsView: React.FC = () => {
  const txs = LocalDB.getTransactions();
  const cars = LocalDB.getCars();

  const totalIncome = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Group by categories
  const categoryBreakdown: Record<string, number> = {};
  txs.forEach((t) => {
    categoryBreakdown[t.category_name] = (categoryBreakdown[t.category_name] || 0) + t.amount;
  });

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">Analitik & Laporan Arus Kas</h2>
            <p className="text-xs text-[#717e79]">Statistik performa keuangan dan penjualan kendaraan</p>
          </div>
        </div>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Total Pemasukan</span>
          <div className="text-base font-black text-[#11815e] mt-1">
            {formatRupiah(totalIncome)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase">Total Pengeluaran</span>
          <div className="text-base font-black text-[#d65750] mt-1">
            {formatRupiah(totalExpense)}
          </div>
        </div>
      </div>

      {/* Visual Bar representation */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3">
        <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider">
          Distribusi Kategori Transaksi
        </h3>

        <div className="space-y-2.5 pt-1">
          {Object.entries(categoryBreakdown).map(([cat, amt]) => {
            const max = Math.max(...Object.values(categoryBreakdown), 1);
            const pct = Math.round((amt / max) * 100);
            return (
              <div key={cat} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2e3b37]">{cat}</span>
                  <span className="font-mono text-gray-500">{formatRupiah(amt)}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#126b50] rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
