
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { OrderCard } from "@/components/orders/OrderCard";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { OrderFiltersSheet } from "@/components/orders/OrderFiltersSheet";
import type { OrderDateFilter } from "@/components/orders/OrderFiltersSheet";

import { getOrders } from "@/services/api/orders";

import type {
  Order,
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/orders";

const PAGE_SIZE = 10;

function getDateRange(
  filter: OrderDateFilter,
) {
  if (filter === "all") {
    return {
      orderedAtAfter: undefined,
      orderedAtBefore: undefined,
    };
  }

  const now = new Date();

  let from: Date;
  let to: Date;

  switch (filter) {
    case "today": {
      from = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      to = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      break;
    }

    case "this_week": {
      const day = now.getDay();

      // Monday = 0
      // Sunday = 6
      const daysFromMonday =
        day === 0 ? 6 : day - 1;

      from = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() -
          daysFromMonday,
      );

      to = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate() + 7,
      );

      break;
    }

    case "this_month": {
      from = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

      to = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      );

      break;
    }

    case "last_month": {
      from = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      to = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

      break;
    }
  }

  return {
    orderedAtAfter:
      from.toISOString(),
    orderedAtBefore:
      to.toISOString(),
  };
}

export default function OrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  /*
   * Draft filters:
   * These are the values currently selected
   * inside the filter sheet.
   */
  const [status, setStatus] =
    useState<OrderStatus | undefined>();

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState<
    OrderPaymentStatus | undefined
  >();

  const [dateFilter, setDateFilter] =
    useState<OrderDateFilter>("all");

  /*
   * Applied filters:
   * These are the filters actually sent
   * to the API.
   */
  const [
    appliedStatus,
    setAppliedStatus,
  ] = useState<
    OrderStatus | undefined
  >();

  const [
    appliedPaymentStatus,
    setAppliedPaymentStatus,
  ] = useState<
    OrderPaymentStatus | undefined
  >();

  const [
    appliedDateFilter,
    setAppliedDateFilter,
  ] = useState<OrderDateFilter>("all");

  const [
    filterVisible,
    setFilterVisible,
  ] = useState(false);

  const loadOrders = useCallback(
    async ({
      targetPage,
      append,
      searchValue,
      statusValue,
      paymentStatusValue,
      dateFilterValue,
    }: {
      targetPage: number;
      append: boolean;
      searchValue: string;
      statusValue?: OrderStatus;
      paymentStatusValue?: OrderPaymentStatus;
      dateFilterValue: OrderDateFilter;
    }) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const dateRange =
          getDateRange(
            dateFilterValue,
          );

        const response =
          await getOrders({
            page: targetPage,
            pageSize: PAGE_SIZE,
            search:
              searchValue.trim() ||
              undefined,
            status: statusValue,
            paymentStatus:
              paymentStatusValue,
            orderedAtAfter:
              dateRange.orderedAtAfter,
            orderedAtBefore:
              dateRange.orderedAtBefore,
            ordering: "-ordered_at",
          });

        const newOrders =
          response.data.results;

        if (append) {
          setOrders((current) => [
            ...current,
            ...newOrders,
          ]);
        } else {
          setOrders(newOrders);
        }

        setTotalCount(
          response.data.count,
        );

        setHasNextPage(
          Boolean(response.data.next),
        );

        setPage(targetPage);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت سفارش‌ها رخ داد.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  /*
   * Initial request.
   */
  useEffect(() => {
    loadOrders({
      targetPage: 1,
      append: false,
      searchValue: "",
      statusValue: undefined,
      paymentStatusValue:
        undefined,
      dateFilterValue: "all",
    });
  }, [loadOrders]);

  const handleSearch = () => {
    loadOrders({
      targetPage: 1,
      append: false,
      searchValue: search,
      statusValue: appliedStatus,
      paymentStatusValue:
        appliedPaymentStatus,
      dateFilterValue:
        appliedDateFilter,
    });
  };

  const handleLoadMore = () => {
    if (
      loadingMore ||
      !hasNextPage
    ) {
      return;
    }

    loadOrders({
      targetPage: page + 1,
      append: true,
      searchValue: search,
      statusValue: appliedStatus,
      paymentStatusValue:
        appliedPaymentStatus,
      dateFilterValue:
        appliedDateFilter,
    });
  };

  const handleApplyFilters = () => {
    setAppliedStatus(status);

    setAppliedPaymentStatus(
      paymentStatus,
    );

    setAppliedDateFilter(
      dateFilter,
    );

    setFilterVisible(false);

    loadOrders({
      targetPage: 1,
      append: false,
      searchValue: search,
      statusValue: status,
      paymentStatusValue:
        paymentStatus,
      dateFilterValue: dateFilter,
    });
  };

  const handleClearFilters = () => {
    setStatus(undefined);
    setPaymentStatus(undefined);
    setDateFilter("all");

    setAppliedStatus(undefined);
    setAppliedPaymentStatus(
      undefined,
    );
    setAppliedDateFilter("all");

    setFilterVisible(false);

    loadOrders({
      targetPage: 1,
      append: false,
      searchValue: search,
      statusValue: undefined,
      paymentStatusValue: undefined,
      dateFilterValue: "all",
    });
  };

  const handleOrderPress = (
    order: Order,
  ) => {
    router.push({
      pathname:
        "/(dashboard)/orders/[id]",
      params: {
        id: String(order.id),
      },
    });
  };

  const handleCreateOrder = () => {
    router.push(
      "/(dashboard)/orders/create",
    );
  };

  const hasActiveFilters =
    Boolean(appliedStatus) ||
    Boolean(appliedPaymentStatus) ||
    appliedDateFilter !== "all";

  if (
    loading &&
    orders.length === 0
  ) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text style={styles.stateText}>
          در حال دریافت سفارش‌ها...
        </Text>
      </View>
    );
  }

  if (
    error &&
    orders.length === 0
  ) {
    return (
      <View style={styles.centerState}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#dc2626"
          />
        </View>

        <Text style={styles.stateTitle}>
          دریافت سفارش‌ها ناموفق بود
        </Text>

        <Text style={styles.stateText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() =>
            loadOrders({
              targetPage: 1,
              append: false,
              searchValue: search,
              statusValue:
                appliedStatus,
              paymentStatusValue:
                appliedPaymentStatus,
              dateFilterValue:
                appliedDateFilter,
            })
          }
        >
          <Text style={styles.retryText}>
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={handleOrderPress}
          />
        )}
        contentContainerStyle={
          orders.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        onEndReached={
          handleLoadMore
        }
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            <OrdersHeader
              totalCount={totalCount}
              onCreateOrder={
                handleCreateOrder
              }
            />

            {/* Search + Filter */}
            <View
              style={styles.searchRow}
            >
              <View
                style={
                  styles.searchContainer
                }
              >
                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#737373"
                />

                <TextInput
                  value={search}
                  onChangeText={
                    setSearch
                  }
                  onSubmitEditing={
                    handleSearch
                  }
                  placeholder="جستجوی سفارش یا مشتری..."
                  placeholderTextColor="#a3a3a3"
                  style={
                    styles.searchInput
                  }
                  returnKeyType="search"
                  textAlign="right"
                />

                {search.length >
                  0 && (
                  <Pressable
                    onPress={() => {
                      setSearch("");

                      loadOrders({
                        targetPage: 1,
                        append: false,
                        searchValue:
                          "",
                        statusValue:
                          appliedStatus,
                        paymentStatusValue:
                          appliedPaymentStatus,
                        dateFilterValue:
                          appliedDateFilter,
                      });
                    }}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close-circle"
                      size={19}
                      color="#a3a3a3"
                    />
                  </Pressable>
                )}
              </View>

              <Pressable
                style={[
                  styles.filterButton,
                  hasActiveFilters &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setFilterVisible(
                    true,
                  )
                }
              >
                <Ionicons
                  name="options-outline"
                  size={20}
                  color={
                    hasActiveFilters
                      ? "#ffffff"
                      : "#404040"
                  }
                />
              </Pressable>
            </View>

            {/* Active filter indicator */}
            {hasActiveFilters && (
              <View
                style={
                  styles.activeFilterRow
                }
              >
                <Ionicons
                  name="funnel-outline"
                  size={15}
                  color="#525252"
                />

                <Text
                  style={
                    styles.activeFilterText
                  }
                >
                  فیلتر فعال است
                </Text>
              </View>
            )}

            {/* Inline error */}
            {error &&
              orders.length > 0 && (
                <View
                  style={
                    styles.inlineError
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={17}
                    color="#dc2626"
                  />

                  <Text
                    style={
                      styles.inlineErrorText
                    }
                  >
                    {error}
                  </Text>
                </View>
              )}
          </View>
        }
        ListEmptyComponent={
          <View
            style={styles.emptyState}
          >
            <View
              style={styles.emptyIcon}
            >
              <Ionicons
                name="receipt-outline"
                size={28}
                color="#737373"
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              سفارشی پیدا نشد
            </Text>

            <Text
              style={styles.emptyText}
            >
              {hasActiveFilters ||
              search.trim()
                ? "با فیلترها یا عبارت جستجوی فعلی سفارشی پیدا نشد."
                : "هنوز سفارشی برای نمایش وجود ندارد."}
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View
              style={styles.loadMore}
            >
              <ActivityIndicator
                size="small"
                color="#525252"
              />

              <Text
                style={
                  styles.loadMoreText
                }
              >
                در حال دریافت سفارش‌های بیشتر...
              </Text>
            </View>
          ) : null
        }
      />

      <OrderFiltersSheet
        visible={filterVisible}
        status={status}
        paymentStatus={
          paymentStatus
        }
        dateFilter={dateFilter}
        onStatusChange={
          setStatus
        }
        onPaymentStatusChange={
          setPaymentStatus
        }
        onDateFilterChange={
          setDateFilter
        }
        onApply={
          handleApplyFilters
        }
        onClear={
          handleClearFilters
        }
        onClose={() =>
          setFilterVisible(false)
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

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  emptyList: {
    flexGrow: 1,
    padding: 16,
  },

  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  searchContainer: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 13,
    color: "#171717",
  },

  filterButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    borderColor: "#171717",
    backgroundColor: "#171717",
  },

  activeFilterRow: {
    minHeight: 34,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
  },

  activeFilterText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#525252",
  },

  centerState: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },

  stateTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
    textAlign: "center",
  },

  stateText: {
    maxWidth: 280,
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color: "#737373",
    textAlign: "center",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },

  retryButton: {
    minWidth: 100,
    height: 40,
    marginTop: 16,
    paddingHorizontal: 18,
    borderRadius: 11,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  inlineError: {
    padding: 10,
    marginBottom: 12,
    borderRadius: 11,
    backgroundColor: "#fef2f2",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  inlineErrorText: {
    flex: 1,
    fontSize: 11,
    color: "#dc2626",
    textAlign: "right",
  },

  emptyState: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 15,
    fontWeight: "700",
    color: "#262626",
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 6,
    fontSize: 12,
    lineHeight: 19,
    color: "#a3a3a3",
    textAlign: "center",
  },

  loadMore: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  loadMoreText: {
    fontSize: 11,
    color: "#737373",
  },
});

