import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getIngredients } from "@/services/api/ingredients";
import type { Ingredient } from "@/types/ingredients";

const PAGE_SIZE = 10;

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return `${formatNumber(value)} تومان`;
}

function InventoryCard({
  item,
}: {
  item: Ingredient;
}) {
  const isOutOfStock = item.current_stock <= 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/(dashboard)/ingredients/[id]",
          params: {
            id: String(item.id),
          },
        })
      }
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name="cube-outline"
              size={19}
              color="#525252"
            />
          </View>

          <View style={styles.nameContent}>
            <Text
              numberOfLines={1}
              style={styles.ingredientName}
            >
              {item.name}
            </Text>

            <Text style={styles.ingredientUnit}>
              واحد: {item.base_unit}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.stockBadge,
            isOutOfStock && styles.stockBadgeDanger,
          ]}
        >
          <Text
            style={[
              styles.stockBadgeText,
              isOutOfStock &&
                styles.stockBadgeTextDanger,
            ]}
          >
            {isOutOfStock ? "ناموجود" : "موجود"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            موجودی
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.statValue,
              isOutOfStock && styles.dangerValue,
            ]}
          >
            {formatNumber(item.current_stock)}{" "}
            {item.base_unit}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            ارزش موجودی
          </Text>

          <Text
            numberOfLines={1}
            style={styles.statValue}
          >
            {formatCurrency(
              item.current_inventory_value,
            )}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>
            میانگین بهای واحد
          </Text>

          <Text style={styles.costValue}>
            {formatCurrency(item.average_unit_cost)}
          </Text>
        </View>

        <Ionicons
          name="chevron-back"
          size={18}
          color="#a3a3a3"
        />
      </View>
    </TouchableOpacity>
  );
}

export default function InventoryScreen() {
  const [ingredients, setIngredients] = useState<
    Ingredient[]
  >([]);

  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] =
    useState("");

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const loadInventory = useCallback(
    async (
      pageNumber: number,
      append = false,
    ) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const response = await getIngredients({
          page: pageNumber,
          pageSize: PAGE_SIZE,
          search:
            submittedSearch || undefined,
          ordering: "name",
        });

        const results = response.data.results;

        setIngredients((previous) =>
          append
            ? [...previous, ...results]
            : results,
        );

        setTotalCount(response.data.count);
        setPage(pageNumber);
        setHasNext(Boolean(response.data.next));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "دریافت اطلاعات انبار با خطا مواجه شد.";

        if (!append) {
          setError(message);
        }
      } finally {
        if (!append) {
          setLoading(false);
        }

        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [submittedSearch],
  );

  useEffect(() => {
    loadInventory(1);
  }, [loadInventory]);

  const handleSearch = () => {
    const value = search.trim();

    if (value === submittedSearch) {
      return;
    }

    setSubmittedSearch(value);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSubmittedSearch("");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadInventory(1);
  };

  const handleLoadMore = () => {
    if (
      loading ||
      loadingMore ||
      !hasNext
    ) {
      return;
    }

    loadInventory(page + 1, true);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.topSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            انبار
          </Text>

          <Text style={styles.subtitle}>
            وضعیت موجودی مواد اولیه
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/(dashboard)/inventory/adjustment",
            )
          }
          style={styles.actionButton}
        >
          <Ionicons
            name="add"
            size={19}
            color="#ffffff"
          />

          <Text style={styles.actionButtonText}>
            اصلاح موجودی
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={19}
            color="#737373"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            placeholder="جستجوی ماده اولیه..."
            placeholderTextColor="#a3a3a3"
            returnKeyType="search"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearSearch}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#a3a3a3"
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/(dashboard)/inventory/waste",
            )
          }
          style={styles.wasteButton}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color="#525252"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          موجودی مواد اولیه
        </Text>

        <Text style={styles.sectionCount}>
          {formatNumber(totalCount)} مورد
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="cube-outline"
            size={27}
            color="#737373"
          />
        </View>

        <Text style={styles.emptyTitle}>
          ماده اولیه‌ای پیدا نشد
        </Text>

        <Text style={styles.emptyDescription}>
          {submittedSearch
            ? "موردی مطابق جستجوی شما وجود ندارد."
            : "هنوز ماده اولیه‌ای برای نمایش وجود ندارد."}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return <View style={styles.footerSpace} />;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />
      </View>
    );
  };

  // Initial loading
  if (
    loading &&
    ingredients.length === 0
  ) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />
      </View>
    );
  }

  // Initial error
  if (
    error &&
    ingredients.length === 0
  ) {
    return (
      <View style={styles.errorScreen}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={27}
            color="#b91c1c"
          />
        </View>

        <Text style={styles.errorTitle}>
          دریافت اطلاعات ناموفق بود
        </Text>

        <Text style={styles.errorMessage}>
          {error}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            loadInventory(1)
          }
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={ingredients}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <InventoryCard item={item} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#525252"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },

  topSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#737373",
    textAlign: "right",
  },

  actionButton: {
    height: 42,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    marginRight: 10,
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
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
    gap: 9,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    color: "#171717",
    textAlign: "right",
  },

  wasteButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  sectionCount: {
    fontSize: 11,
    color: "#a3a3a3",
  },

  card: {
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  nameContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  nameContent: {
    flex: 1,
  },

  ingredientName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  ingredientUnit: {
    marginTop: 4,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  stockBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },

  stockBadgeDanger: {
    backgroundColor: "#fef2f2",
  },

  stockBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
  },

  stockBadgeTextDanger: {
    color: "#b91c1c",
  },

  divider: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginVertical: 13,
  },

  statsRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },

  stat: {
    flex: 1,
  },

  statLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  dangerValue: {
    color: "#b91c1c",
  },

  cardFooter: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  costContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  costLabel: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  costValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#525252",
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },

  errorScreen: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    textAlign: "center",
  },

  errorMessage: {
    marginTop: 7,
    maxWidth: 300,
    fontSize: 12,
    lineHeight: 19,
    color: "#737373",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  emptyContainer: {
    flex: 1,
    minHeight: 280,
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
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#404040",
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 6,
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "center",
  },

  footerLoader: {
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  footerSpace: {
    height: 10,
  },
});