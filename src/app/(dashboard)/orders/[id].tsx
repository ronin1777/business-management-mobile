
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  cancelOrder,
  getOrder,
} from "@/services/api/orders";

import type {
  OrderDetail,
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/orders";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getOrderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "completed":
      return "تکمیل شده";
    case "cancelled":
      return "لغو شده";
    default:
      return "نامشخص";
  }
}

function getPaymentStatusLabel(
  status: OrderPaymentStatus,
) {
  switch (status) {
    case "paid":
      return "پرداخت شده";
    case "partially_paid":
      return "پرداخت ناقص";
    case "unpaid":
      return "پرداخت نشده";
    default:
      return "نامشخص";
  }
}

function getOrderStatusStyle(status: OrderStatus) {
  switch (status) {
    case "completed":
      return {
        backgroundColor: "#f0fdf4",
        color: "#16a34a",
      };

    case "cancelled":
      return {
        backgroundColor: "#fef2f2",
        color: "#dc2626",
      };

    default:
      return {
        backgroundColor: "#f5f5f5",
        color: "#525252",
      };
  }
}

function getPaymentStatusStyle(
  status: OrderPaymentStatus,
) {
  switch (status) {
    case "paid":
      return {
        backgroundColor: "#f0fdf4",
        color: "#16a34a",
      };

    case "partially_paid":
      return {
        backgroundColor: "#fff7ed",
        color: "#ea580c",
      };

    case "unpaid":
      return {
        backgroundColor: "#fef2f2",
        color: "#dc2626",
      };

    default:
      return {
        backgroundColor: "#f5f5f5",
        color: "#525252",
      };
  }
}

type StatusBadgeProps = {
  label: string;
  backgroundColor: string;
  color: string;
};

