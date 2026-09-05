import { useState } from "react";
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
import { router } from "expo-router";

import { createIngredient } from "@/services/api/ingredients";

export default function CreateIngredientScreen() {
  const [name, setName] = useState("");
  const [unitType, setUnitType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
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

    try {
      setLoading(true);

      await createIngredient({
        name: trimmedName,
        unit_type: trimmedUnitType,
        is_active: isActive,
      });

      Alert.alert(
        "ثبت موفق",
        "ماده اولیه با موفقیت ایجاد شد.",
        [
          {
            text: "باشه",
            onPress: () => {
              router.replace("/(dashboard)/ingredients");
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "خطا",
        error instanceof Error
          ? error.message
          : "ثبت ماده اولیه انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  };

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
          >
            <Ionicons
              name="arrow-forward"
              size={21}
              color="#404040"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              ماده اولیه جدید
            </Text>

            <Text style={styles.headerDescription}>
              اطلاعات ماده اولیه را وارد کنید.
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
                placeholder="مثلاً قهوه عربیکا"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
                textAlign="right"
                editable={!loading}
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
                editable={!loading}
              />

              <Text style={styles.hint}>
                نوع واحد مورد استفاده برای مدیریت این ماده اولیه را وارد کنید.
              </Text>
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
                مواد اولیه غیرفعال در فرآیندهای جدید قابل استفاده نخواهند بود.
              </Text>
            </View>

            <Switch
              value={isActive}
              onValueChange={setIsActive}
              disabled={loading}
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

        {/* Inventory Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#737373"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              مدیریت موجودی
            </Text>

            <Text style={styles.infoText}>
              موجودی، ارزش موجودی و میانگین قیمت این ماده اولیه پس از ثبت، توسط سیستم مدیریت می‌شود.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={loading}
            onPress={handleCreate}
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
          >
            {loading ? (
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
                  ثبت ماده اولیه
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={loading}
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
    marginBottom: 24,
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

  infoCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  infoText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 17,
    color: "#737373",
    textAlign: "right",
  },

  actions: {
    marginTop: 24,
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
});