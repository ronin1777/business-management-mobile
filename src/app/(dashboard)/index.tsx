import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { BusinessInsights } from "@/components/dashboard/BusinessInsights";
import { SalesProfitChart } from "@/components/dashboard/SalesProfitChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { InventoryOverview } from "@/components/dashboard/InventoryOverview";
import { CustomerReceivables } from "@/components/dashboard/CustomerReceivables";
import { SupplierPayables } from "@/components/dashboard/SupplierPayables";
import { RecentOrders } from "@/components/dashboard/RecentOrders";

import { getDashboard } from "@/services/api/dashboard";

import type { DashboardData } from "@/types/dashboard";

import {
  formatPersianDate,
  getDateRangeFromPreset,
  type DateRangePreset,
} from "@/utils/date";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoney(value: number): string {
  return `${formatNumber(value)} تومان`;
}

export default function DashboardScreen() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [preset, setPreset] =
    useState<DateRangePreset>(
      "last_30_days",
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const { dateFrom, dateTo } =
          getDateRangeFromPreset(preset);

        const response = await getDashboard({
          dateFrom,
          dateTo,
        });

        if (!mounted) {
          return;
        }

        if (!response.success || !response.data) {
          setError(
            response.message ||
              "اطلاعات داشبورد دریافت نشد.",
          );
          return;
        }

        setDashboard(response.data);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت اطلاعات داشبورد رخ داد.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [preset]);

  if (loading && !dashboard) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات داشبورد...
        </Text>
      </View>
    );
  }

  if (error && !dashboard) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          خطا در دریافت اطلاعات
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          اطلاعاتی برای نمایش وجود ندارد.
        </Text>
      </View>
    );
  }

  const { kpis, inventory } = dashboard;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
      overScrollMode="always"
    >
      {/* Header */}

      <DashboardHeader
        preset={preset}
        onPresetChange={setPreset}
      />

      {/* Refreshing */}

      {loading && (
        <View style={styles.refreshing}>
          <ActivityIndicator size="small" />

          <Text style={styles.refreshingText}>
            در حال به‌روزرسانی...
          </Text>
        </View>
      )}

      {/* Inline Error */}

      {error && (
        <View style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>
            {error}
          </Text>
        </View>
      )}

      {/* Period */}

      <View style={styles.periodContainer}>
        <Text style={styles.period}>
          {formatPersianDate(
            dashboard.period.date_from,
          )}{" "}
          تا{" "}
          {formatPersianDate(
            dashboard.period.date_to,
          )}
        </Text>
      </View>

      {/* KPIs */}

      <View style={styles.kpiSection}>
        <KpiCard
          title="فروش"
          metric={kpis.sales}
          value={formatMoney(
            kpis.sales.current,
          )}
          icon="wallet-outline"
        />

        <View style={styles.kpiRow}>
          <View style={styles.kpiHalf}>
            <KpiCard
              title="سفارش‌ها"
              metric={kpis.orders}
              value={formatNumber(
                kpis.orders.current,
              )}
              icon="receipt-outline"
              compact
            />
          </View>

          <View style={styles.kpiHalf}>
            <KpiCard
              title="سود ناخالص"
              metric={kpis.gross_profit}
              value={formatMoney(
                kpis.gross_profit.current,
              )}
              icon="trending-up-outline"
              compact
            />
          </View>
        </View>

        <KpiCard
          title="حاشیه سود"
          metric={kpis.gross_margin}
          value={`${formatNumber(
            kpis.gross_margin.current,
          )}٪`}
          icon="pie-chart-outline"
        />
      </View>

      {/* Sales / Profit Chart */}

      <View style={styles.chartContainer}>
        <SalesProfitChart
          sales={dashboard.trends.sales}
          grossProfit={
            dashboard.trends.gross_profit
          }
        />
      </View>

      {/* Top Products */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          پرفروش‌ترین محصولات
        </Text>

        <TopProducts
          products={
            dashboard.products.top_by_sales
          }
          formatNumber={formatNumber}
          formatMoney={formatMoney}
        />
      </View>

      {/* Inventory */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          وضعیت موجودی
        </Text>

        <Text style={styles.sectionDescription}>
          خلاصه وضعیت مواد اولیه و ارزش موجودی
        </Text>

        <InventoryOverview
          inventory={inventory}
          formatNumber={formatNumber}
          formatMoney={formatMoney}
        />
      </View>

      {/* Customers / Suppliers */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          مطالبات و بدهی‌ها
        </Text>

        <Text style={styles.sectionDescription}>
          وضعیت مالی مشتریان و تأمین‌کنندگان
        </Text>

        <View style={styles.financialCards}>
          <View style={styles.financialCard}>
            <Text style={styles.financialCardTitle}>
              مطالبات مشتریان
            </Text>

            <CustomerReceivables
              customers={
                dashboard.customers
                  .top_by_balance
              }
              formatNumber={formatNumber}
              formatMoney={formatMoney}
            />
          </View>

          <View style={styles.financialCard}>
            <Text style={styles.financialCardTitle}>
              بدهی تأمین‌کنندگان
            </Text>

            <SupplierPayables
              suppliers={
                dashboard.suppliers
                  .top_by_balance
              }
              formatNumber={formatNumber}
              formatMoney={formatMoney}
            />
          </View>
        </View>
      </View>

      {/* Recent Orders */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          سفارش‌های اخیر
        </Text>

        <Text style={styles.sectionDescription}>
          آخرین سفارش‌های ثبت‌شده
        </Text>

        <RecentOrders
          orders={dashboard.recent_orders}
        />
      </View>

      {/* Business Insights */}

        <View style={styles.section}>
              <BusinessInsights
          insights={dashboard.insights}
/>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  contentContainer: {
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
  },

  refreshing: {
    minHeight: 36,
    paddingHorizontal: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },

  refreshingText: {
    fontSize: 12,
    color: "#737373",
  },

  inlineError: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  inlineErrorText: {
    fontSize: 12,
    color: "#b91c1c",
    textAlign: "right",
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    textAlign: "center",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
  },

  periodContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  period: {
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "right",
  },

  // -------------------------
  // KPI
  // -------------------------

  kpiSection: {
    paddingHorizontal: 20,
    gap: 12,
  },

  kpiRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },

  kpiHalf: {
    flex: 1,
  },

  // -------------------------
  // Chart
  // -------------------------

  chartContainer: {
    paddingBottom: 20,
    overflow: "visible",
  },

  // -------------------------
  // Sections
  // -------------------------

  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    marginBottom: 6,
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  sectionDescription: {
    marginBottom: 12,
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "right",
  },

  // -------------------------
  // Financial
  // -------------------------

  financialCards: {
    gap: 12,
  },

  financialCard: {
    width: "100%",
  },

  financialCardTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  // -------------------------
  // Empty
  // -------------------------

  emptyCard: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },

  // -------------------------
  // Insights
  // -------------------------

  insightCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },

  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  insightMessage: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 21,
    color: "#737373",
    textAlign: "right",
  },
});