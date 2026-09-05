import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  getProduct,
  updateProduct,
} from "@/services/api/products";

import type { Product } from "@/types/products";

function parseNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();

  if (!normalized) {
    return 0;
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const productId = Number(id);

  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      setName(data.name);
      setSellingPrice(String(data.selling_price));
      setIsActive(data.is_active);
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

  const validate = () => {
    if (!name.trim()) {
      return "نام محصول را وارد کنید.";
    }

    if (!sellingPrice.trim()) {
      return "قیمت فروش را وارد کنید.";
    }

    if (parseNumber(sellingPrice) < 0) {
      return "قیمت فروش نمی‌تواند منفی باشد.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      Alert.alert("خطا", validationError);
      return;
    }

    try {
      setSaving(true);

      await updateProduct(productId, {
        name: name.trim(),
        selling_price: parseNumber(sellingPrice),
        is_active: isActive,
      });

      Alert.alert(
        "موفق",
        "محصول با موفقیت بروزرسانی شد.",
        [
          {
            text: "مشاهده محصول",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        "خطا",
        err instanceof Error
          ? err.message
          : "خطایی در بروزرسانی محصول رخ داد.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="small"
            color="#525252"
          />
        </View>

        <Text style={styles.stateTitle}>
          در حال دریافت محصول...
        </Text>

        <Text style={styles.stateDescription}>
          اطلاعات محصول در حال بارگذاری است.
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
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

          <View style={styles.headerText}>
            <Text style={styles.title}>
              ویرایش محصول
            </Text>

            <Text style={styles.subtitle}>
              اطلاعات محصول #{product.id} را ویرایش کنید.
            </Text>
          </View>
        </View>

        {/* Product identity */}
        <View style={styles.identityCard}>
          <View style={styles.productIcon}>
            <Ionicons
              name="cube-outline"
              size={22}
              color="#525252"
            />
          </View>

          <View style={styles.identityText}>
            <Text
              style={styles.identityName}
              numberOfLines={1}
            >
              {product.name}
            </Text>

            <Text style={styles.identityId}>
              شناسه محصول #{product.id}
            </Text>
          </View>

          <View
            style={[
              styles.identityBadge,
              product.is_active
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.identityDot,
                product.is_active
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.identityBadgeText,
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

        {/* Basic information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="create-outline"
                size={19}
                color="#525252"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                اطلاعات پایه
              </Text>

              <Text style={styles.sectionDescription}>
                مشخصات اصلی محصول را ویرایش کنید.
              </Text>
            </View>
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              نام محصول
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="نام محصول"
              placeholderTextColor="#a3a3a3"
              textAlign="right"
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          {/* Price */}
          <View style={styles.fieldLast}>
            <Text style={styles.label}>
              قیمت فروش
              <Text style={styles.required}> *</Text>
            </Text>

            <View style={styles.priceInputWrapper}>
              <Text style={styles.priceUnit}>
                تومان
              </Text>

              <TextInput
                value={sellingPrice}
                onChangeText={setSellingPrice}
                placeholder="قیمت به تومان"
                placeholderTextColor="#a3a3a3"
                keyboardType="decimal-pad"
                textAlign="right"
                style={styles.priceInput}
              />
            </View>

            <Text style={styles.helperText}>
              قیمت فروش فعلی محصول را وارد کنید.
            </Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.statusIcon}>
              <View
                style={[
                  styles.statusDot,
                  !isActive &&
                    styles.statusDotInactive,
                ]}
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                وضعیت محصول
              </Text>

              <Text style={styles.sectionDescription}>
                مشخص کنید محصول در فروش قابل استفاده باشد یا خیر.
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{
                false: "#d4d4d4",
                true: "#171717",
              }}
              thumbColor="#ffffff"
              ios_backgroundColor="#d4d4d4"
            />

            <View style={styles.statusContent}>
              <View style={styles.statusTitleRow}>
                <Text style={styles.statusTitle}>
                  محصول فعال باشد
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    !isActive &&
                      styles.statusBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      !isActive &&
                        styles.statusBadgeTextInactive,
                    ]}
                  >
                    {isActive
                      ? "فعال"
                      : "غیرفعال"}
                  </Text>
                </View>
              </View>

              <Text style={styles.statusDescription}>
                {isActive
                  ? "این محصول در فرآیند فروش قابل استفاده است."
                  : "این محصول در حال حاضر در فرآیند فروش قابل استفاده نیست."}
              </Text>
            </View>
          </View>
        </View>

        {/* Recipe */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="flask-outline"
              size={18}
              color="#737373"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              دستور تهیه و مواد اولیه
            </Text>

            <Text style={styles.infoDescription}>
              مدیریت دستور تهیه و مواد اولیه از صفحه جزئیات
              محصول انجام می‌شود.
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.back()
            }
            style={({ pressed }) => [
              styles.infoAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color="#737373"
            />
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            disabled={saving}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.primaryButton,
              saving && styles.buttonDisabled,
              pressed &&
                !saving &&
                styles.buttonPressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-outline"
                  size={19}
                  color="#ffffff"
                />

                <Text style={styles.primaryButtonText}>
                  ذخیره تغییرات
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            disabled={saving}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              انصراف
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

  headerText: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-end",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#171717",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  identityCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },

  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  identityText: {
    flex: 1,
    marginRight: 11,
    alignItems: "flex-end",
  },

  identityName: {
    width: "100%",
    fontSize: 13,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  identityId: {
    marginTop: 3,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  identityBadge: {
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

  identityDot: {
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

  identityBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  activeText: {
    color: "#404040",
  },

  inactiveText: {
    color: "#a3a3a3",
  },

  section: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeaderText: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-end",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  sectionDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 16,
    color: "#a3a3a3",
    textAlign: "right",
  },

  field: {
    marginBottom: 18,
  },

  fieldLast: {
    marginBottom: 0,
  },

  label: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  required: {
    color: "#737373",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#171717",
  },

  priceInputWrapper: {
    height: 48,
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  priceInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#171717",
  },

  priceUnit: {
    paddingHorizontal: 14,
    fontSize: 11,
    color: "#737373",
    borderLeftWidth: 1,
    borderLeftColor: "#e5e5e5",
  },

  helperText: {
    marginTop: 6,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#171717",
  },

  statusDotInactive: {
    backgroundColor: "#a3a3a3",
  },

  statusRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },

  statusContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  statusTitleRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  statusTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#f5f5f5",
  },

  statusBadgeInactive: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#404040",
  },

  statusBadgeTextInactive: {
    color: "#a3a3a3",
  },

  statusDescription: {
    width: "100%",
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: "#a3a3a3",
    textAlign: "right",
  },

  infoCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 14,
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginRight: 10,
    alignItems: "flex-end",
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#404040",
    textAlign: "right",
  },

  infoDescription: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 15,
    color: "#737373",
    textAlign: "right",
  },

  infoAction: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  actions: {
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

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  pressed: {
    opacity: 0.7,
  },
});