function StatusBadge({
  label,
  backgroundColor,
  color,
}: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({
  icon,
  label,
  value,
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={17}
          color="#737373"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

function SummaryRow({
  label,
  value,
  strong = false,
}: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text
        style={[
          styles.summaryValue,
          strong &&
            styles.summaryValueStrong,
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.summaryLabel,
          strong &&
            styles.summaryLabelStrong,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type CancelOrderModalProps = {
  visible: boolean;
  orderId: number;
  cancelling: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function CancelOrderModal({
  visible,
  orderId,
  cancelling,
  onCancel,
  onConfirm,
}: CancelOrderModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onCancel}
        />

        <View style={styles.confirmCard}>
          <View style={styles.confirmIconWrapper}>
            <View style={styles.confirmIcon}>
              <Ionicons
                name="close-circle-outline"
                size={30}
                color="#dc2626"
              />
            </View>
          </View>

          <Text style={styles.confirmTitle}>
            لغو سفارش
          </Text>

          <Text style={styles.confirmDescription}>
            آیا از لغو سفارش{" "}
            <Text style={styles.confirmOrderNumber}>
              #{formatNumber(orderId)}
            </Text>{" "}
            مطمئن هستید؟
          </Text>

          {/* <Text style={styles.confirmWarning}>
            پس از لغو، وضعیت این سفارش به «لغو شده»
            تغییر خواهد کرد.
          </Text> */}

          <View style={styles.confirmActions}>
            <Pressable
              style={({ pressed }) => [
                styles.confirmCancelButton,
                pressed &&
                  styles.confirmButtonPressed,
              ]}
              onPress={onCancel}
              disabled={cancelling}
            >
              <Text
                style={styles.confirmCancelText}
              >
                انصراف
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.confirmDeleteButton,
                pressed &&
                  styles.confirmButtonPressed,
                cancelling &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
              ) : (
                <>
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color="#ffffff"
                  />

                  <Text
                    style={
                      styles.confirmDeleteText
                    }
                  >
                    لغو سفارش
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function OrderDetailScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [order, setOrder] =
    useState<OrderDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [cancelling, setCancelling] =
    useState(false);

  const [
    cancelModalVisible,
    setCancelModalVisible,
  ] = useState(false);

  const loadOrder = useCallback(
    async () => {
      if (!id) {
        setError(
          "شناسه سفارش نامعتبر است.",
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getOrder(
          Number(id),
        );

        setOrder(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت جزئیات سفارش رخ داد.",
        );
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const openCancelModal = () => {
    if (
      !order ||
      order.status === "cancelled" ||
      cancelling
    ) {
      return;
    }

    setCancelModalVisible(true);
  };

  const closeCancelModal = () => {
    if (cancelling) {
      return;
    }

    setCancelModalVisible(false);
  };

  const handleCancelOrder = async () => {
    if (
      !order ||
      order.status === "cancelled" ||
      cancelling
    ) {
      return;
    }

    try {
      setCancelling(true);
      setError(null);

      await cancelOrder(order.id);

      setCancelModalVisible(false);

      await loadOrder();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "لغو سفارش ناموفق بود.",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text style={styles.stateText}>
          در حال دریافت جزئیات سفارش...
        </Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerState}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#dc2626"
          />
        </View>

        <Text style={styles.stateTitle}>
          دریافت سفارش ناموفق بود
        </Text>

        <Text style={styles.stateText}>
          {error ||
            "اطلاعات سفارش پیدا نشد."}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadOrder}
        >
          <Text style={styles.retryText}>
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  }

  const orderStatusStyle =
    getOrderStatusStyle(
      order.status,
    );

  const paymentStatusStyle =
    getPaymentStatusStyle(
      order.payment_status,
    );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleArea}>
            <Text style={styles.title}>
              سفارش #{formatNumber(order.id)}
            </Text>

            <Text style={styles.subtitle}>
              جزئیات و وضعیت سفارش
            </Text>
          </View>

          <View style={styles.headerActions}>
            {order.status !== "cancelled" && (
              <Pressable
                style={({ pressed }) => [
                  styles.cancelSmallButton,
                  pressed &&
                    styles.cancelSmallButtonPressed,
                ]}
                onPress={openCancelModal}
                disabled={cancelling}
              >
                <Ionicons
                  name="close-outline"
                  size={17}
                  color="#dc2626"
                />

                <Text
                  style={
                    styles.cancelSmallText
                  }
                >
                  لغو سفارش
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={8}
            >
              <Ionicons
                name="chevron-forward"
                size={22}
                color="#404040"
              />
            </Pressable>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.inlineError}>
            <Ionicons
              name="alert-circle-outline"
              size={17}
              color="#dc2626"
            />

            <Text
              style={styles.inlineErrorText}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              وضعیت سفارش
            </Text>

            <Ionicons
              name="receipt-outline"
              size={20}
              color="#737373"
            />
          </View>

          <View style={styles.statusContainer}>
            <StatusBadge
              label={getOrderStatusLabel(
                order.status,
              )}
              backgroundColor={
                orderStatusStyle.backgroundColor
              }
              color={
                orderStatusStyle.color
              }
            />

            <StatusBadge
              label={getPaymentStatusLabel(
                order.payment_status,
              )}
              backgroundColor={
                paymentStatusStyle.backgroundColor
              }
              color={
                paymentStatusStyle.color
              }
            />
          </View>

          <View style={styles.divider} />

          <InfoRow
            icon="calendar-outline"
            label="تاریخ سفارش"
            value={formatDate(
              order.ordered_at,
            )}
          />

          <InfoRow
            icon="person-outline"
            label="مشتری"
            value={
              order.customer_name ||
              "مشتری متفرقه"
            }
          />
        </View>

        {/* Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              اقلام سفارش
            </Text>

            <View style={styles.itemCount}>
              <Text
                style={
                  styles.itemCountText
                }
              >
                {formatNumber(
                  order.items.length,
                )}{" "}
                قلم
              </Text>
            </View>
          </View>

          {order.items.length === 0 ? (
            <Text style={styles.emptyItems}>
              این سفارش فاقد قلم است.
            </Text>
          ) : (
            order.items.map(
              (item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.item,
                    index <
                      order.items.length -
                        1 &&
                      styles.itemWithBorder,
                  ]}
                >
                  <View
                    style={styles.itemIcon}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={19}
                      color="#737373"
                    />
                  </View>

                  <View
                    style={
                      styles.itemContent
                    }
                  >
                    <Text
                      style={styles.itemName}
                      numberOfLines={2}
                    >
                      {item.product_name}
                    </Text>

                    <Text
                      style={
                        styles.itemQuantity
                      }
                    >
                      {formatNumber(
                        item.quantity,
                      )}{" "}
                      ×{" "}
                      {formatMoney(
                        item.unit_price,
                      )}
                    </Text>
                  </View>

                  <Text
                    style={styles.itemTotal}
                  >
                    {formatMoney(
                      item.total_price,
                    )}
                  </Text>
                </View>
              ),
            )
          )}
        </View>

        {/* Financial Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              خلاصه مالی
            </Text>

            <Ionicons
              name="wallet-outline"
              size={20}
              color="#737373"
            />
          </View>

          <SummaryRow
            label="مبلغ کل سفارش"
            value={formatMoney(
              order.total_amount,
            )}
            strong
          />

          <SummaryRow
            label="هزینه مواد"
            value={formatMoney(
              order.total_material_cost,
            )}
          />

          <SummaryRow
            label="سود ناخالص"
            value={formatMoney(
              order.gross_profit,
            )}
            strong
          />

          <View style={styles.divider} />

          <SummaryRow
            label="مبلغ پرداخت شده"
            value={formatMoney(
              order.paid_amount,
            )}
          />

          <SummaryRow
            label="مانده حساب"
            value={formatMoney(
              order.remaining_amount,
            )}
            strong
          />
        </View>

        {/* Note */}
        {order.note.trim() && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                توضیحات
              </Text>

              <Ionicons
                name="document-text-outline"
                size={20}
                color="#737373"
              />
            </View>

            <Text style={styles.note}>
              {order.note}
            </Text>
          </View>
        )}

        {/* Meta */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              اطلاعات ثبت
            </Text>

            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#737373"
            />
          </View>

          <InfoRow
            icon="time-outline"
            label="ایجاد شده در"
            value={formatDate(
              order.created_at,
            )}
          />

          <InfoRow
            icon="refresh-outline"
            label="آخرین بروزرسانی"
            value={formatDate(
              order.updated_at,
            )}
          />
        </View>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <CancelOrderModal
        visible={cancelModalVisible}
        orderId={order.id}
        cancelling={cancelling}
        onCancel={closeCancelModal}
        onConfirm={handleCancelOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    padding: 16,
    paddingBottom: 36,
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerTitleArea: {
    flex: 1,
  },

  headerActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
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
    fontSize: 12,
    color: "#737373",
    textAlign: "right",
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

  cancelSmallButton: {
    height: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  cancelSmallButtonPressed: {
    opacity: 0.65,
  },

  cancelSmallText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#dc2626",
  },

  card: {
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 17,
    backgroundColor: "#ffffff",
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  statusContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#f0f0f0",
  },

  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  itemCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#f5f5f5",
  },

  itemCountText: {
    fontSize: 10,
    color: "#737373",
  },

  item: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 13,
    gap: 10,
  },

  itemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  itemContent: {
    flex: 1,
  },

  itemName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  itemQuantity: {
    marginTop: 5,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  itemTotal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#404040",
    textAlign: "left",
  },

  emptyItems: {
    marginTop: 16,
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    fontSize: 11,
    color: "#737373",
    textAlign: "center",
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
  },

  summaryLabel: {
    fontSize: 11,
    color: "#737373",
    textAlign: "right",
  },

  summaryLabelStrong: {
    fontWeight: "700",
    color: "#262626",
  },

  summaryValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#525252",
    textAlign: "left",
  },

  summaryValueStrong: {
    fontSize: 12,
    fontWeight: "700",
    color: "#171717",
  },

  note: {
    marginTop: 13,
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    fontSize: 12,
    lineHeight: 20,
    color: "#525252",
    textAlign: "right",
  },

  inlineError: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
    padding: 11,
    marginBottom: 12,
    borderRadius: 11,
    backgroundColor: "#fef2f2",
  },

  inlineErrorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: "#dc2626",
    textAlign: "right",
  },

  centerState: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },

  stateTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
    textAlign: "center",
  },

  stateText: {
    maxWidth: 280,
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color: "#737373",
    textAlign: "center",
  },

  retryButton: {
    minWidth: 100,
    height: 40,
    marginTop: 16,
    paddingHorizontal: 18,
    borderRadius: 11,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  /* Cancel Modal */

  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  confirmCard: {
    width: "100%",
    maxWidth: 390,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 12,
  },

  confirmIconWrapper: {
    alignItems: "center",
    marginBottom: 14,
  },

  confirmIcon: {
    width: 58,
    height: 58,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 19,
    backgroundColor:
      "rgba(254,242,242,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    textAlign: "center",
  },

  confirmDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 20,
    color: "#525252",
    textAlign: "center",
  },

  confirmOrderNumber: {
    fontWeight: "700",
    color: "#171717",
  },

  confirmWarning: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor:
      "rgba(254,242,242,0.82)",
    fontSize: 10,
    lineHeight: 17,
    color: "#991b1b",
    textAlign: "center",
  },

  confirmActions: {
    flexDirection: "row-reverse",
    gap: 9,
    marginTop: 20,
  },

  confirmCancelButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor:
      "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmCancelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  confirmDeleteButton: {
    flex: 1.35,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#dc2626",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  confirmDeleteText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  confirmButtonPressed: {
    opacity: 0.72,
  },

  confirmButtonDisabled: {
    opacity: 0.65,
  },
});

