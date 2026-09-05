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
import { useCallback, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { getProducts } from "@/services/api/products";
import type { Product } from "@/types/products";

const PAGE_SIZE = 10;

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export default function ProductsScreen() {
  const router = useRouter();

  const [products, setProducts] =
    useState<Product[]>([]);

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

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const loadProducts = useCallback(
    async ({
      targetPage,
      append,
      searchValue,
    }: {
      targetPage: number;
      append: boolean;
      searchValue: string;
    }) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response =
          await getProducts({
            page: targetPage,
            pageSize: PAGE_SIZE,
            search:
              searchValue.trim() ||
              undefined,
            ordering: "-created_at",
          });

        const newProducts =
          response.data.results;

        if (append) {
          setProducts((current) => [
            ...current,
            ...newProducts,
          ]);
        } else {
          setProducts(newProducts);
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
            : "خطایی در دریافت محصولات رخ داد.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [],
  );

  /*
   * Initial request.
   */
  useEffect(() => {
    loadProducts({
      targetPage: 1,
      append: false,
      searchValue: "",
    });
  }, [loadProducts]);

  const handleSearch = () => {
    loadProducts({
      targetPage: 1,
      append: false,
      searchValue: search,
    });
  };

  const handleClearSearch = () => {
    setSearch("");

    loadProducts({
      targetPage: 1,
      append: false,
      searchValue: "",
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);

    loadProducts({
      targetPage: 1,
      append: false,
      searchValue: search,
    });
  };

  const handleLoadMore = () => {
    if (
      loadingMore ||
      !hasNextPage
    ) {
      return;
    }

    loadProducts({
      targetPage: page + 1,
      append: true,
      searchValue: search,
    });
  };

  const handleProductPress = (
    product: Product,
  ) => {
    router.push({
      pathname:
        "/(dashboard)/products/[id]",
      params: {
        id: String(product.id),
      },
    });
  };

  const handleCreateProduct = () => {
    router.push(
      "/(dashboard)/products/create",
    );
  };

  const renderProduct = ({
    item,
  }: {
    item: Product;
  }) => (
    <Pressable
      style={styles.productCard}
      onPress={() =>
        handleProductPress(item)
      }
    >
      {/* Top row */}
      <View style={styles.cardTopRow}>
        <View style={styles.productIdentity}>
          <View style={styles.productIcon}>
            <Ionicons
              name="cube-outline"
              size={21}
              color="#525252"
            />
          </View>

          <View
            style={styles.productTitleContainer}
          >
            <Text
              style={styles.productName}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              style={styles.productId}
            >
              محصول #{item.id}
            </Text>
          </View>
        </View>

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

      {/* Divider */}
      <View
        style={styles.cardDivider}
      />

      {/* Product info */}
      <View style={styles.cardInfoRow}>
        <View style={styles.priceSection}>
          <Text style={styles.infoLabel}>
            قیمت فروش
          </Text>

          <View
            style={styles.priceRow}
          >
            <Text style={styles.priceValue}>
              {formatPrice(
                item.selling_price,
              )}
            </Text>

            <Text
              style={styles.priceCurrency}
            >
              تومان
            </Text>
          </View>
        </View>

        {item.has_valid_recipe !==
          undefined && (
          <View
            style={styles.recipeSection}
          >
            <Text
              style={styles.infoLabel}
            >
              دستور تهیه
            </Text>

            <View
              style={
                styles.recipeStatus
              }
            >
              <Ionicons
                name={
                  item.has_valid_recipe
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={16}
                color={
                  item.has_valid_recipe
                    ? "#16a34a"
                    : "#d97706"
                }
              />

              <Text
                style={[
                  styles.recipeText,
                  item.has_valid_recipe
                    ? styles.recipeValid
                    : styles.recipeInvalid,
                ]}
              >
                {item.has_valid_recipe
                  ? "معتبر"
                  : "ناقص"}
              </Text>
            </View>
          </View>
        )}

        <Ionicons
          name="chevron-back"
          size={19}
          color="#a3a3a3"
        />
      </View>
    </Pressable>
  );

  if (
    loading &&
    products.length === 0
  ) {
    return (
      <View
        style={styles.centerState}
      >
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text
          style={styles.stateText}
        >
          در حال دریافت محصولات...
        </Text>
      </View>
    );
  }

  if (
    error &&
    products.length === 0
  ) {
    return (
      <View
        style={styles.centerState}
      >
        <View
          style={styles.errorIcon}
        >
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#dc2626"
          />
        </View>

        <Text
          style={styles.stateTitle}
        >
          دریافت محصولات ناموفق بود
        </Text>

        <Text
          style={styles.stateText}
        >
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() =>
            loadProducts({
              targetPage: 1,
              append: false,
              searchValue: search,
            })
          }
        >
          <Text
            style={styles.retryText}
          >
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderProduct}
        contentContainerStyle={
          products.length === 0
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#525252"
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View
              style={styles.header}
            >
              <View
                style={styles.headerText}
              >
                <Text
                  style={styles.title}
                >
                  محصولات
                </Text>

                <Text
                  style={styles.subtitle}
                >
                  {totalCount.toLocaleString(
                    "fa-IR",
                  )}{" "}
                  محصول ثبت شده
                </Text>
              </View>

              <Pressable
                style={
                  styles.createButton
                }
                onPress={
                  handleCreateProduct
                }
              >
                <Ionicons
                  name="add"
                  size={21}
                  color="#ffffff"
                />

                <Text
                  style={
                    styles.createButtonText
                  }
                >
                  محصول جدید
                </Text>
              </Pressable>
            </View>

            {/* Search */}
            <View
              style={styles.searchContainer}
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
                placeholder="جستجوی محصول..."
                placeholderTextColor="#a3a3a3"
                style={styles.searchInput}
                returnKeyType="search"
                textAlign="right"
              />

              {search.length > 0 && (
                <Pressable
                  onPress={
                    handleClearSearch
                  }
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

            {/* Inline error */}
            {error &&
              products.length > 0 && (
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
                name="cube-outline"
                size={28}
                color="#737373"
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              محصولی پیدا نشد
            </Text>

            <Text
              style={styles.emptyText}
            >
              {search.trim()
                ? "با عبارت جستجوی فعلی محصولی پیدا نشد."
                : "هنوز محصولی برای نمایش وجود ندارد."}
            </Text>

            {!search.trim() && (
              <Pressable
                style={styles.emptyAction}
                onPress={
                  handleCreateProduct
                }
              >
                <Ionicons
                  name="add"
                  size={17}
                  color="#ffffff"
                />

                <Text
                  style={
                    styles.emptyActionText
                  }
                >
                  ایجاد محصول
                </Text>
              </Pressable>
            )}
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
                در حال دریافت محصولات بیشتر...
              </Text>
            </View>
          ) : null
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

  header: {
    marginBottom: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  headerText: {
    flex: 1,
    alignItems: "flex-end",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#171717",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 11,
    color: "#737373",
    textAlign: "right",
  },

  createButton: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  createButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  searchContainer: {
    height: 48,
    marginBottom: 14,
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

  productCard: {
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  cardTopRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  productIdentity: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  productIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  productTitleContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  productId: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 9,
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

  cardDivider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#f0f0f0",
  },

  cardInfoRow: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 18,
  },

  priceSection: {
    flex: 1,
    alignItems: "flex-end",
  },

  recipeSection: {
    alignItems: "flex-end",
  },

  infoLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  priceRow: {
    marginTop: 4,
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 4,
  },

  priceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#262626",
  },

  priceCurrency: {
    fontSize: 9,
    color: "#737373",
  },

  recipeStatus: {
    marginTop: 5,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  recipeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  recipeValid: {
    color: "#15803d",
  },

  recipeInvalid: {
    color: "#b45309",
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
    minHeight: 300,
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

  emptyAction: {
    height: 40,
    marginTop: 16,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  emptyActionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
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