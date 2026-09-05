
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { DrawerSection } from "./DrawerSection";

type AppDrawerProps = {
  onClose: () => void;
};

export function AppDrawer({
  onClose,
}: AppDrawerProps) {
  function goTo(route: string) {
    onClose();
    router.push(route as never);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons
              name="business-outline"
              size={23}
              color="#171717"
            />
          </View>

          <View style={styles.brandTextContainer}>
            <Text style={styles.brandTitle}>
              مدیریت کسب‌وکار
            </Text>

            <Text style={styles.brandSubtitle}>
              پنل مدیریت
            </Text>
          </View>
        </View>

        {/* Dashboard */}
        <Pressable
          onPress={() => goTo("/(dashboard)")}
          style={({ pressed }) => [
            styles.dashboardItem,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="grid-outline"
            size={21}
            color="#404040"
          />

          <Text style={styles.dashboardText}>
            داشبورد
          </Text>
        </Pressable>

        {/* Sales */}
        <DrawerSection
          label="فروش"
          icon="cart-outline"
          items={[
            {
              label: "سفارش‌ها",
              onPress: () =>
                goTo("/(dashboard)/orders"),
            },
            {
              label: "مشتریان",
              onPress: () =>
                goTo("/(dashboard)/customers"),
            },
          ]}
        />

        {/* Purchases */}
        <DrawerSection
          label="خرید"
          icon="car-outline"
          items={[
            {
              label: "خریدها",
              onPress: () =>
                goTo("/(dashboard)/purchases"),
            },
            {
              label: "تأمین‌کنندگان",
              onPress: () =>
                goTo("/(dashboard)/suppliers"),
            },
          ]}
        />

        {/* Production */}
        <DrawerSection
          label="تولید"
          icon="cube-outline"
          items={[
            {
              label: "محصولات",
              onPress: () =>
                goTo("/(dashboard)/products"),
            },
            {
              label: "دستور تهیه‌ها",
              onPress: () =>
                goTo("/(dashboard)/recipes"),
            },
            {
              label: "مواد اولیه",
              onPress: () =>
                goTo("/(dashboard)/ingredients"),
            },
          ]}
        />

        {/* Inventory */}
        <Pressable
          onPress={() =>
            goTo("/(dashboard)/inventory")
          }
          style={({ pressed }) => [
            styles.item,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="layers-outline"
            size={21}
            color="#525252"
          />

          <Text style={styles.itemText}>
            انبار
          </Text>
        </Pressable>

        {/* Reports */}
        <Pressable
          onPress={() =>
            goTo("/(dashboard)/reports")
          }
          style={({ pressed }) => [
            styles.item,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="bar-chart-outline"
            size={21}
            color="#525252"
          />

          <Text style={styles.itemText}>
            گزارش‌ها
          </Text>
        </Pressable>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Pressable
          onPress={() =>
            goTo("/(dashboard)/settings")
          }
          style={({ pressed }) => [
            styles.item,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="settings-outline"
            size={21}
            color="#525252"
          />

          <Text style={styles.itemText}>
            تنظیمات
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },

  brand: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 12,
  },

  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  brandTextContainer: {
    flex: 1,
  },

  brandTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  brandSubtitle: {
    fontSize: 12,
    color: "#737373",
    marginTop: 3,
    textAlign: "right",
  },

  dashboardItem: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
    backgroundColor: "#f5f5f5",
  },

  dashboardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
    textAlign: "right",
  },

  item: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },

  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#404040",
    textAlign: "right",
  },

  pressed: {
    backgroundColor: "#f5f5f5",
  },

  bottom: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
});

