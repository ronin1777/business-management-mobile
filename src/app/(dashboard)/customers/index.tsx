
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getCustomers } from "@/services/api/customers";
import type { Customer } from "@/types/customers";

const PAGE_SIZE = 10;

export default function CustomersScreen() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(
    async (pageNumber = 1, refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else if (pageNumber === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const response = await getCustomers({
          page: pageNumber,
          pageSize: PAGE_SIZE,
          search: search.trim() || undefined,
          ordering: "-created_at",
        });

        const results = response.data.results;

        if (pageNumber === 1) {
          setCustomers(results);
        } else {
          setCustomers((current) => [
            ...current,
            ...results,
          ]);
        }

        setPage(pageNumber);
        setHasNextPage(Boolean(response.data.next));
      } catch (err) {
        console.error("LOAD CUSTOMERS ERROR:", err);

        setError(
          "دریافت اطلاعات مشتریان با خطا مواجه شد.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadCustomers(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [loadCustomers]);

  const visibleCustomers = useMemo(() => {
    if (!activeOnly) {
      return customers;
    }

    return customers.filter(
      (customer) => customer.is_active,
    );
  }, [customers, activeOnly]);

  const handleRefresh = () => {
    loadCustomers(1, true);
  };

  const handleLoadMore = () => {
    if (
      loading ||
      refreshing ||
      loadingMore ||
      !hasNextPage
    ) {
      return;
    }

    loadCustomers(page + 1);
  };

  const handleCreateCustomer = () => {
    router.push(
      "/(dashboard)/customers/create",
    );
  };

  const handleCustomerPress = (customer: Customer) => {
    router.push({
  pathname: "/(dashboard)/customers/[id]",
  params: {
    id: String(customer.id),
  },
});
  };

  const renderCustomer = ({
    item,
  }: {
    item: Customer;
  }) => (
    <Pressable
      style={styles.customerCard}
      onPress={() => handleCustomerPress(item)}
    >
      <View style={styles.customerIcon}>
        <Ionicons
          name="person-outline"
          size={21}
          color="#525252"
        />
      </View>

      <View style={styles.customerContent}>
        <View style={styles.customerTopRow}>
          <Text
            style={styles.customerName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              item.is_active
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                item.is_active
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                item.is_active
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.is_active
                ? "فعال"
                : "غیرفعال"}
            </Text>
          </View>
        </View>

        <View style={styles.phoneRow}>
          <Ionicons
            name="call-outline"
            size={14}
            color="#a3a3a3"
          />

          <Text style={styles.phoneText}>
            {item.phone || "بدون شماره تماس"}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-back"
        size={18}
        color="#a3a3a3"
      />
    </Pressable>
  );

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color="#737373"
            />
          </View>

          <Text style={styles.emptyTitle}>
            دریافت اطلاعات ناموفق بود
          </Text>

          <Text style={styles.emptyDescription}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => loadCustomers(1)}
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color="#ffffff"
            />

            <Text style={styles.retryButtonText}>
              تلاش مجدد
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name={
              search.trim()
                ? "search-outline"
                : "people-outline"
            }
            size={28}
            color="#737373"
          />
        </View>

        <Text style={styles.emptyTitle}>
          {search.trim()
            ? "مشتری‌ای پیدا نشد"
            : "هنوز مشتری‌ای ثبت نشده"}
        </Text>

        <Text style={styles.emptyDescription}>
          {search.trim()
            ? "عبارت جستجو را تغییر دهید و دوباره امتحان کنید."
            : "برای شروع، اولین مشتری خود را ثبت کنید."}
        </Text>

        {!search.trim() && (
          <Pressable
            style={styles.retryButton}
            onPress={handleCreateCustomer}
          >
            <Ionicons
              name="add"
              size={18}
              color="#ffffff"
            />

            <Text style={styles.retryButtonText}>
              ایجاد مشتری
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              مشتریان
            </Text>

            <Text style={styles.subtitle}>
              مدیریت و پیگیری مشتریان
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {customers.length}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.createButton}
          onPress={handleCreateCustomer}
        >
          <Ionicons
            name="add"
            size={19}
            color="#ffffff"
          />

          <Text style={styles.createButtonText}>
            مشتری جدید
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={19}
          color="#737373"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="جستجوی نام یا شماره تماس..."
          placeholderTextColor="#a3a3a3"
          style={styles.searchInput}
          textAlign="right"
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={10}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color="#a3a3a3"
            />
          </Pressable>
        )}
      </View>

      <View style={styles.filtersRow}>
        <Pressable
          style={[
            styles.filterButton,
            activeOnly && styles.filterButtonActive,
          ]}
          onPress={() =>
            setActiveOnly((current) => !current)
          }
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={17}
            color={
              activeOnly ? "#ffffff" : "#525252"
            }
          />

          <Text
            style={[
              styles.filterText,
              activeOnly &&
                styles.filterTextActive,
            ]}
          >
            فقط فعال‌ها
          </Text>
        </Pressable>

        <Text style={styles.resultsText}>
          {visibleCustomers.length} مشتری
        </Text>
      </View>

      <FlatList
        data={visibleCustomers}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderCustomer}
        contentContainerStyle={[
          styles.listContent,
          visibleCustomers.length === 0 &&
            styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  headerTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
    flex: 1,
  },

  headerTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#737373",
    textAlign: "right",
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#525252",
  },

  createButton: {
    height: 42,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  createButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },

  searchContainer: {
    marginHorizontal: 16,
    height: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 4,
    fontSize: 13,
    color: "#171717",
  },

  filtersRow: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  filterButtonActive: {
    borderColor: "#171717",
    backgroundColor: "#171717",
  },

  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#525252",
  },

  filterTextActive: {
    color: "#ffffff",
  },

  resultsText: {
    fontSize: 11,
    color: "#737373",
    fontWeight: "600",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  customerCard: {
    minHeight: 76,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  customerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
  },

  customerContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  customerTopRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  customerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#262626",
    textAlign: "right",
  },

  statusBadge: {
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  activeBadge: {
    backgroundColor: "#f0fdf4",
  },

  inactiveBadge: {
    backgroundColor: "#f5f5f5",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    backgroundColor: "#16a34a",
  },

  inactiveDot: {
    backgroundColor: "#a3a3a3",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#737373",
  },

  phoneRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  phoneText: {
    fontSize: 11,
    color: "#737373",
    textAlign: "right",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#262626",
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#737373",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 15,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  retryButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },

  footerLoader: {
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
});
