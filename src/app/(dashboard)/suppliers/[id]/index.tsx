
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  getSupplier,
  getSupplierAccount,
  getSupplierTransactions,
} from "@/services/api/suppliers";

import type {
  SupplierAccount,
  SupplierDetail,
  SupplierTransaction,
} from "@/types/suppliers";

export default function SupplierDetailScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const supplierId = Number(id);

  const [supplier, setSupplier] =
    useState<SupplierDetail | null>(null);

  const [account, setAccount] =
    useState<SupplierAccount | null>(null);

  const [transactions, setTransactions] =
    useState<SupplierTransaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadSupplier = useCallback(
    async (isRefresh = false) => {
      if (!supplierId || Number.isNaN(supplierId)) {
        setError("شناسه تأمین‌کننده نامعتبر است.");
        setLoading(false);
        return;
      }

      try {
        setError(null);

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [
          supplierResponse,
          accountResponse,
          transactionsResponse,
        ] = await Promise.all([
          getSupplier(supplierId),
          getSupplierAccount(supplierId),
          getSupplierTransactions({
            supplier: supplierId,
            page: 1,
            pageSize: 10,
            ordering: "-created_at",
          }),
        ]);

        setSupplier(supplierResponse.data);
        setAccount(accountResponse.data);
        setTransactions(
          transactionsResponse.data.results,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "دریافت اطلاعات تأمین‌کننده با خطا مواجه شد.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supplierId],
  );

  useEffect(() => {
    loadSupplier();
  }, [loadSupplier]);

  const handleRefresh = () => {
    loadSupplier(true);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(
      amount,
    );
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات...
        </Text>
      </View>
    );
  }

  if (error && !supplier) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          onPress={() => loadSupplier()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          تأمین‌کننده پیدا نشد.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {supplier.name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              supplier.is_active
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                supplier.is_active
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {supplier.is_active
                ? "فعال"
                : "غیرفعال"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname:
                "/(dashboard)/suppliers/[id]/edit",
              params: {
                id: String(supplier.id),
              },
            })
          }
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>
            ویرایش
          </Text>
        </Pressable>
      </View>

      {/* Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          اطلاعات تأمین‌کننده
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            نام
          </Text>

          <Text style={styles.infoValue}>
            {supplier.name}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            شماره تماس
          </Text>

          <Text style={styles.infoValue}>
            {supplier.phone || "ثبت نشده"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            تاریخ ایجاد
          </Text>

          <Text style={styles.infoValue}>
            {formatDate(supplier.created_at)}
          </Text>
        </View>
      </View>

      {/* Account */}
      {account && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            وضعیت حساب
          </Text>

          <View style={styles.accountRow}>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>
                بدهکار
              </Text>

              <Text style={styles.accountValue}>
                {formatAmount(account.debit)}
              </Text>
            </View>

            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>
                بستانکار
              </Text>

              <Text style={styles.accountValue}>
                {formatAmount(account.credit)}
              </Text>
            </View>
          </View>

          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>
              مانده حساب
            </Text>

            <Text style={styles.balanceValue}>
              {formatAmount(account.balance)}
            </Text>

            {account.direction && (
              <Text style={styles.directionText}>
                {account.direction}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>
            تراکنش‌های اخیر
          </Text>

          {transactions.length > 0 && (
            <Pressable
              onPress={() =>
                router.push({
                  pathname:
                    "/(dashboard)/suppliers/transactions/[id]",
                  params: {
                    id: String(supplier.id),
                  },
                })
              }
            >
              <Text style={styles.linkText}>
                مشاهده همه
              </Text>
            </Pressable>
          )}
        </View>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>
            هنوز تراکنشی برای این تأمین‌کننده ثبت نشده است.
          </Text>
        ) : (
          transactions.map((transaction, index) => (
            <Pressable
              key={transaction.id}
              onPress={() =>
                router.push({
                  pathname:
                    "/(dashboard)/suppliers/transactions/[id]",
                  params: {
                    id: String(transaction.id),
                  },
                })
              }
              style={[
                styles.transactionRow,
                index < transactions.length - 1 &&
                  styles.transactionBorder,
              ]}
            >
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>
                  {
                    transaction.transaction_type_display
                  }
                </Text>

                <Text style={styles.transactionDate}>
                  {formatDate(
                    transaction.created_at,
                  )}
                </Text>
              </View>

              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>
                  {formatAmount(transaction.amount)}
                </Text>

                <Text style={styles.directionSmall}>
                  {transaction.direction_display}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {error && supplier && (
        <Text style={styles.inlineError}>
          {error}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },

  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },

  inlineError: {
    fontSize: 13,
    color: "#dc2626",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 12,
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },

  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    gap: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#f1f5f9",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#64748b",
  },

  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  infoLabel: {
    fontSize: 13,
    color: "#64748b",
  },

  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 14,
  },

  accountRow: {
    flexDirection: "row",
    gap: 12,
  },

  accountItem: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },

  accountLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },

  accountValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },

  balanceBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },

  balanceLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },

  balanceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },

  directionText: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
  },

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  transactionInfo: {
    flex: 1,
    gap: 5,
  },

  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },

  transactionDate: {
    fontSize: 11,
    color: "#94a3b8",
  },

  transactionAmount: {
    alignItems: "flex-end",
    marginLeft: 12,
  },

  amountText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },

  directionSmall: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748b",
  },
});

