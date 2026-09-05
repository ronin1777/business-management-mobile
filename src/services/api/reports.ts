import { apiRequest } from "./client";

import type {
  CustomerReportResponse,
  InventoryReportResponse,
  ProfitabilityReportResponse,
  PurchaseReportResponse,
  SalesReportResponse,
  SupplierReportResponse,
} from "@/types/reports";

export type ReportDateRange = {
  dateFrom: string;
  dateTo: string;
};

function buildDateQuery({
  dateFrom,
  dateTo,
}: ReportDateRange): string {
  const searchParams = new URLSearchParams();

  searchParams.set("date_from", dateFrom);
  searchParams.set("date_to", dateTo);

  return searchParams.toString();
}

/* -------------------------------------------------------------------------- */
/*                                   Sales                                    */
/* -------------------------------------------------------------------------- */

export async function getSalesReport(
  params: ReportDateRange,
): Promise<SalesReportResponse> {
  const query = buildDateQuery(params);

  return apiRequest<SalesReportResponse>(
    `/reports/sales/?${query}`,
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Purchases                                 */
/* -------------------------------------------------------------------------- */

export async function getPurchaseReport(
  params: ReportDateRange,
): Promise<PurchaseReportResponse> {
  const query = buildDateQuery(params);

  console.log(
    "PURCHASE URL:",
    `/reports/purchases/?${query}`,
  );

  try {
    return await apiRequest<PurchaseReportResponse>(
      `/reports/purchases/?${query}`,
    );
  } catch (error) {
    console.log(
      "PURCHASE ERROR:",
      error,
    );

    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                               Profitability                                */
/* -------------------------------------------------------------------------- */

export async function getProfitabilityReport(
  params: ReportDateRange,
): Promise<ProfitabilityReportResponse> {
  const query = buildDateQuery(params);

  return apiRequest<ProfitabilityReportResponse>(
    `/reports/profitability/?${query}`,
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Inventory                                 */
/* -------------------------------------------------------------------------- */

export async function getInventoryReport(): Promise<InventoryReportResponse> {
  return apiRequest<InventoryReportResponse>(
    "/reports/inventory/",
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Customers                                 */
/* -------------------------------------------------------------------------- */

export async function getCustomerReport(): Promise<CustomerReportResponse> {
  return apiRequest<CustomerReportResponse>(
    "/reports/customers/",
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Suppliers                                 */
/* -------------------------------------------------------------------------- */

export async function getSupplierReport(): Promise<SupplierReportResponse> {
  return apiRequest<SupplierReportResponse>(
    "/reports/suppliers/",
  );
}