import React, { useState } from 'react';
import {
  Car as CarIcon,
  Search,
  Plus,
  Tag,
  Calendar,
  Gauge,
  CheckCircle,
  HelpCircle,
  X,
  Sparkles,
  AlertCircle,
  DollarSign,
  UserCheck,
  Check,
} from 'lucide-react';
import { Car, User, Account } from '../types';
import { LocalDB } from '../services/storage';
import { ApiService } from '../services/api';

interface CarsViewProps {
  user: User;
  onRefresh: () => void;
  openAddModalInitially?: boolean;
}

export const CarsView: React.FC<CarsViewProps> = ({
  user,
  onRefresh,
  openAddModalInitially = false,
}) => {
  const isSuper = user.role === 'super_admin';
  const cars = LocalDB.getCars();
  const accounts = LocalDB.getAccounts();

  const [filterStatus, setFilterStatus] = useState<'semua' | 'tersedia' | 'dipesan' | 'terjual'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddModalInitially);
  const [sellingCar, setSellingCar] = useState<Car | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form states for Add Car
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2022);
  const [plateNumber, setPlateNumber] = useState('');
  const [color, setColor] = useState('Hitam Metalik');
  const [transmission, setTransmission] = useState<'Manual' | 'Otomatis'>('Otomatis');
  const [fuel, setFuel] = useState('Bensin');
  const [mileage, setMileage] = useState(25000);
  const [purchasePrice, setPurchasePrice] = useState(200000000);
  const [sellingPrice, setSellingPrice] = useState(230000000);
  const [purchasePaid, setPurchasePaid] = useState(200000000);
  const [purchaseAccountId, setPurchaseAccountId] = useState(accounts[0]?.id || 1);
  const [description, setDescription] = useState('');

  // Form states for Sell Car Modal
  const [soldPrice, setSoldPrice] = useState(0);
  const [soldReceived, setSoldReceived] = useState(0);
  const [soldAccountId, setSoldAccountId] = useState(accounts[0]?.id || 1);
  const [buyerName, setBuyerName] = useState('');
  const [soldNote, setSoldNote] = useState('');

  const filteredCars = cars.filter((car) => {
    const matchesFilter = filterStatus === 'semua' ? true : car.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : `${car.brand} ${car.model} ${car.plate_number}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenSellModal = (car: Car) => {
    setSellingCar(car);
    setSoldPrice(car.selling_price);
    setSoldReceived(car.selling_price);
    setBuyerName('');
    setSoldNote('');
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingCar) return;

    const res = await ApiService.markCarSold(
      sellingCar.id,
      {
        sold_at: new Date().toISOString().substring(0, 10),
        sold_price: Number(soldPrice),
        sold_received: Number(soldReceived),
        sold_account_id: Number(soldAccountId),
        buyer_name: buyerName.trim() || 'Pembeli Showroom',
        sold_note: soldNote,
      },
      user
    );

    setMessage({
      text: res.message,
      type: res.isPending ? 'info' : 'success',
    });

    setSellingCar(null);
    onRefresh();
  };

  const handleAddCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim() || !plateNumber.trim()) {
      alert('Merek/Model dan Nomor Polisi wajib diisi.');
      return;
    }

    const res = await ApiService.addCar(
      {
        brand,
        model,
        year: Number(year),
        plate_number: plateNumber.toUpperCase(),
        color,
        transmission,
        fuel,
        mileage: Number(mileage),
        purchase_price: Number(purchasePrice),
        selling_price: Number(sellingPrice),
        purchase_paid: Number(purchasePaid),
        purchase_account_id: Number(purchaseAccountId),
        description,
        photo_url: '/uploads/cars/654224a3903832c220048d18acaac93cfa10.jpg',
      },
      user
    );

    setMessage({
      text: res.message,
      type: res.isPending ? 'info' : 'success',
    });

    setIsAddModalOpen(false);
    setModel('');
    setPlateNumber('');
    setDescription('');
    onRefresh();
  };

  const formatRupiah = (val?: number) => {
    if (!val) return 'Rp 0';
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#18211e] flex items-center gap-2">
            <CarIcon className="w-5 h-5 text-emerald-700" />
            <span>Katalog & Stok Mobil</span>
          </h2>
          <p className="text-xs text-[#717e79] mt-0.5">
            Total {cars.length} unit kendaraan dalam inventaris showroom
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-white bg-[#126b50] hover:bg-[#0e543e] active:scale-95 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isSuper ? 'Tambah Mobil' : 'Ajukan Unit'}</span>
        </button>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-3 border border-[#e2e8e5] shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari merek, model, atau nomor polisi..."
            className="w-full bg-[#f6f8f7] border border-[#dce3df] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18211e] outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(['semua', 'tersedia', 'dipesan', 'terjual'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition shrink-0 ${
                filterStatus === st
                  ? 'bg-[#126b50] text-white shadow-xs'
                  : 'bg-[#f0f3f1] text-[#5c6964] hover:bg-[#e4eae6]'
              }`}
            >
              {st === 'semua' ? 'Semua Stok' : st}
              <span className="ml-1.5 text-[10px] opacity-80 font-black">
                {st === 'semua' ? cars.length : cars.filter((c) => c.status === st).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cars Grid */}
      <div className="space-y-3.5">
        {filteredCars.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
            <CarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">Tidak ada mobil yang sesuai filter.</p>
          </div>
        ) : (
          filteredCars.map((car) => {
            const isSold = car.status === 'terjual';
            const isReserved = car.status === 'dipesan';

            return (
              <div
                key={car.id}
                className="bg-white rounded-2xl border border-[#e2e8e5] overflow-hidden shadow-xs hover:shadow-md transition"
              >
                {/* Image & Status Tag */}
                <div className="relative h-44 bg-gray-100">
                  <img
                    src={car.photo_url || '/uploads/cars/654224a3903832c220048d18acaac93cfa10.jpg'}
                    alt={car.model}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-black/75 backdrop-blur-md text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg border border-white/20">
                      {car.plate_number}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider shadow-sm ${
                        car.status === 'tersedia'
                          ? 'bg-emerald-600 text-white'
                          : car.status === 'dipesan'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {car.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
                      {car.brand}
                    </div>
                    <h3 className="font-extrabold text-sm text-[#18211e] leading-snug">
                      {car.model}
                    </h3>
                  </div>

                  {/* Badges Info */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#63716c] pt-0.5">
                    <div className="bg-[#f6f8f7] p-1.5 rounded-lg text-center">
                      <span className="font-bold text-[#18211e]">{car.year}</span>
                      <div className="text-[9px] text-[#8e9894]">Tahun</div>
                    </div>
                    <div className="bg-[#f6f8f7] p-1.5 rounded-lg text-center">
                      <span className="font-bold text-[#18211e]">{car.transmission}</span>
                      <div className="text-[9px] text-[#8e9894]">Transmisi</div>
                    </div>
                    <div className="bg-[#f6f8f7] p-1.5 rounded-lg text-center">
                      <span className="font-bold text-[#18211e]">
                        {car.mileage.toLocaleString('id-ID')} km
                      </span>
                      <div className="text-[9px] text-[#8e9894]">Jarak</div>
                    </div>
                  </div>

                  {/* Financial figures */}
                  <div className="pt-2 border-t border-[#edf1ef] flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-[#808d87]">Harga Beli</div>
                      <div className="font-bold text-[#44524e]">{formatRupiah(car.purchase_price)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#808d87]">
                        {isSold ? 'Harga Terjual' : 'Harga Penjualan'}
                      </div>
                      <div className="font-black text-sm text-[#126b50]">
                        {formatRupiah(isSold ? car.sold_price || car.selling_price : car.selling_price)}
                      </div>
                    </div>
                  </div>

                  {/* Sold Details if Sold */}
                  {isSold && (
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
                      <div className="font-bold flex items-center justify-between text-[11px]">
                        <span>Terjual: {car.sold_at}</span>
                        <span className="text-blue-700">Pembeli: {car.buyer_name}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isSold && (
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenSellModal(car)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{isSuper ? 'Tandai Terjual' : 'Ajukan Penjualan'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Tambah Mobil Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-black text-sm text-[#18211e]">
                  {isSuper ? 'Tambah Stok Mobil Baru' : 'Ajukan Penambahan Stok Mobil'}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {isSuper ? 'Data akan langsung tercatat di inventaris' : 'Pengajuan akan masuk antrean Persetujuan Super Admin'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCarSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Merek</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl font-bold"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                    <option value="Daihatsu">Daihatsu</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Nissan">Nissan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nomor Polisi</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="mis. B 1234 XYZ"
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl uppercase font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Model & Varian</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="mis. Innova Reborn 2.4 V AT Diesel"
                  className="w-full p-2 bg-[#f8faf9] border rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Transmisi</label>
                  <select
                    value={transmission}
                    onChange={(e: any) => setTransmission(e.target.value)}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl"
                  >
                    <option value="Otomatis">Otomatis</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Bahan Bakar</label>
                  <select
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl"
                  >
                    <option value="Bensin">Bensin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPurchasePrice(v);
                      setPurchasePaid(v);
                    }}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Harga Jual Rencana</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              {/* Purchase funding source */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-emerald-950 text-xs">
                  Sumber Dana Pembelian Kas:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-600 block mb-0.5">Akun Pembayaran</label>
                    <select
                      value={purchaseAccountId}
                      onChange={(e) => setPurchaseAccountId(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border rounded-lg text-xs font-semibold"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Rp {Math.round(a.balance / 1000000)}jt)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 block mb-0.5">Dibayar Sekarang</label>
                    <input
                      type="number"
                      value={purchasePaid}
                      onChange={(e) => setPurchasePaid(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Catatan / Deskripsi Kendaraan</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kondisi cat, riwayat servis, kelengkapan surat..."
                  className="w-full p-2 bg-[#f8faf9] border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#126b50] text-white font-black text-xs hover:bg-[#0e543e] active:scale-98 transition shadow-sm"
              >
                {isSuper ? 'Simpan Mobil ke Stok' : 'Kirim Pengajuan ke Super Admin'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tandai Terjual */}
      {sellingCar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-black text-sm text-[#18211e]">
                  {isSuper ? 'Tandai Mobil Terjual' : 'Ajukan Penjualan Mobil'}
                </h3>
                <p className="text-[11px] text-gray-500 truncate">
                  {sellingCar.brand} {sellingCar.model} ({sellingCar.plate_number})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSellingCar(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSellSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Pembeli</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="mis. Bapak Hendra Gunawan"
                  className="w-full p-2 bg-[#f8faf9] border rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Harga Jual Deal (Rp)</label>
                  <input
                    type="number"
                    value={soldPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSoldPrice(v);
                      setSoldReceived(v);
                    }}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Uang Diterima Kas (Rp)</label>
                  <input
                    type="number"
                    value={soldReceived}
                    onChange={(e) => setSoldReceived(Number(e.target.value))}
                    className="w-full p-2 bg-[#f8faf9] border rounded-xl font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Rekening Tujuan Penerimaan</label>
                <select
                  value={soldAccountId}
                  onChange={(e) => setSoldAccountId(Number(e.target.value))}
                  className="w-full p-2 bg-[#f8faf9] border rounded-xl font-medium"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.number_label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Catatan Penjualan</label>
                <input
                  type="text"
                  value={soldNote}
                  onChange={(e) => setSoldNote(e.target.value)}
                  placeholder="Pelunasan via transfer, titip kunci..."
                  className="w-full p-2 bg-[#f8faf9] border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 active:scale-98 transition shadow-sm"
              >
                {isSuper ? 'Konfirmasi Terjual & Catat Kas' : 'Ajukan Penjualan ke Super Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
