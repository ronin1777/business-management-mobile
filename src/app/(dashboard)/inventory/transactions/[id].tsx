import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getInventoryTransaction } from "@/services/api/inventory";
import type {
  InventoryTransactionDetail,
  InventoryTransactionType,
} from "@/types/inventory";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return `${formatNumber(value)} تومان`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getTransactionMeta(
  type: InventoryTransactionType,
) {
  switch (type) {
    case "purchase":
      return {
        label: "خرید",
        icon: "cart-outline" as const,
        background: "#f0fdf4",
        iconColor: "#15803d",
        valueColor: "#15803d",
        description:
          "ورود موجودی ناشی از خرید ماده اولیه",
      };

    case "order_usage":
      return {
        label: "مصرف سفارش",
        icon: "receipt-outline" as const,
        background: "#eff6ff",
        iconColor: "#2563eb",
        valueColor: "#2563eb",
        description:
          "مصرف ماده اولیه در فرآیند ثبت سفارش",
      };

    case "waste":
      return {
        label: "ضایعات",
        icon: "trash-outline" as const,
        background: "#fef2f2",
        iconColor: "#b91c1c",
        valueColor: "#b91c1c",
        description:
          "کاهش موجودی ناشی از ثبت ضایعات",
      };

    case "adjustment":
      return {
        label: "اصلاح موجودی",
        icon: "create-outline" as const,
        background: "#fffbeb",
        iconColor: "#a16207",
        valueColor: "#a16207",
        description:
          "تغییر دستی موجودی توسط کاربر",
      };

    case "reversal":
      return {
        label: "برگشت",
        icon: "return-down-back-outline" as const,
        background: "#f5f5f5",
        iconColor: "#525252",
        valueColor: "#525252",
        description:
          "برگشت یا معکوس شدن یک تراکنش قبلی",
      };

    default:
      return {
        label: "تراکنش",
        icon: "swap-horizontal-outline" as const,
        background: "#f5f5f5",
        iconColor: "#525252",
        valueColor: "#525252",
        description: "تراکنش موجودی انبار",
      };
  }
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        numberOfLines={2}
        style={styles.infoValue}
      >
        {value}
      </Text>
    </View>
  );
}

