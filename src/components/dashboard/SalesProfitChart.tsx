import { useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

import type { DashboardTrendItem } from "@/types/dashboard";

type SalesProfitChartProps = {
  sales: DashboardTrendItem[];
  grossProfit: DashboardTrendItem[];
  onDateSelect?: (date: string) => void;
};

type ChartPoint = {
  value: number;
  date: string;
  dataPointColor?: string;
};

type LineSegmentConfig = {
  startIndex: number;
  endIndex: number;
  color: string;
};

// ========== تغییر رنگ نارنجی به سبز ==========
const POSITIVE_COLOR = "#10B981"; // سبز ملایم برای سود مثبت
const NEGATIVE_COLOR = "#EF4444";
const SALES_COLOR = "#2563EB";

// Hoisted outside the component so it's constructed once, not on every render.
const currencyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});

function toChartData(items: DashboardTrendItem[]): ChartPoint[] {
  return items.map((item) => ({
    value: Number(item.value) || 0,
    date: item.date,
  }));
}

// Profit points additionally carry a per-point color so negative
// dots render red even if the line segment coloring is adjusted later.
function toProfitChartData(items: DashboardTrendItem[]): ChartPoint[] {
  return items.map((item) => {
    const value = Number(item.value) || 0;
    return {
      value,
      date: item.date,
      dataPointColor: value < 0 ? NEGATIVE_COLOR : POSITIVE_COLOR,
    };
  });
}

// Splits a line into contiguous same-sign runs so `lineSegments2` can
// paint the negative portions of the profit line red.
function buildSignSegments(data: ChartPoint[]): LineSegmentConfig[] | undefined {
  if (data.length < 2) {
    return undefined;
  }

  const segments: LineSegmentConfig[] = [];
  let segmentStart = 0;
  let currentSign: "pos" | "neg" = data[0].value < 0 ? "neg" : "pos";

  for (let i = 1; i < data.length; i += 1) {
    const sign: "pos" | "neg" = data[i].value < 0 ? "neg" : "pos";

    if (sign !== currentSign) {
      segments.push({
        startIndex: segmentStart,
        endIndex: i,
        color: currentSign === "neg" ? NEGATIVE_COLOR : POSITIVE_COLOR,
      });
      segmentStart = i;
      currentSign = sign;
    }
  }

  segments.push({
    startIndex: segmentStart,
    endIndex: data.length - 1,
    color: currentSign === "neg" ? NEGATIVE_COLOR : POSITIVE_COLOR,
  });

  return segments;
}

function formatMoney(value: number): string {
  return currencyFormatter.format(value);
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

// Matches the same convention already used in the project's date utilities
// (Intl + fa-IR-u-ca-persian), built from local Y/M/D components rather than
// parsing the ISO string directly, which avoids a timezone-driven day shift.
const jalaliShortDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  month: "numeric",
  day: "numeric",
});

// The upstream `date` field arrives as a Gregorian ISO string (e.g. "2024-08-02").
function formatShortDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  const date = new Date(year, month - 1, day);

  return jalaliShortDateFormatter.format(date);
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

// Matches formatPersianDate() from the project's date utilities — full
// year/month/day, used inside the tooltip (the axis keeps the short form).
const jalaliFullDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatFullPersianDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  const date = new Date(year, month - 1, day);

  return jalaliFullDateFormatter.format(date);
}

// Renders "۱۳۳ هزار" / "۱٫۲ میلیون" style labels instead of the
// English "133K" / "1.2M" abbreviations.
function formatAxisValue(value: string): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  const absValue = Math.abs(number);
  const sign = number < 0 ? "-" : "";
  let formatted: string;

  if (absValue >= 1_000_000_000) {
    formatted = `${roundToOneDecimal(absValue / 1_000_000_000)} میلیارد`;
  } else if (absValue >= 1_000_000) {
    formatted = `${roundToOneDecimal(absValue / 1_000_000)} میلیون`;
  } else if (absValue >= 1_000) {
    formatted = `${roundToOneDecimal(absValue / 1_000)} هزار`;
  } else {
    formatted = String(Math.round(absValue));
  }

  return toPersianDigits(`${sign}${formatted}`);
}

