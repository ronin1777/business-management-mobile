
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { ComparisonMetric } from "@/types/dashboard";

type KpiCardProps = {
  title: string;
  metric: ComparisonMetric;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
};

export function KpiCard({
  title,
  metric,
  value,
  icon,
  compact = false,
}: KpiCardProps) {
  const percentageChange =
    metric.percentage_change;

  const isPositive =
    metric.direction === "up";

  const isNegative =
    metric.direction === "down";

  const changeColor = isPositive
    ? "#15803d"
    : isNegative
      ? "#dc2626"
      : "#737373";

  const changeBackground = isPositive
    ? "#f0fdf4"
    : isNegative
      ? "#fef2f2"
      : "#e5e5e5";

  const iconName = isPositive
    ? "trending-up"
    : isNegative
      ? "trending-down"
      : "remove";

  return (
    <View
      style={[
        styles.card,
        compact && styles.compactCard,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={18}
            color="#525252"
          />
        </View>

        <Text style={styles.title}>
          {title}
        </Text>
      </View>

      <Text
        style={[
          styles.value,
          compact && styles.compactValue,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      <View style={styles.bottomRow}>
        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor:
                changeBackground,
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={13}
            color={changeColor}
          />

          <Text
            style={[
              styles.changeText,
              {
                color: changeColor,
              },
            ]}
          >
            {percentageChange !== null
              ? `${Math.abs(
                  percentageChange,
                ).toLocaleString("fa-IR", {
                  maximumFractionDigits: 1,
                })}٪`
              : "بدون تغییر"}
          </Text>
        </View>

        <Text style={styles.comparisonText}>
          نسبت به دوره قبل
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 148,
    padding: 16,

    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 18,

    backgroundColor: "#f7f7f7",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.09,
    shadowRadius: 8,

    elevation: 4,
  },

  compactCard: {
    minHeight: 132,
  },

  topRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#e9e9e9",

    borderWidth: 1,
    borderColor: "#dedede",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,

    elevation: 2,
  },

  title: {
    flex: 1,
    marginRight: 10,

    fontSize: 13,
    fontWeight: "600",
    color: "#666666",

    textAlign: "right",
  },

  value: {
    marginTop: 18,

    fontSize: 22,
    fontWeight: "700",
    color: "#171717",

    textAlign: "right",
  },

  compactValue: {
    marginTop: 14,
    fontSize: 19,
  },

  bottomRow: {
    marginTop: 12,

    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",

    gap: 7,
  },

  changeBadge: {
    minHeight: 26,

    paddingHorizontal: 8,

    borderRadius: 8,

    flexDirection: "row-reverse",
    alignItems: "center",

    gap: 3,
  },

  changeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  comparisonText: {
    flexShrink: 1,

    fontSize: 10,
    color: "#999999",

    textAlign: "right",
  },
});

