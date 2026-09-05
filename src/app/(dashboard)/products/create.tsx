import { router } from "expo-router";
import { useState } from "react";
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

import { createProduct } from "@/services/api/products";

function parseNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();

  if (!normalized) {
    return 0;
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
}

export default function CreateProductScreen() {
  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      return "نام محصول را وارد کنید.";
    }

    if (!sellingPrice.trim()) {
      return "قیمت فروش را وارد کنید.";
    }

    const price = parseNumber(sellingPrice);

    if (price < 0) {
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
      setLoading(true);

      const response = await createProduct({
        name: name.trim(),
        selling_price: parseNumber(sellingPrice),
        is_active: isActive,
      });

      if (!response.success) {
        throw new Error(
          response.message || "ساخت محصول انجام نشد.",
        );
      }

      Alert.alert("موفق", "محصول با موفقیت ایجاد شد.", [
        {
          text: "مشاهده محصول",
          onPress: () =>
            router.replace({
              pathname: "/(dashboard)/products/[id]",
              params: {
                id: String(response.data.id),
              },
            }),
        },
      ]);
    } catch (err) {
      Alert.alert(
        "خطا",
        err instanceof Error
          ? err.message
          : "خطایی در ساخت محصول رخ داد.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>محصول جدید</Text>

            <Text style={styles.subtitle}>
              اطلاعات پایه محصول را وارد کنید.
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>P</Text>
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                اطلاعات محصول
              </Text>

              <Text style={styles.sectionDescription}>
                مشخصات اصلی محصول را وارد کنید.
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
              placeholder="مثلاً قهوه اسپرسو"
              placeholderTextColor="#a3a3a3"
              textAlign="right"
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          {/* Price */}
          <View style={styles.field}>
            <Text style={styles.label}>
              قیمت فروش
              <Text style={styles.required}> *</Text>
            </Text>

            <View style={styles.priceInputWrapper}>
              <Text style={styles.priceUnit}>تومان</Text>

              <TextInput
                value={sellingPrice}
                onChangeText={setSellingPrice}
                placeholder="مثلاً ۲۵۰۰۰۰"
                placeholderTextColor="#a3a3a3"
                keyboardType="decimal-pad"
                textAlign="right"
                style={styles.priceInput}
              />
            </View>

            <Text style={styles.helperText}>
              قیمت نهایی فروش هر واحد محصول.
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
                  !isActive && styles.statusDotInactive,
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
                    !isActive && styles.statusBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      !isActive &&
                        styles.statusBadgeTextInactive,
                    ]}
                  >
                    {isActive ? "فعال" : "غیرفعال"}
                  </Text>
                </View>
              </View>

              <Text style={styles.statusDescription}>
                {isActive
                  ? "این محصول می‌تواند در فرآیند فروش استفاده شود."
                  : "این محصول فعلاً در فرآیند فروش قابل استفاده نیست."}
              </Text>
            </View>
          </View>
        </View>

        {/* Recipe Hint */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>i</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              دستور تهیه و مواد اولیه
            </Text>

            <Text style={styles.infoDescription}>
              پس از ایجاد محصول می‌توانید دستور تهیه و مواد اولیه
              آن را مدیریت کنید.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            disabled={loading}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.primaryButton,
              loading && styles.buttonDisabled,
              pressed && !loading && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                ایجاد محصول
              </Text>
            )}
          </Pressable>

          <Pressable
            disabled={loading}
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

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#171717",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "right",
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

  backIcon: {
    fontSize: 30,
    lineHeight: 30,
    color: "#525252",
    marginTop: -3,
  },

  section: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
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

  sectionIconText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#525252",
  },

  sectionHeaderText: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  sectionDescription: {
    marginTop: 3,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
    lineHeight: 17,
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
    justifyContent: "flex-start",
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
    alignItems: "flex-start",
    padding: 14,
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  infoIconText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#737373",
  },

  infoContent: {
    flex: 1,
    marginRight: 10,
    alignItems: "flex-end",
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#404040",
    textAlign: "right",
  },

  infoDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 16,
    color: "#737373",
    textAlign: "right",
  },

  actions: {
    gap: 10,
  },

  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontSize: 13,
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
    opacity: 0.75,
  },

  pressed: {
    opacity: 0.7,
  },
});