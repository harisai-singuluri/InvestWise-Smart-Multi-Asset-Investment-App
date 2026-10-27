export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface Account {
  id: number;
  userId: number;
  currency: string;
  totalBalance: number;
  availableCash: number;
  reservedCash: number;
  updatedAt: string;
}

export type AssetClass = 'STOCKS' | 'ETFS' | 'CRYPTO' | 'MUTUAL_FUNDS' | 'GOLD';

export interface MarketQuote {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  observedAt: string;
}

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  currency: string;
  exchange: string;
  active: boolean;
  quote?: MarketQuote;
}

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  volume: number;
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
export type OrderStatus = 'NEW' | 'ACCEPTED' | 'OPEN' | 'FILLED' | 'CANCELLED' | 'REJECTED';

export interface Order {
  id: number;
  userId: number;
  symbol: string;
  assetName: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  triggerPrice?: number;
  filledPrice?: number;
  status: OrderStatus;
  idempotencyKey?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  triggerPrice?: number;
  idempotencyKey?: string;
}

export interface TransactionRecord {
  id: number;
  orderId: number;
  userId: number;
  assetSymbol: string;
  assetName: string;
  side: OrderSide;
  quantity: number;
  executionPrice: number;
  totalAmount: number;
  fee: number;
  timestamp: string;
}

export type LedgerEntryType = 'CASH_DEBIT' | 'CASH_CREDIT' | 'ASSET_ACQUISITION' | 'ASSET_DISPOSAL' | 'FEE_EXPENSE';

export interface LedgerEntry {
  id: number;
  transactionId: number;
  userId: number;
  entryType: LedgerEntryType;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  assetSymbol?: string;
  assetQuantity: number;
  balanceAfter: number;
  timestamp: string;
}

export interface Holding {
  id: number;
  symbol: string;
  assetName: string;
  assetClass: AssetClass;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocationPercent: number;
}

export interface AllocationItem {
  category: string;
  totalValue: number;
  percentage: number;
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  cashBalance: number;
  availableCash: number;
  reservedCash: number;
  totalInvested: number;
  totalUnrealizedPnL: number;
  totalReturnPercent: number;
  holdings: Holding[];
  allocation: AllocationItem[];
}

export interface PerformancePoint {
  timestamp: string;
  portfolioValue: number;
  netInvested: number;
}

export type RiskProfile = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
export type GoalStatus = 'ACTIVE' | 'ACHIEVED' | 'CANCELLED';

export interface InvestmentGoal {
  id: number;
  userId: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  targetDate: string;
  riskProfile: RiskProfile;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface RecurringPlan {
  id: number;
  userId: number;
  symbol: string;
  assetName: string;
  amount: number;
  frequency: RecurringFrequency;
  nextExecutionDate: string;
  status: RecurringStatus;
  createdAt: string;
  updatedAt: string;
}

export type AlertCondition = 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENT_GAIN_24H' | 'PERCENT_DROP_24H';
export type AlertStatus = 'ACTIVE' | 'TRIGGERED' | 'CANCELLED';

export interface PriceAlert {
  id: number;
  userId: number;
  symbol: string;
  assetName: string;
  alertCondition: AlertCondition;
  thresholdPrice: number;
  status: AlertStatus;
  triggeredAt?: string;
  createdAt: string;
}

export type NotificationType = 'ORDER_FILLED' | 'PRICE_ALERT' | 'GOAL_ACHIEVED' | 'MARKET_UPDATE' | 'RECURRING_EXECUTED';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export type InsightType = 'PORTFOLIO_CONCENTRATION' | 'RISK_DIVERSIFICATION' | 'ASSET_MOMENTUM' | 'VOLATILITY_WARNING';

export interface Insight {
  id: number;
  title: string;
  summary: string;
  insightType: InsightType;
  confidenceScore: number;
  provider: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface RebalanceRecommendationItem {
  category: string;
  currentPercentage: number;
  targetPercentage: number;
  deltaPercentage: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  adjustmentAmount: number;
  suggestedSymbol?: string;
  suggestedQuantity: number;
}

export interface RebalanceAnalysisResponse {
  totalPortfolioValue: number;
  balanced: boolean;
  recommendations: RebalanceRecommendationItem[];
}

export interface RebalanceRequest {
  targetPercentages: Record<string, number>;
}
