import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Car,
  Wallet,
  DollarSign,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { User, TailscaleProfile } from '../types';
import { LocalDB } from '../services/storage';

interface DashboardViewProps {
  user: User;
  activeProfile: TailscaleProfile;
  pendingCount: number;
  onNavigate: (tab: string) => void;
  onOpenAddCarModal?: () => void;
  onOpenAddTxModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  activeProfile,
  pendingCount,
  onNavigate,
  onOpenAddCarModal,
  onOpenAddTxModal,
}) => {
  const [period, setPeriod] = useState<'bulan' | 'tahun' | 'semua'>('bulan');
  const isSuper = user.role === 'super_admin';

  const cars = LocalDB.getCars();
  const txs = LocalDB.getTransactions();

  // Financial calculations matching Finora formulas
  // 1. Arus Kas Bersih = Total In - Total Out
  const totalIncome = txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  // 2. Car stock statistics
  const carsAvailable = cars.filter((c) => c.status === 'tersedia');
  const carsReserved = cars.filter((c) => c.status === 'dipesan');
  const carsSold = cars.filter((c) => c.status === 'terjual');

  // Active stock capital = sum of purchase price for available + reserved
  const activeStockCapital = [...carsAvailable, ...carsReserved].reduce(
    (sum, c) => sum + (c.purchase_price || 0),
    0
  );

  // Gross Profit = actual sold price - purchase price for sold cars
  const grossProfit = carsSold.reduce(
    (sum, c) => sum + ((c.sold_price || c.selling_price) - c.purchase_price),
    0
  );

  // Net Profit = Gross Profit + Other Income - Other Expense (non-car purchase)
  const nonCarIncome = txs
    .filter((t) => t.type === 'income' && t.category_name !== 'Penjualan Mobil')
    .reduce((sum, t) => sum + t.amount, 0);
  const nonCarExpense = txs
    .filter((t) => t.type === 'expense' && t.category_name !== 'Pembelian Mobil')
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = grossProfit + nonCarIncome - nonCarExpense;

  const avgPurchasePrice =
    cars.length > 0 ? Math.round(cars.reduce((s, c) => s + c.purchase_price, 0) / cars.length) : 0;

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.abs(num).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner: Tailscale Connection & Role Notice */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-xs"
            style={{ backgroundColor: isSuper ? '#1d3b6b' : '#126b50' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs text-[#717e79]">Selamat datang kembali,</div>
            <div className="font-extrabold text-sm text-[#18211e] flex items-center gap-1.5">
              <span>{user.name}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider"
                style={{
                  backgroundColor: isSuper ? '#dce6f5' : '#dcefe8',
                  color: isSuper ? '#1d3b6b' : '#116c50',
                }}
              >
                {isSuper ? 'Super Admin' : 'Pengguna'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Period Selector */}
        <select
          value={period}
          onChange={(e: any) => setPeriod(e.target.value)}
          className="bg-[#f5f8f6] border border-[#d6deda] rounded-lg text-xs font-bold text-[#44524e] px-2.5 py-1.5 outline-none"
        >
          <option value="bulan">Bulan Ini</option>
          <option value="tahun">Tahun Ini</option>
          <option value="semua">Semua Periode</option>
        </select>
      </div>

      {/* Primary Financial Metric Cards (2x2 on mobile) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Arus Kas Bersih */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#e2e8e5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#74827d]">Arus Kas Bersih</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-base font-extrabold mt-1.5 tracking-tight ${
              netCashFlow >= 0 ? 'text-[#11815e]' : 'text-rose-600'
            }`}
          >
            {netCashFlow < 0 ? '-' : ''}
            {formatRupiah(netCashFlow)}
          </div>
          <div className="text-[10px] text-[#8e9894] mt-1 font-medium">Uang masuk − keluar kas</div>
        </div>

        {/* Laba Kotor */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#e2e8e5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#74827d]">Laba Kotor</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-extrabold text-[#18211e] mt-1.5 tracking-tight">
            {formatRupiah(grossProfit)}
          </div>
          <div className="text-[10px] text-[#8e9894] mt-1 font-medium">Margin mobil terjual</div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#e2e8e5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#74827d]">Laba Bersih</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-extrabold text-[#18211e] mt-1.5 tracking-tight">
            {formatRupiah(netProfit)}
          </div>
          <div className="text-[10px] text-[#8e9894] mt-1 font-medium">Setelah operasional</div>
        </div>

        {/* Modal Stok Aktif */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#e2e8e5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#74827d]">Modal Stok Aktif</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Car className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-extrabold text-[#18211e] mt-1.5 tracking-tight">
            {formatRupiah(activeStockCapital)}
          </div>
          <div className="text-[10px] text-[#8e9894] mt-1 font-medium">Tersedia + Dipesan</div>
        </div>
      </div>

      {/* Stok Mobil Insight Strip */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider">
              Ringkasan Stok Mobil Showroom
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('cars')}
            className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
          >
            Lihat Stok <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center pt-1">
          <div className="bg-[#f0f8f4] p-2.5 rounded-xl border border-emerald-100">
            <div className="text-lg font-black text-[#126b50]">{carsAvailable.length}</div>
            <div className="text-[10px] font-bold text-emerald-800 uppercase mt-0.5">Tersedia</div>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
            <div className="text-lg font-black text-amber-800">{carsReserved.length}</div>
            <div className="text-[10px] font-bold text-amber-900 uppercase mt-0.5">Dipesan</div>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
            <div className="text-lg font-black text-blue-800">{carsSold.length}</div>
            <div className="text-[10px] font-bold text-blue-900 uppercase mt-0.5">Terjual</div>
          </div>
          <div className="bg-[#f6f7f6] p-2.5 rounded-xl border border-gray-200">
            <div className="text-xs font-black text-[#2e3b37] truncate mt-1">
              Rp {Math.round(avgPurchasePrice / 1000000)} jt
            </div>
            <div className="text-[9px] font-bold text-gray-600 uppercase mt-1">Rata Beli</div>
          </div>
        </div>
      </div>

      {/* Pending Approvals / Requests Alert Banner */}
      {pendingCount > 0 && (
        <div
          onClick={() => onNavigate(isSuper ? 'approvals' : 'my_requests')}
          className="cursor-pointer bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 active:scale-98 transition shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
              {pendingCount}
            </div>
            <div>
              <div className="font-extrabold text-xs text-amber-950">
                {isSuper
                  ? `${pendingCount} Permintaan Menunggu Persetujuan`
                  : `${pendingCount} Pengajuan Anda Sedang Ditinjau`}
              </div>
              <div className="text-[11px] text-amber-800">
                {isSuper
                  ? 'Klik untuk memeriksa data pengajuan staf dan setujui.'
                  : 'Lihat status pengajuan stok mobil atau transaksi Anda.'}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-800 shrink-0" />
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            onNavigate('cars');
            if (onOpenAddCarModal) onOpenAddCarModal();
          }}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#126b50] hover:bg-[#0e543e] text-white font-extrabold text-xs shadow-xs active:scale-98 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isSuper ? '+ Tambah Mobil' : '+ Ajukan Mobil'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigate('transactions');
            if (onOpenAddTxModal) onOpenAddTxModal();
          }}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white border border-[#d6deda] hover:bg-gray-50 text-[#273530] font-extrabold text-xs shadow-xs active:scale-98 transition"
        >
          <Wallet className="w-4 h-4 text-emerald-700" />
          <span>+ Catat Transaksi</span>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-xs text-[#18211e] uppercase tracking-wider">
            Transaksi Kas Terakhir
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('transactions')}
            className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
          >
            Semua ({txs.length}) <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-[#edf1ef]">
          {txs.slice(0, 5).map((t) => (
            <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-xs text-[#18211e] truncate">{t.name}</div>
                <div className="flex items-center gap-2 text-[10px] text-[#788580] mt-0.5">
                  <span className="font-medium">{t.tx_date}</span>
                  <span>&bull;</span>
                  <span className="truncate">{t.account_name}</span>
                </div>
              </div>
              <div
                className={`text-xs font-extrabold shrink-0 text-right ${
                  t.type === 'income' ? 'text-[#11815e]' : 'text-[#d65750]'
                }`}
              >
                {t.type === 'income' ? '+ ' : '- '}
                {formatRupiah(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
