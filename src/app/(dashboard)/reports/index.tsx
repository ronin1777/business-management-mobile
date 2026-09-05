import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CustomerReport from "@/components/reports/customers/customer-report";
import InventoryReport from "@/components/reports/inventory/inventory-report";
import PurchaseReport from "@/components/reports/purchases/purchase-report";
import ProfitabilityReport from "@/components/reports/profitability/profitability-report";
import SupplierReport from "@/components/reports/suppliers/supplier-report";
import ReportDateRange from "@/components/reports/shared/report-date-range";
import ReportTabs, {
  type ReportTab,
} from "@/components/reports/shared/report-tabs";
import SalesReport from "@/components/reports/sales/sales-report";

import {
  getDateRangeFromPreset,
} from "@/utils/date";

import type { DateRange } from "@/utils/date";

export default function ReportsPage() {
  const [activeTab, setActiveTab] =
    useState<ReportTab>("sales");

  const [dateRange, setDateRange] =
    useState<DateRange>(() =>
      getDateRangeFromPreset("last_30_days"),
    );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.contentContainer
        }
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>
            تحلیل کسب‌وکار
          </Text>

          <Text style={styles.subtitle}>
            عملکرد فروش، خرید، سودآوری و وضعیت
            مالی کسب‌وکار را دقیق‌تر بررسی کنید.
          </Text>
        </View>

        {/* Tabs */}

        <ReportTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Date Range */}

        <View style={styles.dateRangeContainer}>
          <ReportDateRange
            value={dateRange}
            onChange={setDateRange}
          />
        </View>

        {/* Sales */}

        {activeTab === "sales" && (
          <View style={styles.reportContainer}>
            <SalesReport
              dateFrom={dateRange.dateFrom}
              dateTo={dateRange.dateTo}
            />
          </View>
        )}

        {/* Purchases */}

        {activeTab === "purchases" && (
          <View style={styles.reportContainer}>
            <PurchaseReport
              dateFrom={dateRange.dateFrom}
              dateTo={dateRange.dateTo}
            />
          </View>
        )}

        {/* Profitability */}

        {activeTab === "profitability" && (
          <View style={styles.reportContainer}>
            <ProfitabilityReport
              dateFrom={dateRange.dateFrom}
              dateTo={dateRange.dateTo}
            />
          </View>
        )}

        {/* Inventory */}

        {activeTab === "inventory" && (
          <View style={styles.reportContainer}>
            <InventoryReport />
          </View>
        )}

        {/* Customers */}

        {activeTab === "customers" && (
          <View style={styles.reportContainer}>
            <CustomerReport />
          </View>
        )}

        {/* Suppliers */}

        {activeTab === "suppliers" && (
          <View style={styles.reportContainer}>
            <SupplierReport />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  contentContainer: {
    paddingTop: 20,
    paddingBottom: 32,
  },

  header: {
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: "flex-end",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "right",
  },

  dateRangeContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },

  reportContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 4,
  },
});