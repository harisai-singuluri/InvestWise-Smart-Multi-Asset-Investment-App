import {
  ApiResponse,
  AuthResponse,
  User,
  Account,
  Asset,
  AssetClass,
  MarketQuote,
  PriceHistoryPoint,
  Order,
  OrderRequest,
  OrderStatus,
  TransactionRecord,
  LedgerEntry,
  PortfolioSummary,
  PerformancePoint,
  InvestmentGoal,
  RecurringPlan,
  RecurringStatus,
  PriceAlert,
  Notification,
  Insight,
  RebalanceAnalysisResponse,
  RebalanceRequest,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '') : '') + '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('investwise_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMessage = data?.message || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return (data as ApiResponse<T>)?.data as T;
}

export const api = {
  auth: {
    register: (body: { fullName: string; email: string; password: string }) =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<User>('/auth/me'),
  },

  account: {
    get: () => request<Account>('/accounts'),
    resetDemo: () => request<Account>('/accounts/demo/reset', { method: 'POST' }),
  },

  assets: {
    list: (params?: { assetClass?: AssetClass; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.assetClass) q.set('assetClass', params.assetClass);
      if (params?.search) q.set('search', params.search);
      const query = q.toString() ? `?${q.toString()}` : '';
      return request<Asset[]>(`/assets${query}`);
    },
    get: (symbol: string) => request<Asset>(`/assets/${symbol}`),
    getHistory: (symbol: string, timeframe: string = '1M') =>
      request<PriceHistoryPoint[]>(`/assets/${symbol}/history?timeframe=${timeframe}`),
  },

  market: {
    getQuote: (symbol: string) => request<MarketQuote>(`/market/quotes/${symbol}`),
    simulatePrice: (symbol: string, newPrice: number) =>
      request<MarketQuote>(`/market/quotes/${symbol}/simulate?newPrice=${newPrice}`, { method: 'POST' }),
  },

  portfolio: {
    getSummary: () => request<PortfolioSummary>('/portfolio'),
    getPerformance: (timeframe: string = '1M') =>
      request<PerformancePoint[]>(`/portfolio/performance?timeframe=${timeframe}`),
    analyzeRebalance: (targetPercentages: Record<string, number>) =>
      request<RebalanceAnalysisResponse>('/portfolio/rebalance/analyze', {
        method: 'POST',
        body: JSON.stringify({ targetPercentages }),
      }),
    executeRebalance: (targetPercentages: Record<string, number>) =>
      request<RebalanceAnalysisResponse>('/portfolio/rebalance/execute', {
        method: 'POST',
        body: JSON.stringify({ targetPercentages }),
      }),
    downloadStatementCsv: async () => {
      const token = localStorage.getItem('investwise_token');
      const response = await fetch(`${API_BASE}/portfolio/statement.csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to download statement');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InvestWise_Statement_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  },

  orders: {
    submit: (order: OrderRequest) => {
      const headers: Record<string, string> = {};
      if (order.idempotencyKey) {
        headers['X-Idempotency-Key'] = order.idempotencyKey;
      }
      return request<Order>('/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(order),
      });
    },
    list: (status?: OrderStatus) => {
      const query = status ? `?status=${status}` : '';
      return request<Order[]>(`/orders${query}`);
    },
    cancel: (id: number) => request<Order>(`/orders/${id}/cancel`, { method: 'POST' }),
  },

  ledger: {
    getTransactions: () => request<TransactionRecord[]>('/transactions'),
    getEntries: () => request<LedgerEntry[]>('/ledger'),
  },

  goals: {
    list: () => request<InvestmentGoal[]>('/goals'),
    create: (body: { title: string; targetAmount: number; targetDate: string; initialContribution?: number; riskProfile?: string }) =>
      request<InvestmentGoal>('/goals', { method: 'POST', body: JSON.stringify(body) }),
    contribute: (id: number, amount: number) =>
      request<InvestmentGoal>(`/goals/${id}/contribute?amount=${amount}`, { method: 'POST' }),
    cancel: (id: number) => request<InvestmentGoal>(`/goals/${id}/cancel`, { method: 'POST' }),
  },

  recurring: {
    list: () => request<RecurringPlan[]>('/recurring-plans'),
    create: (body: { symbol: string; amount: number; frequency: string }) =>
      request<RecurringPlan>('/recurring-plans', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id: number, status: RecurringStatus) =>
      request<RecurringPlan>(`/recurring-plans/${id}/status?status=${status}`, { method: 'PATCH' }),
  },

  watchlist: {
    list: () => request<Asset[]>('/watchlist'),
    add: (symbol: string) => request<Asset>(`/watchlist/${symbol}`, { method: 'POST' }),
    remove: (symbol: string) => request<void>(`/watchlist/${symbol}`, { method: 'DELETE' }),
  },

  alerts: {
    list: () => request<PriceAlert[]>('/alerts'),
    create: (body: { symbol: string; alertCondition: string; thresholdPrice: number }) =>
      request<PriceAlert>('/alerts', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: number) => request<void>(`/alerts/${id}`, { method: 'DELETE' }),
  },

  notifications: {
    list: () => request<Notification[]>('/notifications'),
    markAsRead: (id: number) => request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => request<void>('/notifications/read-all', { method: 'POST' }),
  },

  insights: {
    list: () => request<Insight[]>('/insights'),
  },
};
