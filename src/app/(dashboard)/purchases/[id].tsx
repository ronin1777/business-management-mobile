import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { Ionicons } from "@expo/vector-icons";

import { getPurchase } from "@/services/api/purchases";

import type {
  PurchaseDetail,
  PurchaseItem,
  PurchaseAdditionalCost,
} from "@/types/purchases";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    value,
  );
}

function formatDate(dateString: string) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(dateString: string) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPurchaseStatus(
  purchase: PurchaseDetail,
) {
  /*
   * در PurchaseDetail فعلی status نداریم.
   *
   * بنابراین تا زمانی که backend status را
   * در detail برنگرداند، خرید را completed
   * در نظر می‌گیریم.
   */
  return "completed" as const;
}

function getStatusLabel(
  status: "completed" | "cancelled",
) {
  return status === "completed"
    ? "تکمیل شده"
    : "لغو شده";
}

function getStatusIcon(
  status: "completed" | "cancelled",
): keyof typeof Ionicons.glyphMap {
  return status === "completed"
    ? "checkmark-circle-outline"
    : "close-circle-outline";
}

function formatUnit(unit: string) {
  const units: Record<string, string> = {
    kg: "کیلوگرم",
    kilogram: "کیلوگرم",
    kilograms: "کیلوگرم",
    g: "گرم",
    gram: "گرم",
    grams: "گرم",
    l: "لیتر",
    liter: "لیتر",
    liters: "لیتر",
    ml: "میلی‌لیتر",
    milliliter: "میلی‌لیتر",
    milliliters: "میلی‌لیتر",
    pcs: "عدد",
    piece: "عدد",
    pieces: "عدد",
  };

  return units[unit.toLowerCase()] ?? unit;
}

function ItemCard({
  item,
}: {
  item: PurchaseItem;
}) {
  const quantity = item.quantity;
  const unitPrice = item.unit_price;
  const discount = item.discount;
  const total = item.total_price;

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemIcon}>
          <Ionicons
            name="cube-outline"
            size={19}
            color="#374151"
          />
        </View>

        <View style={styles.itemTitleContainer}>
          <Text
            style={styles.itemName}
            numberOfLines={2}
          >
            {item.ingredient_name}
          </Text>

          <Text style={styles.itemUnit}>
            {formatNumber(quantity)}{" "}
            {formatUnit(item.unit)}
          </Text>
        </View>
      </View>

      <View style={styles.itemInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            مقدار
          </Text>

          <Text style={styles.infoValue}>
            {formatNumber(quantity)}{" "}
            {formatUnit(item.unit)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            قیمت واحد
          </Text>

          <Text style={styles.infoValue}>
            {formatNumber(unitPrice)} تومان
          </Text>
        </View>

        {discount > 0 ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              تخفیف
            </Text>

            <Text style={styles.discountValue}>
              {formatNumber(discount)} تومان
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.itemTotalRow}>
        <Text style={styles.itemTotalLabel}>
          مبلغ نهایی قلم
        </Text>

        <Text style={styles.itemTotalValue}>
          {formatNumber(total)} تومان
        </Text>
      </View>
    </View>
  );
}

function AdditionalCostCard({
  cost,
}: {
  cost: PurchaseAdditionalCost;
}) {
  return (
    <View style={styles.costCard}>
      <View style={styles.costHeader}>
        <View style={styles.costIcon}>
          <Ionicons
            name="receipt-outline"
            size={18}
            color="#374151"
          />
        </View>

        <View style={styles.costTitleContainer}>
          <Text style={styles.costTitle}>
            {cost.cost_type_display ||
              cost.cost_type}
          </Text>

          {cost.note ? (
            <Text
              style={styles.costNote}
              numberOfLines={2}
            >
              {cost.note}
            </Text>
          ) : null}
        </View>

        <Text style={styles.costAmount}>
          {formatNumber(cost.amount)} تومان
        </Text>
      </View>
    </View>
  );
}