export default function InventoryTransactionDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
  }>();

  const transactionId = Number(params.id);

  const [transaction, setTransaction] =
    useState<InventoryTransactionDetail | null>(
      null,
    );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const loadTransaction = useCallback(
    async (isRefresh = false) => {
      if (
        !Number.isInteger(transactionId) ||
        transactionId <= 0
      ) {
        setError("شناسه تراکنش نامعتبر است.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const response =
          await getInventoryTransaction(
            transactionId,
          );

        setTransaction(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "دریافت اطلاعات تراکنش با خطا مواجه شد.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [transactionId],
  );

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.errorScreen}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={27}
            color="#b91c1c"
          />
        </View>

        <Text style={styles.errorTitle}>
          دریافت تراکنش ناموفق بود
        </Text>

        <Text style={styles.errorMessage}>
          {error || "اطلاعات تراکنش پیدا نشد."}
        </Text>

        <View style={styles.errorActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => loadTransaction()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              تلاش مجدد
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.backActionButton}
          >
            <Text style={styles.backActionText}>
              بازگشت
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const meta = getTransactionMeta(
    transaction.transaction_type,
  );

  const quantityIsPositive =
    transaction.quantity >= 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTransaction(true)}
            tintColor="#525252"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-forward"
              size={21}
              color="#404040"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              جزئیات تراکنش
            </Text>

            <Text style={styles.subtitle}>
              تراکنش #{formatNumber(transaction.id)}
            </Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View
            style={[
              styles.heroIcon,
              {
                backgroundColor: meta.background,
              },
            ]}
          >
            <Ionicons
              name={meta.icon}
              size={25}
              color={meta.iconColor}
            />
          </View>

          <Text style={styles.heroTitle}>
            {transaction.transaction_type_display ||
              meta.label}
          </Text>

          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: meta.background,
              },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                {
                  color: meta.iconColor,
                },
              ]}
            >
              {meta.label}
            </Text>
          </View>

          <Text style={styles.heroDescription}>
            {meta.description}
          </Text>
        </View>

        {/* Quantity */}
        <View style={styles.quantityCard}>
          <View style={styles.quantityHeader}>
            <Text style={styles.sectionTitle}>
              تغییر موجودی
            </Text>

            <Ionicons
              name="layers-outline"
              size={18}
              color="#737373"
            />
          </View>

          <Text
            style={[
              styles.quantityValue,
              {
                color: meta.valueColor,
              },
            ]}
          >
            {quantityIsPositive ? "+" : ""}
            {formatNumber(transaction.quantity)}
          </Text>

          <Text style={styles.quantityUnit}>
            واحد ماده اولیه
          </Text>
        </View>

        {/* Ingredient */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>
              ماده اولیه
            </Text>

            <Ionicons
              name="cube-outline"
              size={18}
              color="#737373"
            />
          </View>

          <View style={styles.ingredientBlock}>
            <View style={styles.ingredientIcon}>
              <Ionicons
                name="cube-outline"
                size={21}
                color="#525252"
              />
            </View>

            <View style={styles.ingredientContent}>
              <Text style={styles.ingredientName}>
                {transaction.ingredient_name}
              </Text>

              <Text style={styles.ingredientId}>
                شناسه ماده اولیه:{" "}
                {formatNumber(
                  transaction.ingredient,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Financial */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>
              اطلاعات مالی
            </Text>

            <Ionicons
              name="cash-outline"
              size={18}
              color="#737373"
            />
          </View>

          <InfoRow
            label="بهای واحد"
            value={formatCurrency(
              transaction.unit_cost,
            )}
          />

          <View style={styles.infoDivider} />

          <InfoRow
            label="بهای کل"
            value={formatCurrency(
              transaction.total_cost,
            )}
          />
        </View>

        {/* References */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>
              مراجع تراکنش
            </Text>

            <Ionicons
              name="link-outline"
              size={18}
              color="#737373"
            />
          </View>

          <InfoRow
            label="آیتم خرید"
            value={
              transaction.purchase_item
                ? `#${formatNumber(
                    transaction.purchase_item,
                  )}`
                : "—"
            }
          />

          <View style={styles.infoDivider} />

          <InfoRow
            label="مصرف در سفارش"
            value={
              transaction.order_item_ingredient
                ? `#${formatNumber(
                    transaction.order_item_ingredient,
                  )}`
                : "—"
            }
          />

          <View style={styles.infoDivider} />

          <InfoRow
            label="ثبت‌کننده"
            value={
              transaction.created_by
                ? `کاربر #${formatNumber(
                    transaction.created_by,
                  )}`
                : "—"
            }
          />
        </View>

        {/* Note */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>
              توضیحات
            </Text>

            <Ionicons
              name="document-text-outline"
              size={18}
              color="#737373"
            />
          </View>

          <View style={styles.noteBox}>
            <Text
              style={[
                styles.noteText,
                !transaction.note &&
                  styles.emptyNote,
              ]}
            >
              {transaction.note ||
                "توضیحاتی برای این تراکنش ثبت نشده است."}
            </Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>
              اطلاعات ثبت
            </Text>

            <Ionicons
              name="time-outline"
              size={18}
              color="#737373"
            />
          </View>

          <InfoRow
            label="شناسه تراکنش"
            value={formatNumber(transaction.id)}
          />

          <View style={styles.infoDivider} />

          <InfoRow
            label="سازمان"
            value={formatNumber(
              transaction.organization,
            )}
          />

          <View style={styles.infoDivider} />

          <InfoRow
            label="تاریخ ثبت"
            value={formatDate(
              transaction.created_at,
            )}
          />
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#737373",
    textAlign: "right",
  },

  heroCard: {
    marginBottom: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#262626",
    textAlign: "center",
  },

  typeBadge: {
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  heroDescription: {
    maxWidth: 290,
    marginTop: 9,
    fontSize: 11,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "center",
  },

  quantityCard: {
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  quantityHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
  },

  quantityValue: {
    marginTop: 11,
    fontSize: 25,
    fontWeight: "700",
  },

  quantityUnit: {
    marginTop: 3,
    fontSize: 10,
    color: "#a3a3a3",
  },

  card: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  ingredientBlock: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  ingredientIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  ingredientContent: {
    flex: 1,
    marginRight: 10,
  },

  ingredientName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  ingredientId: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  infoRow: {
    minHeight: 28,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  infoLabel: {
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  infoValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    color: "#404040",
    textAlign: "left",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginVertical: 5,
  },

  noteBox: {
    minHeight: 70,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },

  noteText: {
    fontSize: 11,
    lineHeight: 19,
    color: "#525252",
    textAlign: "right",
  },

  emptyNote: {
    color: "#a3a3a3",
  },

  bottomSpace: {
    height: 8,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },

  errorScreen: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    textAlign: "center",
  },

  errorMessage: {
    marginTop: 7,
    maxWidth: 300,
    fontSize: 12,
    lineHeight: 19,
    color: "#737373",
    textAlign: "center",
  },

  errorActions: {
    marginTop: 18,
    alignItems: "center",
    gap: 8,
  },

  retryButton: {
    minWidth: 120,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  backActionButton: {
    minWidth: 120,
    height: 42,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  backActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#737373",
  },
});