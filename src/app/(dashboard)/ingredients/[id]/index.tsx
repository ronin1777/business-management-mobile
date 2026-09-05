import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { getIngredient } from "@/services/api/ingredients";
import type { Ingredient } from "@/types/ingredients";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatCurrency(value: number) {
  return `${formatNumber(value)} تومان`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function IngredientDetailScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [ingredient, setIngredient] =
    useState<Ingredient | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const loadIngredient = useCallback(async () => {
    if (!id) {
      setError("شناسه ماده اولیه معتبر نیست.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getIngredient(
        Number(id),
      );

      setIngredient(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "دریافت اطلاعات ماده اولیه انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadIngredient();
  }, [loadIngredient]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات...
        </Text>
      </View>
    );
  }

  if (error || !ingredient) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={27}
            color="#b91c1c"
          />
        </View>

        <Text style={styles.errorTitle}>
          دریافت اطلاعات ناموفق بود
        </Text>

        <Text style={styles.errorDescription}>
          {error || "ماده اولیه پیدا نشد."}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={loadIngredient}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-forward"
              size={21}
              color="#404040"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text
              numberOfLines={1}
              style={styles.headerTitle}
            >
              {ingredient.name}
            </Text>

            <Text style={styles.headerDescription}>
              جزئیات ماده اولیه
            </Text>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>
                {ingredient.name}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  ingredient.is_active
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    ingredient.is_active
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    ingredient.is_active
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  {ingredient.is_active
                    ? "فعال"
                    : "غیرفعال"}
                </Text>
              </View>
            </View>

            <View style={styles.unitBadge}>
              <Text style={styles.unitText}>
                {ingredient.base_unit}
              </Text>
            </View>
          </View>
        </View>

        {/* Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            وضعیت موجودی
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="cube-outline"
                  size={19}
                  color="#525252"
                />
              </View>

              <View style={styles.statContent}>
                <Text style={styles.statLabel}>
                  موجودی فعلی
                </Text>

                <Text style={styles.statValue}>
                  {formatNumber(
                    ingredient.current_stock,
                  )}{" "}
                  <Text style={styles.statUnit}>
                    {ingredient.base_unit}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={19}
                  color="#525252"
                />
              </View>

              <View style={styles.statContent}>
                <Text style={styles.statLabel}>
                  ارزش موجودی
                </Text>

                <Text style={styles.statValue}>
                  {formatCurrency(
                    ingredient.current_inventory_value,
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="pricetag-outline"
                  size={19}
                  color="#525252"
                />
              </View>

              <View style={styles.statContent}>
                <Text style={styles.statLabel}>
                  میانگین قیمت واحد
                </Text>

                <Text style={styles.statValue}>
                  {formatCurrency(
                    ingredient.average_unit_cost,
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            اطلاعات ماده اولیه
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {ingredient.base_unit}
              </Text>

              <Text style={styles.infoLabel}>
                واحد پایه
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {ingredient.unit_type}
              </Text>

              <Text style={styles.infoLabel}>
                نوع واحد
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {formatDate(
                  ingredient.created_at,
                )}
              </Text>

              <Text style={styles.infoLabel}>
                تاریخ ایجاد
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {formatDate(
                  ingredient.updated_at,
                )}
              </Text>

              <Text style={styles.infoLabel}>
                آخرین بروزرسانی
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                #{ingredient.id}
              </Text>

              <Text style={styles.infoLabel}>
                شناسه
              </Text>
            </View>
          </View>
        </View>

        {/* Inventory Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#737373"
            />
          </View>

          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>
              اطلاعات موجودی
            </Text>

            <Text style={styles.noticeText}>
              موجودی و ارزش این ماده اولیه بر اساس
              عملیات ثبت‌شده در سیستم محاسبه می‌شود.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname:
                "/(dashboard)/ingredients/[id]/edit",
              params: {
                id: String(ingredient.id),
              },
            })
          }
          style={styles.editButton}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color="#ffffff"
          />

          <Text style={styles.editButtonText}>
            ویرایش ماده اولیه
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
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

  headerTitle: {
    maxWidth: "100%",
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  headerDescription: {
    marginTop: 4,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  overviewCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },

  overviewTop: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  nameContainer: {
    flex: 1,
    alignItems: "flex-end",
    gap: 8,
  },

  name: {
    width: "100%",
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  statusBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  activeBadge: {
    backgroundColor: "#f0fdf4",
  },

  inactiveBadge: {
    backgroundColor: "#f5f5f5",
  },

  statusDot: {
    width: 5,
    height: 5,
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

  unitBadge: {
    minWidth: 52,
    height: 42,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  unitText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    marginBottom: 9,
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  statsCard: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  statRow: {
    minHeight: 70,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 11,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  statContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  statLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  statValue: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  statUnit: {
    fontSize: 10,
    fontWeight: "500",
    color: "#737373",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },

  infoCard: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  infoRow: {
    minHeight: 55,
    flexDirection: "row",
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
    fontWeight: "600",
    color: "#525252",
    textAlign: "left",
  },

  noticeCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
  },

  noticeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  noticeContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  noticeTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  noticeText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 17,
    color: "#737373",
    textAlign: "right",
  },

  editButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  centerContainer: {
    flex: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
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
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#404040",
    textAlign: "center",
  },

  errorDescription: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    minWidth: 110,
    height: 42,
    paddingHorizontal: 18,
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
});