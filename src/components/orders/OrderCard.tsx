import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  Order,
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/orders";

type OrderCardProps = {
  order: Order;
  onPress: (order: Order) => void;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getOrderStatusLabel(
  status: OrderStatus,
) {
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

function getOrderStatusStyle(
  status: OrderStatus,
) {
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

export function OrderCard({
  order,
  onPress,
}: OrderCardProps) {
  const orderStatusStyle =
    getOrderStatusStyle(order.status);

  const paymentStatusStyle =
    getPaymentStatusStyle(
      order.payment_status,
    );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.orderCard,
        pressed &&
          styles.orderCardPressed,
      ]}
      onPress={() => onPress(order)}
    >
      <View style={styles.orderTop}>
        <View
          style={
            styles.orderNumberContainer
          }
        >
          <View style={styles.orderIcon}>
            <Ionicons
              name="receipt-outline"
              size={20}
              color="#525252"
            />
          </View>

          <View>
            <Text
              style={styles.orderNumber}
            >
              سفارش #{order.id}
            </Text>

            <Text
              style={styles.orderDate}
            >
              {formatDate(
                order.ordered_at,
              )}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-back"
          size={18}
          color="#a3a3a3"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.customerRow}>
        <Ionicons
          name="person-outline"
          size={16}
          color="#737373"
        />

        <Text
          style={styles.customerName}
          numberOfLines={1}
        >
          {order.customer_name ||
            "مشتری متفرقه"}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                orderStatusStyle.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color:
                  orderStatusStyle.color,
              },
            ]}
          >
            {getOrderStatusLabel(
              order.status,
            )}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                paymentStatusStyle.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color:
                  paymentStatusStyle.color,
              },
            ]}
          >
            {getPaymentStatusLabel(
              order.payment_status,
            )}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  orderCardPressed: {
    opacity: 0.7,
  },

  orderTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  orderNumberContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  orderNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  orderDate: {
    marginTop: 4,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  divider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: "#f0f0f0",
  },

  customerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  customerName: {
    flex: 1,
    fontSize: 13,
    color: "#525252",
    textAlign: "right",
  },

  statusRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
});