
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { register } from "@/services/api/auth";

export default function RegisterScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] =
    useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (
      !username.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !password ||
      !organizationName.trim()
    ) {
      Alert.alert(
        "خطا",
        "لطفاً تمام فیلدها را تکمیل کنید.",
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "خطا",
        "رمز عبور باید حداقل ۸ کاراکتر باشد.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await register(
        username.trim(),
        firstName.trim(),
        lastName.trim(),
        password,
        organizationName.trim(),
      );

      Alert.alert(
        "ثبت‌نام موفق",
        response.message ||
          "ثبت‌نام با موفقیت انجام شد. حساب شما پس از تأیید فعال خواهد شد.",
        [
          {
            text: "متوجه شدم",
            onPress: () => {
              router.replace("/");
            },
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "خطایی در ثبت‌نام رخ داد.";

      Alert.alert(
        "ثبت‌نام ناموفق",
        message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          ایجاد حساب
        </Text>

        <Text style={styles.subtitle}>
          اطلاعات حساب مدیریت کسب‌وکار خود را وارد کنید
        </Text>

        <View style={styles.form}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="نام کاربری"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="next"
            style={styles.input}
          />

          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="نام"
            editable={!loading}
            returnKeyType="next"
            style={styles.input}
          />

          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="نام خانوادگی"
            editable={!loading}
            returnKeyType="next"
            style={styles.input}
          />

          <TextInput
            value={organizationName}
            onChangeText={setOrganizationName}
            placeholder="نام کسب‌وکار / سازمان"
            editable={!loading}
            returnKeyType="next"
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="رمز عبور"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            style={styles.input}
          />

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                ثبت‌نام
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              قبلاً حساب ساخته‌اید؟ وارد شوید
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#737373",
    textAlign: "right",
    marginBottom: 32,
  },

  form: {
    gap: 14,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: "right",
    backgroundColor: "#fafafa",
  },

  button: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171717",
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  loginText: {
    textAlign: "center",
    fontSize: 14,
    color: "#525252",
    marginTop: 18,
  },
});

