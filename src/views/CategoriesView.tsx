import React, { useState } from 'react';
import { Tags, Plus, X, Sparkles } from 'lucide-react';
import { LocalDB } from '../services/storage';
import { Category, User } from '../types';

interface CategoriesViewProps {
  user: User;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ user }) => {
  const [categories, setCategories] = useState<Category[]>(LocalDB.getCategories());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newColor, setNewColor] = useState('green');

  const filtered = categories.filter((c) => (filterType === 'all' ? true : c.type === filterType));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCat: Category = {
      id: Date.now(),
      name: newName.trim(),
      type: newType,
      color: newColor,
      created_at: new Date().toISOString().substring(0, 10),
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    LocalDB.set('finora_data_categories', updated);
    setIsAddOpen(false);
    setNewName('');
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">Kategori Keuangan</h2>
            <p className="text-xs text-[#717e79]">Pos pemasukan dan pengeluaran anggaran</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#126b50] hover:bg-[#0e543e]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'Semua Kategori' },
          { id: 'income', label: 'Pemasukan' },
          { id: 'expense', label: 'Pengeluaran' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilterType(item.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              filterType === item.id
                ? 'bg-[#126b50] text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-3.5 border border-[#e2e8e5] shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  cat.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="font-extrabold text-xs text-[#18211e]">{cat.name}</span>
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                cat.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {cat.type}
            </span>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Kategori Baru</h3>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="mis. Komisi Penjualan"
                  className="w-full p-2 bg-[#f8faf9] border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Jenis</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2 bg-[#f8faf9] border rounded-xl font-bold"
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#126b50] text-white font-bold"
              >
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
