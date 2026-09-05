
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

import { login } from "@/services/api/auth";
import { useAuth } from "@/context/auth-context";

export default function LoginScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      Alert.alert(
        "خطا",
        "نام کاربری و رمز عبور را وارد کنید.",
      );
      return;
    }

    try {
      setLoading(true);

      await login(
        username.trim(),
        password,
      );

      /*
       * Login توکن‌ها را ذخیره می‌کند،
       * اما user داخل AuthContext را تغییر نمی‌دهد.
       *
       * با refreshUser اطلاعات کاربر از /auth/me/
       * گرفته شده و AuthContext آپدیت می‌شود.
       */
      await refreshUser();

      /*
       * بعد از تغییر user، Protected Route اجازه
       * ورود به Dashboard را می‌دهد.
       */
      router.replace("/(dashboard)");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "خطایی در ورود رخ داد.";

      Alert.alert(
        "ورود ناموفق",
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
          ورود به حساب
        </Text>

        <Text style={styles.subtitle}>
          وارد حساب مدیریت کسب‌وکار خود شوید
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
            value={password}
            onChangeText={setPassword}
            placeholder="رمز عبور"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            style={styles.input}
          />

          <Pressable
            onPress={handleLogin}
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
                ورود
              </Text>
            )}
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
});

