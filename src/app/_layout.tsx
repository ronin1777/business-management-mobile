
import { Stack } from "expo-router";

import {
  AuthProvider,
  useAuth,
} from "@/context/auth-context";

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ================= LOGIN ================= */}

      <Stack.Protected guard={!user}>
        <Stack.Screen
          name="index"
        />
      </Stack.Protected>

      {/* ================= DASHBOARD ================= */}

      <Stack.Protected guard={!!user}>
        <Stack.Screen
          name="(dashboard)"
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

