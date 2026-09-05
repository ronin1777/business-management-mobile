import { StyleSheet, Text, View } from "react-native";
import {
  ArrowDownLeft,
  ArrowUpLeft,
  Minus,
} from "lucide-react-native";

import type { ReportComparison } from "@/types/reports";

type ReportComparisonProps = {
  comparison: ReportComparison;
};

export default function ReportComparison({
  comparison,
}: ReportComparisonProps) {
  const isUp = comparison.direction === "up";
  const isDown = comparison.direction === "down";
  const isUnchanged =
    comparison.direction === "unchanged";

  return (
    <View style={styles.container}>
      {comparison.percentage_change !== null && (
        <View
          style={[
            styles.badge,
            isUp && styles.badgeUp,
            isDown && styles.badgeDown,
            isUnchanged && styles.badgeUnchanged,
          ]}
        >
          {isUp && (
            <ArrowUpLeft
              size={12}
              color="#166534"
              strokeWidth={2}
            />
          )}

          {isDown && (
            <ArrowDownLeft
              size={12}
              color="#b91c1c"
              strokeWidth={2}
            />
          )}

          {isUnchanged && (
            <Minus
              size={12}
              color="#737373"
              strokeWidth={2}
            />
          )}

          <Text
            style={[
              styles.percentage,
              isUp && styles.textUp,
              isDown && styles.textDown,
              isUnchanged &&
                styles.textUnchanged,
            ]}
          >
            {comparison.percentage_change}
          </Text>
        </View>
      )}

      <Text style={styles.previous}>
        نسبت به دوره قبل
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  badge: {
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: 7,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
  },

  badgeUp: {
    backgroundColor: "#f0fdf4",
  },

  badgeDown: {
    backgroundColor: "#fef2f2",
  },

  badgeUnchanged: {
    backgroundColor: "#f5f5f5",
  },

  percentage: {
    fontSize: 10,
    fontWeight: "600",
  },

  textUp: {
    color: "#166534",
  },

  textDown: {
    color: "#b91c1c",
  },

  textUnchanged: {
    color: "#737373",
  },

  previous: {
    fontSize: 10,
    color: "#a3a3a3",
  },
});