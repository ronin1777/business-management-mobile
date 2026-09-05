"use client";

import { useCallback, useEffect, useState } from "react";
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
import { router } from "expo-router";

import { getRecipes } from "@/services/api/recipes";
import type { Recipe } from "@/types/recipes";

const PAGE_SIZE = 10;

function formatDate(date: string | null) {
  if (!date) return "بدون تاریخ پایان";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "تاریخ نامعتبر";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsedDate);
}

function RecipeCard({
  recipe,
  onPress,
}: {
  recipe: Recipe;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.productInfo}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name="restaurant-outline"
              size={20}
              color="#404040"
            />
          </View>

          <View style={styles.productText}>
            <Text
              style={styles.productName}
              numberOfLines={1}
            >
              {recipe.product_name}
            </Text>

            <Text style={styles.recipeId}>
              رسپی #{recipe.id}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            recipe.is_active
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              recipe.is_active
                ? styles.activeDot
                : styles.inactiveDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              recipe.is_active
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {recipe.is_active ? "فعال" : "غیرفعال"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>
            نسخه
          </Text>

          <Text style={styles.metaValue}>
            نسخه {recipe.version}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>
            شروع اعتبار
          </Text>

          <Text style={styles.metaValue}>
            {formatDate(recipe.valid_from)}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>
            پایان اعتبار
          </Text>

          <Text
            style={[
              styles.metaValue,
              !recipe.valid_to && styles.mutedValue,
            ]}
          >
            {formatDate(recipe.valid_to)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.createdText}>
          ایجاد شده در {formatDate(recipe.created_at)}
        </Text>

        <View style={styles.detailsLink}>
          <Text style={styles.detailsText}>
            مشاهده جزئیات
          </Text>

          <Ionicons
            name="chevron-back"
            size={16}
            color="#525252"
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(
    async ({
      targetPage,
      reset,
      showLoading,
    }: {
      targetPage: number;
      reset: boolean;
      showLoading?: boolean;
    }) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        if (reset) {
          setError(null);
        }

        const response = await getRecipes({
          page: targetPage,
          pageSize: PAGE_SIZE,
          search: submittedSearch || undefined,
          ordering: "-created_at",
        });

        if (!response.success) {
          throw new Error(
            response.message || "دریافت رسپی‌ها ناموفق بود.",
          );
        }

        setRecipes((current) =>
          reset
            ? response.data.results
            : [...current, ...response.data.results],
        );

        setPage(targetPage);
        setHasNextPage(Boolean(response.data.next));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "خطایی در دریافت رسپی‌ها رخ داد.";

        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [submittedSearch],
  );

  useEffect(() => {
    loadRecipes({
      targetPage: 1,
      reset: true,
      showLoading: true,
    });
  }, [loadRecipes]);

  const handleSearch = () => {
    setSubmittedSearch(search.trim());
  };

  const handleClearSearch = () => {
    setSearch("");
    setSubmittedSearch("");
  };

  const handleRefresh = () => {
    setRefreshing(true);

    loadRecipes({
      targetPage: 1,
      reset: true,
    });
  };

  const handleLoadMore = () => {
    if (
      loading ||
      loadingMore ||
      !hasNextPage
    ) {
      return;
    }

    setLoadingMore(true);

    loadRecipes({
      targetPage: page + 1,
      reset: false,
    });
  };

  const renderItem = ({
    item,
  }: {
    item: Recipe;
  }) => {
    return (
      <RecipeCard
        recipe={item}
        onPress={() =>
          router.push({
            pathname: "/(dashboard)/recipes/[id]",
            params: {
              id: String(item.id),
            },
          })
        }
      />
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>
              رسپی‌ها
            </Text>

            <Text style={styles.subtitle}>
              مدیریت فرمول و ترکیبات محصولات
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push(
                "/(dashboard)/recipes/create",
              )
            }
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Ionicons
              name="add"
              size={20}
              color="#ffffff"
            />

            <Text style={styles.addButtonText}>
              رسپی جدید
            </Text>
          </Pressable>
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
              placeholder="جستجوی نام محصول..."
              placeholderTextColor="#a3a3a3"
              style={styles.searchInput}
              returnKeyType="search"
              textAlign="right"
              clearButtonMode="never"
            />

            {search.length > 0 && (
              <Pressable
                onPress={handleClearSearch}
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color="#a3a3a3"
                />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={handleSearch}
            style={({ pressed }) => [
              styles.searchButton,
              pressed && styles.searchButtonPressed,
            ]}
          >
            <Ionicons
              name="search"
              size={19}
              color="#ffffff"
            />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color="#dc2626"
            />
          </View>

          <Text style={styles.stateTitle}>
            دریافت رسپی‌ها ناموفق بود
          </Text>

          <Text style={styles.stateDescription}>
            {error}
          </Text>

          <Pressable
            onPress={() =>
              loadRecipes({
                targetPage: 1,
                reset: true,
                showLoading: true,
              })
            }
            style={styles.retryButton}
          >
            <Ionicons
              name="refresh"
              size={18}
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
      <View style={styles.stateContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="restaurant-outline"
            size={28}
            color="#737373"
          />
        </View>

        <Text style={styles.stateTitle}>
          رسپی‌ای پیدا نشد
        </Text>

        <Text style={styles.stateDescription}>
          {submittedSearch
            ? "نتیجه‌ای برای عبارت جستجو شده وجود ندارد."
            : "هنوز هیچ رسپی‌ای برای محصولات ثبت نشده است."}
        </Text>

        {!submittedSearch && (
          <Pressable
            onPress={() =>
              router.push(
                "/(dashboard)/recipes/create",
              )
            }
            style={styles.retryButton}
          >
            <Ionicons
              name="add"
              size={18}
              color="#ffffff"
            />

            <Text style={styles.retryButtonText}>
              ساخت اولین رسپی
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator
            size="small"
            color="#525252"
          />
        </View>
      );
    }

    if (!hasNextPage && recipes.length > 0) {
      return (
        <View style={styles.endContainer}>
          <Text style={styles.endText}>
            همه رسپی‌ها نمایش داده شدند
          </Text>
        </View>
      );
    }

    return <View style={styles.footerSpace} />;
  };

  if (loading && recipes.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color="#525252"
          />

          <Text style={styles.loadingText}>
            در حال دریافت رسپی‌ها...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          recipes.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
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
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  emptyListContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },

  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },

  title: {
    fontSize: 21,
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

  addButton: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  addButtonPressed: {
    opacity: 0.8,
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
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
    height: "100%",
    padding: 0,
    color: "#171717",
    fontSize: 13,
  },

  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  searchButtonPressed: {
    opacity: 0.8,
  },

  card: {
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  cardPressed: {
    opacity: 0.75,
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  productInfo: {
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

  productText: {
    flex: 1,
    alignItems: "flex-end",
  },

  productName: {
    maxWidth: "100%",
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    textAlign: "right",
  },

  recipeId: {
    marginTop: 3,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 999,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
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
    fontWeight: "600",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#737373",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 14,
  },

  metaGrid: {
    flexDirection: "row-reverse",
    gap: 8,
  },

  metaItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  metaLabel: {
    marginBottom: 5,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  metaValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#404040",
    textAlign: "right",
  },

  mutedValue: {
    color: "#a3a3a3",
  },

  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  createdText: {
    flex: 1,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  detailsLink: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2,
  },

  detailsText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#525252",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 12,
    color: "#737373",
  },

  stateContainer: {
    flex: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
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

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  stateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    textAlign: "center",
  },

  stateDescription: {
    maxWidth: 280,
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#737373",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  retryButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  footerLoader: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },

  endContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: "center",
  },

  endText: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  footerSpace: {
    height: 12,
  },
});