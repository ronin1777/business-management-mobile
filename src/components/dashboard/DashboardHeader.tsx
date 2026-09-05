
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import type { DateRangePreset } from "@/utils/date";

type DashboardHeaderProps = {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
};

const PRESETS: {
  value: DateRangePreset;
  label: string;
}[] = [
  {
    value: "last_7_days",
    label: "۷ روز اخیر",
  },
  {
    value: "last_30_days",
    label: "۳۰ روز اخیر",
  },
  {
    value: "this_month",
    label: "ماه جاری",
  },
  {
    value: "last_month",
    label: "ماه قبل",
  },
];

export function DashboardHeader({
  preset,
  onPresetChange,
}: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);

  const selectedPreset =
    PRESETS.find((item) => item.value === preset) ??
    PRESETS[1];

  function handlePresetChange(
    value: DateRangePreset,
  ) {
    onPresetChange(value);
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>
          داشبورد
        </Text>

        <Text style={styles.subtitle}>
          نمای کلی کسب‌وکار شما
        </Text>
      </View>

      <View style={styles.selectorWrapper}>
        <Pressable
          onPress={() =>
            setOpen((value) => !value)
          }
          style={({ pressed }) => [
            styles.currentRange,
            pressed && styles.currentRangePressed,
          ]}
        >
          <Ionicons
            name={
              open
                ? "chevron-up"
                : "chevron-down"
            }
            size={17}
            color="#737373"
          />

          <Text style={styles.currentRangeText}>
            {selectedPreset.label}
          </Text>

          <Ionicons
            name="calendar-outline"
            size={18}
            color="#737373"
          />
        </Pressable>

        {open && (
          <>
            <Pressable
              style={styles.menuBackdrop}
              onPress={() => setOpen(false)}
            />

            <View style={styles.presetContainer}>
              {PRESETS.map((item) => {
                const active =
                  item.value === preset;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() =>
                      handlePresetChange(
                        item.value,
                      )
                    }
                    style={({ pressed }) => [
                      styles.presetItem,
                      active &&
                        styles.presetItemActive,
                      pressed &&
                        styles.presetItemPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        active &&
                          styles.presetTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color="#171717"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
  },

  titleSection: {
    alignItems: "flex-end",
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "400",
    color: "#737373",
    textAlign: "right",
  },

  selectorWrapper: {
    position: "relative",
    zIndex: 20,
  },

  currentRange: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  currentRangePressed: {
    backgroundColor: "#f5f5f5",
  },

  currentRangeText: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  menuBackdrop: {
    position: "absolute",
    top: 48,
    left: -16,
    right: -16,
    height: 300,
  },

  presetContainer: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 6,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },

  presetItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  presetItemActive: {
    backgroundColor: "#f5f5f5",
  },

  presetItemPressed: {
    backgroundColor: "#f5f5f5",
  },

  presetText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#525252",
    textAlign: "right",
  },

  presetTextActive: {
    color: "#171717",
    fontWeight: "600",
  },
});

