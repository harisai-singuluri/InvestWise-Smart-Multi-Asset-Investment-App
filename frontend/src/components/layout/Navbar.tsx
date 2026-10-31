import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  RefreshCw,
  LogOut,
  TrendingUp,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Compass,
  PieChart,
  Scale,
  Target,
  Repeat,
  Star,
  FileText,
  Sparkles,
  Settings
} from 'lucide-react';
import { api } from '../../services/api';
import { Notification } from '../../types';

const mobileNavLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/explore', label: 'Explore Markets', icon: Compass },
  { path: '/portfolio', label: 'Portfolio', icon: PieChart },
  { path: '/rebalance', label: 'Rebalance Engine', icon: Scale },
  { path: '/goals', label: 'Financial Goals', icon: Target },
  { path: '/recurring', label: 'Recurring (DCA)', icon: Repeat },
  { path: '/watchlist', label: 'Watchlist & Alerts', icon: Star },
  { path: '/activity', label: 'Ledger & Activity', icon: FileText },
  { path: '/insights', label: 'AI Risk Insights', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Navbar: React.FC = () => {
  const { user, account, logout, resetDemoAccount, refreshAccount } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (err) {
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetDemoAccount();
      await refreshAccount();
    } catch (err) {
    } finally {
      setIsResetting(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      loadNotifications();
    } catch (err) {
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#1E293B] px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white bg-[#121824] border border-[#243046] rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">Invest<span className="text-emerald-400">Wise</span></span>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Demo</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Smart Multi-Asset Platform</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-5">
          {account && (
            <div className="hidden md:flex items-center space-x-3 bg-[#121824] border border-[#243046] rounded-xl px-3.5 py-2">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Demo Cash Available</p>
                <p className="text-sm font-bold text-white font-mono">
                  ${Number(account.availableCash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">USD</span>
                </p>
              </div>
              <button
                onClick={handleReset}
                disabled={isResetting}
                title="Reset demo cash balance to $100,000"
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-400 hover:text-white bg-[#121824] hover:bg-[#1A2333] border border-[#243046] rounded-xl transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121824] border border-[#243046] rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between p-3.5 border-b border-[#243046]">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#1E293B]">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3.5 hover:bg-[#1A2333]/60 transition-colors ${!n.isRead ? 'bg-emerald-500/5' : ''}`}>
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-semibold text-white">{n.title}</p>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2.5 p-1.5 pl-2.5 bg-[#121824] hover:bg-[#1A2333] border border-[#243046] rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-xs">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-semibold text-white hidden sm:block">{user?.fullName || 'User'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#121824] border border-[#243046] rounded-2xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-[#243046] mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#1A2333] rounded-xl transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Account & Demo Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#1E293B] space-y-1">
          {account && (
            <div className="flex items-center justify-between p-3 bg-[#121824] rounded-xl mb-3 border border-[#243046]">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Demo Available Balance</p>
                <p className="text-xs font-bold text-white font-mono">
                  ${Number(account.availableCash).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </p>
              </div>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold"
              >
                Reset Demo
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {mobileNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white bg-[#121824]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
