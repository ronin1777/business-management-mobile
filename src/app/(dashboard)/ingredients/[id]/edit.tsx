import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import {
  getIngredient,
  updateIngredient,
} from "@/services/api/ingredients";
import type { Ingredient } from "@/types/ingredients";

export default function EditIngredientScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [ingredient, setIngredient] =
    useState<Ingredient | null>(null);

  const [name, setName] = useState("");
  const [unitType, setUnitType] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIngredient = useCallback(async () => {
    if (!id) {
      setError("شناسه ماده اولیه معتبر نیست.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getIngredient(Number(id));

      setIngredient(data);
      setName(data.name);
      setUnitType(data.unit_type);
      setIsActive(data.is_active);
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

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedUnitType = unitType.trim();

    if (!trimmedName) {
      Alert.alert(
        "اطلاعات ناقص",
        "نام ماده اولیه را وارد کنید.",
      );
      return;
    }

    if (!trimmedUnitType) {
      Alert.alert(
        "اطلاعات ناقص",
        "نوع واحد را وارد کنید.",
      );
      return;
    }

    if (!id) {
      Alert.alert(
        "خطا",
        "شناسه ماده اولیه معتبر نیست.",
      );
      return;
    }

    try {
      setSaving(true);

      await updateIngredient(Number(id), {
        name: trimmedName,
        unit_type: trimmedUnitType,
        is_active: isActive,
      });

      Alert.alert(
        "ذخیره شد",
        "اطلاعات ماده اولیه با موفقیت بروزرسانی شد.",
        [
          {
            text: "باشه",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        "خطا",
        err instanceof Error
          ? err.message
          : "بروزرسانی ماده اولیه انجام نشد.",
      );
    } finally {
      setSaving(false);
    }
  };

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backButton}
            disabled={saving}
          >
            <Ionicons
              name="arrow-forward"
              size={21}
              color="#404040"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              ویرایش ماده اولیه
            </Text>

            <Text style={styles.headerDescription}>
              اطلاعات ماده اولیه را بروزرسانی کنید.
            </Text>
          </View>
        </View>

        {/* Identity */}
        <View style={styles.identityCard}>
          <View style={styles.identityIcon}>
            <Ionicons
              name="flask-outline"
              size={22}
              color="#525252"
            />
          </View>

          <View style={styles.identityContent}>
            <Text style={styles.identityName}>
              {ingredient.name}
            </Text>

            <Text style={styles.identityId}>
              شناسه ماده اولیه: #{ingredient.id}
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            اطلاعات پایه
          </Text>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>
                نام ماده اولیه
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="نام ماده اولیه"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
                textAlign="right"
                editable={!saving}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                نوع واحد
              </Text>

              <TextInput
                value={unitType}
                onChangeText={setUnitType}
                placeholder="مثلاً weight"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
                textAlign="right"
                autoCapitalize="none"
                editable={!saving}
              />

              <Text style={styles.hint}>
                نوع واحد مورد استفاده برای این ماده اولیه.
              </Text>
            </View>

            <View style={styles.readOnlyRow}>
              <View style={styles.readOnlyContent}>
                <Text style={styles.readOnlyLabel}>
                  واحد پایه
                </Text>

                <Text style={styles.readOnlyValue}>
                  {ingredient.base_unit}
                </Text>
              </View>

              <View style={styles.lockIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={15}
                  color="#a3a3a3"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            وضعیت
          </Text>

          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                ماده اولیه فعال باشد
              </Text>

              <Text style={styles.statusDescription}>
                وضعیت فعال بودن ماده اولیه را مشخص کنید.
              </Text>
            </View>

            <Switch
              value={isActive}
              onValueChange={setIsActive}
              disabled={saving}
              trackColor={{
                false: "#e5e5e5",
                true: "#171717",
              }}
              thumbColor="#ffffff"
            />
          </View>

          <View
            style={[
              styles.statusBadge,
              isActive
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isActive
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                isActive
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
        </View>

        {/* Inventory */}
        <View style={styles.inventoryCard}>
          <View style={styles.inventoryHeader}>
            <Text style={styles.inventoryTitle}>
              اطلاعات موجودی
            </Text>

            <Ionicons
              name="cube-outline"
              size={19}
              color="#737373"
            />
          </View>

          <View style={styles.inventoryRow}>
            <Text style={styles.inventoryValue}>
              {new Intl.NumberFormat("fa-IR").format(
                ingredient.current_stock,
              )}{" "}
              {ingredient.base_unit}
            </Text>

            <Text style={styles.inventoryLabel}>
              موجودی فعلی
            </Text>
          </View>

          <View style={styles.inventoryRow}>
            <Text style={styles.inventoryValue}>
              {new Intl.NumberFormat("fa-IR").format(
                ingredient.current_inventory_value,
              )}{" "}
              تومان
            </Text>

            <Text style={styles.inventoryLabel}>
              ارزش موجودی
            </Text>
          </View>

          <Text style={styles.inventoryHint}>
            اطلاعات موجودی مستقیماً از عملیات انبار
            محاسبه می‌شود و در این صفحه قابل ویرایش نیست.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleSave}
            style={[
              styles.primaryButton,
              saving && styles.disabledButton,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#ffffff"
                />

                <Text style={styles.primaryButtonText}>
                  ذخیره تغییرات
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={saving}
            onPress={() => router.back()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              انصراف
            </Text>
          </TouchableOpacity>
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

  identityCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 11,
    marginBottom: 20,
  },

  identityIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  identityContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  identityName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#404040",
    textAlign: "right",
  },

  identityId: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
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

  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  field: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  input: {
    height: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    fontSize: 13,
    color: "#171717",
  },

  hint: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 17,
    color: "#a3a3a3",
    textAlign: "right",
  },

  readOnlyRow: {
    minHeight: 58,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  readOnlyContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  readOnlyLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  readOnlyValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  lockIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  statusCard: {
    minHeight: 76,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  statusInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  statusTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  statusDescription: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: "#a3a3a3",
    textAlign: "right",
  },

  statusBadge: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
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

  inventoryCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },

  inventoryHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inventoryTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  inventoryRow: {
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  inventoryLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  inventoryValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
    textAlign: "left",
  },

  inventoryHint: {
    marginTop: 11,
    fontSize: 10,
    lineHeight: 17,
    color: "#a3a3a3",
    textAlign: "right",
  },

  actions: {
    gap: 9,
  },

  primaryButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  secondaryButton: {
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
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