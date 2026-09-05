"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { getRecipe } from "@/services/api/recipes";
import type { RecipeDetail } from "@/types/recipes";

function formatDate(date: string | null) {
  if (!date) {
    return "بدون تاریخ پایان";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "تاریخ نامعتبر";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsedDate);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 4,
  }).format(value);
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [recipe, setRecipe] =
    useState<RecipeDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const loadRecipe = useCallback(async () => {
    const recipeId = Number(id);

    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      setError("شناسه رسپی نامعتبر است.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getRecipe(recipeId);

      if (!response) {
        throw new Error(
          "اطلاعات رسپی دریافت نشد.",
        );
      }

      setRecipe(response);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "خطایی در دریافت اطلاعات رسپی رخ داد.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  if (loading) {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات رسپی...
        </Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.stateScreen}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#dc2626"
          />
        </View>

        <Text style={styles.stateTitle}>
          دریافت رسپی ناموفق بود
        </Text>

        <Text style={styles.stateDescription}>
          {error || "اطلاعات رسپی پیدا نشد."}
        </Text>

        <View style={styles.stateActions}>
          <Pressable
            onPress={loadRecipe}
            style={styles.retryButton}
          >
            <Ionicons
              name="refresh"
              size={18}
              color="#ffffff"
            />

            <Text style={styles.retryText}>
              تلاش مجدد
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={styles.backStateButton}
          >
            <Text style={styles.backStateText}>
              بازگشت
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#404040"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            جزئیات رسپی
          </Text>

          <Text style={styles.subtitle}>
            مشاهده فرمول و مواد اولیه محصول
          </Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.productIcon}>
            <Ionicons
              name="restaurant-outline"
              size={25}
              color="#404040"
            />
          </View>

          <View style={styles.heroInfo}>
            <Text
              style={styles.productName}
              numberOfLines={2}
            >
              {recipe.product_name}
            </Text>

            <Text style={styles.recipeNumber}>
              رسپی #{recipe.id}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              recipe.is_active
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                recipe.is_active
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                recipe.is_active
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {recipe.is_active
                ? "فعال"
                : "غیرفعال"}
            </Text>
          </View>
        </View>

        <View style={styles.heroDivider} />

        <View style={styles.versionRow}>
          <View style={styles.versionIcon}>
            <Ionicons
              name="git-branch-outline"
              size={17}
              color="#525252"
            />
          </View>

          <View style={styles.versionInfo}>
            <Text style={styles.versionLabel}>
              نسخه رسپی
            </Text>

            <Text style={styles.versionValue}>
              نسخه {recipe.version}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          اطلاعات اعتبار
        </Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              شروع اعتبار
            </Text>

            <Text style={styles.infoValue}>
              {formatDate(recipe.valid_from)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              پایان اعتبار
            </Text>

            <Text
              style={[
                styles.infoValue,
                !recipe.valid_to &&
                  styles.mutedValue,
              ]}
            >
              {formatDate(recipe.valid_to)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              تعداد مواد
            </Text>

            <Text style={styles.infoValue}>
              {formatNumber(recipe.items.length)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              شناسه محصول
            </Text>

            <Text style={styles.infoValue}>
              #{recipe.product}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              مواد اولیه
            </Text>

            <Text style={styles.sectionDescription}>
              مواد تشکیل‌دهنده این رسپی
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {recipe.items.length}
            </Text>
          </View>
        </View>

        {recipe.items.length === 0 ? (
          <View style={styles.emptyItems}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="flask-outline"
                size={27}
                color="#737373"
              />
            </View>

            <Text style={styles.emptyTitle}>
              ماده اولیه‌ای ثبت نشده
            </Text>

            <Text style={styles.emptyDescription}>
              این رسپی هنوز هیچ ماده اولیه‌ای ندارد.
            </Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {recipe.items.map((item, index) => (
              <View
                key={item.id}
                style={styles.itemCard}
              >
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.itemMain}>
                  <Text
                    style={styles.itemName}
                    numberOfLines={1}
                  >
                    {item.ingredient_name}
                  </Text>

                  <Text style={styles.itemId}>
                    ماده اولیه #{item.ingredient}
                  </Text>
                </View>

                <View style={styles.quantityContainer}>
                  <Text style={styles.quantity}>
                    {formatNumber(item.quantity)}
                  </Text>

                  <Text style={styles.unit}>
                    {item.unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.baseQuantityCard}>
        <View style={styles.baseQuantityIcon}>
          <Ionicons
            name="scale-outline"
            size={19}
            color="#525252"
          />
        </View>

        <View style={styles.baseQuantityText}>
          <Text style={styles.baseQuantityTitle}>
            مقدار پایه
          </Text>

          <Text style={styles.baseQuantityDescription}>
            مقدار پایه محاسبه‌شده برای هر ماده اولیه
            در داده‌های رسپی نمایش داده شده است.
          </Text>
        </View>
      </View>

      {recipe.items.some(
        (item) => item.base_quantity !== undefined,
      ) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            مقادیر پایه
          </Text>

          <View style={styles.baseList}>
            {recipe.items.map((item) => (
              <View
                key={`base-${item.id}`}
                style={styles.baseRow}
              >
                <Text style={styles.baseName}>
                  {item.ingredient_name}
                </Text>

                <Text style={styles.baseValue}>
                  {formatNumber(
                    item.base_quantity,
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footerInfo}>
        <Ionicons
          name="information-circle-outline"
          size={17}
          color="#a3a3a3"
        />

        <Text style={styles.footerText}>
          این صفحه اطلاعات ثبت‌شده رسپی را نمایش
          می‌دهد.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  stateScreen: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#737373",
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

  stateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    textAlign: "center",
  },

  stateDescription: {
    maxWidth: 280,
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#737373",
    textAlign: "center",
  },

  stateActions: {
    width: "100%",
    maxWidth: 260,
    marginTop: 18,
    gap: 9,
  },

  retryButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  backStateButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  backStateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  header: {
    marginBottom: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
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

  heroCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 17,
    backgroundColor: "#ffffff",
  },

  heroTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 11,
  },

  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  heroInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  productName: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  recipeNumber: {
    marginTop: 3,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 999,
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
    fontWeight: "600",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#737373",
  },

  heroDivider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#f0f0f0",
  },

  versionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },

  versionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  versionInfo: {
    alignItems: "flex-end",
  },

  versionLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  versionValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  section: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 17,
    backgroundColor: "#ffffff",
  },

  sectionHeader: {
    marginBottom: 15,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  sectionDescription: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
  },

  infoGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
  },

  infoItem: {
    width: "48%",
    minHeight: 65,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#fafafa",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  infoLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  infoValue: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  mutedValue: {
    color: "#a3a3a3",
  },

  itemsList: {
    gap: 9,
  },

  itemCard: {
    minHeight: 64,
    padding: 11,
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 13,
    backgroundColor: "#fafafa",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },

  itemNumber: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },

  itemNumberText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
  },

  itemMain: {
    flex: 1,
    alignItems: "flex-end",
  },

  itemName: {
    maxWidth: "100%",
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  itemId: {
    marginTop: 3,
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  quantityContainer: {
    minWidth: 62,
    alignItems: "flex-end",
  },

  quantity: {
    fontSize: 13,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  unit: {
    marginTop: 3,
    fontSize: 9,
    color: "#737373",
    textAlign: "right",
  },

  emptyItems: {
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  emptyTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
  },

  emptyDescription: {
    marginTop: 5,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "center",
  },

  baseQuantityCard: {
    marginBottom: 16,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
  },

  baseQuantityIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  baseQuantityText: {
    flex: 1,
    alignItems: "flex-end",
  },

  baseQuantityTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  baseQuantityDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: "#737373",
    textAlign: "right",
  },

  baseList: {
    marginTop: 14,
    gap: 8,
  },

  baseRow: {
    minHeight: 42,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  baseName: {
    flex: 1,
    fontSize: 11,
    color: "#525252",
    textAlign: "right",
  },

  baseValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
  },

  footerInfo: {
    paddingHorizontal: 4,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  footerText: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "center",
  },
});