export default function PurchaseDetailScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const purchaseId = Number(id);

  const [purchase, setPurchase] =
    useState<PurchaseDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadPurchase = useCallback(
    async () => {
      if (!Number.isFinite(purchaseId)) {
        setError("شناسه خرید نامعتبر است.");
        setLoading(false);
        return;
      }

      try {
        setError(null);

        const response =
          await getPurchase(purchaseId);

        setPurchase(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "دریافت اطلاعات خرید ناموفق بود.",
        );
      } finally {
        setLoading(false);
      }
    },
    [purchaseId],
  );

  useEffect(() => {
    loadPurchase();
  }, [loadPurchase]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadPurchase();
    } finally {
      setRefreshing(false);
    }
  };

  const status = useMemo(() => {
    if (!purchase) {
      return "completed" as const;
    }

    return getPurchaseStatus(purchase);
  }, [purchase]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#111827"
        />

        <Text style={styles.centerText}>
          در حال دریافت اطلاعات خرید...
        </Text>
      </View>
    );
  }

  if (error && !purchase) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#B91C1C"
          />
        </View>

        <Text style={styles.errorTitle}>
          دریافت اطلاعات ناموفق بود
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          onPress={loadPurchase}
          style={styles.retryButton}
        >
          <Ionicons
            name="refresh"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!purchase) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.headerButton}
        >
          <Ionicons
            name="arrow-forward"
            size={22}
            color="#111827"
          />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>
            جزئیات خرید
          </Text>

          <Text style={styles.subtitle}>
            خرید شماره #{purchase.id}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#111827"
          />
        }
      >
        {error ? (
          <View style={styles.warningBox}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color="#92400E"
            />

            <Text style={styles.warningText}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View
              style={[
                styles.statusBadge,
                status === "completed"
                  ? styles.completedBadge
                  : styles.cancelledBadge,
              ]}
            >
              <Ionicons
                name={getStatusIcon(status)}
                size={16}
                color={
                  status === "completed"
                    ? "#166534"
                    : "#B91C1C"
                }
              />

              <Text
                style={[
                  styles.statusText,
                  status === "completed"
                    ? styles.completedText
                    : styles.cancelledText,
                ]}
              >
                {getStatusLabel(status)}
              </Text>
            </View>

            <View style={styles.purchaseIdContainer}>
              <Text style={styles.purchaseIdLabel}>
                شماره خرید
              </Text>

              <Text style={styles.purchaseId}>
                #{purchase.id}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroTotalRow}>
            <View>
              <Text style={styles.heroTotalLabel}>
                مبلغ نهایی
              </Text>

              <Text style={styles.heroTotalValue}>
                {formatNumber(
                  purchase.grand_total,
                )}{" "}
                تومان
              </Text>
            </View>

            <View style={styles.totalIcon}>
              <Ionicons
                name="wallet-outline"
                size={23}
                color="#374151"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            اطلاعات خرید
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                تاریخ خرید
              </Text>

              <Text style={styles.detailValue}>
                {formatDate(
                  purchase.purchased_at,
                )}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                تأمین‌کننده
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  !purchase.supplier_name &&
                    styles.mutedValue,
                ]}
                numberOfLines={2}
              >
                {purchase.supplier_name ||
                  "بدون تأمین‌کننده"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                تاریخ ثبت
              </Text>

              <Text style={styles.detailValue}>
                {formatDateTime(
                  purchase.created_at,
                )}
              </Text>
            </View>

            {purchase.updated_at !==
            purchase.created_at ? (
              <View style={styles.detailRow}>
                <Text
                  style={styles.detailLabel}
                >
                  آخرین بروزرسانی
                </Text>

                <Text
                  style={styles.detailValue}
                >
                  {formatDateTime(
                    purchase.updated_at,
                  )}
                </Text>
              </View>
            ) : null}
          </View>

          {purchase.note ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>
                توضیحات
              </Text>

              <Text style={styles.noteText}>
                {purchase.note}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              اقلام خرید
            </Text>

            <View style={styles.countBadge}>
              <Text
                style={
                  styles.countBadgeText
                }
              >
                {purchase.items.length}
              </Text>
            </View>
          </View>

          {purchase.items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="cube-outline"
                size={26}
                color="#9CA3AF"
              />

              <Text style={styles.emptyText}>
                این خرید قلمی ندارد.
              </Text>
            </View>
          ) : (
            purchase.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
              />
            ))
          )}
        </View>

        {purchase.additional_costs.length >
        0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                هزینه‌های اضافی
              </Text>

              <Text style={styles.optionalText}>
                {purchase.additional_costs.length}{" "}
                مورد
              </Text>
            </View>

            {purchase.additional_costs.map(
              (cost) => (
                <AdditionalCostCard
                  key={cost.id}
                  cost={cost}
                />
              ),
            )}
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            خلاصه مالی
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              جمع اقلام
            </Text>

            <Text style={styles.summaryValue}>
              {formatNumber(
                purchase.items_total,
              )}{" "}
              تومان
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              هزینه‌های اضافی
            </Text>

            <Text style={styles.summaryValue}>
              {formatNumber(
                purchase.additional_costs_total,
              )}{" "}
              تومان
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalLabel}>
              مبلغ نهایی
            </Text>

            <Text style={styles.grandTotalValue}>
              {formatNumber(
                purchase.grand_total,
              )}{" "}
              تومان
            </Text>
          </View>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              شناسه خرید
            </Text>

            <Text style={styles.metaValue}>
              #{purchase.id}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              شناسه سازمان
            </Text>

            <Text style={styles.metaValue}>
              #{purchase.organization}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F9FAFB",
  },

  centerText: {
    marginTop: 12,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },

  errorIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderRadius: 29,
    backgroundColor: "#FEF2F2",
  },

  errorTitle: {
    marginBottom: 7,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  errorText: {
    maxWidth: 320,
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },

  retryButton: {
    minHeight: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: "#111827",
  },

  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#F9FAFB",
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: "flex-end",
  },

  headerSpacer: {
    width: 42,
  },

  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
  },

  warningBox: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    backgroundColor: "#FFFBEB",
  },

  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#92400E",
    textAlign: "right",
  },

  heroCard: {
    marginBottom: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  heroTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  completedBadge: {
    backgroundColor: "#F0FDF4",
  },

  cancelledBadge: {
    backgroundColor: "#FEF2F2",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  completedText: {
    color: "#166534",
  },

  cancelledText: {
    color: "#B91C1C",
  },

  purchaseIdContainer: {
    alignItems: "flex-end",
  },

  purchaseIdLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  purchaseId: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  heroDivider: {
    height: 1,
    marginVertical: 15,
    backgroundColor: "#F3F4F6",
  },

  heroTotalRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroTotalLabel: {
    marginBottom: 4,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },

  heroTotalValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
    textAlign: "right",
  },

  totalIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  section: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  optionalText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  detailsGrid: {
    gap: 0,
  },

  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 43,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },

  detailValue: {
    maxWidth: "60%",
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "left",
  },

  mutedValue: {
    color: "#9CA3AF",
    fontWeight: "500",
  },

  noteBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#F9FAFB",
  },

  noteLabel: {
    marginBottom: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "right",
  },

  noteText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#374151",
    textAlign: "right",
  },

  itemCard: {
    marginBottom: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 13,
    backgroundColor: "#F9FAFB",
  },

  itemHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  itemIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },

  itemTitleContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },

  itemUnit: {
    marginTop: 3,
    fontSize: 11,
    color: "#6B7280",
    textAlign: "right",
  },

  itemInfo: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 30,
  },

  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "right",
  },

  infoValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "left",
  },

  discountValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
    textAlign: "left",
  },

  itemTotalRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  itemTotalLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  itemTotalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  costCard: {
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },

  costHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  costIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
    borderRadius: 9,
    backgroundColor: "#E5E7EB",
  },

  costTitleContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  costTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    textAlign: "right",
  },

  costNote: {
    marginTop: 3,
    fontSize: 11,
    color: "#6B7280",
    textAlign: "right",
  },

  costAmount: {
    marginRight: 8,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    textAlign: "left",
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 12,
    color: "#9CA3AF",
  },

  summaryCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  summaryTitle: {
    marginBottom: 14,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },

  summaryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "left",
  },

  summaryDivider: {
    height: 1,
    marginVertical: 4,
    backgroundColor: "#F3F4F6",
  },

  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  grandTotalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  metaCard: {
    marginBottom: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 13,
    backgroundColor: "#F9FAFB",
  },

  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 32,
  },

  metaLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  metaValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },

  bottomSpace: {
    height: 20,
  },
});