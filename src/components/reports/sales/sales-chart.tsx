import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BarChart3,
  TrendingUp,
} from "lucide-react-native";

import type { DailySales } from "@/types/reports";

type SalesChartProps = {
  data: DailySales[];
};

const CHART_HEIGHT = 210;

function parseValue(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(
    Math.round(value),
  );
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${formatNumber(
      value / 1_000_000_000,
    )} میلیارد`;
  }

  if (value >= 1_000_000) {
    return `${formatNumber(
      value / 1_000_000,
    )} میلیون`;
  }

  if (value >= 1_000) {
    return `${formatNumber(
      value / 1_000,
    )} هزار`;
  }

  return formatNumber(value);
}

function formatDateLabel(dateString: string): string {
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!month || !day) {
    return dateString;
  }

  return `${day}/${month}`;
}

function getChartData(data: DailySales[]): DailySales[] {
  return [...data]
    .sort((a, b) =>
      a.date.localeCompare(b.date),
    )
    .slice(-14);
}

export default function SalesChart({
  data,
}: SalesChartProps) {
  const chartData = getChartData(data);

  if (chartData.length === 0) {
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
          در بازه انتخاب‌شده فروش ثبت نشده است.
        </Text>
      </View>
    );
  }

  const values = chartData.map((item) =>
    parseValue(item.sales),
  );

  const totalSales = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  const averageSales =
    values.length > 0
      ? totalSales / values.length
      : 0;

  const maxValue = Math.max(...values, 0);

  const maxIndex = values.findIndex(
    (value) => value === maxValue,
  );

  const bestDay =
    maxIndex >= 0
      ? chartData[maxIndex]
      : null;

  /*
   * کمی فضا بالاتر از بیشترین مقدار
   * برای اینکه میله به سقف نچسبد.
   */
  const chartMax =
    maxValue > 0
      ? maxValue * 1.18
      : 1;

  /*
   * برای نمایش خط میانگین.
   */
  const averageRatio =
    averageSales / chartMax;

  const averageBottom =
    Math.max(
      0,
      Math.min(
        100,
        averageRatio * 100,
      ),
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            فروش روزانه
          </Text>

          <Text style={styles.subtitle}>
            عملکرد فروش در روزهای اخیر
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <TrendingUp
            size={18}
            color="#404040"
            strokeWidth={2}
          />
        </View>
      </View>

      {/* KPI */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            مجموع فروش
          </Text>

          <Text style={styles.summaryValue}>
            {formatCompactNumber(
              totalSales,
            )}
          </Text>

          <Text style={styles.summaryUnit}>
            تومان
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            میانگین روزانه
          </Text>

          <Text style={styles.summaryValue}>
            {formatCompactNumber(
              averageSales,
            )}
          </Text>

          <Text style={styles.summaryUnit}>
            تومان
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            بهترین روز
          </Text>

          <Text style={styles.summaryValue}>
            {bestDay
              ? formatCompactNumber(
                  parseValue(
                    bestDay.sales,
                  ),
                )
              : "—"}
          </Text>

          <Text style={styles.summaryUnit}>
            تومان
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartArea}>
        {/* Y Axis */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>
            {formatCompactNumber(
              chartMax,
            )}
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

        {/* Main chart */}
        <View style={styles.chart}>
          {/* Grid */}
          <View
            style={[
              styles.gridLine,
              {
                top: 0,
              },
            ]}
          />

          <View
            style={[
              styles.gridLine,
              {
                top:
                  (CHART_HEIGHT - 32) /
                  2,
              },
            ]}
          />

          <View
            style={[
              styles.gridLine,
              {
                bottom: 32,
              },
            ]}
          />

          {/* Average */}
          {averageSales > 0 && (
            <View
              style={[
                styles.averageLine,
                {
                  bottom:
                    32 +
                    ((CHART_HEIGHT -
                      64) *
                      averageRatio),
                },
              ]}
            >
              <View
                style={
                  styles.averageLabel
                }
              >
                <Text
                  style={
                    styles.averageLabelText
                  }
                >
                  میانگین
                </Text>
              </View>
            </View>
          )}

          {/* Bars */}
          <View style={styles.bars}>
            {chartData.map(
              (item, index) => {
                const value =
                  parseValue(
                    item.sales,
                  );

                const ratio =
                  value / chartMax;

                const barHeight =
                  value <= 0
                    ? 3
                    : Math.max(
                        5,
                        ratio *
                          (CHART_HEIGHT -
                            64),
                      );

                const isBestDay =
                  index === maxIndex;

                return (
                  <View
                    key={`${item.date}-${index}`}
                    style={styles.barColumn}
                  >
                    {/* Best day marker */}
                    {isBestDay &&
                      value > 0 && (
                        <View
                          style={
                            styles.bestMarker
                          }
                        >
                          <TrendingUp
                            size={10}
                            color="#ffffff"
                            strokeWidth={2.5}
                          />
                        </View>
                      )}

                    {/* Bar */}
                    <View
                      style={[
                        styles.bar,
                        {
                          height:
                            barHeight,
                          backgroundColor:
                            isBestDay
                              ? "#000000"
                              : "#404040",
                        },
                      ]}
                    />

                    {/* Date */}
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

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={styles.legendBar}
            />

            <Text style={styles.legendText}>
              فروش روزانه
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={styles.legendLine}
            />

            <Text style={styles.legendText}>
              میانگین
            </Text>
          </View>
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
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    overflow: "hidden",
  },

  /* Header */

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  headerText: {
    flex: 1,
    alignItems: "flex-end",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  /* Summary */

  summary: {
    flexDirection: "row-reverse",
    alignItems: "stretch",
    backgroundColor: "#fafafa",
    borderRadius: 14,
    paddingVertical: 11,
    marginBottom: 18,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  summaryDivider: {
    width: 1,
    backgroundColor: "#e5e5e5",
  },

  summaryLabel: {
    fontSize: 9,
    color: "#737373",
    textAlign: "center",
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#171717",
    textAlign: "center",
  },

  summaryUnit: {
    marginTop: 2,
    fontSize: 8,
    color: "#a3a3a3",
  },

  /* Chart */

  chartArea: {
    height: CHART_HEIGHT,
    flexDirection: "row",
  },

  yAxis: {
    width: 48,
    height: CHART_HEIGHT,
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 32,
  },

  axisLabel: {
    fontSize: 8,
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

  /* Average */

  averageLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: "#a3a3a3",
    borderStyle: "dashed",
    zIndex: 2,
  },

  averageLabel: {
    position: "absolute",
    right: 2,
    top: -15,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
  },

  averageLabelText: {
    fontSize: 7,
    color: "#737373",
    fontWeight: "600",
  },

  /* Bars */

  bars: {
    position: "absolute",
    left: 2,
    right: 2,
    bottom: 0,
    height: CHART_HEIGHT,
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 12,
  },

  bar: {
    width: "55%",
    minWidth: 7,
    maxWidth: 20,
    borderRadius: 6,
    marginBottom: 7,
  },

  bestMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  dateLabel: {
    width: 32,
    fontSize: 7,
    color: "#a3a3a3",
    textAlign: "center",
  },

  /* Footer */

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
    gap: 12,
  },

  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  legendBar: {
    width: 8,
    height: 8,
    borderRadius: 3,
    backgroundColor: "#404040",
  },

  legendLine: {
    width: 14,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: "#a3a3a3",
    borderStyle: "dashed",
  },

  legendText: {
    fontSize: 9,
    color: "#737373",
  },

  footerText: {
    fontSize: 9,
    color: "#a3a3a3",
  },

  /* Empty */

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