import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";

type DrawerItem = {
  label: string;
  onPress: () => void;
};

type DrawerSectionProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: DrawerItem[];
};

export function DrawerSection({
  label,
  icon,
  items,
}: DrawerSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [
          styles.header,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.headerContent}>
          <Ionicons
            name={icon}
            size={21}
            color="#525252"
          />

          <Text style={styles.headerText}>
            {label}
          </Text>
        </View>

        <Ionicons
          name={
            open
              ? "chevron-up"
              : "chevron-down"
          }
          size={18}
          color="#737373"
        />
      </Pressable>

      {open && (
        <View style={styles.items}>
          {items.map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
            >
              <Text style={styles.itemText}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },

  header: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },

  headerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  items: {
    marginRight: 18,
    marginTop: 2,
    marginBottom: 4,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
    gap: 2,
  },

  item: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  itemPressed: {
    backgroundColor: "#f5f5f5",
  },

  itemText: {
    fontSize: 14,
    color: "#737373",
    textAlign: "right",
  },

  pressed: {
    backgroundColor: "#f5f5f5",
  },
});