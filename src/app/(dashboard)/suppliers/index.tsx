
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
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { getSuppliers } from "@/services/api/suppliers";

import type { Supplier } from "@/types/suppliers";

const PAGE_SIZE = 10;

export default function SuppliersScreen() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(
    async ({
      pageNumber = 1,
      refresh = false,
      append = false,
    }: {
      pageNumber?: number;
      refresh?: boolean;
      append?: boolean;
    } = {}) => {
      try {
        setError(null);

        if (refresh) {
          setRefreshing(true);
        } else if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await getSuppliers({
          page: pageNumber,
          pageSize: PAGE_SIZE,
          search: search.trim() || undefined,
          ordering: "-created_at",
        });

        const results = response.data.results;

        if (append) {
          setSuppliers((current) => [
            ...current,
            ...results,
          ]);
        } else {
          setSuppliers(results);
        }

        setPage(pageNumber);
        setHasNextPage(
          Boolean(response.data.next),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "دریافت تأمین‌کنندگان با خطا مواجه شد.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadSuppliers({
        pageNumber: 1,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [loadSuppliers]);

  const handleRefresh = () => {
    loadSuppliers({
      pageNumber: 1,
      refresh: true,
    });
  };

  const handleLoadMore = () => {
    if (
      loading ||
      loadingMore ||
      refreshing ||
      !hasNextPage
    ) {
      return;
    }

    loadSuppliers({
      pageNumber: page + 1,
      append: true,
    });
  };

  const renderSupplier = ({
    item,
  }: {
    item: Supplier;
  }) => {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(dashboard)/suppliers/[id]",
            params: {
              id: String(item.id),
            },
          })
        }
        style={({ pressed }) => [
          styles.supplierCard,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.supplierInfo}>
            <Text
              style={styles.supplierName}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text style={styles.supplierPhone}>
              {item.phone || "شماره تماس ثبت نشده"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.is_active
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
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

        <View style={styles.cardFooter}>
          <Text style={styles.createdAt}>
            {formatDate(item.created_at)}
          </Text>

          <Text style={styles.detailsText}>
            مشاهده جزئیات
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator />
      </View>
    );
  };

  if (loading && suppliers.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          در حال دریافت تأمین‌کنندگان...
        </Text>
      </View>
    );
  }

  if (
    error &&
    suppliers.length === 0
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          onPress={() =>
            loadSuppliers({
              pageNumber: 1,
            })
          }
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            تأمین‌کنندگان
          </Text>

          <Text style={styles.subtitle}>
            مدیریت تأمین‌کنندگان و اطلاعات حساب آن‌ها
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/(dashboard)/suppliers/create",
            )
          }
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.createButtonText}>
            افزودن
          </Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="جستجوی تأمین‌کننده..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          textAlign="right"
          returnKeyType="search"
        />
      </View>

      {/* Error */}
      {error && suppliers.length > 0 && (
        <View style={styles.inlineErrorBox}>
          <Text style={styles.inlineErrorText}>
            {error}
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={suppliers}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderSupplier}
        contentContainerStyle={[
          styles.listContent,
          suppliers.length === 0 &&
            styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              تأمین‌کننده‌ای پیدا نشد
            </Text>

            <Text style={styles.emptyText}>
              {search.trim()
                ? "موردی مطابق جستجوی شما وجود ندارد."
                : "هنوز هیچ تأمین‌کننده‌ای ثبت نشده است."}
            </Text>

            {!search.trim() && (
              <Pressable
                onPress={() =>
                  router.push(
                    "/(dashboard)/suppliers/create",
                  )
                }
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>
                  افزودن تأمین‌کننده
                </Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "تاریخ نامعتبر";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },

  headerText: {
    flex: 1,
    gap: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
    textAlign: "right",
  },

  createButton: {
    paddingHorizontal: 16,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#0f172a",
  },

  createButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  searchInput: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 9,
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#0f172a",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  supplierCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  supplierInfo: {
    flex: 1,
    alignItems: "flex-end",
    gap: 5,
  },

  supplierName: {
    width: "100%",
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "right",
  },

  supplierPhone: {
    width: "100%",
    fontSize: 12,
    color: "#64748b",
    textAlign: "right",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#f1f5f9",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#64748b",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  createdAt: {
    fontSize: 11,
    color: "#94a3b8",
  },

  detailsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },

  footerLoader: {
    paddingVertical: 18,
    alignItems: "center",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },

  errorText: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 21,
    color: "#dc2626",
    textAlign: "center",
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },

  inlineErrorBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  inlineErrorText: {
    fontSize: 12,
    color: "#dc2626",
    textAlign: "right",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },

  emptyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },

  pressed: {
    opacity: 0.75,
  },
});
