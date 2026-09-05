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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { getIngredients } from "@/services/api/ingredients";
import type { Ingredient } from "@/types/ingredients";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatCurrency(value: number) {
  return `${formatNumber(value)} تومان`;
}

function IngredientCard({
  item,
}: {
  item: Ingredient;
}) {
  const handlePress = () => {
    router.push({
      pathname: "/(dashboard)/ingredients/[id]",
      params: {
        id: String(item.id),
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={styles.title}
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
              {item.is_active ? "فعال" : "غیرفعال"}
            </Text>
          </View>
        </View>

        <View style={styles.unitBadge}>
          <Text style={styles.unitText}>
            {item.base_unit}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>
            موجودی
          </Text>

          <Text style={styles.statValue}>
            {formatNumber(item.current_stock)}
          </Text>

          <Text style={styles.statUnit}>
            {item.base_unit}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>
            میانگین قیمت
          </Text>

          <Text style={styles.statValue}>
            {formatCurrency(item.average_unit_cost)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>
            ارزش موجودی
          </Text>

          <Text style={styles.statValue}>
            {formatCurrency(item.current_inventory_value)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.detailsText}>
          مشاهده جزئیات
        </Text>

        <Ionicons
          name="chevron-back"
          size={16}
          color="#737373"
        />
      </View>
    </TouchableOpacity>
  );
}

export default function IngredientsScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadIngredients = useCallback(
    async ({
      pageNumber = 1,
      searchValue = appliedSearch,
      append = false,
    }: {
      pageNumber?: number;
      searchValue?: string;
      append?: boolean;
    } = {}) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else if (!refreshing) {
          setLoading(true);
        }

        setError(null);

        const response = await getIngredients({
          page: pageNumber,
          pageSize: 20,
          search: searchValue || undefined,
        });

        const results = response.data.results;

        setIngredients((current) =>
          append ? [...current, ...results] : results,
        );

        setPage(pageNumber);
        setHasNextPage(Boolean(response.data.next));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "خطایی در دریافت مواد اولیه رخ داد.";

        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [appliedSearch, refreshing],
  );

  useEffect(() => {
    loadIngredients({
      pageNumber: 1,
      searchValue: appliedSearch,
    });
  }, [appliedSearch]);

  const handleSearch = () => {
    setAppliedSearch(search.trim());
  };

  const handleClearSearch = () => {
    setSearch("");
    setAppliedSearch("");
  };

  const handleRefresh = () => {
    setRefreshing(true);

    loadIngredients({
      pageNumber: 1,
      searchValue: appliedSearch,
    });
  };

  const handleLoadMore = () => {
    if (
      loadingMore ||
      loading ||
      !hasNextPage
    ) {
      return;
    }

    loadIngredients({
      pageNumber: page + 1,
      searchValue: appliedSearch,
      append: true,
    });
  };

  const renderItem = ({
    item,
  }: {
    item: Ingredient;
  }) => {
    return <IngredientCard item={item} />;
  };

  if (loading && ingredients.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text style={styles.loadingText}>
          در حال دریافت مواد اولیه...
        </Text>
      </View>
    );
  }

  if (error && ingredients.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={26}
            color="#b91c1c"
          />
        </View>

        <Text style={styles.errorTitle}>
          دریافت اطلاعات ناموفق بود
        </Text>

        <Text style={styles.errorDescription}>
          {error}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            loadIngredients({
              pageNumber: 1,
              searchValue: appliedSearch,
            })
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
    <View style={styles.container}>
      <FlatList
        data={ingredients}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          ingredients.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#525252"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
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
                  returnKeyType="search"
                  placeholder="جستجوی ماده اولیه..."
                  placeholderTextColor="#a3a3a3"
                  style={styles.searchInput}
                  textAlign="right"
                />

                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearSearch}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="#a3a3a3"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {formatNumber(
                    ingredients.length,
                  )}
                </Text>
              </View>
            </View>

            {error && ingredients.length > 0 && (
              <View style={styles.inlineError}>
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color="#b91c1c"
                />

                <Text style={styles.inlineErrorText}>
                  {error}
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="flask-outline"
                size={27}
                color="#737373"
              />
            </View>

            <Text style={styles.emptyTitle}>
              ماده اولیه‌ای پیدا نشد
            </Text>

            <Text style={styles.emptyDescription}>
              {appliedSearch
                ? "ماده اولیه‌ای با این عبارت پیدا نشد."
                : "هنوز هیچ ماده اولیه‌ای ثبت نشده است."}
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator
                size="small"
                color="#737373"
              />
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
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

  header: {
    marginBottom: 12,
  },

  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
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
    fontSize: 13,
    color: "#171717",
    paddingVertical: 0,
  },

  countBadge: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  titleContainer: {
    flex: 1,
    alignItems: "flex-end",
    gap: 7,
  },

  title: {
    width: "100%",
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  statusBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  activeBadge: {
    backgroundColor: "#f0fdf4",
  },

  inactiveBadge: {
    backgroundColor: "#f5f5f5",
  },

  statusDot: {
    width: 5,
    height: 5,
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
    fontWeight: "600",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#737373",
  },

  unitBadge: {
    minWidth: 48,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  unitText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 14,
  },

  statsGrid: {
    flexDirection: "row-reverse",
    gap: 8,
  },

  statItem: {
    flex: 1,
    minHeight: 62,
    padding: 9,
    borderRadius: 11,
    backgroundColor: "#fafafa",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  statLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    marginBottom: 5,
    textAlign: "right",
  },

  statValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  statUnit: {
    fontSize: 9,
    color: "#a3a3a3",
    marginTop: 2,
  },

  cardFooter: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  detailsText: {
    fontSize: 11,
    color: "#737373",
  },

  inlineError: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#fef2f2",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  inlineErrorText: {
    flex: 1,
    fontSize: 11,
    color: "#b91c1c",
    textAlign: "right",
  },

  centerContainer: {
    flex: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#737373",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#404040",
    textAlign: "center",
  },

  errorDescription: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    minWidth: 110,
    height: 42,
    paddingHorizontal: 18,
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#404040",
  },

  emptyDescription: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "center",
  },

  footerLoading: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});