import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import type { DashboardInsight } from "@/types/dashboard";

type BusinessInsightsProps = {
  insights: DashboardInsight[];
};

type InsightConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
  iconColor: string;
};

const insightConfig: Record<
  DashboardInsight["severity"],
  InsightConfig
> = {
  critical: {
    icon: "alert-circle-outline",
    iconBackground: "#fef2f2",
    iconColor: "#dc2626",
  },

  warning: {
    icon: "warning-outline",
    iconBackground: "#fff7ed",
    iconColor: "#ea580c",
  },

  positive: {
    icon: "trending-up-outline",
    iconBackground: "#f0fdf4",
    iconColor: "#16a34a",
  },

  info: {
    icon: "information-circle-outline",
    iconBackground: "#eff6ff",
    iconColor: "#2563eb",
  },
};

const severityPriority: Record<
  DashboardInsight["severity"],
  number
> = {
  critical: 0,
  warning: 1,
  positive: 2,
  info: 3,
};

export function BusinessInsights({
  insights,
}: BusinessInsightsProps) {
  const visibleInsights = [...insights]
    .sort(
      (a, b) =>
        severityPriority[a.severity] -
        severityPriority[b.severity],
    )
    .slice(0, 5);

  if (visibleInsights.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            بینش‌های کسب‌وکار
          </Text>

          <Text style={styles.description}>
            نکات و هشدارهای مهم بر اساس عملکرد کسب‌وکار
          </Text>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="sparkles-outline"
              size={24}
              color="#525252"
            />
          </View>

          <Text style={styles.emptyTitle}>
            نکته خاصی برای نمایش وجود ندارد
          </Text>

          <Text style={styles.emptyText}>
            عملکرد کسب‌وکار شما در وضعیت عادی قرار دارد.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          بینش‌های کسب‌وکار
        </Text>

        <Text style={styles.description}>
          نکات و هشدارهای مهم بر اساس عملکرد کسب‌وکار
        </Text>
      </View>

      <View style={styles.list}>
        {visibleInsights.map((insight) => {
          const config =
            insightConfig[insight.severity];

          return (
            <View
              key={`${insight.type}-${insight.metric}`}
              style={styles.insightCard}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      config.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name={config.icon}
                  size={21}
                  color={config.iconColor}
                />
              </View>

              <View style={styles.content}>
                <Text
                  style={styles.insightTitle}
                  numberOfLines={1}
                >
                  {insight.title}
                </Text>

                <Text style={styles.message}>
                  {insight.message}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 24,
  },

  header: {
    marginBottom: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  description: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#737373",
    textAlign: "right",
  },

  list: {
    gap: 10,
  },

  insightCard: {
    minHeight: 82,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  content: {
    flex: 1,
    alignItems: "flex-end",
  },

  insightTitle: {
    width: "100%",
    fontSize: 14,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  message: {
    width: "100%",
    marginTop: 5,
    fontSize: 12,
    lineHeight: 19,
    color: "#737373",
    textAlign: "right",
  },

  emptyCard: {
    minHeight: 150,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "center",
  },
});