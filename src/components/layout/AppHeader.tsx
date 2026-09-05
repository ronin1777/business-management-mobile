
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { useAuth } from "@/context/auth-context";

type AppHeaderProps = {
  onMenuPress: () => void;
  drawerOpen: boolean;
};

export function AppHeader({
  onMenuPress,
  drawerOpen,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const displayName =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.username ||
    "کاربر";

  const organizationName =
    user?.organization?.name ||
    "مدیریت کسب‌وکار";

  function handleMenuPress() {
    setUserMenuOpen(false);

    onMenuPress();
  }

  function toggleUserMenu() {
    if (drawerOpen || loggingOut) {
      return;
    }

    setUserMenuOpen((value) => !value);
  }

  function closeUserMenu() {
    setUserMenuOpen(false);
  }

  function goToProfile() {
    /*
     * فعلاً route پروفایل وجود ندارد.
     * بعداً با ساخت صفحه Profile navigation
     * را اضافه می‌کنیم.
     */
    closeUserMenu();
  }

  function goToSettings() {
    closeUserMenu();

    router.push("/(dashboard)/settings");
  }

  async function handleLogout() {
  if (loggingOut) {
    return;
  }

  setLoggingOut(true);
  closeUserMenu();

  try {
    await logout();
  } finally {
    setLoggingOut(false);
  }
}

  return (
    <>
      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            height: 64 + insets.top,
          },
        ]}
      >
        {/* همبرگر - سمت راست */}

        <Pressable
          onPress={handleMenuPress}
          hitSlop={8}
          disabled={loggingOut}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="menu-outline"
            size={25}
            color="#171717"
          />
        </Pressable>

        {/* نام شرکت - وسط */}

        <View style={styles.organizationContainer}>
          <Text
            numberOfLines={1}
            style={styles.organization}
          >
            {organizationName}
          </Text>
        </View>

        {/* اسم کاربر + زنگوله - سمت چپ */}

        <View style={styles.leftActions}>
          {/* اسم کاربر */}

          <Pressable
            onPress={toggleUserMenu}
            hitSlop={8}
            disabled={
              drawerOpen || loggingOut
            }
            style={({ pressed }) => [
              styles.userButton,
              pressed && styles.pressed,
              drawerOpen &&
                styles.userButtonDisabled,
            ]}
          >
            <Text
              numberOfLines={1}
              style={styles.userName}
            >
              {displayName}
            </Text>

            <Ionicons
              name={
                userMenuOpen
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={15}
              color="#737373"
            />
          </Pressable>

          {/* زنگوله */}

          <Pressable
            onPress={() => {}}
            hitSlop={8}
            disabled={loggingOut}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color="#404040"
            />

            <View
              style={styles.notificationDot}
            />
          </Pressable>
        </View>
      </View>

      {/* ================= USER MENU ================= */}

      {userMenuOpen && !drawerOpen && (
        <View style={styles.menuLayer}>
          {/* فضای بیرون منو */}

          <Pressable
            style={styles.menuBackdrop}
            onPress={closeUserMenu}
          />

          {/* خود منو */}

          <View
            style={[
              styles.userMenu,
              {
                top: 64 + insets.top,
              },
            ]}
          >
            {/* پروفایل */}

            <Pressable
              onPress={goToProfile}
              style={({ pressed }) => [
                styles.menuItem,
                pressed &&
                  styles.menuItemPressed,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={19}
                color="#525252"
              />

              <Text style={styles.menuText}>
                پروفایل
              </Text>
            </Pressable>

            {/* تنظیمات */}

            <Pressable
              onPress={goToSettings}
              style={({ pressed }) => [
                styles.menuItem,
                pressed &&
                  styles.menuItemPressed,
              ]}
            >
              <Ionicons
                name="settings-outline"
                size={19}
                color="#525252"
              />

              <Text style={styles.menuText}>
                تنظیمات
              </Text>
            </Pressable>

            {/* جداکننده */}

            <View style={styles.divider} />

            {/* خروج */}

            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              style={({ pressed }) => [
                styles.menuItem,
                pressed &&
                  styles.menuItemPressed,
                loggingOut &&
                  styles.menuItemDisabled,
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={19}
                color="#dc2626"
              />

              <Text
                style={[
                  styles.menuText,
                  styles.logoutText,
                ]}
              >
                {loggingOut
                  ? "در حال خروج..."
                  : "خروج"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  /* ================= HEADER ================= */

  container: {
    paddingHorizontal: 12,

    flexDirection: "row-reverse",
    alignItems: "center",

    backgroundColor: "#ffffff",

    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",

    zIndex: 300,
    elevation: 30,
  },

  iconButton: {
    width: 44,
    height: 44,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    backgroundColor: "#f5f5f5",
  },

  /* ================= ORGANIZATION ================= */

  organizationContainer: {
    flex: 1,

    alignItems: "center",

    paddingHorizontal: 8,
  },

  organization: {
    maxWidth: "100%",

    fontSize: 15,
    fontWeight: "700",

    color: "#171717",

    textAlign: "center",
  },

  /* ================= LEFT ACTIONS ================= */

  leftActions: {
    flexDirection: "row",

    alignItems: "center",

    gap: 2,
  },

  /* ================= USER ================= */

  userButton: {
    maxWidth: 120,
    minHeight: 44,

    paddingHorizontal: 8,

    borderRadius: 12,

    flexDirection: "row",
    alignItems: "center",

    gap: 4,
  },

  userButtonDisabled: {
    opacity: 0.75,
  },

  userName: {
    maxWidth: 90,

    fontSize: 13,
    fontWeight: "600",

    color: "#404040",

    textAlign: "right",
  },

  /* ================= NOTIFICATION ================= */

  notificationDot: {
    position: "absolute",

    top: 9,
    right: 9,

    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "#ef4444",

    borderWidth: 1.5,
    borderColor: "#ffffff",
  },

  /* ================= USER MENU LAYER ================= */

  menuLayer: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 200,
    elevation: 20,
  },

  menuBackdrop: {
    ...StyleSheet.absoluteFill,
  },

  /* ================= USER MENU ================= */

  userMenu: {
    position: "absolute",

    left: 12,

    width: 190,

    backgroundColor: "#ffffff",

    borderRadius: 14,

    padding: 6,

    borderWidth: 1,
    borderColor: "#e5e5e5",

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 8,
  },

  /* ================= MENU ITEM ================= */

  menuItem: {
    minHeight: 44,

    borderRadius: 10,

    paddingHorizontal: 10,

    flexDirection: "row-reverse",

    alignItems: "center",

    gap: 10,
  },

  menuItemPressed: {
    backgroundColor: "#f5f5f5",
  },

  menuItemDisabled: {
    opacity: 0.6,
  },

  menuText: {
    flex: 1,

    fontSize: 14,
    fontWeight: "500",

    color: "#404040",

    textAlign: "right",
  },

  divider: {
    height: 1,

    backgroundColor: "#eeeeee",

    marginVertical: 5,
  },

  logoutText: {
    color: "#dc2626",
  },
});
