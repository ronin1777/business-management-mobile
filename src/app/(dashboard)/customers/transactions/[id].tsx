
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { getCustomerTransaction } from "@/services/api/customers";
import type { CustomerTransaction } from "@/types/customers";

function formatAmount(amount: number) {
  return `${new Intl.NumberFormat("fa-IR").format(amount)} تومان`;
}

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function getTransactionIcon(transactionType: string) {
  switch (transactionType) {
    case "sale":
      return "🛒";

    case "payment":
      return "💳";

    case "refund":
      return "↩️";

    default:
      return "↔️";
  }
}

function getDirectionStyle(direction: string) {
  switch (direction) {
    case "debit":
      return styles.debitBadge;

    case "credit":
      return styles.creditBadge;

    default:
      return styles.neutralBadge;
  }
}

export default function CustomerTransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [transaction, setTransaction] =
    useState<CustomerTransaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransaction = useCallback(async () => {
    if (!id) {
      setError("شناسه تراکنش نامعتبر است.");
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const data = await getCustomerTransaction(
        Number(id),
      );

      setTransaction(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "خطا در دریافت اطلاعات تراکنش.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadTransaction();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات تراکنش...
        </Text>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          دریافت اطلاعات تراکنش ناموفق بود
        </Text>

        <Text style={styles.errorText}>
          {error ?? "تراکنش پیدا نشد."}
        </Text>

        <Pressable
          onPress={loadTransaction}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  }

  const directionStyle = getDirectionStyle(
    transaction.direction,
  );

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
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            جزئیات تراکنش
          </Text>

          <Text style={styles.subtitle}>
            اطلاعات کامل تراکنش مشتری
          </Text>
        </View>
      </View>

      {/* Main transaction card */}
      <View style={styles.mainCard}>
        <View style={styles.transactionIcon}>
          <Text style={styles.transactionIconText}>
            {getTransactionIcon(
              transaction.transaction_type,
            )}
          </Text>
        </View>

        <Text style={styles.transactionType}>
          {transaction.transaction_type_display}
        </Text>

        <Text style={styles.amount}>
          {formatAmount(transaction.amount)}
        </Text>

        <View
          style={[
            styles.directionBadge,
            directionStyle,
          ]}
        >
          <Text style={styles.directionText}>
            {transaction.direction_display}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          اطلاعات تراکنش
        </Text>

        <View style={styles.card}>
          <InfoRow
            label="نوع تراکنش"
            value={
              transaction.transaction_type_display
            }
          />

          <InfoRow
            label="جهت تراکنش"
            value={transaction.direction_display}
          />

          <InfoRow
            label="مبلغ"
            value={formatAmount(transaction.amount)}
          />

          <InfoRow
            label="تاریخ ثبت"
            value={formatDate(transaction.created_at)}
            last
          />
        </View>
      </View>

      {/* Related records */}
      {(transaction.order !== null ||
        transaction.payment !== null) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            اطلاعات مرتبط
          </Text>

          <View style={styles.card}>
            {transaction.order !== null && (
              <InfoRow
                label="سفارش"
                value={`#${transaction.order}`}
                onPress={() => {
                  router.push({
                    pathname:
                      "/(dashboard)/orders/[id]",
                    params: {
                      id: String(transaction.order),
                    },
                  });
                }}
              />
            )}

            {transaction.payment !== null && (
              <InfoRow
                label="پرداخت"
                value={`#${transaction.payment}`}
                last
              />
            )}
          </View>
        </View>
      )}

      {/* Note */}
      {transaction.note?.trim() && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            توضیحات
          </Text>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              {transaction.note}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  last?: boolean;
  onPress?: () => void;
};

function InfoRow({
  label,
  value,
  last = false,
  onPress,
}: InfoRowProps) {
  const content = (
    <View
      style={[
        styles.infoRow,
        !last && styles.infoRowBorder,
      ]}
    >
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,
          onPress && styles.linkValue,
        ]}
      >
        {value}
      </Text>

      {onPress && (
        <Text style={styles.rowArrow}>
          ‹
        </Text>
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) =>
        pressed && styles.pressed
      }
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fafafa",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
  },

  errorTitle: {
    fontSize: 16,
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

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#171717",
  },

  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  backIcon: {
    fontSize: 28,
    lineHeight: 30,
    color: "#171717",
  },

  headerText: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#171717",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#737373",
  },

  mainCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  transactionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },

  transactionIconText: {
    fontSize: 25,
  },

  transactionType: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
  },

  amount: {
    marginTop: 8,
    fontSize: 25,
    fontWeight: "800",
    color: "#171717",
  },

  directionBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  debitBadge: {
    backgroundColor: "#fef2f2",
  },

  creditBadge: {
    backgroundColor: "#f0fdf4",
  },

  neutralBadge: {
    backgroundColor: "#f5f5f5",
  },

  directionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  card: {
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  infoRow: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  infoLabel: {
    width: 100,
    fontSize: 13,
    color: "#737373",
    textAlign: "right",
  },

  infoValue: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    textAlign: "right",
  },

  linkValue: {
    color: "#404040",
  },

  rowArrow: {
    marginLeft: 8,
    fontSize: 22,
    color: "#a3a3a3",
  },

  noteCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  noteText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#404040",
    textAlign: "right",
  },

  pressed: {
    opacity: 0.7,
  },
});

