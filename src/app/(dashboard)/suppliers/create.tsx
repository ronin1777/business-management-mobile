
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
import { useRouter } from "expo-router";
import {
  useState,
} from "react";

import { createSupplier } from "@/services/api/suppliers";

export default function CreateSupplierScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("نام تأمین‌کننده الزامی است.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createSupplier({
        name: trimmedName,
        phone: trimmedPhone || undefined,
        is_active: isActive,
      });

      router.back();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ثبت تأمین‌کننده انجام نشد.",
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
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-forward"
              size={21}
              color="#262626"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              تأمین‌کننده جدید
            </Text>

            <Text style={styles.subtitle}>
              اطلاعات تأمین‌کننده را وارد کنید
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>
              نام تأمین‌کننده
              <Text style={styles.required}>
                {" "}
                *
              </Text>
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="مثلاً صنایع پارس"
              placeholderTextColor="#a3a3a3"
              style={styles.input}
              textAlign="right"
              editable={!loading}
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
              placeholderTextColor="#a3a3a3"
              style={styles.input}
              textAlign="right"
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          <View style={styles.activeRow}>
            <View style={styles.activeInfo}>
              <Text style={styles.activeTitle}>
                تأمین‌کننده فعال
              </Text>

              <Text style={styles.activeDescription}>
                تأمین‌کننده‌های غیرفعال در
                عملیات جدید استفاده نمی‌شوند.
              </Text>
            </View>

            <Switch
              value={isActive}
              onValueChange={setIsActive}
              disabled={loading}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#525252"
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.pressed,
            loading && styles.disabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
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
                size={19}
                color="#ffffff"
              />

              <Text style={styles.submitText}>
                ثبت تأمین‌کننده
              </Text>
            </>
          )}
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

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#737373",
  },

  formCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 16,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  required: {
    color: "#525252",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#262626",
    backgroundColor: "#ffffff",
  },

  activeRow: {
    minHeight: 64,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  activeInfo: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: 12,
  },

  activeTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  activeDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#737373",
    textAlign: "right",
  },

  errorBox: {
    marginTop: 4,
    padding: 11,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#525252",
    textAlign: "right",
  },

  submitButton: {
    height: 48,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#262626",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  submitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },

  disabled: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.7,
  },
});

