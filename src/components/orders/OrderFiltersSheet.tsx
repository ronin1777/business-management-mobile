import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/orders";

export type OrderDateFilter =
  | "all"
  | "today"
  | "this_week"
  | "this_month"
  | "last_month";

type OrderFiltersSheetProps = {
  visible: boolean;

  status?: OrderStatus;

  paymentStatus?: OrderPaymentStatus;

  dateFilter: OrderDateFilter;

  onStatusChange: (
    status?: OrderStatus,
  ) => void;

  onPaymentStatusChange: (
    status?: OrderPaymentStatus,
  ) => void;

  onDateFilterChange: (
    filter: OrderDateFilter,
  ) => void;

  onApply: () => void;

  onClear: () => void;

  onClose: () => void;
};

export function OrderFiltersSheet({
  visible,
  status,
  paymentStatus,
  dateFilter,
  onStatusChange,
  onPaymentStatusChange,
  onDateFilterChange,
  onApply,
  onClear,
  onClose,
}: OrderFiltersSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              فیلتر سفارش‌ها
            </Text>

            <Pressable
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={22}
                color="#525252"
              />
            </Pressable>
          </View>

          {/* Order Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              وضعیت سفارش
            </Text>

            <View style={styles.options}>
              <FilterOption
                label="همه"
                selected={!status}
                onPress={() =>
                  onStatusChange(undefined)
                }
              />

              <FilterOption
                label="تکمیل شده"
                selected={
                  status === "completed"
                }
                onPress={() =>
                  onStatusChange("completed")
                }
              />

              <FilterOption
                label="لغو شده"
                selected={
                  status === "cancelled"
                }
                onPress={() =>
                  onStatusChange("cancelled")
                }
              />
            </View>
          </View>

          {/* Payment Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              وضعیت پرداخت
            </Text>

            <View style={styles.options}>
              <FilterOption
                label="همه"
                selected={!paymentStatus}
                onPress={() =>
                  onPaymentStatusChange(
                    undefined,
                  )
                }
              />

              <FilterOption
                label="پرداخت شده"
                selected={
                  paymentStatus === "paid"
                }
                onPress={() =>
                  onPaymentStatusChange(
                    "paid",
                  )
                }
              />

              <FilterOption
                label="پرداخت ناقص"
                selected={
                  paymentStatus ===
                  "partially_paid"
                }
                onPress={() =>
                  onPaymentStatusChange(
                    "partially_paid",
                  )
                }
              />

              <FilterOption
                label="پرداخت نشده"
                selected={
                  paymentStatus === "unpaid"
                }
                onPress={() =>
                  onPaymentStatusChange(
                    "unpaid",
                  )
                }
              />
            </View>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              تاریخ سفارش
            </Text>

            <View style={styles.options}>
              <FilterOption
                label="همه"
                selected={
                  dateFilter === "all"
                }
                onPress={() =>
                  onDateFilterChange("all")
                }
              />

              <FilterOption
                label="امروز"
                selected={
                  dateFilter === "today"
                }
                onPress={() =>
                  onDateFilterChange("today")
                }
              />

              <FilterOption
                label="این هفته"
                selected={
                  dateFilter === "this_week"
                }
                onPress={() =>
                  onDateFilterChange(
                    "this_week",
                  )
                }
              />

              <FilterOption
                label="این ماه"
                selected={
                  dateFilter === "this_month"
                }
                onPress={() =>
                  onDateFilterChange(
                    "this_month",
                  )
                }
              />

              <FilterOption
                label="ماه قبل"
                selected={
                  dateFilter === "last_month"
                }
                onPress={() =>
                  onDateFilterChange(
                    "last_month",
                  )
                }
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={styles.clearButton}
              onPress={onClear}
            >
              <Text style={styles.clearText}>
                پاک کردن
              </Text>
            </Pressable>

            <Pressable
              style={styles.applyButton}
              onPress={onApply}
            >
              <Text style={styles.applyText}>
                اعمال فیلتر
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type FilterOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function FilterOption({
  label,
  selected,
  onPress,
}: FilterOptionProps) {
  return (
    <Pressable
      style={[
        styles.option,
        selected && styles.optionSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected &&
            styles.optionTextSelected,
        ]}
      >
        {label}
      </Text>

      {selected && (
        <Ionicons
          name="checkmark"
          size={17}
          color="#ffffff"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff",
  },

  handle: {
    width: 38,
    height: 4,
    alignSelf: "center",
    marginBottom: 18,
    borderRadius: 999,
    backgroundColor: "#d4d4d4",
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#404040",
    textAlign: "right",
  },

  options: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },

  option: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 11,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  optionSelected: {
    borderColor: "#171717",
    backgroundColor: "#171717",
  },

  optionText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#525252",
  },

  optionTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },

  actions: {
    marginTop: 28,
    flexDirection: "row-reverse",
    gap: 10,
  },

  clearButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#525252",
  },

  applyButton: {
    flex: 2,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  applyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
});