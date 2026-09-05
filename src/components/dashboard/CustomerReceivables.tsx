import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import type { DashboardCustomer } from "@/types/dashboard";

type CustomerReceivablesProps = {
  customers: DashboardCustomer[];
  formatMoney: (value: number) => string;
};

export function CustomerReceivables({
  customers,
  formatMoney,
}: CustomerReceivablesProps) {
  const router = useRouter();

  const receivables = [...customers]
    .filter((customer) => {
      const balance = Number(customer.balance ?? 0);

      return balance > 0;
    })
    .sort((a, b) => {
      const balanceA = Number(a.balance ?? 0);
      const balanceB = Number(b.balance ?? 0);

      return balanceB - balanceA;
    })
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {receivables.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#525252"
              />
            </View>

            <Text style={styles.emptyTitle}>
              مطالبه‌ای وجود ندارد
            </Text>

            <Text style={styles.emptyText}>
              در حال حاضر مشتری بدهکاری وجود ندارد.
            </Text>
          </View>
        ) : (
          receivables.map((customer, index) => {
            const balance = Number(customer.balance ?? 0);

            return (
              <View
                key={customer.customer_id}
                style={[
                  styles.customerRow,
                  index !== receivables.length - 1 &&
                    styles.rowBorder,
                ]}
              >
                <View style={styles.customerInfo}>
                  <Text
                    style={styles.customerName}
                    numberOfLines={1}
                  >
                    {customer.customer_name}
                  </Text>

                  <Text style={styles.balanceLabel}>
                    مانده بدهکار
                  </Text>
                </View>

                <Text style={styles.balanceValue}>
                  {formatMoney(balance)}
                </Text>
              </View>
            );
          })
        )}

        {customers.length > 5 && (
          <Pressable
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed && styles.viewAllButtonPressed,
            ]}
            onPress={() =>
              router.push(
                "/(dashboard)/customers",
              )
            }
          >
            <Text style={styles.viewAllText}>
              مشاهده همه مشتریان
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

  customerRow: {
    minHeight: 68,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  customerInfo: {
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

  balanceLabel: {
    marginTop: 5,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  balanceValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#171717",
    textAlign: "left",
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