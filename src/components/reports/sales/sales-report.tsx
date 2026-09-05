import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SalesChart from "./sales-chart";
import {
  BarChart3,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react-native";

import ReportKpiCard from "@/components/reports/shared/report-kpi-card";
import { getSalesReport } from "@/services/api/reports";

import type {
  SalesReport as SalesReportData,
} from "@/types/reports";

type SalesReportProps = {
  dateFrom: string;
  dateTo: string;
};

function formatNumber(value: string): string {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("fa-IR").format(
    number,
  );
}

function formatCurrency(
  value: string,
): string {
  return `${formatNumber(value)} تومان`;
}

export default function SalesReport({
  dateFrom,
  dateTo,
}: SalesReportProps) {
  const [report, setReport] =
    useState<SalesReportData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadReport = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getSalesReport({
            dateFrom,
            dateTo,
          });

        if (!response.success) {
          throw new Error(
            response.message ||
              "دریافت گزارش فروش ناموفق بود.",
          );
        }

        setReport(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت گزارش فروش رخ داد.",
        );
      } finally {
        setLoading(false);
      }
    },
    [dateFrom, dateTo],
  );

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text style={styles.stateText}>
          در حال دریافت گزارش فروش...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <BarChart3
            size={22}
            color="#b91c1c"
            strokeWidth={1.8}
          />
        </View>

        <Text style={styles.errorTitle}>
          دریافت گزارش ناموفق بود
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>
          گزارشی برای نمایش وجود ندارد.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <BarChart3
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            خلاصه فروش
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          عملکرد فروش در بازه انتخاب‌شده
        </Text>
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="فروش کل"
          value={formatCurrency(
            report.summary.total_sales.current,
          )}
          comparison={
            report.summary.total_sales
          }
        />

        <ReportKpiCard
          title="تعداد سفارش"
          value={formatNumber(
            report.summary.order_count.current,
          )}
          comparison={
            report.summary.order_count
          }
        />
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="میانگین ارزش سفارش"
          value={formatCurrency(
            report.summary.average_order_value
              .current,
          )}
          comparison={
            report.summary
              .average_order_value
          }
        />

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <TrendingUp
              size={18}
              color="#525252"
              strokeWidth={1.8}
            />
          </View>

          <Text style={styles.infoTitle}>
            وضعیت فروش
          </Text>

          <Text style={styles.infoText}>
            {report.summary.total_sales
              .direction === "up"
              ? "فروش نسبت به دوره قبل افزایش داشته است."
              : report.summary.total_sales
                    .direction === "down"
                ? "فروش نسبت به دوره قبل کاهش داشته است."
                : "فروش نسبت به دوره قبل تغییر محسوسی نداشته است."}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Wallet
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            روند فروش
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          فروش روزانه و تعداد سفارش‌ها
        </Text>
      </View>

      <View style={styles.chartPlaceholder}>
        <BarChart3
          size={28}
          color="#a3a3a3"
          strokeWidth={1.6}
        />

        <Text style={styles.chartTitle}>
          نمودار فروش
        </Text>

        <Text style={styles.chartDescription}>
         <SalesChart data={report.daily_sales} />
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ShoppingCart
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            محصولات پرفروش
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          محصولاتی که بیشترین فروش را داشته‌اند
        </Text>
      </View>

      <View style={styles.productsCard}>
        {report.top_products.length === 0 ? (
          <Text style={styles.emptyText}>
            محصولی برای نمایش وجود ندارد.
          </Text>
        ) : (
          report.top_products
            .slice(0, 5)
            .map((product, index) => (
              <View
                key={product.product_id}
                style={[
                  styles.productRow,
                  index <
                    Math.min(
                      report.top_products.length,
                      5,
                    ) -
                      1 &&
                    styles.productRowBorder,
                ]}
              >
                <View
                  style={styles.productRank}
                >
                  <Text
                    style={styles.productRankText}
                  >
                    {index + 1}
                  </Text>
                </View>

                <View
                  style={styles.productInfo}
                >
                  <Text
                    style={styles.productName}
                    numberOfLines={1}
                  >
                    {product.product_name}
                  </Text>

                  <Text
                    style={styles.productQuantity}
                  >
                    مقدار فروش:{" "}
                    {formatNumber(
                      product.quantity_sold,
                    )}
                  </Text>
                </View>

                <Text
                  style={styles.productSales}
                >
                  {formatCurrency(
                    product.sales,
                  )}
                </Text>
              </View>
            ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },

  stateContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  stateText: {
    fontSize: 12,
    color: "#737373",
  },

  errorContainer: {
    marginTop: 8,
    minHeight: 180,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  errorTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991b1b",
  },

  errorText: {
    marginTop: 5,
    fontSize: 11,
    color: "#b91c1c",
    textAlign: "center",
    lineHeight: 18,
  },

  sectionHeader: {
    alignItems: "flex-end",
    marginBottom: 10,
    marginTop: 8,
  },

  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },

  sectionDescription: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  kpiRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  infoCard: {
    flex: 1,
    minHeight: 116,
    minWidth: 0,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "flex-end",
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
  },

  infoText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 17,
    color: "#737373",
    textAlign: "right",
  },

  chartPlaceholder: {
    minHeight: 220,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  chartTitle: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: "600",
    color: "#525252",
  },

  chartDescription: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
  },

  productsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  productRow: {
    minHeight: 68,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  productRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  productRank: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  productRankText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
  },

  productInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  productName: {
    width: "100%",
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  productQuantity: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  productSales: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "left",
  },

  emptyText: {
    paddingVertical: 24,
    textAlign: "center",
    fontSize: 11,
    color: "#a3a3a3",
  },
});