import React, { useState } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  X,
  Sparkles,
  Calendar,
  Wallet,
  Tag,
  Lock,
} from 'lucide-react';
import { Transaction, User, Account, Category } from '../types';
import { LocalDB } from '../services/storage';
import { ApiService } from '../services/api';

interface TransactionsViewProps {
  user: User;
  onRefresh: () => void;
  openAddModalInitially?: boolean;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  user,
  onRefresh,
  openAddModalInitially = false,
}) => {
  const isSuper = user.role === 'super_admin';
  const transactions = LocalDB.getTransactions();
  const accounts = LocalDB.getAccounts();
  const categories = LocalDB.getCategories();

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddModalInitially);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState(1500000);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 1);
  const [accountId, setAccountId] = useState(accounts[0]?.id || 1);
  const [txDate, setTxDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');

  const filtered = transactions.filter((t) => {
    const matchesType = filterType === 'all' ? true : t.type === filterType;
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : `${t.name} ${t.category_name} ${t.account_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0) {
      alert('Nama transaksi dan nominal wajib diisi valid.');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    const acc = accounts.find((a) => a.id === accountId);

    const payload = {
      name,
      type,
      category_id: categoryId,
      category_name: cat?.name || 'Umum',
      account_id: accountId,
      account_name: acc?.name || 'Kas',
      amount: Number(amount),
      tx_date: txDate,
      note,
    };

    if (isSuper) {
      // Direct apply
      const txs = LocalDB.getTransactions();
      const updatedAccounts = [...accounts];
      const targetAcc = updatedAccounts.find((a) => a.id === accountId);
      if (targetAcc) {
        if (type === 'income') targetAcc.balance += Number(amount);
        else targetAcc.balance -= Number(amount);
        LocalDB.saveAccounts(updatedAccounts);
      }

      const newTx: Transaction = {
        ...payload,
        id: Date.now(),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      LocalDB.saveTransactions([newTx, ...txs]);

      ApiService.recordAuditLog(
        user.id,
        user.name,
        'create_transaction',
        'transaction',
        `Menambah transaksi ${type}: ${name} (Rp ${Number(amount).toLocaleString('id-ID')})`,
        newTx.id
      );

      setToastMsg({ text: 'Transaksi berhasil dicatat dan saldo kas diperbarui!', type: 'success' });
    } else {
      // User submits to change_requests
      const requests = LocalDB.getChangeRequests();
      const newReq = {
        id: Date.now(),
        entity: 'transaction' as const,
        action: 'create' as const,
        summary: `Transaksi ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}: ${name} (Rp ${Number(amount).toLocaleString('id-ID')})`,
        payload,
        status: 'pending' as const,
        requested_by: user.id,
        requested_by_name: user.name,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      LocalDB.saveChangeRequests([newReq, ...requests]);

      ApiService.recordAuditLog(
        user.id,
        user.name,
        'request_create_transaction',
        'change_request',
        `Mengajukan transaksi baru: ${name}`,
        newReq.id
      );

      setToastMsg({
        text: 'Pengajuan transaksi berhasil dikirim ke antrean persetujuan Super Admin.',
        type: 'info',
      });
    }

    setIsAddModalOpen(false);
    setName('');
    setNote('');
    onRefresh();
  };

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#18211e] flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-700" />
            <span>Riwayat Transaksi Keuangan</span>
          </h2>
          <p className="text-xs text-[#717e79]">Pencatatan arus kas masuk & keluar</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold text-white bg-[#126b50] hover:bg-[#0e543e] active:scale-95 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isSuper ? 'Catat Kas' : 'Ajukan Kas'}</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-3 border border-[#e2e8e5] shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, kategori, atau rekening kas..."
            className="w-full bg-[#f6f8f7] border border-[#dce3df] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18211e] outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Semua Transaksi' },
            { id: 'income', label: 'Pemasukan (+)' },
            { id: 'expense', label: 'Pengeluaran (-)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterType(item.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                filterType === item.id
                  ? 'bg-[#126b50] text-white shadow-xs'
                  : 'bg-[#f0f3f1] text-[#5c6964] hover:bg-[#e4eae6]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
            <ArrowLeftRight className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">Tidak ada transaksi ditemukan.</p>
          </div>
        ) : (
          filtered.map((t) => {
            const isIncome = t.type === 'income';
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-3.5 border border-[#e2e8e5] shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-[#18211e] truncate flex items-center gap-1.5">
                      <span>{t.name}</span>
                      {t.ref_key && (
                        <span title="Transaksi terkunci otomatis dari stok mobil">
                          <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#76847f] mt-0.5">
                      <span className="font-medium">{t.tx_date}</span>
                      <span>&bull;</span>
                      <span className="bg-[#f0f4f2] text-[#44524e] font-semibold px-1.5 py-0.2 rounded">
                        {t.category_name}
                      </span>
                      <span>&bull;</span>
                      <span className="truncate">{t.account_name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-black ${
                      isIncome ? 'text-[#11815e]' : 'text-[#d65750]'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatRupiah(t.amount)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-black text-sm text-[#18211e]">
                  {isSuper ? 'Catat Transaksi Keuangan' : 'Ajukan Transaksi Keuangan'}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {isSuper ? 'Langsung mempengaruhi saldo buku' : 'Masuk antrean persetujuan Super Admin'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              {/* Type toggle */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                      type === 'expense'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Pengeluaran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                      type === 'income'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Pemasukan</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama / Keterangan Transaksi</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mis. Pembayaran Sewa Tempat, Tagihan Listrik, Servis..."
                  className="w-full p-2.5 bg-[#f8faf9] border rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl font-bold text-[#18211e]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Akun / Rekening</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(Number(e.target.value))}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl font-semibold"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nomor struk, bukti transfer..."
                  className="w-full p-2 bg-[#f8faf9] border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#126b50] text-white font-black text-xs hover:bg-[#0e543e] active:scale-98 transition shadow-xs"
              >
                {isSuper ? 'Simpan Transaksi Kas' : 'Kirim Pengajuan Transaksi ke Super Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
