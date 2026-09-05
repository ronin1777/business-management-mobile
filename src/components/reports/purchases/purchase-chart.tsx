import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart3 } from "lucide-react-native";

import type { DailyPurchase } from "@/types/reports";

type PurchaseChartProps = {
  data: DailyPurchase[];
};

const SCREEN_WIDTH =
  Dimensions.get("window").width;

const CHART_WIDTH = Math.max(
  SCREEN_WIDTH - 64,
  248,
);

const CHART_HEIGHT = 220;

function parseValue(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(
    value,
  );
}

function formatCompactNumber(
  value: number,
): string {
  if (value >= 1_000_000_000) {
    return `${formatNumber(
      Math.round(value / 1_000_000_000),
    )} میلیارد`;
  }

  if (value >= 1_000_000) {
    return `${formatNumber(
      Math.round(value / 1_000_000),
    )} میلیون`;
  }

  if (value >= 1_000) {
    return `${formatNumber(
      Math.round(value / 1_000),
    )} هزار`;
  }

  return formatNumber(value);
}

function formatDateLabel(
  dateString: string,
): string {
  const [, month, day] =
    dateString.split("-");

  if (!month || !day) {
    return dateString;
  }

  return `${Number(day)}/${Number(month)}`;
}

export default function PurchaseChart({
  data,
}: PurchaseChartProps) {
  if (!data.length) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <BarChart3
            size={24}
            color="#a3a3a3"
            strokeWidth={1.7}
          />
        </View>

        <Text style={styles.emptyTitle}>
          داده‌ای برای نمایش وجود ندارد
        </Text>

        <Text style={styles.emptyText}>
          در بازه انتخاب‌شده خریدی ثبت نشده است.
        </Text>
      </View>
    );
  }

  const values = data.map((item) =>
    parseValue(item.purchases),
  );

  const maxValue = Math.max(
    ...values,
    1,
  );

  const chartData = data.slice(-14);

  const chartValues = chartData.map(
    (item) => parseValue(item.purchases),
  );

  const chartMax = Math.max(
    ...chartValues,
    1,
  );

  const barAreaWidth =
    CHART_WIDTH - 52;

  const barWidth = Math.max(
    12,
    Math.min(
      28,
      (barAreaWidth / chartData.length) *
        0.55,
    ),
  );

  const barGap =
    chartData.length > 1
      ? Math.max(
          5,
          (barAreaWidth -
            barWidth *
              chartData.length) /
            (chartData.length - 1),
        )
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryText}>
          <Text style={styles.summaryLabel}>
            بیشترین خرید
          </Text>

          <Text style={styles.summaryValue}>
            {formatCompactNumber(maxValue)}
          </Text>
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.summaryLabel}>
            روزهای نمایش
          </Text>

          <Text style={styles.summaryValue}>
            {formatNumber(chartData.length)}
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>
            {formatCompactNumber(chartMax)}
          </Text>

          <Text style={styles.axisLabel}>
            {formatCompactNumber(
              chartMax / 2,
            )}
          </Text>

          <Text style={styles.axisLabel}>
            ۰
          </Text>
        </View>

        <View style={styles.chart}>
          <View
            style={[
              styles.gridLine,
              { top: 0 },
            ]}
          />

          <View
            style={[
              styles.gridLine,
              {
                top:
                  CHART_HEIGHT / 2,
              },
            ]}
          />

          <View
            style={[
              styles.gridLine,
              { bottom: 24 },
            ]}
          />

          <View style={styles.bars}>
            {chartData.map(
              (item, index) => {
                const value =
                  parseValue(
                    item.purchases,
                  );

                const ratio =
                  value / chartMax;

                const barHeight =
                  Math.max(
                    value > 0 ? 6 : 2,
                    ratio *
                      (CHART_HEIGHT - 52),
                  );

                return (
                  <View
                    key={`${item.date}-${index}`}
                    style={[
                      styles.barColumn,
                      {
                        width:
                          barWidth,
                        marginRight:
                          index ===
                          chartData.length -
                            1
                            ? 0
                            : barGap,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.bar,
                        {
                          height:
                            barHeight,
                        },
                      ]}
                    />

                    <Text
                      style={
                        styles.dateLabel
                      }
                      numberOfLines={1}
                    >
                      {formatDateLabel(
                        item.date,
                      )}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.legend}>
          <View
            style={styles.legendDot}
          />

          <Text style={styles.legendText}>
            خرید روزانه
          </Text>
        </View>

        <Text style={styles.footerText}>
          {data.length > 14
            ? "۱۴ روز اخیر"
            : "بازه انتخاب‌شده"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 300,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },

  summary: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  summaryText: {
    alignItems: "flex-end",
  },

  summaryLabel: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#404040",
  },

  chartWrapper: {
    height: CHART_HEIGHT,
    flexDirection: "row",
    alignItems: "stretch",
  },

  yAxis: {
    width: 48,
    height: CHART_HEIGHT,
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 24,
  },

  axisLabel: {
    fontSize: 9,
    color: "#a3a3a3",
  },

  chart: {
    flex: 1,
    height: CHART_HEIGHT,
    position: "relative",
    overflow: "hidden",
  },

  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#f0f0f0",
  },

  bars: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 0,
    height: CHART_HEIGHT - 24,
    flexDirection: "row-reverse",
    alignItems: "flex-end",
  },

  barColumn: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bar: {
    width: "100%",
    minHeight: 2,
    borderRadius: 5,
    backgroundColor: "#171717",
    marginBottom: 8,
  },

  dateLabel: {
    width: 34,
    fontSize: 8,
    color: "#a3a3a3",
    textAlign: "center",
  },

  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  legend: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#171717",
  },

  legendText: {
    fontSize: 10,
    color: "#737373",
  },

  footerText: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  empty: {
    minHeight: 260,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "center",
  },
});