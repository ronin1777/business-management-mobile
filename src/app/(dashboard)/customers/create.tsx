
"use client";

import { useState } from "react";
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

import { createCustomer } from "@/services/api/customers";

export default function CreateCustomerScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedNote = note.trim();

    if (!trimmedName) {
      setError("نام مشتری را وارد کنید.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createCustomer({
        name: trimmedName,
        phone: trimmedPhone || undefined,
        note: trimmedNote || undefined,
        is_active: isActive,
      });

      router.back();
    } catch (err) {
      console.error(
        "CREATE CUSTOMER ERROR:",
        err,
      );

      setError(
        "ثبت مشتری با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Ionicons
              name="arrow-forward"
              size={21}
              color="#262626"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              مشتری جدید
            </Text>

            <Text style={styles.subtitle}>
              اطلاعات مشتری جدید را وارد کنید
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>
              نام مشتری
              <Text style={styles.required}>
                {" "}
                *
              </Text>
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="مثلاً علی رضایی"
              placeholderTextColor="#a3a3a3"
              style={styles.input}
              textAlign="right"
              editable={!loading}
              autoCapitalize="words"
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
              editable={!loading}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              یادداشت
            </Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="یادداشت یا توضیحات مشتری..."
              placeholderTextColor="#a3a3a3"
              style={[
                styles.input,
                styles.textarea,
              ]}
              textAlign="right"
              textAlignVertical="top"
              multiline
              numberOfLines={5}
              editable={!loading}
            />
          </View>

          <View style={styles.activeRow}>
            <View style={styles.activeTextContainer}>
              <Text style={styles.activeTitle}>
                مشتری فعال
              </Text>

              <Text style={styles.activeDescription}>
                مشتری فعال در فهرست انتخاب مشتریان
                نمایش داده می‌شود.
              </Text>
            </View>

            <Switch
              value={isActive}
              onValueChange={setIsActive}
              disabled={loading}
            />
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color="#dc2626"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <Pressable
          style={[
            styles.submitButton,
            loading &&
              styles.submitButtonDisabled,
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
            <Ionicons
              name="checkmark"
              size={19}
              color="#ffffff"
            />
          )}

          <Text style={styles.submitButtonText}>
            {loading
              ? "در حال ثبت..."
              : "ثبت مشتری"}
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

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  header: {
    minHeight: 58,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 11,
    marginBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
    fontSize: 22,
    fontWeight: "800",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#737373",
    textAlign: "right",
  },

  formCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  field: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "800",
    color: "#404040",
    textAlign: "right",
  },

  required: {
    color: "#dc2626",
  },

  input: {
    height: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 11,
    backgroundColor: "#fafafa",
    fontSize: 13,
    color: "#171717",
  },

  textarea: {
    height: 110,
    paddingTop: 12,
  },

  activeRow: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  activeTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  activeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#262626",
    textAlign: "right",
  },

  activeDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: "#737373",
    textAlign: "right",
  },

  errorBox: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 11,
    backgroundColor: "#fef2f2",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#b91c1c",
    fontWeight: "600",
    textAlign: "right",
  },

  submitButton: {
    height: 48,
    marginTop: 14,
    borderRadius: 13,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
