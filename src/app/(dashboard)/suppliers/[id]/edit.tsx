
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  getSupplier,
  updateSupplier,
} from "@/services/api/suppliers";

export default function EditSupplierScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const supplierId = Number(id);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSupplier = useCallback(async () => {
    if (!supplierId || Number.isNaN(supplierId)) {
      setError("شناسه تأمین‌کننده نامعتبر است.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const response = await getSupplier(supplierId);

      setName(response.data.name);
      setPhone(response.data.phone ?? "");
      setIsActive(response.data.is_active);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "دریافت اطلاعات تأمین‌کننده با خطا مواجه شد.",
      );
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    loadSupplier();
  }, [loadSupplier]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("نام تأمین‌کننده الزامی است.");
      return;
    }

    try {
      setError(null);
      setSaving(true);

      await updateSupplier(supplierId, {
        name: trimmedName,
        phone: phone.trim(),
        is_active: isActive,
      });

      router.back();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ویرایش تأمین‌کننده با خطا مواجه شد.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          ویرایش تأمین‌کننده
        </Text>

        <Text style={styles.subtitle}>
          اطلاعات تأمین‌کننده را ویرایش کنید.
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            نام تأمین‌کننده
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="مثلاً صنایع پارس"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            editable={!saving}
            textAlign="right"
          />
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <Text style={styles.label}>
            شماره تماس
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="مثلاً 09121234567"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            editable={!saving}
            keyboardType="phone-pad"
            textAlign="right"
          />
        </View>

        {/* Active */}
        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchTitle}>
              وضعیت فعال
            </Text>

            <Text style={styles.switchDescription}>
              تأمین‌کننده فعال در سیستم قابل استفاده است.
            </Text>
          </View>

          <Switch
            value={isActive}
            onValueChange={setIsActive}
            disabled={saving}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.back()}
          disabled={saving}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.cancelButtonText}>
            انصراف
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
            saving && styles.disabledButton,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
            />
          ) : (
            <Text style={styles.saveButtonText}>
              ذخیره تغییرات
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },

  header: {
    gap: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748b",
  },

  errorBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#dc2626",
    textAlign: "right",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 20,
  },

  field: {
    gap: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    textAlign: "right",
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 9,
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#0f172a",
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingTop: 4,
  },

  switchTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  switchTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },

  switchDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
    textAlign: "right",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  saveButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#0f172a",
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },

  disabledButton: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.75,
  },
});

