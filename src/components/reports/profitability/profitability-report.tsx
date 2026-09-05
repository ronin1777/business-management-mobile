import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BarChart3,
  CircleDollarSign,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import ProfitabilityChart from "./profitability-chart";
import ReportKpiCard from "@/components/reports/shared/report-kpi-card";
import { getProfitabilityReport } from "@/services/api/reports";

import type {
  ProfitabilityReport as ProfitabilityReportData,
} from "@/types/reports";

type ProfitabilityReportProps = {
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

function formatCurrency(value: string): string {
  return `${formatNumber(value)} تومان`;
}

export default function ProfitabilityReport({
  dateFrom,
  dateTo,
}: ProfitabilityReportProps) {
  const [report, setReport] =
    useState<ProfitabilityReportData | null>(null);

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
          await getProfitabilityReport({
            dateFrom,
            dateTo,
          });

        if (!response.success) {
          throw new Error(
            response.message ||
              "دریافت گزارش سودآوری ناموفق بود.",
          );
        }

        setReport(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت گزارش سودآوری رخ داد.",
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
          در حال دریافت گزارش سودآوری...
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

  const profitDirection =
    report.summary.gross_profit.direction;

  const marginDirection =
    report.summary.gross_margin.direction;

  return (
    <View style={styles.container}>
      {/* Summary */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <CircleDollarSign
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            خلاصه سودآوری
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          وضعیت درآمد، هزینه و سود در بازه انتخاب‌شده
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
          title="هزینه مواد اولیه"
          value={formatCurrency(
            report.summary.total_material_cost
              .current,
          )}
          comparison={
            report.summary.total_material_cost
          }
        />
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="سود ناخالص"
          value={formatCurrency(
            report.summary.gross_profit.current,
          )}
          comparison={
            report.summary.gross_profit
          }
        />

        <ReportKpiCard
          title="حاشیه سود"
          value={`${formatNumber(
            report.summary.gross_margin.current,
          )}%`}
          comparison={
            report.summary.gross_margin
          }
        />
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="تعداد سفارش"
          value={formatNumber(
            report.summary.order_count.current,
          )}
          comparison={
            report.summary.order_count
          }
        />

        <ReportKpiCard
          title="میانگین ارزش سفارش"
          value={formatCurrency(
            report.summary.average_order_value
              .current,
          )}
          comparison={
            report.summary.average_order_value
          }
        />
      </View>

      {/* Profitability status */}

      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <TrendingUp
            size={19}
            color="#525252"
            strokeWidth={1.8}
          />
        </View>

        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            وضعیت سودآوری
          </Text>

          <Text style={styles.statusText}>
            {profitDirection === "up"
              ? "سود ناخالص نسبت به دوره قبل افزایش داشته است."
              : profitDirection === "down"
                ? "سود ناخالص نسبت به دوره قبل کاهش داشته است."
                : "سود ناخالص نسبت به دوره قبل تغییر محسوسی نداشته است."}
          </Text>

          <Text style={styles.statusSubtext}>
            {marginDirection === "up"
              ? "حاشیه سود نیز بهبود پیدا کرده است."
              : marginDirection === "down"
                ? "حاشیه سود نسبت به دوره قبل کاهش داشته است."
                : "حاشیه سود نسبت به دوره قبل تغییر محسوسی نداشته است."}
          </Text>
        </View>
      </View>

      {/* Chart placeholder */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <BarChart3
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            روند سودآوری
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          فروش، هزینه مواد اولیه و سود ناخالص روزانه
        </Text>
      </View>

      <ProfitabilityChart
  data={report.daily_profitability}
/>

      {/* Top profitable products */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ShoppingCart
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            محصولات سودآور
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          محصولاتی که بیشترین سود ناخالص را ایجاد کرده‌اند
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
                <View style={styles.productRank}>
                  <Text style={styles.productRankText}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.productInfo}>
                  <Text
                    style={styles.productName}
                    numberOfLines={1}
                  >
                    {product.product_name}
                  </Text>

                  <Text
                    style={styles.productQuantity}
                  >
                    فروش:{" "}
                    {formatCurrency(
                      product.sales,
                    )}
                  </Text>

                  <Text
                    style={styles.productCost}
                  >
                    هزینه مواد:{" "}
                    {formatCurrency(
                      product.material_cost,
                    )}
                  </Text>
                </View>

                <View style={styles.productProfit}>
                  <Text
                    style={styles.productProfitValue}
                  >
                    {formatCurrency(
                      product.gross_profit,
                    )}
                  </Text>

                  <Text
                    style={styles.productMargin}
                  >
                    حاشیه سود{" "}
                    {formatNumber(
                      product.gross_margin,
                    )}
                    %
                  </Text>
                </View>
              </View>
            ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
    textAlign: "center",
  },

  errorContainer: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
    textAlign: "center",
  },

  errorText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "center",
  },

  sectionHeader: {
    alignItems: "flex-end",
    marginBottom: 10,
    marginTop: 4,
  },

  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
  },

  sectionDescription: {
    marginTop: 5,
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

  statusCard: {
    width: "100%",
    padding: 14,
    marginTop: 2,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  statusContent: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  statusTitle: {
    width: "100%",
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  statusText: {
    width: "100%",
    marginTop: 5,
    fontSize: 11,
    lineHeight: 18,
    color: "#525252",
    textAlign: "right",
  },

  statusSubtext: {
    width: "100%",
    marginTop: 3,
    fontSize: 10,
    lineHeight: 17,
    color: "#a3a3a3",
    textAlign: "right",
  },

  chartPlaceholder: {
    width: "100%",
    minHeight: 190,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  chartPlaceholderTitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  chartPlaceholderText: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 17,
    color: "#a3a3a3",
    textAlign: "center",
  },

  productsCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  productRow: {
    width: "100%",
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  productRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  productRank: {
    width: 28,
    height: 28,
    borderRadius: 9,
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
    minWidth: 0,
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
    width: "100%",
    marginTop: 4,
    fontSize: 10,
    color: "#737373",
    textAlign: "right",
  },

  productCost: {
    width: "100%",
    marginTop: 2,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  productProfit: {
    minWidth: 88,
    alignItems: "flex-end",
  },

  productProfitValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  productMargin: {
    marginTop: 4,
    fontSize: 9,
    color: "#737373",
    textAlign: "right",
  },

  emptyText: {
    padding: 20,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "center",
  },
});