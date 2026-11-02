/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AuthSession,
  User,
  TailscaleProfile,
} from './types';
import { LocalDB } from './services/storage';
import { ApiService } from './services/api';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileSidebar } from './components/layout/MobileSidebar';
import { BottomNav } from './components/layout/BottomNav';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { CarsView } from './views/CarsView';
import { TransactionsView } from './views/TransactionsView';
import { ApprovalsView } from './views/ApprovalsView';
import { MyRequestsView } from './views/MyRequestsView';
import { UsersView } from './views/UsersView';
import { AuditView } from './views/AuditView';
import { AccountsView } from './views/AccountsView';
import { InvoicesView } from './views/InvoicesView';
import { BudgetsView } from './views/BudgetsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { CategoriesView } from './views/CategoriesView';
import { SecurityView } from './views/SecurityView';
import { TailscaleConfigView } from './views/TailscaleConfigView';
import { ApkDownloadView } from './views/ApkDownloadView';

import { Lock, Unlock, ShieldAlert, KeyRound } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => LocalDB.getAuthSession());
  const [activeProfile, setActiveProfile] = useState<TailscaleProfile>(() => LocalDB.getActiveProfile());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Quick PIN lock screen state
  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    const hasPin = LocalDB.isPinEnabled() && LocalDB.getQuickPin();
    const hasSession = !!LocalDB.getAuthSession();
    return Boolean(hasPin && hasSession);
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Modal open states
  const [openAddCar, setOpenAddCar] = useState(false);
  const [openAddTx, setOpenAddTx] = useState(false);

  // Persistent Login Auto-Login Check on App Launch
  useEffect(() => {
    // If not logged in, check if saved credentials exist with RememberMe
    if (!session && LocalDB.isRememberMeEnabled()) {
      const saved = LocalDB.getSavedCredentials();
      if (saved) {
        ApiService.login(saved.username, saved.mode, true).then((res) => {
          if (res.success && res.session) {
            setSession(res.session);
            if (LocalDB.isPinEnabled() && LocalDB.getQuickPin()) {
              setIsPinLocked(true);
            }
          }
        });
      }
    }
  }, []);

  // Listen to service worker registration if supported
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW register note:', err);
      });
    }
  }, []);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = () => {
    ApiService.logout();
    setSession(null);
    setIsPinLocked(false);
    setActiveTab('dashboard');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = LocalDB.getQuickPin();
    if (pinInput === correctPin) {
      setIsPinLocked(false);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // Calculate pending items for badge counters
  const changeRequests = LocalDB.getChangeRequests();
  const pendingApprovalsCount = changeRequests.filter((r) => r.status === 'pending').length;
  const userPendingRequestsCount = session
    ? changeRequests.filter((r) => r.requested_by === session.user.id && r.status === 'pending').length
    : 0;
  const pendingCount = session?.user.role === 'super_admin' ? pendingApprovalsCount : userPendingRequestsCount;

  // 1. If not logged in, show Login Screen
  if (!session) {
    return (
      <LoginView
        activeProfile={activeProfile}
        onLoginSuccess={() => {
          const freshSession = LocalDB.getAuthSession();
          setSession(freshSession);
          setActiveTab('dashboard');
        }}
        onOpenTailscaleConfig={() => {
          // Can configure Tailscale IP even before logging in!
          setActiveTab('tailscale');
        }}
      />
    );
  }

  // 2. If quick PIN is locked
  if (isPinLocked) {
    return (
      <div className="min-h-screen bg-[#f5f7f6] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-gray-200 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#126b50] mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-[#18211e]">Aplikasi Terkunci</h2>
            <p className="text-xs text-gray-500 mt-1">
              Masukkan 4-digit PIN Anda untuk membuka kembali Finora Mobile
            </p>
          </div>

          {pinError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              PIN salah. Silakan coba lagi.
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-48 mx-auto text-center font-mono text-2xl tracking-[0.5em] font-black p-3 bg-gray-50 border border-gray-300 rounded-2xl outline-none focus:border-emerald-600 block"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#126b50] text-white font-extrabold text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Aplikasi</span>
            </button>
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-rose-600 underline"
          >
            Masuk dengan akun lain
          </button>
        </div>
      </div>
    );
  }

  const isSuper = session.user.role === 'super_admin';

  // Role Access Guard: Block non-super_admin from admin pages
  const isAdminExclusiveTab = ['approvals', 'users', 'audit', 'settings'].includes(activeTab);
  if (isAdminExclusiveTab && !isSuper) {
    return (
      <div className="min-h-screen bg-[#f5f7f6] flex flex-col">
        <MobileHeader
          user={session.user}
          activeProfile={activeProfile}
          activeTab={activeTab}
          pendingCount={pendingCount}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onNavigate={setActiveTab}
          onLogout={handleLogout}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200 shadow-xl text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-base font-extrabold text-rose-900">Hak Akses Dibatasi</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Halaman ini hanya dapat diakses melalui <strong>Pintu Super Admin</strong> (Port {activeProfile.adminPort}). Akun Anda saat ini memiliki peran <strong>{session.user.role}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-[#126b50] text-white font-bold text-xs rounded-xl"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f5f7f6] text-[#18211e] flex flex-col ${isSuper ? 'mode-admin' : 'mode-user'}`}>
      {/* 1. Sticky Mobile Header */}
      <MobileHeader
        user={session.user}
        activeProfile={activeProfile}
        activeTab={activeTab}
        pendingCount={pendingCount}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onNavigate={setActiveTab}
        onLogout={handleLogout}
      />

      {/* 2. Mobile Drawer Navigation Sidebar */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        user={session.user}
        activeProfile={activeProfile}
        pendingCount={pendingCount}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={setActiveTab}
        onLogout={handleLogout}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-6 pt-3.5">
        {activeTab === 'dashboard' && (
          <DashboardView
            user={session.user}
            activeProfile={activeProfile}
            pendingCount={pendingCount}
            onNavigate={setActiveTab}
            onOpenAddCarModal={() => {
              setActiveTab('cars');
              setOpenAddCar(true);
            }}
            onOpenAddTxModal={() => {
              setActiveTab('transactions');
              setOpenAddTx(true);
            }}
          />
        )}

        {activeTab === 'cars' && (
          <CarsView
            user={session.user}
            onRefresh={handleRefresh}
            openAddModalInitially={openAddCar}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            user={session.user}
            onRefresh={handleRefresh}
            openAddModalInitially={openAddTx}
          />
        )}

        {activeTab === 'approvals' && isSuper && (
          <ApprovalsView user={session.user} onRefresh={handleRefresh} />
        )}

        {activeTab === 'my_requests' && (
          <MyRequestsView user={session.user} onNavigate={setActiveTab} />
        )}

        {activeTab === 'users' && isSuper && (
          <UsersView currentUser={session.user} onRefresh={handleRefresh} />
        )}

        {activeTab === 'audit' && isSuper && (
          <AuditView currentUser={session.user} />
        )}

        {activeTab === 'accounts' && <AccountsView />}

        {activeTab === 'invoices' && <InvoicesView />}

        {activeTab === 'budgets' && <BudgetsView />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'categories' && <CategoriesView user={session.user} />}

        {activeTab === 'settings' && isSuper && <SettingsView currentUser={session.user} />}

        {activeTab === 'security' && <SecurityView user={session.user} />}

        {activeTab === 'tailscale' && (
          <TailscaleConfigView
            activeProfile={activeProfile}
            onProfileChanged={(p) => setActiveProfile(p)}
          />
        )}

        {activeTab === 'apk' && <ApkDownloadView activeProfile={activeProfile} />}
      </main>

      {/* 4. Bottom Thumb Navigation */}
      <BottomNav
        activeTab={activeTab}
        user={session.user}
        pendingCount={pendingCount}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setOpenAddCar(false);
          setOpenAddTx(false);
        }}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
    </div>
  );
}
