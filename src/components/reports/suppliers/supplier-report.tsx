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
  ShoppingCart,
  Truck,
  Wallet,
} from "lucide-react-native";

import ReportKpiCard from "@/components/reports/shared/report-kpi-card";
import { getSupplierReport } from "@/services/api/reports";

import type {
  SupplierReport as SupplierReportData,
  TopSupplierByBalance,
  TopSupplierByPurchases,
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

function PurchaseSupplierCard({
  supplier,
  rank,
}: {
  supplier: TopSupplierByPurchases;
  rank: number;
}) {
  return (
    <View style={styles.supplierRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>
          {formatNumber(rank)}
        </Text>
      </View>

      <View style={styles.supplierInfo}>
        <Text
          style={styles.supplierName}
          numberOfLines={1}
        >
          {supplier.supplier_name}
        </Text>

        <Text style={styles.supplierMeta}>
          مجموع خرید از تأمین‌کننده
        </Text>
      </View>

      <View style={styles.supplierValue}>
        <Text style={styles.purchaseValue}>
          {formatCurrency(
            supplier.total_purchases,
          )}
        </Text>
      </View>
    </View>
  );
}

function BalanceSupplierCard({
  supplier,
  rank,
}: {
  supplier: TopSupplierByBalance;
  rank: number;
}) {
  const status = getBalanceStatus(
    supplier.balance,
  );

  return (
    <View style={styles.supplierRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>
          {formatNumber(rank)}
        </Text>
      </View>

      <View style={styles.supplierInfo}>
        <Text
          style={styles.supplierName}
          numberOfLines={1}
        >
          {supplier.supplier_name}
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

      <View style={styles.supplierValue}>
        <Text
          style={[
            styles.balanceValue,
            {
              color: status.textColor,
            },
          ]}
        >
          {formatCurrency(
            supplier.balance,
          )}
        </Text>
      </View>
    </View>
  );
}

export default function SupplierReport() {
  const [report, setReport] =
    useState<SupplierReportData | null>(
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
          await getSupplierReport();

        if (!response.success) {
          throw new Error(
            response.message ||
              "دریافت گزارش تأمین‌کنندگان ناموفق بود.",
          );
        }

        setReport(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت گزارش تأمین‌کنندگان رخ داد.",
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
          در حال دریافت گزارش تأمین‌کنندگان...
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
          <Truck
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            خلاصه تأمین‌کنندگان
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          وضعیت تأمین‌کنندگان و بدهی‌های کسب‌وکار
        </Text>
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="کل تأمین‌کنندگان"
          value={formatNumber(
            report.summary.total_suppliers,
          )}
        />

        <ReportKpiCard
          title="تأمین‌کنندگان فعال"
          value={formatNumber(
            report.summary.active_suppliers,
          )}
        />
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="دارای بدهی"
          value={formatNumber(
            report.summary
              .suppliers_with_payable,
          )}
        />

        <ReportKpiCard
          title="مجموع بدهی"
          value={formatCurrency(
            report.summary.total_payables,
          )}
        />
      </View>

      {/* Payable alert */}

      {Number(
        report.summary.total_payables,
      ) > 0 && (
        <View style={styles.payableCard}>
          <View style={styles.payableIcon}>
            <Wallet
              size={19}
              color="#b91c1c"
              strokeWidth={1.8}
            />
          </View>

          <View style={styles.payableContent}>
            <Text style={styles.payableTitle}>
              بدهی به تأمین‌کنندگان
            </Text>

            <Text style={styles.payableValue}>
              {formatCurrency(
                report.summary.total_payables,
              )}
            </Text>

            <Text
              style={styles.payableDescription}
            >
              مربوط به{" "}
              {formatNumber(
                report.summary
                  .suppliers_with_payable,
              )}{" "}
              تأمین‌کننده
            </Text>
          </View>
        </View>
      )}

      {/* Top suppliers by purchases */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ShoppingCart
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            تأمین‌کنندگان برتر
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          تأمین‌کنندگانی که بیشترین خرید از آن‌ها انجام شده
        </Text>
      </View>

      <View style={styles.listCard}>
        {report.top_suppliers_by_purchases
          .length === 0 ? (
          <View style={styles.emptyState}>
            <Truck
              size={22}
              color="#a3a3a3"
              strokeWidth={1.7}
            />

            <Text style={styles.emptyText}>
              اطلاعات خرید تأمین‌کنندگان وجود ندارد.
            </Text>
          </View>
        ) : (
          report.top_suppliers_by_purchases
            .slice(0, 5)
            .map((supplier, index) => (
              <PurchaseSupplierCard
                key={supplier.supplier_id}
                supplier={supplier}
                rank={index + 1}
              />
            ))
        )}
      </View>

      {/* Suppliers by balance */}

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
          تأمین‌کنندگان با بیشترین مانده حساب
        </Text>
      </View>

      <View style={styles.listCard}>
        {report.top_suppliers_by_balance
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
          report.top_suppliers_by_balance
            .slice(0, 5)
            .map((supplier, index) => (
              <BalanceSupplierCard
                key={supplier.supplier_id}
                supplier={supplier}
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

  payableCard: {
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

  payableIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },

  payableContent: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  payableTitle: {
    width: "100%",
    fontSize: 11,
    fontWeight: "500",
    color: "#991b1b",
    textAlign: "right",
  },

  payableValue: {
    width: "100%",
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
    color: "#b91c1c",
    textAlign: "right",
  },

  payableDescription: {
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

  supplierRow: {
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

  supplierInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  supplierName: {
    width: "100%",
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  supplierMeta: {
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

  supplierValue: {
    minWidth: 92,
    alignItems: "flex-end",
  },

  purchaseValue: {
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