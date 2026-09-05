import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getProduct } from "@/services/api/products";
import type { Product } from "@/types/products";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const productId = Number(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!Number.isFinite(productId)) {
      setError("شناسه محصول نامعتبر است.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getProduct(productId);

      setProduct(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "خطایی در دریافت محصول رخ داد.",
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="small" color="#525252" />
        </View>

        <Text style={styles.stateTitle}>
          در حال دریافت محصول...
        </Text>

        <Text style={styles.stateDescription}>
          لطفاً کمی صبر کنید.
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerState}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#737373"
          />
        </View>

        <Text style={styles.stateTitle}>
          {error || "محصول پیدا نشد."}
        </Text>

        <Pressable
          onPress={loadProduct}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.retryText}>
            تلاش مجدد
          </Text>
        </Pressable>
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
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#525252"
            />
          </Pressable>

          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text
                style={styles.productTitle}
                numberOfLines={2}
              >
                {product.name}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  product.is_active
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    product.is_active
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    product.is_active
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  {product.is_active
                    ? "فعال"
                    : "غیرفعال"}
                </Text>
              </View>
            </View>

            <Text style={styles.productId}>
              محصول #{product.id}
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <View style={styles.priceIcon}>
              <Ionicons
                name="pricetag-outline"
                size={19}
                color="#525252"
              />
            </View>

            <View style={styles.priceHeaderText}>
              <Text style={styles.priceLabel}>
                قیمت فروش
              </Text>

              <Text style={styles.priceHint}>
                قیمت فعلی محصول
              </Text>
            </View>
          </View>

          <View style={styles.priceValueRow}>
            <Text style={styles.priceValue}>
              {formatPrice(product.selling_price)}
            </Text>

            <Text style={styles.priceCurrency}>
              تومان
            </Text>
          </View>
        </View>

        {/* Recipe */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.recipeIcon}>
              <Ionicons
                name="flask-outline"
                size={20}
                color="#525252"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                دستور تهیه
              </Text>

              <Text style={styles.sectionDescription}>
                مواد اولیه و ترکیبات مورد استفاده در محصول
              </Text>
            </View>

            {product.has_valid_recipe !== undefined && (
              <View
                style={[
                  styles.recipeBadge,
                  product.has_valid_recipe
                    ? styles.recipeValid
                    : styles.recipeInvalid,
                ]}
              >
                <Ionicons
                  name={
                    product.has_valid_recipe
                      ? "checkmark-circle-outline"
                      : "alert-circle-outline"
                  }
                  size={15}
                  color={
                    product.has_valid_recipe
                      ? "#525252"
                      : "#737373"
                  }
                />

                <Text style={styles.recipeBadgeText}>
                  {product.has_valid_recipe
                    ? "معتبر"
                    : "ناقص"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.recipeBody}>
            <View style={styles.recipeEmptyIcon}>
              <Ionicons
                name="flask-outline"
                size={23}
                color="#a3a3a3"
              />
            </View>

            <Text style={styles.recipeEmptyTitle}>
              مدیریت مواد اولیه
            </Text>

            <Text style={styles.recipeEmptyDescription}>
              دستور تهیه، مواد اولیه و مقدار مصرف هر ماده
              را از این بخش مدیریت کنید.
            </Text>

            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [
                styles.recipeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back-outline"
                size={17}
                color="#404040"
              />

              <Text style={styles.recipeButtonText}>
                مدیریت دستور تهیه
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-outline"
                size={19}
                color="#525252"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                اطلاعات محصول
              </Text>

              <Text style={styles.sectionDescription}>
                اطلاعات ثبت و بروزرسانی محصول
              </Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow
              icon="calendar-outline"
              label="تاریخ ایجاد"
              value={formatDate(product.created_at)}
            />

            <View style={styles.divider} />

            <InfoRow
              icon="refresh-outline"
              label="آخرین بروزرسانی"
              value={formatDate(product.updated_at)}
            />

            <View style={styles.divider} />

            <InfoRow
              icon="barcode-outline"
              label="شناسه محصول"
              value={`#${product.id}`}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() =>
              router.push({
                pathname:
                  "/(dashboard)/products/[id]/edit",
                params: {
                  id: String(product.id),
                },
              })
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color="#ffffff"
            />

            <Text style={styles.primaryButtonText}>
              ویرایش محصول
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              بازگشت
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowIcon}>
        <Ionicons
          name={icon}
          size={16}
          color="#737373"
        />
      </View>

      <View style={styles.infoRowText}>
        <Text style={styles.infoRowLabel}>
          {label}
        </Text>

        <Text style={styles.infoRowValue}>
          {value}
        </Text>
      </View>
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
    paddingBottom: 40,
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
    paddingHorizontal: 24,
  },

  loadingIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  stateTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#404040",
    textAlign: "center",
  },

  stateDescription: {
    marginTop: 4,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 13,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 14,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  headerInfo: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-end",
  },

  titleRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  productTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  productId: {
    width: "100%",
    marginTop: 4,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  statusBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    gap: 5,
  },

  activeBadge: {
    backgroundColor: "#f5f5f5",
  },

  inactiveBadge: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    backgroundColor: "#525252",
  },

  inactiveDot: {
    backgroundColor: "#a3a3a3",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  activeText: {
    color: "#404040",
  },

  inactiveText: {
    color: "#a3a3a3",
  },

  priceCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },

  priceHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  priceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  priceHeaderText: {
    flex: 1,
    marginRight: 10,
    alignItems: "flex-end",
  },

  priceLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#262626",
  },

  priceHint: {
    marginTop: 3,
    fontSize: 10,
    color: "#a3a3a3",
  },

  priceValueRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    justifyContent: "flex-start",
    marginTop: 16,
  },

  priceValue: {
    fontSize: 27,
    fontWeight: "700",
    color: "#171717",
  },

  priceCurrency: {
    marginRight: 7,
    fontSize: 11,
    color: "#737373",
  },

  section: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  sectionHeaderText: {
    flex: 1,
    marginRight: 10,
    alignItems: "flex-end",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  sectionDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: "#a3a3a3",
    textAlign: "right",
  },

  recipeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  recipeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },

  recipeValid: {
    backgroundColor: "#f5f5f5",
  },

  recipeInvalid: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  recipeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
  },

  recipeBody: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  recipeEmptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  recipeEmptyTitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#404040",
  },

  recipeEmptyDescription: {
    maxWidth: 280,
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: "#a3a3a3",
    textAlign: "center",
  },

  recipeButton: {
    minWidth: 180,
    height: 42,
    marginTop: 14,
    paddingHorizontal: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    gap: 7,
  },

  recipeButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
  },

  infoList: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 13,
  },

  infoRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  infoRowText: {
    flex: 1,
    marginRight: 10,
    alignItems: "flex-end",
  },

  infoRowLabel: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  infoRowValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },

  actions: {
    marginTop: 4,
    gap: 10,
  },

  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  secondaryButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
  },

  pressed: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.8,
  },
});