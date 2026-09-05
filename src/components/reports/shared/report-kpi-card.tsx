import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import ReportComparison from "./report-comparison";

import type { ReportComparison as ReportComparisonType } from "@/types/reports";

type ReportKpiCardProps = {
  title: string;
  value: string;
  comparison?: ReportComparisonType;
  description?: string;
};

export default function ReportKpiCard({
  title,
  value,
  comparison,
  description,
}: ReportKpiCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      {comparison && (
        <ReportComparison
          comparison={comparison}
        />
      )}

      {description && (
        <Text
          style={styles.description}
          numberOfLines={1}
        >
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 116,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  title: {
    width: "100%",
    fontSize: 11,
    fontWeight: "500",
    color: "#737373",
    textAlign: "right",
  },

  value: {
    width: "100%",
    marginTop: 7,
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  description: {
    width: "100%",
    marginTop: 5,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },
});