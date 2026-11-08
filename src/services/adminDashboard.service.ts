import { apiRequest } from './http.client';
import type { OrderStatus } from '@/types/order.type';

export type DashboardRange = 'today' | '7d' | '30d' | 'month' | '12m' | 'custom';

export type KpiMetric = { value: number; changePct?: number };

export type DashboardKpi = {
  todayRevenue: KpiMetric;
  monthRevenue: KpiMetric;
  totalRevenue: KpiMetric;
  todayOrders: KpiMetric;
  newCustomersToday: KpiMetric;
  lowStockProducts: KpiMetric;
};

export type OrderStatusBreakdown = {
  total: number;
  items: { status: OrderStatus; count: number }[];
};

export type RevenuePoint = { label: string; revenue: number; orders: number };

export type CategoryRevenue = { name: string; slug: string; revenue: number };

export type RecentOrder = {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  customerName: string;
};

export type TopProduct = {
  productId: number;
  name: string;
  slug: string;
  primaryImage: string | null;
  quantitySold: number;
  revenue: number;
};

export type LowStockProduct = {
  id: number;
  name: string;
  slug: string;
  stockQuantity: number;
  lowStockThreshold: number;
  image: string | null;
};

export type CustomerStats = {
  total: number;
  newToday: number;
  newThisMonth: number;
  newInRange: number;
  withOrders: number;
};

export type TopCustomer = { userId: number; fullName: string; orderCount: number; totalSpent: number };

export type SupportTicketStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING_ADMIN' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';

export type SupportStats = {
  waiting: number;
  inProgress: number;
  done: number;
  recent: { id: number; code: string; category: string; status: SupportTicketStatus; createdAt: string }[];
};

export type PaymentStats = {
  total: number;
  cancelled: number;
  methods: { method: string; count: number; revenue: number; pct: number }[];
};

export type DashboardData = {
  range: { range: DashboardRange; start: string; end: string; bucket: 'day' | 'month' };
  kpi: DashboardKpi;
  orderStatus: OrderStatusBreakdown;
  revenueTimeline: RevenuePoint[];
  categoryRevenue: CategoryRevenue[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  customerStats: CustomerStats;
  topCustomers: TopCustomer[];
  supportStats: SupportStats;
  paymentStats: PaymentStats;
};

export async function getAdminDashboard(
  token: string | null,
  params: { range?: DashboardRange; from?: string; to?: string } = {}
): Promise<DashboardData> {
  const q = new URLSearchParams();
  if (params.range) q.set('range', params.range);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const qs = q.toString();
  return apiRequest<DashboardData>(`/admin/dashboard${qs ? `?${qs}` : ''}`, {}, token);
}

export async function getRevenueTimeline(
  token: string | null,
  params: { range?: DashboardRange; from?: string; to?: string } = {}
): Promise<RevenuePoint[]> {
  const q = new URLSearchParams();
  if (params.range) q.set('range', params.range);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const qs = q.toString();
  const { revenueTimeline } = await apiRequest<{ revenueTimeline: RevenuePoint[] }>(`/admin/dashboard/revenue-timeline${qs ? `?${qs}` : ''}`, {}, token);
  return revenueTimeline;
}

export async function getCategoryRevenue(
  token: string | null,
  params: { range?: DashboardRange; from?: string; to?: string } = {}
): Promise<CategoryRevenue[]> {
  const q = new URLSearchParams();
  if (params.range) q.set('range', params.range);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const qs = q.toString();
  const { categoryRevenue } = await apiRequest<{ categoryRevenue: CategoryRevenue[] }>(`/admin/dashboard/category-revenue${qs ? `?${qs}` : ''}`, {}, token);
  return categoryRevenue;
}

export type ProfitPoint = { date: string; revenue: number; cost: number; profit: number };

export type ProductProfit = {
  productId: number;
  name: string;
  slug: string;
  primaryImage: string | null;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
};

export type ProfitInventory = {
  costValue: number;
  retailValue: number;
  productsCounted: number;
  productsMissingCost: number;
};

export type ProfitPrevious = {
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  /** null when the previous period is 0 (no baseline to compare against). */
  changePercent: { revenue: number | null; profit: number | null };
};

export type ProfitLossData = {
  range: { start: string; end: string; bucket: 'day' | 'month' };
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  timeline: ProfitPoint[];
  topProfit: ProductProfit[];
  topLoss: ProductProfit[];
  missingCostItems: number;
  missingCostProducts: number;
  missingCostSamples: string[];
  inventory: ProfitInventory;
  previous: ProfitPrevious;
};

export async function getProfitLoss(
  token: string | null,
  params: { range?: DashboardRange; from?: string; to?: string } = {}
): Promise<ProfitLossData> {
  const q = new URLSearchParams();
  if (params.range) q.set('range', params.range);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const qs = q.toString();
  return apiRequest<ProfitLossData>(`/admin/dashboard/profit-loss${qs ? `?${qs}` : ''}`, {}, token);
}
