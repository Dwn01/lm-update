import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle,
  FileCode,
  Package,
  Layers,
  Sparkles,
  Info,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { TailscaleProfile } from '../types';
import { generateApkProjectBundle } from '../utils/apkGenerator';

interface ApkDownloadViewProps {
  activeProfile: TailscaleProfile;
}

export const ApkDownloadView: React.FC<ApkDownloadViewProps> = ({ activeProfile }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDownloadZip = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const blob = await generateApkProjectBundle(activeProfile);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finora-mobile-android-project-${activeProfile.ip.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Failed to generate APK bundle:', err);
      alert('Gagal membuat paket APK.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePwaInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        alert('Aplikasi Finora berhasil dipasang di layar utama smartphone Anda!');
      }
      setInstallPrompt(null);
    } else {
      alert(
        'Untuk memasang di Android:\n1. Buka menu browser (titik 3 di kanan atas Chrome)\n2. Pilih "Tambahkan ke Layar Utama" (Add to Home screen) atau "Install App".\n3. Ikon Finora akan langsung muncul di menu HP Anda!'
      );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#126b50] to-[#0d4f3b] text-white rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Finora Mobile APK</h2>
            <p className="text-xs text-emerald-100">
              Aplikasi Android dengan koneksi aman Tailscale VPN
            </p>
          </div>
        </div>

        {/* Current profile badge */}
        <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span className="font-bold">Target Tailscale IP:</span>
            <span className="font-mono bg-white/20 px-2 py-0.5 rounded font-black">
              {activeProfile.ip}
            </span>
          </div>
          <span className="text-[11px] opacity-80">Port: {activeProfile.userPort} / {activeProfile.adminPort}</span>
        </div>
      </div>

      {/* Option 1: Instant PWA Install (Direct to Android Screen) */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-[#18211e]">
                Opsi 1: Pasang Langsung ke HP (PWA / WebAPK)
              </h3>
              <p className="text-[11px] text-[#717e79]">
                Paling praktis &mdash; tanpa perlu install Android Studio atau komputer
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
            Disarankan
          </span>
        </div>

        <p className="text-xs text-[#44524d] leading-relaxed">
          Aplikasi ini dapat langsung dipasang ke layar utama ponsel Android Anda. Tampilan layar penuh (Full Screen) tanpa bilah browser, dengan ikon Finora resmi dan sesi login tersimpan permanen.
        </p>

        <button
          type="button"
          onClick={handlePwaInstall}
          className="w-full py-3 rounded-xl bg-[#126b50] hover:bg-[#0e543e] text-white font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-xs"
        >
          <Smartphone className="w-4 h-4" />
          <span>Pasang ke Layar Utama Ponsel Sekarang</span>
        </button>
      </div>

      {/* Option 2: Download Ready-to-Build Android Studio Project Bundle */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-[#18211e]">
                Opsi 2: Unduh Source Code Proyek APK Android (.zip)
              </h3>
              <p className="text-[11px] text-[#717e79]">
                Paket lengkap Android Studio (AndroidManifest, WebView, Tailscale dialog)
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">
            Source Proyek
          </span>
        </div>

        <div className="bg-[#f8faf9] p-3 rounded-xl text-xs space-y-1.5 border border-[#edf1ef]">
          <div className="font-extrabold text-[10px] text-gray-500 uppercase">
            Isi File Dalam Paket ZIP:
          </div>
          <div className="space-y-1 font-mono text-[11px] text-gray-700">
            <div>&bull; app/src/main/AndroidManifest.xml (Izin Internet & Tailscale cleartext)</div>
            <div>&bull; app/src/main/java/id/finora/mobile/MainActivity.java (WebView Client)</div>
            <div>&bull; app/src/main/res/layout/activity_main.xml (UI Pull to refresh)</div>
            <div>&bull; app/src/main/res/layout/dialog_config.xml (Dialog ubah IP Tailscale)</div>
            <div>&bull; app/build.gradle (Script Gradle Android SDK 34)</div>
            <div>&bull; PANDUAN-INSTALL-APK-ANDROID.md (Petunjuk kompilasi APK)</div>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Paket ZIP proyek Android berhasil diunduh ke perangkat Anda!</span>
          </div>
        )}

        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadZip}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-xs disabled:opacity-50"
        >
          {downloading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh Paket Proyek APK Android (.zip)</span>
            </>
          )}
        </button>
      </div>

      {/* Option 3: Step-by-Step Compile Instructions */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8e5] shadow-xs space-y-3 text-xs">
        <h3 className="font-extrabold text-xs text-[#18211e] flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gray-700" />
          <span>Cara Kompilasi Menjadi File .APK Mandiri</span>
        </h3>

        <div className="space-y-2 text-[#525f5a] leading-relaxed">
          <p>
            Jika Anda ingin menghasilkan file berkas installer <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-gray-800">app-debug.apk</code> secara langsung:
          </p>

          <div className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-[11px] space-y-1">
            <div className="text-gray-400"># 1. Ekstrak zip dan buka terminal di folder proyek</div>
            <div className="text-emerald-400">./gradlew assembleDebug</div>
            <div className="text-gray-400 mt-2"># 2. File APK akan otomatis terbentuk di:</div>
            <div className="text-blue-300">app/build/outputs/apk/debug/app-debug.apk</div>
            <div className="text-gray-400 mt-2"># 3. Kirim ke HP Android Anda atau pasang via adb:</div>
            <div className="text-amber-300">adb install app-debug.apk</div>
          </div>
        </div>
      </div>
    </div>
  );
};
