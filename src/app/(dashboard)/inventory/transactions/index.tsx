"use client";

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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  CircleAlert,
  History,
  Package,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react-native";

import {
  getInventoryTransactions,
} from "@/services/api/inventory";

import type {
  InventoryTransaction,
  InventoryTransactionType,
} from "@/types/inventory";

const PAGE_SIZE = 15;

const TRANSACTION_TYPES: Array<{
  value: InventoryTransactionType | "";
  label: string;
}> = [
  { value: "", label: "همه" },
  { value: "purchase", label: "خرید" },
  { value: "order_usage", label: "مصرف سفارش" },
  { value: "waste", label: "ضایعات" },
  { value: "adjustment", label: "اصلاح موجودی" },
  { value: "reversal", label: "برگشت" },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(Math.round(value))} تومان`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getTransactionMeta(type: InventoryTransactionType) {
  switch (type) {
    case "purchase":
      return {
        label: "خرید",
        icon: ArrowDownLeft,
        background: "#f0fdf4",
        color: "#15803d",
      };

    case "order_usage":
      return {
        label: "مصرف سفارش",
        icon: ArrowUpRight,
        background: "#eff6ff",
        color: "#2563eb",
      };

    case "waste":
      return {
        label: "ضایعات",
        icon: Trash2,
        background: "#fef2f2",
        color: "#dc2626",
      };

    case "adjustment":
      return {
        label: "اصلاح موجودی",
        icon: RefreshCw,
        background: "#f5f5f5",
        color: "#525252",
      };

    case "reversal":
      return {
        label: "برگشت",
        icon: RefreshCw,
        background: "#fff7ed",
        color: "#c2410c",
      };

    default:
      return {
        label: "تراکنش",
        icon: History,
        background: "#f5f5f5",
        color: "#525252",
      };
  }
}

function TransactionCard({
  item,
  onPress,
}: {
  item: InventoryTransaction;
  onPress: () => void;
}) {
  const meta = getTransactionMeta(item.transaction_type);
  const Icon = meta.icon;

  const isPositive =
    item.transaction_type === "purchase" ||
    (item.transaction_type === "adjustment" && item.quantity > 0) ||
    item.transaction_type === "reversal";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderRight}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: meta.background },
            ]}
          >
            <Icon size={18} color={meta.color} strokeWidth={2} />
          </View>

          <View style={styles.titleWrapper}>
            <Text style={styles.ingredientName} numberOfLines={1}>
              {item.ingredient_name}
            </Text>

            <Text style={styles.date}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.typeBadge,
            { backgroundColor: meta.background },
          ]}
        >
          <Text style={[styles.typeBadgeText, { color: meta.color }]}>
            {item.transaction_type_display || meta.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>مقدار</Text>

          <Text
            style={[
              styles.metricValue,
              {
                color: isPositive ? "#15803d" : "#dc2626",
              },
            ]}
          >
            {isPositive ? "+" : ""}
            {formatNumber(item.quantity)}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>هزینه واحد</Text>
          <Text style={styles.metricValue}>
            {formatMoney(item.unit_cost)}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>هزینه کل</Text>
          <Text style={styles.metricValue}>
            {formatMoney(item.total_cost)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.unitWrapper}>
          <Package size={14} color="#737373" />
          <Text style={styles.unitText}>
            {item.quantity === 1 ? "۱ واحد" : "گردش موجودی"}
          </Text>
        </View>

        <ChevronLeft size={18} color="#a3a3a3" />
      </View>
    </Pressable>
  );
}

export default function InventoryTransactionsScreen() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(
    [],
  );

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedType, setSelectedType] =
    useState<InventoryTransactionType | "">("");

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const hasActiveFilter = useMemo(
    () => Boolean(selectedType),
    [selectedType],
  );

  const loadTransactions = useCallback(
    async (targetPage = page, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await getInventoryTransactions({
          page: targetPage,
          pageSize: PAGE_SIZE,
          search: search || undefined,
          transaction_type: selectedType || undefined,
          ordering: "-created_at",
        });

        setTransactions(response.data.results);
        setCount(response.data.count);
        setPage(targetPage);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت تراکنش‌ها رخ داد.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, selectedType],
  );

  useEffect(() => {
    loadTransactions(1);
  }, [search, selectedType]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  const handleRefresh = () => {
    loadTransactions(1, true);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      loadTransactions(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      loadTransactions(page - 1);
    }
  };

  const renderItem = ({
    item,
  }: {
    item: InventoryTransaction;
  }) => (
    <TransactionCard
      item={item}
      onPress={() => {
        router.push({
          pathname: "/(dashboard)/inventory/transactions/[id]",
          params: {
            id: String(item.id),
          },
        });
      }}
    />
  );

  const renderHeader = () => (
    <View>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={19} color="#737373" />

          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            placeholder="جستجوی ماده اولیه..."
            placeholderTextColor="#a3a3a3"
            style={styles.searchInput}
            returnKeyType="search"
          />

          {searchInput.length > 0 && (
            <Pressable
              onPress={handleClearSearch}
              hitSlop={8}
            >
              <X size={17} color="#737373" />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => setShowFilters((value) => !value)}
          style={[
            styles.filterButton,
            (showFilters || hasActiveFilter) &&
              styles.filterButtonActive,
          ]}
        >
          <SlidersHorizontal
            size={19}
            color={
              showFilters || hasActiveFilter
                ? "#ffffff"
                : "#404040"
            }
          />
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterPanelHeader}>
            <Text style={styles.filterTitle}>نوع تراکنش</Text>

            {hasActiveFilter && (
              <Pressable
                onPress={() => setSelectedType("")}
              >
                <Text style={styles.clearFilterText}>
                  حذف فیلتر
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.filterOptions}>
            {TRANSACTION_TYPES.map((type) => {
              const active = selectedType === type.value;

              return (
                <Pressable
                  key={type.value || "all"}
                  onPress={() =>
                    setSelectedType(type.value)
                  }
                  style={[
                    styles.filterOption,
                    active && styles.filterOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      active &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            گردش انبار
          </Text>

          <Text style={styles.sectionSubtitle}>
            {formatNumber(count)} تراکنش ثبت شده
          </Text>
        </View>

        {hasActiveFilter && (
          <View style={styles.activeFilterBadge}>
            <Text style={styles.activeFilterText}>
              فیلتر فعال
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <History size={25} color="#737373" />
        </View>

        <Text style={styles.emptyTitle}>
          تراکنشی پیدا نشد
        </Text>

        <Text style={styles.emptyDescription}>
          {search || selectedType
            ? "با تغییر جستجو یا فیلترها دوباره امتحان کنید."
            : "هنوز هیچ گردش انباری ثبت نشده است."}
        </Text>

        {(search || selectedType) && (
          <Pressable
            onPress={() => {
              setSearch("");
              setSearchInput("");
              setSelectedType("");
            }}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>
              پاک کردن فیلترها
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorState}>
        <View style={styles.errorIcon}>
          <CircleAlert size={25} color="#dc2626" />
        </View>

        <Text style={styles.errorTitle}>
          دریافت اطلاعات ناموفق بود
        </Text>

        <Text style={styles.errorDescription}>
          {error}
        </Text>

        <Pressable
          onPress={() => loadTransactions(1)}
          style={styles.retryButton}
        >
          <RefreshCw size={17} color="#ffffff" />
          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderFooter = () => {
    if (loading || transactions.length === 0) {
      return null;
    }

    if (totalPages <= 1) {
      return <View style={styles.footerSpace} />;
    }

    return (
      <View style={styles.pagination}>
        <Pressable
          onPress={handlePreviousPage}
          disabled={page === 1}
          style={[
            styles.paginationButton,
            page === 1 && styles.paginationButtonDisabled,
          ]}
        >
          <ChevronLeft
            size={18}
            color={page === 1 ? "#d4d4d4" : "#404040"}
            style={{ transform: [{ rotate: "180deg" }] }}
          />

          <Text
            style={[
              styles.paginationText,
              page === 1 && styles.paginationTextDisabled,
            ]}
          >
            قبلی
          </Text>
        </Pressable>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageNumber}>
            {formatNumber(page)}
          </Text>

          <Text style={styles.pageSeparator}>
            از
          </Text>

          <Text style={styles.pageTotal}>
            {formatNumber(totalPages)}
          </Text>
        </View>

        <Pressable
          onPress={handleNextPage}
          disabled={page === totalPages}
          style={[
            styles.paginationButton,
            page === totalPages &&
              styles.paginationButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.paginationText,
              page === totalPages &&
                styles.paginationTextDisabled,
            ]}
          >
            بعدی
          </Text>

          <ChevronLeft
            size={18}
            color={
              page === totalPages
                ? "#d4d4d4"
                : "#404040"
            }
          />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && transactions.length === 0 && !error ? (
        <>
          {renderHeader()}

          <View style={styles.loadingState}>
            <ActivityIndicator
              size="small"
              color="#525252"
            />

            <Text style={styles.loadingText}>
              در حال دریافت تراکنش‌ها...
            </Text>
          </View>
        </>
      ) : error && transactions.length === 0 ? (
        <>
          {renderHeader()}
          {renderError()}
        </>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#525252"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
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
    minWidth: 0,
    textAlign: "right",
    fontSize: 13,
    color: "#171717",
    paddingVertical: 0,
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },

  filterPanel: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  filterPanelHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  filterTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
  },

  clearFilterText: {
    fontSize: 12,
    color: "#737373",
  },

  filterOptions: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },

  filterOption: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  filterOptionActive: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },

  filterOptionText: {
    fontSize: 12,
    color: "#525252",
  },

  filterOptionTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#737373",
    textAlign: "right",
  },

  activeFilterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#f5f5f5",
  },

  activeFilterText: {
    fontSize: 10,
    color: "#525252",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  cardPressed: {
    opacity: 0.72,
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  cardHeaderRight: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  typeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  titleWrapper: {
    flex: 1,
    minWidth: 0,
  },

  ingredientName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    textAlign: "right",
  },

  date: {
    marginTop: 4,
    fontSize: 11,
    color: "#737373",
    textAlign: "right",
  },

  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 13,
  },

  metricsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  metric: {
    flex: 1,
    alignItems: "flex-end",
  },

  metricLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#eeeeee",
    marginHorizontal: 10,
  },

  cardFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },

  unitWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  unitText: {
    fontSize: 10,
    color: "#737373",
  },

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 12,
    color: "#737373",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 70,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },

  emptyDescription: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 19,
    color: "#737373",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#171717",
  },

  emptyButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
  },

  errorState: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991b1b",
    textAlign: "center",
  },

  errorDescription: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#b91c1c",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 14,
    minHeight: 40,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  retryButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
  },

  pagination: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 14,
  },

  paginationButton: {
    minWidth: 84,
    height: 40,
    paddingHorizontal: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  paginationButtonDisabled: {
    backgroundColor: "#fafafa",
    borderColor: "#f0f0f0",
  },

  paginationText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#404040",
  },

  paginationTextDisabled: {
    color: "#d4d4d4",
  },

  pageIndicator: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  pageNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#262626",
  },

  pageSeparator: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  pageTotal: {
    fontSize: 11,
    color: "#737373",
  },

  footerSpace: {
    height: 20,
  },
});