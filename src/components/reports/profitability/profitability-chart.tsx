import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  DailyProfitability,
} from "@/types/reports";

type ProfitabilityChartProps = {
  data: DailyProfitability[];
};

const CHART_HEIGHT = 180;
const MAX_ITEMS = 14;

function formatNumber(value: string): string {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("fa-IR").format(
    number,
  );
}

function formatCompactNumber(
  value: number,
): string {
  if (value >= 1_000_000_000) {
    return `${new Intl.NumberFormat("fa-IR", {
      maximumFractionDigits: 1,
    }).format(value / 1_000_000_000)} میلیارد`;
  }

  if (value >= 1_000_000) {
    return `${new Intl.NumberFormat("fa-IR", {
      maximumFractionDigits: 1,
    }).format(value / 1_000_000)} میلیون`;
  }

  if (value >= 1_000) {
    return `${new Intl.NumberFormat("fa-IR", {
      maximumFractionDigits: 1,
    }).format(value / 1_000)} هزار`;
  }

  return formatNumber(String(value));
}

function formatDateLabel(
  dateString: string,
): string {
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[2]}/${parts[1]}`;
}

export default function ProfitabilityChart({
  data,
}: ProfitabilityChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          داده‌ای برای نمایش نمودار وجود ندارد.
        </Text>
      </View>
    );
  }

  const chartData = data.slice(-MAX_ITEMS);

  const values = chartData.flatMap((item) => [
    Number(item.sales),
    Number(item.material_cost),
    Number(item.gross_profit),
  ]);

  const validValues = values.filter(
    (value) => Number.isFinite(value),
  );

  const maxValue =
    validValues.length > 0
      ? Math.max(...validValues)
      : 0;

  const safeMaxValue =
    maxValue > 0 ? maxValue : 1;

  const screenWidth =
    Dimensions.get("window").width;

  const chartWidth = Math.max(
    screenWidth - 84,
    240,
  );

  const barGroupWidth =
    chartWidth / chartData.length;

  const barWidth = Math.max(
    Math.min(barGroupWidth * 0.18, 9),
    4,
  );

  return (
    <View style={styles.card}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              styles.profitDot,
            ]}
          />
          <Text style={styles.legendText}>
            سود ناخالص
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              styles.costDot,
            ]}
          />
          <Text style={styles.legendText}>
            هزینه مواد
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              styles.salesDot,
            ]}
          />
          <Text style={styles.legendText}>
            فروش
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>
            {formatCompactNumber(safeMaxValue)}
          </Text>

          <Text style={styles.axisLabel}>
            {formatCompactNumber(
              safeMaxValue / 2,
            )}
          </Text>

          <Text style={styles.axisLabel}>
            ۰
          </Text>
        </View>

        <View
          style={[
            styles.chart,
            {
              width: chartWidth,
            },
          ]}
        >
          <View style={styles.gridLineTop} />
          <View style={styles.gridLineMiddle} />
          <View style={styles.gridLineBottom} />

          <View style={styles.barsContainer}>
            {chartData.map((item) => {
              const sales = Number(item.sales);
              const materialCost = Number(
                item.material_cost,
              );
              const grossProfit = Number(
                item.gross_profit,
              );

              const salesHeight =
                Math.max(
                  (sales / safeMaxValue) *
                    CHART_HEIGHT,
                  sales > 0 ? 2 : 0,
                );

              const costHeight =
                Math.max(
                  (materialCost /
                    safeMaxValue) *
                    CHART_HEIGHT,
                  materialCost > 0 ? 2 : 0,
                );

              const profitHeight =
                grossProfit > 0
                  ? Math.max(
                      (grossProfit /
                        safeMaxValue) *
                        CHART_HEIGHT,
                      2,
                    )
                  : 0;

              return (
                <View
                  key={item.date}
                  style={[
                    styles.barGroup,
                    {
                      width: barGroupWidth,
                    },
                  ]}
                >
                  <View
                    style={styles.barArea}
                  >
                    <View
                      style={[
                        styles.bar,
                        styles.salesBar,
                        {
                          width: barWidth,
                          height: salesHeight,
                        },
                      ]}
                    />

                    <View
                      style={[
                        styles.bar,
                        styles.costBar,
                        {
                          width: barWidth,
                          height: costHeight,
                        },
                      ]}
                    />

                    <View
                      style={[
                        styles.bar,
                        styles.profitBar,
                        {
                          width: barWidth,
                          height: profitHeight,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={styles.dateLabel}
                    numberOfLines={1}
                  >
                    {formatDateLabel(
                      item.date,
                    )}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {chartData.length} روز اخیر
        </Text>

        <Text style={styles.footerText}>
          ارقام به تومان
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 280,
    marginBottom: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  legend: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },

  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  salesDot: {
    backgroundColor: "#171717",
  },

  costDot: {
    backgroundColor: "#a3a3a3",
  },

  profitDot: {
    backgroundColor: "#525252",
  },

  legendText: {
    fontSize: 10,
    color: "#737373",
  },

  chartWrapper: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },

  yAxis: {
    width: 48,
    height: CHART_HEIGHT,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: 1,
  },

  axisLabel: {
    fontSize: 8,
    color: "#a3a3a3",
  },

  chart: {
    height: CHART_HEIGHT + 30,
    position: "relative",
  },

  gridLineTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#f0f0f0",
  },

  gridLineMiddle: {
    position: "absolute",
    top: CHART_HEIGHT / 2,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#f0f0f0",
  },

  gridLineBottom: {
    position: "absolute",
    top: CHART_HEIGHT,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#e5e5e5",
  },

  barsContainer: {
    height: CHART_HEIGHT + 30,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  barGroup: {
    height: CHART_HEIGHT + 30,
    alignItems: "center",
  },

  barArea: {
    width: "100%",
    height: CHART_HEIGHT,
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 2,
  },

  bar: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  salesBar: {
    backgroundColor: "#171717",
  },

  costBar: {
    backgroundColor: "#a3a3a3",
  },

  profitBar: {
    backgroundColor: "#525252",
  },

  dateLabel: {
    width: 34,
    marginTop: 7,
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
    justifyContent: "space-between",
  },

  footerText: {
    fontSize: 9,
    color: "#a3a3a3",
  },

  emptyContainer: {
    width: "100%",
    minHeight: 190,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 11,
    color: "#a3a3a3",
  },
});