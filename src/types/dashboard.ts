
export type ComparisonDirection =
  | "up"
  | "down"
  | "unchanged";

export type ComparisonMetric = {
  current: number;
  previous: number | null;
  percentage_change: number | null;
  direction: ComparisonDirection;
};

export type DashboardPeriod = {
  date_from: string;
  date_to: string;
};

export type DashboardKpis = {
  sales: ComparisonMetric;
  purchases: ComparisonMetric;
  gross_profit: ComparisonMetric;
  gross_margin: ComparisonMetric;
  orders: ComparisonMetric;

  receivables: {
    current: number;
    previous: number | null;
    percentage_change: number | null;
    direction: ComparisonDirection;
  };

  payables: {
    current: number;
    previous: number | null;
    percentage_change: number | null;
    direction: ComparisonDirection;
  };

  inventory_value: {
    current: number;
  };
};

export type DashboardTrendItem = {
  date: string;
  value: number;
};

export type DashboardProductSales = {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  sales: number;
};

export type DashboardProductProfit = {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  sales: number;
  material_cost: number;
  gross_profit: number;
  gross_margin: number;
};

export type DashboardIngredient = {
  id: number;
  name: string;
  unit_type: string;
  base_unit: string;
  current_stock: number;
  minimum_stock: number;
  current_inventory_value: number;
  average_unit_cost: number;
  is_active: boolean;
  is_out_of_stock: boolean;
  is_low_stock: boolean;
};

export type DashboardInventory = {
  total_value: number;
  out_of_stock_count: number;
  low_stock_count: number;
  ingredients: DashboardIngredient[];
};

export type DashboardCustomer = {
  customer_id: number;
  customer_name: string;
  total_sales?: number;
  balance?: number;
};

export type DashboardSupplier = {
  supplier_id: number;
  supplier_name: string;
  total_purchases?: number;
  balance?: number;
};

export type DashboardRecentOrder = {
  id: number;
  customer_name: string;
  status: string;
  payment_status: string;
  ordered_at: string;
};

export type DashboardInsight = {
  type: string;
  severity:
    | "positive"
    | "info"
    | "warning"
    | "critical";
  title: string;
  message: string;
  metric: string;
};

export type DashboardData = {
  period: DashboardPeriod;

  kpis: DashboardKpis;

  trends: {
    sales: DashboardTrendItem[];
    gross_profit: DashboardTrendItem[];
    orders: DashboardTrendItem[];
  };

  products: {
    top_by_sales: DashboardProductSales[];
    top_by_profit: DashboardProductProfit[];
  };

  inventory: DashboardInventory;

  customers: {
    top_by_sales: DashboardCustomer[];
    top_by_balance: DashboardCustomer[];
  };

  suppliers: {
    top_by_purchases: DashboardSupplier[];
    top_by_balance: DashboardSupplier[];
  };

  recent_orders: DashboardRecentOrder[];

  insights: DashboardInsight[];
};

export type DashboardResponse = {
  success: boolean;
  data: DashboardData;
  message: string | null;
  errors: unknown;
};

