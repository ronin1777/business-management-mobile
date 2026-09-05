import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker from "react-native-ui-datepicker";
import {
  CalendarDays,
  Check,
  ChevronDown,
} from "lucide-react-native";

import {
  formatDateForApi,
  formatPersianDate,
  getDateRangeFromPreset,
} from "@/utils/date";

import type {
  DateRange,
  DateRangePreset,
} from "@/utils/date";

type ReportDateRangeProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

type PresetItem = {
  value: DateRangePreset;
  label: string;
};

const PRESETS: PresetItem[] = [
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
    label: "این ماه",
  },
  {
    value: "last_month",
    label: "ماه قبل",
  },
];

function findActivePreset(
  value: DateRange,
): DateRangePreset | null {
  for (const preset of PRESETS) {
    const range = getDateRangeFromPreset(
      preset.value,
    );

    if (
      range.dateFrom === value.dateFrom &&
      range.dateTo === value.dateTo
    ) {
      return preset.value;
    }
  }

  return null;
}

function parseDate(
  dateString: string,
): Date {
  const [year, month, day] =
    dateString.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

function convertToDate(
  value: unknown,
): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  return null;
}

export default function ReportDateRange({
  value,
  onChange,
}: ReportDateRangeProps) {
  const [calendarOpen, setCalendarOpen] =
    useState(false);

  const activePreset = useMemo(
    () => findActivePreset(value),
    [value],
  );

  const handlePresetPress = (
    preset: DateRangePreset,
  ) => {
    const range =
      getDateRangeFromPreset(preset);

    onChange(range);
  };

  const handleCalendarChange = (
    params: any,
  ) => {
    const startDate = params?.startDate;
    const endDate = params?.endDate;

    const start = convertToDate(
      startDate,
    );

    const end = convertToDate(
      endDate,
    );

    if (!start || !end) {
      return;
    }

    onChange({
      dateFrom: formatDateForApi(start),
      dateTo: formatDateForApi(end),
    });

    setCalendarOpen(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <CalendarDays
              size={17}
              color="#525252"
              strokeWidth={2}
            />

            <Text style={styles.title}>
              بازه گزارش
            </Text>
          </View>

          <Text style={styles.rangeText}>
            {formatPersianDate(
              value.dateFrom,
            )}
            {"  تا  "}
            {formatPersianDate(
              value.dateTo,
            )}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.presetList
          }
        >
          {PRESETS.map((preset) => {
            const isActive =
              activePreset === preset.value;

            return (
              <Pressable
                key={preset.value}
                onPress={() =>
                  handlePresetPress(
                    preset.value,
                  )
                }
                style={[
                  styles.presetButton,
                  isActive &&
                    styles.presetButtonActive,
                ]}
              >
                {isActive && (
                  <Check
                    size={14}
                    color="#171717"
                    strokeWidth={2.5}
                  />
                )}

                <Text
                  style={[
                    styles.presetText,
                    isActive &&
                      styles.presetTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() =>
              setCalendarOpen(true)
            }
            style={styles.customButton}
          >
            <CalendarDays
              size={15}
              color="#525252"
              strokeWidth={2}
            />

            <Text
              style={styles.customButtonText}
            >
              انتخاب بازه
            </Text>

            <ChevronDown
              size={14}
              color="#737373"
              strokeWidth={2}
            />
          </Pressable>
        </ScrollView>
      </View>

      <Modal
        visible={calendarOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCalendarOpen(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View
                style={styles.modalHeaderContent}
              >
                <Text style={styles.modalTitle}>
                  انتخاب بازه زمانی
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  تاریخ شروع و پایان گزارش را
                  انتخاب کنید.
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setCalendarOpen(false)
                }
                style={styles.closeButton}
              >
                <Text
                  style={styles.closeButtonText}
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <DateTimePicker
              mode="range"
              startDate={parseDate(
                value.dateFrom,
              )}
              endDate={parseDate(
                value.dateTo,
              )}
              onChange={
                handleCalendarChange
              }
              locale="fa"
            />

            <Pressable
              onPress={() =>
                setCalendarOpen(false)
              }
              style={styles.cancelButton}
            >
              <Text
                style={styles.cancelButtonText}
              >
                انصراف
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  header: {
    alignItems: "flex-end",
    marginBottom: 10,
  },

  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
  },

  rangeText: {
    marginTop: 5,
    fontSize: 11,
    color: "#a3a3a3",
  },

  presetList: {
    gap: 8,
  },

  presetButton: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  presetButtonActive: {
    backgroundColor: "#f0f0f0",
    borderColor: "#d4d4d4",
  },

  presetText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#525252",
  },

  presetTextActive: {
    color: "#171717",
    fontWeight: "600",
  },

  customButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  customButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#525252",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },

  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  modalHeaderContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "right",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    fontSize: 22,
    lineHeight: 24,
    color: "#525252",
    fontWeight: "400",
  },

  cancelButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
});