
import {
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  getCustomer,
  updateCustomer,
} from "@/services/api/customers";

export default function EditCustomerScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const customerId = Number(id);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [validationError, setValidationError] =
    useState<string | null>(null);

  const loadCustomer = useCallback(async () => {
    if (!customerId || Number.isNaN(customerId)) {
      setError("شناسه مشتری نامعتبر است.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const customer = await getCustomer(customerId);

      setName(customer.name ?? "");
      setPhone(customer.phone ?? "");
      setNote(customer.note ?? "");
      setIsActive(customer.is_active);
    } catch {
      setError(
        "دریافت اطلاعات مشتری با خطا مواجه شد.",
      );
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedNote = note.trim();

    if (!trimmedName) {
      setValidationError(
        "نام مشتری نمی‌تواند خالی باشد.",
      );
      return;
    }

    setValidationError(null);

    try {
      setSaving(true);

      await updateCustomer(customerId, {
        name: trimmedName,
        phone: trimmedPhone,
        note: trimmedNote,
        is_active: isActive,
      });

      router.replace({
        pathname: "/(dashboard)/customers/[id]/index",
        params: {
          id: String(customerId),
        },
      });
    } catch {
      setValidationError(
        "ذخیره تغییرات با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات مشتری...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#dc2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          خطا در دریافت اطلاعات
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          onPress={loadCustomer}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#ffffff"
          />

          <Text style={styles.retryButtonText}>
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
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={22}
            color="#18181b"
          />
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            ویرایش مشتری
          </Text>

          <Text style={styles.headerSubtitle}>
            اطلاعات مشتری را ویرایش کنید
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#18181b"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                اطلاعات مشتری
              </Text>

              <Text style={styles.sectionSubtitle}>
                اطلاعات اصلی مشتری
              </Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              نام مشتری
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (validationError) {
                  setValidationError(null);
                }
              }}
              placeholder="مثلاً علی رضایی"
              placeholderTextColor="#a1a1aa"
              style={styles.input}
              textAlign="right"
              editable={!saving}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              شماره تماس
            </Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="مثلاً 09121234567"
              placeholderTextColor="#a1a1aa"
              style={styles.input}
              textAlign="right"
              keyboardType="phone-pad"
              editable={!saving}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              توضیحات
            </Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="یادداشت یا توضیحات مشتری..."
              placeholderTextColor="#a1a1aa"
              style={[
                styles.input,
                styles.textarea,
              ]}
              textAlign="right"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              editable={!saving}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <View style={styles.statusIcon}>
                <Ionicons
                  name={
                    isActive
                      ? "checkmark-circle-outline"
                      : "close-circle-outline"
                  }
                  size={20}
                  color={
                    isActive ? "#16a34a" : "#71717a"
                  }
                />
              </View>

              <View>
                <Text style={styles.statusTitle}>
                  مشتری فعال
                </Text>

                <Text style={styles.statusDescription}>
                  {isActive
                    ? "این مشتری فعال است"
                    : "این مشتری غیرفعال است"}
                </Text>
              </View>
            </View>

            <Switch
              value={isActive}
              onValueChange={setIsActive}
              disabled={saving}
            />
          </View>
        </View>

        {validationError && (
          <View style={styles.validationBox}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color="#dc2626"
            />

            <Text style={styles.validationText}>
              {validationError}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            saving && styles.saveButtonDisabled,
            pressed &&
              !saving &&
              styles.saveButtonPressed,
          ]}
        >
          {saving ? (
            <>
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />

              <Text style={styles.saveButtonText}>
                در حال ذخیره...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={20}
                color="#ffffff"
              />

              <Text style={styles.saveButtonText}>
                ذخیره تغییرات
              </Text>
            </>
          )}
        </Pressable>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fafafa",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#71717a",
  },

  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#18181b",
    marginBottom: 6,
  },

  errorText: {
    fontSize: 14,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },

  retryButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#18181b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  header: {
    minHeight: 84,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f5",
  },

  headerButtonPressed: {
    backgroundColor: "#e4e4e7",
  },

  headerContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#18181b",
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#71717a",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  formCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 16,
    padding: 16,
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#18181b",
    textAlign: "right",
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#71717a",
    textAlign: "right",
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3f3f46",
    textAlign: "right",
    marginBottom: 8,
  },

  required: {
    color: "#dc2626",
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 10,
    paddingHorizontal: 13,
    backgroundColor: "#ffffff",
    color: "#18181b",
    fontSize: 14,
  },

  textarea: {
    minHeight: 120,
    paddingTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#e4e4e7",
    marginVertical: 4,
    marginBottom: 18,
  },

  statusRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#18181b",
    textAlign: "right",
  },

  statusDescription: {
    marginTop: 3,
    fontSize: 12,
    color: "#71717a",
    textAlign: "right",
  },

  validationBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  validationText: {
    flex: 1,
    fontSize: 13,
    color: "#b91c1c",
    textAlign: "right",
    lineHeight: 20,
  },

  saveButton: {
    minHeight: 50,
    marginTop: 16,
    borderRadius: 11,
    backgroundColor: "#18181b",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonPressed: {
    opacity: 0.85,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  cancelButton: {
    minHeight: 48,
    marginTop: 10,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#52525b",
    fontSize: 14,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },
});

