import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type OrdersHeaderProps = {
  totalCount: number;
  onCreateOrder: () => void;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(value);
}

export function OrdersHeader({
  totalCount,
  onCreateOrder,
}: OrdersHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            سفارش‌ها
          </Text>

          <Text style={styles.subtitle}>
            مدیریت و پیگیری سفارش‌های فروش
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {formatNumber(totalCount)}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.createButton,
          pressed &&
            styles.createButtonPressed,
        ]}
        onPress={onCreateOrder}
      >
        <Ionicons
          name="add"
          size={20}
          color="#ffffff"
        />

        <Text style={styles.createButtonText}>
          سفارش جدید
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 12,
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

  countBadge: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#404040",
  },

  createButton: {
    height: 46,
    borderRadius: 13,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  createButtonPressed: {
    opacity: 0.7,
  },

  createButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
});