// Precomputes date -> % change so the tooltip does O(1) lookups
// instead of an O(n) findIndex scan on every pointer move.
function buildChangeMap(data: ChartPoint[]): Map<string, number> {
  const map = new Map<string, number>();

  for (let index = 1; index < data.length; index += 1) {
    const current = data[index].value;
    const previous = data[index - 1].value;

    if (previous === 0) {
      continue;
    }

    const change = Number((((current - previous) / previous) * 100).toFixed(1));
    map.set(data[index].date, change);
  }

  return map;
}

export function SalesProfitChart({
  sales,
  grossProfit,
}: SalesProfitChartProps) {
  const salesData = useMemo(() => toChartData(sales), [sales]);
  const profitData = useMemo(() => toProfitChartData(grossProfit), [grossProfit]);

  const salesChangeMap = useMemo(() => buildChangeMap(salesData), [salesData]);
  const profitChangeMap = useMemo(() => buildChangeMap(profitData), [profitData]);

  const profitSignSegments = useMemo(
    () => buildSignSegments(profitData),
    [profitData],
  );

  const hasData = salesData.length > 0 || profitData.length > 0;

  if (!hasData) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>فروش و سود</Text>
            <Text style={styles.subtitle}>روند عملکرد در بازه انتخاب‌شده</Text>
          </View>
        </View>

        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            داده‌ای برای نمایش نمودار وجود ندارد.
          </Text>
        </View>
      </View>
    );
  }

  const pointCount = Math.max(salesData.length, profitData.length);
  const chartWidth = Math.max(340, pointCount * 58);

  const allValues = [
    ...salesData.map((item) => item.value),
    ...profitData.map((item) => item.value),
  ].filter((value) => Number.isFinite(value));

  const rawMax = allValues.length > 0 ? Math.max(...allValues) : 100;
  const rawMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const hasNegative = rawMin < 0;

  const maxValue = rawMax * 1.25;
  // Only pad a negative floor when negative values actually exist —
  // otherwise this used to produce a floor above zero for all-positive data.
  const minValue = hasNegative ? rawMin * 1.25 : 0;

  const totalSales = salesData.reduce((total, item) => total + item.value, 0);
  const totalProfit = profitData.reduce((total, item) => total + item.value, 0);

  const avgSales = totalSales / (salesData.length || 1);
  const avgProfit = totalProfit / (profitData.length || 1);

  const chartHeight = 300;

  // X axis labels are derived from whichever series has more points,
  // so a shorter series never truncates the labels.
  const labelSource = salesData.length >= profitData.length ? salesData : profitData;

  const renderPointerLabel = useCallback(
    (items: { value?: number; date?: string }[]) => {
      const salesValue = Number(items?.[0]?.value ?? 0);
      const profitValue = Number(items?.[1]?.value ?? 0);
      // `date` is a custom field carried on our data items — the library's
      // `label` field is never set here, so reading it (as before) always
      // returned undefined and change badges never appeared.
      const date = items?.[0]?.date ?? "";

      const salesChange = salesChangeMap.get(date) ?? 0;
      const profitChange = profitChangeMap.get(date) ?? 0;
      const isProfitNegative = profitValue < 0;

      return (
        <View style={styles.tooltipWrapper}>
          <View style={styles.tooltip}>
            <Text style={styles.tooltipDate}>{formatFullPersianDate(date)}</Text>

            <View style={styles.tooltipRow}>
              <View style={[styles.tooltipDot, styles.salesLine]} />

              <Text style={styles.tooltipText}>
                فروش: {formatMoney(salesValue)}
                {salesChange !== 0 && (
                  <Text
                    style={[
                      styles.changeText,
                      salesChange > 0 ? styles.positive : styles.negative,
                    ]}
                  >
                    {salesChange > 0 ? " ▲" : " ▼"} {Math.abs(salesChange)}%
                  </Text>
                )}
              </Text>
            </View>

            <View style={styles.tooltipRow}>
              <View
                style={[
                  styles.tooltipDot,
                  isProfitNegative ? styles.negativeLine : styles.profitLine,
                ]}
              />

              <Text
                style={[styles.tooltipText, isProfitNegative && styles.negativeText]}
              >
                سود: {formatMoney(profitValue)}
                {profitChange !== 0 && (
                  <Text
                    style={[
                      styles.changeText,
                      profitChange > 0 ? styles.positive : styles.negative,
                    ]}
                  >
                    {profitChange > 0 ? " ▲" : " ▼"} {Math.abs(profitChange)}%
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [salesChangeMap, profitChangeMap],
  );

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.card}
        accessible
        accessibilityLabel="نمودار فروش و سود ناخالص در طول زمان"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>فروش و سود</Text>
            <Text style={styles.subtitle}>روند عملکرد در بازه انتخاب‌شده</Text>

            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatMoney(avgSales)}</Text>
                <Text style={styles.statLabel}>میانگین فروش</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatMoney(avgProfit)}</Text>
                <Text style={styles.statLabel}>میانگین سود</Text>
              </View>
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, styles.salesLine]} />
              <Text style={styles.legendText}>فروش</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendLine, styles.profitLine]} />
              <Text style={styles.legendText}>سود</Text>
            </View>
          </View>
        </View>

        {/* Chart Area — single horizontal ScrollView only.
            The previous nested vertical ScrollView served no purpose for a
            fixed-height chart and could intercept/compete with pointer
            touch handling, so it has been removed. */}
        <View style={styles.chartWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
            contentContainerStyle={styles.chartContent}
          >
            <LineChart
              data={salesData}
              data2={profitData}
              width={chartWidth}
              height={chartHeight}
              spacing={58}
              initialSpacing={24}
              endSpacing={40}
              curved
              curvature={0.18}
              thickness={3}
              thickness2={3}
              color1={SALES_COLOR}
              color2={POSITIVE_COLOR}
              lineSegments2={profitSignSegments}
              dataPointsColor1={SALES_COLOR}
              dataPointsColor2={POSITIVE_COLOR}
              dataPointsRadius={4}
              dataPointsRadius2={4}
              hideDataPoints={false}
              interpolateMissingValues={false}
              showDataPointsForMissingValues={false}

              // ========== اضافه کردن گرادیان (Area Chart) ==========
              areaChart1
              areaChart2
              startFillColor1={SALES_COLOR}
              startFillColor2={POSITIVE_COLOR}
              endFillColor1={SALES_COLOR}
              endFillColor2={POSITIVE_COLOR}
              startOpacity1={0.15}
              startOpacity2={0.15}
              endOpacity1={0.01}
              endOpacity2={0.01}

              /*
               * Y axis
               */
              maxValue={maxValue}
              mostNegativeValue={hasNegative ? minValue : undefined}
              noOfSections={4}
              noOfSectionsBelowXAxis={hasNegative ? 2 : 0}
              yAxisLabelWidth={62}
              yAxisThickness={0}
              yAxisColor="transparent"
              yAxisTextStyle={styles.axisText}
              formatYLabel={formatAxisValue}
              /*
               * X axis
               */
              xAxisColor="#e5e5e5"
              xAxisThickness={1}
              xAxisLabelsAtBottom={hasNegative}
              xAxisLabelTextStyle={styles.axisText}
              xAxisLabelTexts={labelSource.map((item) => formatShortDate(item.date))}
              /*
               * Grid
               */
              hideRules={false}
              rulesColor="#f1f1f1"
              rulesType="solid"
              showVerticalLines={false}
              overflowTop={40}
              overflowBottom={80}
              /*
               * Tooltip / Pointer
               */
              pointerConfig={{
                pointerStripHeight: chartHeight - 20,
                pointerStripWidth: 1,
                pointerStripColor: "#d4d4d4",

                pointerColor: SALES_COLOR,
                radius: 5,

                pointerLabelWidth: 170,
                pointerLabelHeight: 96,

                autoAdjustPointerLabelPosition: true,
                shiftPointerLabelY: -20,
                pointerVanishDelay: 1200,

                pointerLabelComponent: renderPointerLabel,
              }}
              /*
               * Animation
               */
              isAnimated
              animationDuration={600}
              animateOnDataChange
              onDataChangeAnimationDuration={400}
            />
          </ScrollView>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIndicator, styles.salesIndicator]} />

            <View>
              <Text style={styles.summaryLabel}>مجموع فروش</Text>
              <Text style={styles.summaryValue}>{formatMoney(totalSales)}</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIndicator, styles.profitIndicator]} />

            <View>
              <Text style={styles.summaryLabel}>سود ناخالص</Text>
              <Text
                style={[
                  styles.summaryValue,
                  totalProfit < 0 && styles.negativeText,
                ]}
              >
                {formatMoney(totalProfit)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "visible",
    paddingBottom: 20,
  },

  card: {
    marginTop: 24,
    marginHorizontal: 20,

    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 18,

    backgroundColor: "#ffffff",

    overflow: "visible",
    elevation: 1,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 10,

    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 5,

    fontSize: 12,
    color: "#a3a3a3",

    textAlign: "right",
  },

  headerStats: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
    paddingHorizontal: 4,
  },

  statItem: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#171717",
  },

  statLabel: {
    fontSize: 9,
    color: "#A3A3A3",
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E5E5",
  },

  legend: {
    marginLeft: 12,

    flexDirection: "row-reverse",
    alignItems: "center",

    gap: 12,
  },

  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",

    gap: 6,
  },

  legendLine: {
    width: 18,
    height: 3,

    borderRadius: 2,
  },

  salesLine: {
    backgroundColor: "#2563EB",
  },

  profitLine: {
    backgroundColor: "#10B981", // تغییر به سبز
  },

  negativeLine: {
    backgroundColor: "#EF4444",
  },

  legendText: {
    fontSize: 11,
    color: "#525252",
  },

  chartWrapper: {
    // height + overflowTop + overflowBottom + label/padding space, with a
    // generous safety margin so the Jalali date labels are never clipped.
    height: 500,
    overflow: "visible",
  },

  chartContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 8,
  },

  axisText: {
    fontSize: 9,
    color: "#a3a3a3",
  },

  /*
   * Tooltip
   */
  tooltipWrapper: {
    width: 170,
    height: 96,

    alignItems: "center",
    justifyContent: "center",

    overflow: "visible",
  },

  tooltip: {
    width: 162,

    minHeight: 86,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: "#e5e5e5",

    backgroundColor: "#ffffff",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 8,
  },

  tooltipDate: {
    marginBottom: 5,

    fontSize: 10,
    fontWeight: "700",

    color: "#171717",

    textAlign: "right",
  },

  tooltipRow: {
    flexDirection: "row-reverse",
    alignItems: "center",

    marginTop: 3,

    gap: 6,
  },

  tooltipDot: {
    width: 7,
    height: 7,

    borderRadius: 4,
  },

  tooltipText: {
    flex: 1,

    fontSize: 10,
    color: "#525252",

    textAlign: "right",
  },

  negativeText: {
    color: "#EF4444",
  },

  changeText: {
    fontSize: 8,
    fontWeight: "600",
  },

  positive: {
    color: "#22C55E",
  },

  negative: {
    color: "#EF4444",
  },

  /*
   * Summary
   */
  summary: {
    marginHorizontal: 16,
    marginBottom: 16,

    minHeight: 68,

    borderRadius: 14,

    backgroundColor: "#f7f7f7",

    flexDirection: "row-reverse",
    alignItems: "center",
  },

  summaryItem: {
    flex: 1,

    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",

    gap: 9,

    paddingVertical: 10,
  },

  summaryIndicator: {
    width: 8,
    height: 8,

    borderRadius: 4,
  },

  salesIndicator: {
    backgroundColor: "#2563EB",
  },

  profitIndicator: {
    backgroundColor: "#10B981", // تغییر به سبز
  },

  summaryLabel: {
    fontSize: 10,
    color: "#737373",

    textAlign: "right",

    marginBottom: 3,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#171717",

    textAlign: "right",
  },

  summaryDivider: {
    width: 1,
    height: 34,

    backgroundColor: "#e5e5e5",
  },

  empty: {
    minHeight: 180,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 13,
    color: "#a3a3a3",

    textAlign: "center",
  },
});