import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  DashboardIngredient,
  DashboardInventory,
} from "@/types/dashboard";

type InventoryOverviewProps = {
  inventory: DashboardInventory;
  formatNumber: (value: number) => string;
  formatMoney: (value: number) => string;
};

function getIngredientStatus(
  ingredient: DashboardIngredient,
) {
  if (ingredient.is_out_of_stock) {
    return {
      label: "ناموجود",
      icon: "alert-circle-outline" as const,
      containerStyle: styles.statusCritical,
      textStyle: styles.statusCriticalText,
    };
  }

  if (ingredient.is_low_stock) {
    return {
      label: "موجودی کم",
      icon: "warning-outline" as const,
      containerStyle: styles.statusWarning,
      textStyle: styles.statusWarningText,
    };
  }

  return {
    label: "مناسب",
    icon: "checkmark-circle-outline" as const,
    containerStyle: styles.statusGood,
    textStyle: styles.statusGoodText,
  };
}

function getIngredientPriority(
  ingredient: DashboardIngredient,
) {
  if (ingredient.is_out_of_stock) {
    return 0;
  }

  if (ingredient.is_low_stock) {
    return 1;
  }

  return 2;
}

export function InventoryOverview({
  inventory,
  formatNumber,
  formatMoney,
}: InventoryOverviewProps) {
  const router = useRouter();

  const ingredients = [...inventory.ingredients]
    .sort(
      (a, b) =>
        getIngredientPriority(a) -
        getIngredientPriority(b),
    )
    .slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="wallet-outline"
              size={18}
              color="#525252"
            />
          </View>

          <Text style={styles.summaryLabel}>
            ارزش موجودی
          </Text>

          <Text style={styles.summaryValue}>
            {formatMoney(inventory.total_value)}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="warning-outline"
              size={18}
              color="#525252"
            />
          </View>

          <Text style={styles.summaryLabel}>
            موجودی کم
          </Text>

          <Text style={styles.summaryValue}>
            {formatNumber(
              inventory.low_stock_count,
            )}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="close-circle-outline"
              size={18}
              color="#525252"
            />
          </View>

          <Text style={styles.summaryLabel}>
            ناموجود
          </Text>

          <Text style={styles.summaryValue}>
            {formatNumber(
              inventory.out_of_stock_count,
            )}
          </Text>
        </View>
      </View>

      {/* Ingredients Header */}
      <View style={styles.ingredientsHeader}>
        <Text style={styles.ingredientsTitle}>
          مواد اولیه
        </Text>

        <Text style={styles.ingredientsCount}>
          {formatNumber(
            inventory.ingredients.length,
          )}{" "}
          مورد
        </Text>
      </View>

      {/* Ingredients */}
      {inventory.ingredients.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="cube-outline"
            size={24}
            color="#a3a3a3"
          />

          <Text style={styles.emptyText}>
            ماده اولیه‌ای برای نمایش وجود ندارد.
          </Text>
        </View>
      ) : (
        <>
          {ingredients.map((ingredient) => {
            const status =
              getIngredientStatus(ingredient);

            return (
              <View
                key={ingredient.id}
                style={styles.ingredientCard}
              >
                <View style={styles.ingredientTop}>
                  <View style={styles.ingredientInfo}>
                    <Text
                      style={styles.ingredientName}
                      numberOfLines={1}
                    >
                      {ingredient.name}
                    </Text>

                    <Text style={styles.stockValue}>
                      {formatNumber(
                        ingredient.current_stock,
                      )}{" "}
                      {ingredient.base_unit}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      status.containerStyle,
                    ]}
                  >
                    <Ionicons
                      name={status.icon}
                      size={14}
                      color={
                        status.textStyle.color
                      }
                      style={styles.statusIcon}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        status.textStyle,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.ingredientBottom}>
                  <Text style={styles.inventoryValue}>
                    {formatMoney(
                      ingredient.current_inventory_value,
                    )}
                  </Text>

                  <Text style={styles.inventoryLabel}>
                    ارزش موجودی
                  </Text>
                </View>
              </View>
            );
          })}

          {/* View All */}
          {inventory.ingredients.length > 5 && (
            <Pressable
              style={({ pressed }) => [
                styles.viewAllButton,
                pressed &&
                  styles.viewAllButtonPressed,
              ]}
              onPress={() =>
                router.push(
                  "/(dashboard)/inventory",
                )
              }
            >
              <Text style={styles.viewAllText}>
                مشاهده همه مواد اولیه
              </Text>

              <Ionicons
                name="arrow-back-outline"
                size={16}
                color="#525252"
              />
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  // -------------------------
  // Summary
  // -------------------------

  summaryCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },

  summaryItem: {
    minHeight: 54,
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },

  summaryLabel: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 13,
    color: "#737373",
    textAlign: "right",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#171717",
    textAlign: "left",
  },

  summaryDivider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: "#f0f0f0",
  },

  // -------------------------
  // Ingredients Header
  // -------------------------

  ingredientsHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ingredientsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  ingredientsCount: {
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "left",
  },

  // -------------------------
  // Ingredient Card
  // -------------------------

  ingredientCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#ffffff",
  },

  ingredientTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  ingredientInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  ingredientName: {
    maxWidth: "100%",
    fontSize: 14,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  stockValue: {
    marginTop: 6,
    fontSize: 12,
    color: "#737373",
    textAlign: "right",
  },

  // -------------------------
  // Status
  // -------------------------

  statusBadge: {
    minHeight: 30,
    paddingHorizontal: 9,
    borderRadius: 999,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  statusIcon: {
    marginTop: 1,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  statusGood: {
    backgroundColor: "#f0fdf4",
  },

  statusGoodText: {
    color: "#15803d",
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

  // -------------------------
  // Bottom
  // -------------------------

  ingredientBottom: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inventoryLabel: {
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  inventoryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#171717",
    textAlign: "left",
  },

  // -------------------------
  // View All
  // -------------------------

  viewAllButton: {
    minHeight: 46,
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

  // -------------------------
  // Empty
  // -------------------------

  emptyCard: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: "#ffffff",
  },

  emptyText: {
    fontSize: 13,
    color: "#737373",
    textAlign: "center",
  },
});