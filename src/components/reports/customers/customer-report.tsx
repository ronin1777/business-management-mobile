import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AlertCircle,
  CircleDollarSign,
  Crown,
  Users,
  Wallet,
} from "lucide-react-native";

import ReportKpiCard from "@/components/reports/shared/report-kpi-card";
import { getCustomerReport } from "@/services/api/reports";

import type {
  CustomerReport as CustomerReportData,
  TopCustomerByBalance,
  TopCustomerBySales,
} from "@/types/reports";

function formatNumber(
  value: string | number,
): string {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
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

function getBalanceStatus(
  balance: string,
): {
  label: string;
  backgroundColor: string;
  textColor: string;
} {
  const numericBalance = Number(balance);

  if (numericBalance > 0) {
    return {
      label: "بدهکار",
      backgroundColor: "#fef2f2",
      textColor: "#b91c1c",
    };
  }

  if (numericBalance < 0) {
    return {
      label: "بستانکار",
      backgroundColor: "#f0fdf4",
      textColor: "#166534",
    };
  }

  return {
    label: "تسویه",
    backgroundColor: "#f5f5f5",
    textColor: "#737373",
  };
}

function SalesCustomerCard({
  customer,
  rank,
}: {
  customer: TopCustomerBySales;
  rank: number;
}) {
  return (
    <View style={styles.customerRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>
          {formatNumber(rank)}
        </Text>
      </View>

      <View style={styles.customerInfo}>
        <Text
          style={styles.customerName}
          numberOfLines={1}
        >
          {customer.customer_name}
        </Text>

        <Text style={styles.customerMeta}>
          مجموع خرید
        </Text>
      </View>

      <View style={styles.customerValue}>
        <Text style={styles.salesValue}>
          {formatCurrency(
            customer.total_sales,
          )}
        </Text>
      </View>
    </View>
  );
}

function BalanceCustomerCard({
  customer,
  rank,
}: {
  customer: TopCustomerByBalance;
  rank: number;
}) {
  const status = getBalanceStatus(
    customer.balance,
  );

  return (
    <View style={styles.customerRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>
          {formatNumber(rank)}
        </Text>
      </View>

      <View style={styles.customerInfo}>
        <Text
          style={styles.customerName}
          numberOfLines={1}
        >
          {customer.customer_name}
        </Text>

        <View style={styles.balanceMeta}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  status.backgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: status.textColor,
                },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.customerValue}>
        <Text
          style={[
            styles.balanceValue,
            {
              color: status.textColor,
            },
          ]}
        >
          {formatCurrency(
            customer.balance,
          )}
        </Text>
      </View>
    </View>
  );
}

export default function CustomerReport() {
  const [report, setReport] =
    useState<CustomerReportData | null>(
      null,
    );

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
          await getCustomerReport();

        if (!response.success) {
          throw new Error(
            response.message ||
              "دریافت گزارش مشتریان ناموفق بود.",
          );
        }

        setReport(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت گزارش مشتریان رخ داد.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
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
          در حال دریافت گزارش مشتریان...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <AlertCircle
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
      {/* Summary */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Users
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            خلاصه مشتریان
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          وضعیت مشتریان و مطالبات کسب‌وکار
        </Text>
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="کل مشتریان"
          value={formatNumber(
            report.summary.total_customers,
          )}
        />

        <ReportKpiCard
          title="مشتریان فعال"
          value={formatNumber(
            report.summary.active_customers,
          )}
        />
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="دارای بدهی"
          value={formatNumber(
            report.summary
              .customers_with_receivable,
          )}
        />

        <ReportKpiCard
          title="مجموع مطالبات"
          value={formatCurrency(
            report.summary.total_receivables,
          )}
        />
      </View>

      {/* Receivable alert */}

      {Number(
        report.summary.total_receivables,
      ) > 0 && (
        <View style={styles.receivableCard}>
          <View style={styles.receivableIcon}>
            <Wallet
              size={19}
              color="#b91c1c"
              strokeWidth={1.8}
            />
          </View>

          <View style={styles.receivableContent}>
            <Text
              style={styles.receivableTitle}
            >
              مطالبات مشتریان
            </Text>

            <Text
              style={styles.receivableValue}
            >
              {formatCurrency(
                report.summary
                  .total_receivables,
              )}
            </Text>

            <Text
              style={styles.receivableDescription}
            >
              از {formatNumber(
                report.summary
                  .customers_with_receivable,
              )} مشتری
            </Text>
          </View>
        </View>
      )}

      {/* Top customers by sales */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Crown
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            مشتریان برتر
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          مشتریان با بیشترین میزان خرید
        </Text>
      </View>

      <View style={styles.listCard}>
        {report.top_customers_by_sales
          .length === 0 ? (
          <View style={styles.emptyState}>
            <Users
              size={22}
              color="#a3a3a3"
              strokeWidth={1.7}
            />

            <Text style={styles.emptyText}>
              اطلاعات فروش مشتریان وجود ندارد.
            </Text>
          </View>
        ) : (
          report.top_customers_by_sales
            .slice(0, 5)
            .map((customer, index) => (
              <SalesCustomerCard
                key={customer.customer_id}
                customer={customer}
                rank={index + 1}
              />
            ))
        )}
      </View>

      {/* Customers by balance */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <CircleDollarSign
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            وضعیت مانده حساب
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          مشتریان با بیشترین مانده حساب
        </Text>
      </View>

      <View style={styles.listCard}>
        {report.top_customers_by_balance
          .length === 0 ? (
          <View style={styles.emptyState}>
            <Wallet
              size={22}
              color="#a3a3a3"
              strokeWidth={1.7}
            />

            <Text style={styles.emptyText}>
              اطلاعات مانده حساب وجود ندارد.
            </Text>
          </View>
        ) : (
          report.top_customers_by_balance
            .slice(0, 5)
            .map((customer, index) => (
              <BalanceCustomerCard
                key={customer.customer_id}
                customer={customer}
                rank={index + 1}
              />
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

  receivableCard: {
    width: "100%",
    padding: 14,
    marginTop: 2,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  receivableIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },

  receivableContent: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  receivableTitle: {
    width: "100%",
    fontSize: 11,
    fontWeight: "500",
    color: "#991b1b",
    textAlign: "right",
  },

  receivableValue: {
    width: "100%",
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
    color: "#b91c1c",
    textAlign: "right",
  },

  receivableDescription: {
    width: "100%",
    marginTop: 2,
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  listCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    marginBottom: 22,
  },

  customerRow: {
    width: "100%",
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  rankText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
  },

  customerInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  customerName: {
    width: "100%",
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  customerMeta: {
    width: "100%",
    marginTop: 4,
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  balanceMeta: {
    marginTop: 5,
    flexDirection: "row-reverse",
  },

  statusBadge: {
    minHeight: 22,
    paddingHorizontal: 7,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "600",
  },

  customerValue: {
    minWidth: 92,
    alignItems: "flex-end",
  },

  salesValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  balanceValue: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "right",
  },

  emptyState: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "center",
  },
});