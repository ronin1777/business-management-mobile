import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import type { DashboardRecentOrder } from "@/types/dashboard";

type RecentOrdersProps = {
  orders: DashboardRecentOrder[];
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function getOrderStatus(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "delivered" ||
    normalized === "done"
  ) {
    return {
      label: "تکمیل شده",
      containerStyle: styles.statusSuccess,
      textStyle: styles.statusSuccessText,
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return {
      label: "لغو شده",
      containerStyle: styles.statusCritical,
      textStyle: styles.statusCriticalText,
    };
  }

  if (
    normalized === "processing" ||
    normalized === "confirmed"
  ) {
    return {
      label: "در حال پردازش",
      containerStyle: styles.statusInfo,
      textStyle: styles.statusInfoText,
    };
  }

  return {
    label: "در انتظار",
    containerStyle: styles.statusWarning,
    textStyle: styles.statusWarningText,
  };
}

function getPaymentStatus(
  paymentStatus: string,
) {
  const normalized =
    paymentStatus.toLowerCase();

  if (
    normalized === "paid" ||
    normalized === "completed" ||
    normalized === "success"
  ) {
    return {
      label: "پرداخت شده",
      containerStyle: styles.paymentSuccess,
      textStyle: styles.paymentSuccessText,
    };
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return {
      label: "ناموفق",
      containerStyle: styles.paymentCritical,
      textStyle: styles.paymentCriticalText,
    };
  }

  return {
    label: "پرداخت نشده",
    containerStyle: styles.paymentWarning,
    textStyle: styles.paymentWarningText,
  };
}

function formatOrderDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "تاریخ نامعتبر";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
}

export function RecentOrders({
  orders,
}: RecentOrdersProps) {
  const router = useRouter();

  const recentOrders = orders.slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {recentOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={24}
                color="#525252"
              />
            </View>

            <Text style={styles.emptyTitle}>
              سفارشی وجود ندارد
            </Text>

            <Text style={styles.emptyText}>
              هنوز سفارشی برای نمایش ثبت نشده است.
            </Text>
          </View>
        ) : (
          recentOrders.map((order, index) => {
            const orderStatus =
              getOrderStatus(order.status);

            const paymentStatus =
              getPaymentStatus(
                order.payment_status,
              );

            return (
              <Pressable
                key={order.id}
                style={({ pressed }) => [
                  styles.orderRow,
                  index !==
                    recentOrders.length - 1 &&
                    styles.rowBorder,
                  pressed &&
                    styles.orderRowPressed,
                ]}
              >
                <View style={styles.orderTop}>
                  <View style={styles.orderInfo}>
                    <Text
                      style={styles.customerName}
                      numberOfLines={1}
                    >
                      {order.customer_name}
                    </Text>

                    <Text style={styles.orderMeta}>
                      سفارش #{formatNumber(order.id)}
                    </Text>
                  </View>

                  <Text style={styles.orderDate}>
                    {formatOrderDate(
                      order.ordered_at,
                    )}
                  </Text>
                </View>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      orderStatus.containerStyle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        orderStatus.textStyle,
                      ]}
                    >
                      {orderStatus.label}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      paymentStatus.containerStyle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        paymentStatus.textStyle,
                      ]}
                    >
                      {paymentStatus.label}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}

        {orders.length > 5 && (
          <Pressable
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed &&
                styles.viewAllButtonPressed,
            ]}
            onPress={() =>
              router.push(
                "/(dashboard)/orders",
              )
            }
          >
            <Text style={styles.viewAllText}>
              مشاهده همه سفارش‌ها
            </Text>

            <Ionicons
              name="arrow-back-outline"
              size={16}
              color="#525252"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  orderRow: {
    paddingVertical: 15,
  },

  orderRowPressed: {
    opacity: 0.7,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  orderTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  orderInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  customerName: {
    maxWidth: "100%",
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    textAlign: "right",
  },

  orderMeta: {
    marginTop: 5,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  orderDate: {
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "left",
  },

  statusRow: {
    marginTop: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  statusSuccess: {
    backgroundColor: "#f0fdf4",
  },

  statusSuccessText: {
    color: "#15803d",
  },

  statusInfo: {
    backgroundColor: "#eff6ff",
  },

  statusInfoText: {
    color: "#1d4ed8",
  },

  statusWarning: {
    backgroundColor: "#fffbeb",
  },

  statusWarningText: {
    color: "#a16207",
  },

  statusCritical: {
    backgroundColor: "#fef2f2",
  },

  statusCriticalText: {
    color: "#b91c1c",
  },

  paymentSuccess: {
    backgroundColor: "#f0fdf4",
  },

  paymentSuccessText: {
    color: "#15803d",
  },

  paymentWarning: {
    backgroundColor: "#fffbeb",
  },

  paymentWarningText: {
    color: "#a16207",
  },

  paymentCritical: {
    backgroundColor: "#fef2f2",
  },

  paymentCriticalText: {
    color: "#b91c1c",
  },

  viewAllButton: {
    minHeight: 46,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#ffffff",
  },

  viewAllButtonPressed: {
    backgroundColor: "#f5f5f5",
  },

  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#525252",
  },

  emptyState: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "center",
  },
});