import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { AssetDetailPage } from './pages/AssetDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { RebalancePage } from './pages/RebalancePage';
import { GoalsPage } from './pages/GoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { WatchlistAlertsPage } from './pages/WatchlistAlertsPage';
import { ActivityLedgerPage } from './pages/ActivityLedgerPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-white text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <span>Loading InvestWise Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-12">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/assets/:symbol" element={<AssetDetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/rebalance" element={<RebalancePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/recurring" element={<RecurringPage />} />
            <Route path="/watchlist" element={<WatchlistAlertsPage />} />
            <Route path="/activity" element={<ActivityLedgerPage />} />
            <Route path="/insights" element={<AiInsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
