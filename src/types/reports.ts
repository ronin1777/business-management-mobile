export type ReportDirection =
  | "up"
  | "down"
  | "unchanged";

export type ReportComparison = {
  current: string;
  previous: string;
  percentage_change: string | null;
  direction: ReportDirection;
};

export type ReportPeriodRange = {
  date_from: string;
  date_to: string;
};

export type ReportPeriods = {
  current: ReportPeriodRange;
  previous: ReportPeriodRange;
};

/* -------------------------------------------------------------------------- */
/*                                   Sales                                    */
/* -------------------------------------------------------------------------- */

export type SalesSummary = {
  total_sales: ReportComparison;
  order_count: ReportComparison;
  average_order_value: ReportComparison;
};

export type DailySales = {
  date: string;
  sales: string;
  order_count: number;
};

export type SalesTopProduct = {
  product_id: number;
  product_name: string;
  quantity_sold: string;
  sales: string;
};

export type SalesReport = {
  period: ReportPeriods;
  summary: SalesSummary;
  daily_sales: DailySales[];
  top_products: SalesTopProduct[];
};

/* -------------------------------------------------------------------------- */
/*                                  Purchases                                 */
/* -------------------------------------------------------------------------- */

export type PurchaseSummary = {
  total_purchases: ReportComparison;
  purchase_count: ReportComparison;
  average_purchase_value: ReportComparison;
};

export type DailyPurchase = {
  date: string;
  purchases: string;
  purchase_count: number;
};

export type PurchaseTopIngredient = {
  ingredient_id: number;
  ingredient_name: string;
  quantity_purchased: string;
  purchases: string;
};

export type PurchaseReport = {
  period: ReportPeriods;
  summary: PurchaseSummary;
  daily_purchases: DailyPurchase[];
  top_ingredients: PurchaseTopIngredient[];
};

/* -------------------------------------------------------------------------- */
/*                               Profitability                                */
/* -------------------------------------------------------------------------- */

export type ProfitabilitySummary = {
  total_sales: ReportComparison;
  total_material_cost: ReportComparison;
  gross_profit: ReportComparison;
  gross_margin: ReportComparison;
  order_count: ReportComparison;
  average_order_value: ReportComparison;
};

export type DailyProfitability = {
  date: string;
  sales: string;
  material_cost: string;
  gross_profit: string;
  order_count: number;
};

export type ProfitabilityTopProduct = {
  product_id: number;
  product_name: string;
  quantity_sold: string;
  sales: string;
  material_cost: string;
  gross_profit: string;
  gross_margin: string;
};

export type ProfitabilityReport = {
  period: ReportPeriods;
  summary: ProfitabilitySummary;
  daily_profitability: DailyProfitability[];
  top_products: ProfitabilityTopProduct[];
};

/* -------------------------------------------------------------------------- */
/*                                  Inventory                                 */
/* -------------------------------------------------------------------------- */

export type InventorySummary = {
  ingredient_count: number;
  total_inventory_value: string;
  out_of_stock_count: number;
  low_stock_count: number;
};

export type InventoryByUnitType = {
  unit_type: string;
  ingredient_count: number;
  inventory_value: string;
  stock: string;
};

export type InventoryIngredient = {
  id: number;
  name: string;
  unit_type: string;
  base_unit: string;
  current_stock: string;
  minimum_stock: string;
  current_inventory_value: string;
  average_unit_cost: string;
  is_active: boolean;
  is_out_of_stock: boolean;
  is_low_stock: boolean;
};

export type InventoryReport = {
  summary: InventorySummary;
  by_unit_type: InventoryByUnitType[];
  ingredients: InventoryIngredient[];
};

/* -------------------------------------------------------------------------- */
/*                                  Customers                                 */
/* -------------------------------------------------------------------------- */

export type CustomerSummary = {
  total_customers: number;
  active_customers: number;
  customers_with_receivable: number;
  total_receivables: string;
};

export type TopCustomerBySales = {
  customer_id: number;
  customer_name: string;
  total_sales: string;
};

export type TopCustomerByBalance = {
  customer_id: number;
  customer_name: string;
  balance: string;
};

export type CustomerReport = {
  summary: CustomerSummary;
  top_customers_by_sales: TopCustomerBySales[];
  top_customers_by_balance: TopCustomerByBalance[];
};

/* -------------------------------------------------------------------------- */
/*                                  Suppliers                                 */
/* -------------------------------------------------------------------------- */

export type SupplierSummary = {
  total_suppliers: number;
  active_suppliers: number;
  suppliers_with_payable: number;
  total_payables: string;
};

export type TopSupplierByPurchases = {
  supplier_id: number;
  supplier_name: string;
  total_purchases: string;
};

export type TopSupplierByBalance = {
  supplier_id: number;
  supplier_name: string;
  balance: string;
};

export type SupplierReport = {
  summary: SupplierSummary;
  top_suppliers_by_purchases: TopSupplierByPurchases[];
  top_suppliers_by_balance: TopSupplierByBalance[];
};

/* -------------------------------------------------------------------------- */
/*                              API Response Types                            */
/* -------------------------------------------------------------------------- */

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

/* Date-based reports */

export type SalesReportResponse =
  ApiResponse<SalesReport>;

export type PurchaseReportResponse =
  ApiResponse<PurchaseReport>;

export type ProfitabilityReportResponse =
  ApiResponse<ProfitabilityReport>;

/* Non-date reports */

export type InventoryReportResponse =
  ApiResponse<InventoryReport>;

export type CustomerReportResponse =
  ApiResponse<CustomerReport>;

export type SupplierReportResponse =
  ApiResponse<SupplierReport>;