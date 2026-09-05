import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PurchaseChart from "./purchase-chart";
import {
  BarChart3,
  ShoppingCart,
  TrendingDown,
  Wallet,
} from "lucide-react-native";

import ReportKpiCard from "@/components/reports/shared/report-kpi-card";
import { getPurchaseReport } from "@/services/api/reports";

import type {
  PurchaseReport as PurchaseReportData,
} from "@/types/reports";

type PurchaseReportProps = {
  dateFrom: string;
  dateTo: string;
};

function formatNumber(value: string): string {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("fa-IR").format(number);
}

function formatCurrency(value: string): string {
  return `${formatNumber(value)} تومان`;
}

export default function PurchaseReport({
  dateFrom,
  dateTo,
}: PurchaseReportProps) {
  const [report, setReport] =
    useState<PurchaseReportData | null>(null);

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
          await getPurchaseReport({
            dateFrom,
            dateTo,
          });

        console.log("PURCHASE REPORT:", {
  dateFrom,
  dateTo,
});

        if (!response.success) {
          throw new Error(
            response.message ||
              "دریافت گزارش خرید ناموفق بود.",
          );
        }

        setReport(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت گزارش خرید رخ داد.",
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
          در حال دریافت گزارش خرید...
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
      {/* خلاصه خرید */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <BarChart3
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            خلاصه خرید
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          عملکرد خرید در بازه انتخاب‌شده
        </Text>
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="خرید کل"
          value={formatCurrency(
            report.summary.total_purchases.current,
          )}
          comparison={
            report.summary.total_purchases
          }
        />

        <ReportKpiCard
          title="تعداد خرید"
          value={formatNumber(
            report.summary.purchase_count.current,
          )}
          comparison={
            report.summary.purchase_count
          }
        />
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="میانگین ارزش خرید"
          value={formatCurrency(
            report.summary.average_purchase_value
              .current,
          )}
          comparison={
            report.summary
              .average_purchase_value
          }
        />

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <TrendingDown
              size={18}
              color="#525252"
              strokeWidth={1.8}
            />
          </View>

          <Text style={styles.infoTitle}>
            وضعیت خرید
          </Text>

          <Text style={styles.infoText}>
            {report.summary.total_purchases
              .direction === "up"
              ? "میزان خرید نسبت به دوره قبل افزایش داشته است."
              : report.summary.total_purchases
                    .direction === "down"
                ? "میزان خرید نسبت به دوره قبل کاهش داشته است."
                : "میزان خرید نسبت به دوره قبل تغییر محسوسی نداشته است."}
          </Text>
        </View>
      </View>

      {/* روند خرید */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Wallet
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            روند خرید
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          خرید روزانه و تعداد خریدها
        </Text>
      </View>

      <PurchaseChart
  data={report.daily_purchases}
/>

      {/* مواد اولیه */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ShoppingCart
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            مواد اولیه با بیشترین خرید
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          موادی که بیشترین میزان خرید را داشته‌اند
        </Text>
      </View>

      <View style={styles.ingredientsCard}>
        {report.top_ingredients.length === 0 ? (
          <Text style={styles.emptyText}>
            ماده اولیه‌ای برای نمایش وجود ندارد.
          </Text>
        ) : (
          report.top_ingredients
            .slice(0, 5)
            .map((ingredient, index) => (
              <View
                key={ingredient.ingredient_id}
                style={[
                  styles.ingredientRow,
                  index <
                    Math.min(
                      report.top_ingredients.length,
                      5,
                    ) - 1 &&
                    styles.ingredientRowBorder,
                ]}
              >
                <View style={styles.ingredientRank}>
                  <Text style={styles.ingredientRankText}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.ingredientInfo}>
                  <Text
                    style={styles.ingredientName}
                    numberOfLines={1}
                  >
                    {ingredient.ingredient_name}
                  </Text>

                  <Text
                    style={styles.ingredientQuantity}
                  >
                    مقدار خرید:{" "}
                    {formatNumber(
                      ingredient.quantity_purchased,
                    )}
                  </Text>
                </View>

                <Text style={styles.ingredientPurchases}>
                  {formatCurrency(
                    ingredient.purchases,
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
    minWidth: 0,
    minHeight: 116,
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

  ingredientsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  ingredientRow: {
    minHeight: 68,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  ingredientRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  ingredientRank: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  ingredientRankText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
  },

  ingredientInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  ingredientName: {
    width: "100%",
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  ingredientQuantity: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  ingredientPurchases: {
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