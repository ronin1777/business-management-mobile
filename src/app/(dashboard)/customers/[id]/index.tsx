
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  getCustomer,
  getCustomerAccount,
  getCustomerTransactions,
} from "@/services/api/customers";

import type {
  CustomerAccount,
  CustomerDetail,
  CustomerTransaction,
} from "@/types/customers";

const transactionTypeIcons: Record<
  string,
  keyof typeof Ionicons.glyphMap
> = {
  sale: "cart-outline",
  payment: "cash-outline",
  debit: "arrow-up-circle-outline",
  credit: "arrow-down-circle-outline",
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(
    Math.abs(amount),
  );
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getDirectionLabel(
  transaction: CustomerTransaction,
) {
  if (transaction.direction_display) {
    return transaction.direction_display;
  }

  if (transaction.direction === "debit") {
    return "بدهکار";
  }

  if (transaction.direction === "credit") {
    return "بستانکار";
  }

  return transaction.direction;
}

function getTransactionIcon(
  transaction: CustomerTransaction,
): keyof typeof Ionicons.glyphMap {
  return (
    transactionTypeIcons[
      transaction.transaction_type
    ] || "swap-horizontal-outline"
  );
}

export default function CustomerDetailScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id: string;
  }>();

  const customerId = Number(params.id);

  const [customer, setCustomer] =
    useState<CustomerDetail | null>(null);

  const [account, setAccount] =
    useState<CustomerAccount | null>(null);

  const [transactions, setTransactions] =
    useState<CustomerTransaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const loadData = useCallback(
    async (refresh = false) => {
      if (!Number.isFinite(customerId)) {
        setError("شناسه مشتری نامعتبر است.");
        setLoading(false);
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [
          customerResponse,
          accountResponse,
          transactionsResponse,
        ] = await Promise.all([
          getCustomer(customerId),

          getCustomerAccount(customerId),

          getCustomerTransactions({
            customer: customerId,
            page: 1,
            pageSize: 20,
            ordering: "-created_at",
          }),
        ]);

        setCustomer(customerResponse);

        setAccount(accountResponse.data);

        setTransactions(
          transactionsResponse.data.results,
        );
      } catch (err) {
        console.error(
          "LOAD CUSTOMER DETAIL ERROR:",
          err,
        );

        setError(
          "دریافت اطلاعات مشتری با خطا مواجه شد.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [customerId],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const balanceInfo = useMemo(() => {
    if (!account) {
      return {
        label: "بدون مانده",
        amount: 0,
        direction: null as string | null,
      };
    }

    if (account.balance > 0) {
      return {
        label:
          account.direction === "debit"
            ? "بدهکار"
            : account.direction === "credit"
              ? "بستانکار"
              : "مانده",
        amount: account.balance,
        direction: account.direction,
      };
    }

    return {
      label: "تسویه",
      amount: 0,
      direction: null as string | null,
    };
  }, [account]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />

        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات مشتری...
        </Text>
      </View>
    );
  }

  if (error || !customer) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#737373"
          />
        </View>

        <Text style={styles.errorTitle}>
          دریافت اطلاعات ناموفق بود
        </Text>

        <Text style={styles.errorDescription}>
          {error || "اطلاعات مشتری پیدا نشد."}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => loadData()}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#ffffff"
          />

          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.backRetryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.backRetryButtonText}>
            بازگشت
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
        />
      }
    >
      {/* Header */}

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-forward"
            size={21}
            color="#262626"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            جزئیات مشتری
          </Text>

          <Text style={styles.subtitle}>
            اطلاعات و حساب مشتری
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            router.push({
              pathname:
                "/(dashboard)/customers/[id]/edit",
              params: {
                id: String(customer.id),
              },
            });
          }}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color="#262626"
          />
        </Pressable>
      </View>

      {/* Customer Information */}

      <View style={styles.profileCard}>
        <View style={styles.profileIcon}>
          <Ionicons
            name="person-outline"
            size={27}
            color="#525252"
          />
        </View>

        <Text style={styles.customerName}>
          {customer.name}
        </Text>

        <View
          style={[
            styles.statusBadge,
            customer.is_active
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              customer.is_active
                ? styles.activeDot
                : styles.inactiveDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              customer.is_active
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {customer.is_active
              ? "فعال"
              : "غیرفعال"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="call-outline"
              size={17}
              color="#737373"
            />

            <Text style={styles.infoValue}>
              {customer.phone ||
                "بدون شماره تماس"}
            </Text>
          </View>
        </View>

        {customer.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>
              یادداشت
            </Text>

            <Text style={styles.noteText}>
              {customer.note}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Account */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          حساب مشتری
        </Text>
      </View>

      <View style={styles.accountCard}>
        <View style={styles.accountMain}>
          <Text style={styles.accountLabel}>
            مانده حساب
          </Text>

          <Text
            style={[
              styles.accountAmount,
              balanceInfo.direction ===
                "debit" && styles.debitAmount,
              balanceInfo.direction ===
                "credit" && styles.creditAmount,
            ]}
          >
            {formatAmount(
              balanceInfo.amount,
            )}{" "}
            تومان
          </Text>

          <Text style={styles.accountDirection}>
            {balanceInfo.label}
          </Text>
        </View>

        <View style={styles.accountDivider} />

        <View style={styles.accountItem}>
          <Text style={styles.smallLabel}>
            بدهکار
          </Text>

          <Text
            style={[
              styles.accountValue,
              styles.debitText,
            ]}
          >
            {formatAmount(
              account?.debit || 0,
            )}{" "}
            تومان
          </Text>
        </View>

        <View style={styles.accountItem}>
          <Text style={styles.smallLabel}>
            بستانکار
          </Text>

          <Text
            style={[
              styles.accountValue,
              styles.creditText,
            ]}
          >
            {formatAmount(
              account?.credit || 0,
            )}{" "}
            تومان
          </Text>
        </View>
      </View>

      {/* Transactions */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          تراکنش‌ها
        </Text>

        <Text style={styles.transactionCount}>
          {transactions.length} تراکنش
        </Text>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyTransactions}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="receipt-outline"
              size={25}
              color="#737373"
            />
          </View>

          <Text style={styles.emptyTitle}>
            تراکنشی ثبت نشده
          </Text>

          <Text style={styles.emptyDescription}>
            هنوز هیچ تراکنشی برای این مشتری ثبت نشده
            است.
          </Text>
        </View>
      ) : (
        <View style={styles.transactionsCard}>
          {transactions.map(
            (transaction, index) => {
              const isLast =
                index ===
                transactions.length - 1;

              const isDebit =
                transaction.direction ===
                "debit";

              return (
                <Pressable
                  key={transaction.id}
                  onPress={() => {
                    router.push({
                      pathname:
                        "/(dashboard)/customers/transactions/[id]",
                      params: {
                        id: String(
                          transaction.id,
                        ),
                      },
                    });
                  }}
                  style={({ pressed }) => [
                    styles.transactionRow,
                    !isLast &&
                      styles.transactionBorder,
                    pressed &&
                      styles.transactionPressed,
                  ]}
                >
                  {/* Transaction Icon */}

                  <View
                    style={[
                      styles.transactionIcon,
                      isDebit
                        ? styles.debitIcon
                        : styles.creditIcon,
                    ]}
                  >
                    <Ionicons
                      name={getTransactionIcon(
                        transaction,
                      )}
                      size={18}
                      color={
                        isDebit
                          ? "#b91c1c"
                          : "#15803d"
                      }
                    />
                  </View>

                  {/* Transaction Content */}

                  <View
                    style={
                      styles.transactionContent
                    }
                  >
                    <Text
                      style={
                        styles.transactionTitle
                      }
                      numberOfLines={1}
                    >
                      {
                        transaction.transaction_type_display
                      }
                    </Text>

                    <Text
                      style={
                        styles.transactionDate
                      }
                    >
                      {formatDate(
                        transaction.created_at,
                      )}
                    </Text>

                    {transaction.note ? (
                      <Text
                        style={
                          styles.transactionNote
                        }
                        numberOfLines={1}
                      >
                        {transaction.note}
                      </Text>
                    ) : null}
                  </View>

                  {/* Amount */}

                  <View
                    style={
                      styles.transactionAmountContainer
                    }
                  >
                    <Text
                      style={[
                        styles.transactionAmount,
                        isDebit
                          ? styles.debitText
                          : styles.creditText,
                      ]}
                    >
                      {isDebit ? "+" : "-"}
                      {formatAmount(
                        transaction.amount,
                      )}
                    </Text>

                    <Text
                      style={
                        styles.transactionDirection
                      }
                    >
                      {getDirectionLabel(
                        transaction,
                      )}
                    </Text>
                  </View>

                  {/* Arrow */}

                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color="#a3a3a3"
                  />
                </Pressable>
              );
            },
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
    gap: 10,
  },

  loadingText: {
    fontSize: 12,
    color: "#737373",
  },

  errorContainer: {
    flex: 1,
    paddingHorizontal: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },

  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#262626",
    textAlign: "center",
  },

  errorDescription: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#737373",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 15,
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  retryButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },

  backRetryButton: {
    marginTop: 9,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  backRetryButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#525252",
  },

  pressed: {
    opacity: 0.7,
  },

  header: {
    minHeight: 58,
    marginBottom: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  editButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    alignItems: "flex-end",
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#737373",
    textAlign: "right",
  },

  profileCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  profileIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },

  customerName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
    textAlign: "center",
  },

  statusBadge: {
    marginTop: 8,
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  activeBadge: {
    backgroundColor: "#f0fdf4",
  },

  inactiveBadge: {
    backgroundColor: "#f5f5f5",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    backgroundColor: "#16a34a",
  },

  inactiveDot: {
    backgroundColor: "#a3a3a3",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#737373",
  },

  infoRow: {
    width: "100%",
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "flex-end",
  },

  infoItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  infoValue: {
    fontSize: 12,
    color: "#525252",
  },

  noteBox: {
    width: "100%",
    marginTop: 12,
    padding: 11,
    borderRadius: 11,
    backgroundColor: "#fafafa",
    alignItems: "flex-end",
  },

  noteLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#737373",
  },

  noteText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 18,
    color: "#525252",
    textAlign: "right",
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 9,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#262626",
    textAlign: "right",
  },

  transactionCount: {
    fontSize: 10,
    color: "#737373",
  },

  accountCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },

  accountMain: {
    flex: 1.25,
    alignItems: "flex-end",
  },

  accountLabel: {
    fontSize: 10,
    color: "#737373",
  },

  accountAmount: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "900",
    color: "#262626",
    textAlign: "right",
  },

  debitAmount: {
    color: "#b91c1c",
  },

  creditAmount: {
    color: "#15803d",
  },

  accountDirection: {
    marginTop: 2,
    fontSize: 10,
    color: "#737373",
  },

  accountDivider: {
    width: 1,
    height: 55,
    backgroundColor: "#eeeeee",
  },

  accountItem: {
    flex: 1,
    alignItems: "flex-end",
  },

  smallLabel: {
    fontSize: 10,
    color: "#737373",
  },

  accountValue: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "800",
  },

  debitText: {
    color: "#b91c1c",
  },

  creditText: {
    color: "#15803d",
  },

  transactionsCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  transactionRow: {
    minHeight: 82,
    padding: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  transactionPressed: {
    backgroundColor: "#fafafa",
  },

  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  debitIcon: {
    backgroundColor: "#fef2f2",
  },

  creditIcon: {
    backgroundColor: "#f0fdf4",
  },

  transactionContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  transactionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#262626",
    textAlign: "right",
  },

  transactionDate: {
    marginTop: 3,
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  transactionNote: {
    marginTop: 3,
    fontSize: 9,
    color: "#737373",
    textAlign: "right",
  },

  transactionAmountContainer: {
    minWidth: 75,
    alignItems: "flex-end",
  },

  transactionAmount: {
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
  },

  transactionDirection: {
    marginTop: 3,
    fontSize: 9,
    color: "#a3a3a3",
  },

  emptyTransactions: {
    paddingVertical: 35,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#262626",
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 17,
    color: "#737373",
    textAlign: "center",
  },
});

