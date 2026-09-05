
import {
  useCallback,
  useEffect,
  useState,
} from "react";
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
import { Ionicons } from "@expo/vector-icons";

import { getPurchases } from "@/services/api/purchases";
import type { Purchase } from "@/types/purchases";

const PAGE_SIZE = 10;

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

function PurchaseCard({
  purchase,
  onPress,
}: {
  purchase: Purchase;
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
        <View style={styles.iconContainer}>
          <Ionicons
            name="cart-outline"
            size={21}
            color="#374151"
          />
        </View>

        <View style={styles.cardHeaderContent}>
          <Text
            style={styles.purchaseTitle}
            numberOfLines={1}
          >
            خرید #{purchase.id}
          </Text>

          <Text style={styles.date}>
            {formatDate(purchase.purchased_at)}
          </Text>
        </View>

        <Ionicons
          name="chevron-back"
          size={20}
          color="#9CA3AF"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            تأمین‌کننده
          </Text>

          <Text
            style={[
              styles.infoValue,
              !purchase.supplier_name &&
                styles.mutedValue,
            ]}
            numberOfLines={1}
          >
            {purchase.supplier_name ||
              "بدون تأمین‌کننده"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            تاریخ ثبت
          </Text>

          <Text style={styles.infoValue}>
            {formatDate(purchase.created_at)}
          </Text>
        </View>
      </View>

      {purchase.note ? (
        <>
          <View style={styles.divider} />

          <View style={styles.noteRow}>
            <Ionicons
              name="document-text-outline"
              size={17}
              color="#6B7280"
            />

            <Text
              style={styles.note}
              numberOfLines={2}
            >
              {purchase.note}
            </Text>
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

export default function PurchasesScreen() {
  const router = useRouter();

  const [purchases, setPurchases] =
    useState<Purchase[]>([]);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [hasNext, setHasNext] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadPurchases = useCallback(
    async (
      targetPage: number,
      options?: {
        append?: boolean;
        refresh?: boolean;
      },
    ) => {
      const append =
        options?.append ?? false;

      const refresh =
        options?.refresh ?? false;

      try {
        if (refresh) {
          setRefreshing(true);
        } else if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response =
          await getPurchases({
            page: targetPage,
            pageSize: PAGE_SIZE,
            search:
              search.trim() || undefined,
            ordering: "-purchased_at",
          });

        const results =
          response.data?.results ?? [];

        setPurchases((current) =>
          append
            ? [...current, ...results]
            : results,
        );

        setPage(targetPage);
        setHasNext(
          Boolean(response.data?.next),
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "خطایی در دریافت لیست خریدها رخ داد.";

        setError(message);

        if (!append) {
          setPurchases([]);
        }
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
      loadPurchases(1);
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [loadPurchases]);

  const handleRefresh = useCallback(() => {
    loadPurchases(1, {
      refresh: true,
    });
  }, [loadPurchases]);

  const handleLoadMore = useCallback(() => {
    if (
      loading ||
      loadingMore ||
      refreshing ||
      !hasNext
    ) {
      return;
    }

    loadPurchases(page + 1, {
      append: true,
    });
  }, [
    hasNext,
    loadPurchases,
    loading,
    loadingMore,
    page,
    refreshing,
  ]);

  const handlePurchasePress = (
    purchaseId: number,
  ) => {
    router.push({
      pathname:
        "/(dashboard)/purchases/[id]",
      params: {
        id: String(purchaseId),
      },
    });
  };

  const renderPurchase = ({
    item,
  }: {
    item: Purchase;
  }) => (
    <PurchaseCard
      purchase={item}
      onPress={() =>
        handlePurchasePress(item.id)
      }
    />
  );

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator
          size="small"
          color="#6B7280"
        />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color="#374151"
          />

          <Text style={styles.stateText}>
            در حال دریافت خریدها...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color="#6B7280"
            />
          </View>

          <Text style={styles.stateTitle}>
            دریافت خریدها ناموفق بود
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>

          <Pressable
            onPress={() =>
              loadPurchases(1)
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
      <View style={styles.centerState}>
        <View style={styles.stateIcon}>
          <Ionicons
            name="cart-outline"
            size={30}
            color="#6B7280"
          />
        </View>

        <Text style={styles.stateTitle}>
          {search.trim()
            ? "خریدی پیدا نشد"
            : "هنوز خریدی ثبت نشده است"}
        </Text>

        <Text style={styles.stateText}>
          {search.trim()
            ? "عبارت جستجو را تغییر دهید و دوباره امتحان کنید."
            : "اولین خرید خود را ثبت کنید."}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            خریدها
          </Text>

          <Text style={styles.subtitle}>
            مدیریت خریدهای ثبت‌شده
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/(dashboard)/purchases/create",
            )
          }
          style={({ pressed }) => [
            styles.addButton,
            pressed &&
              styles.addButtonPressed,
          ]}
        >
          <Ionicons
            name="add"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.addButtonText}>
            خرید جدید
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#9CA3AF"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="جستجوی خرید یا تأمین‌کننده..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          textAlign="right"
          returnKeyType="search"
        />

        {search.length > 0 ? (
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={8}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color="#9CA3AF"
            />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={purchases}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderPurchase}
        contentContainerStyle={[
          styles.listContent,
          purchases.length === 0 &&
            styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          renderEmpty
        }
        ListFooterComponent={
          renderFooter
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
  },

  addButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: "#111827",
  },

  addButtonPressed: {
    opacity: 0.8,
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 9,
    fontSize: 14,
    color: "#111827",
    minHeight: 44,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  card: {
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  cardPressed: {
    opacity: 0.75,
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  cardHeaderContent: {
    flex: 1,
    marginHorizontal: 11,
    alignItems: "flex-end",
  },

  purchaseTitle: {
    maxWidth: "100%",
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },

  date: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },

  divider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#F3F4F6",
  },

  infoRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },

  infoItem: {
    flex: 1,
    alignItems: "flex-end",
  },

  infoLabel: {
    marginBottom: 4,
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
  },

  infoValue: {
    maxWidth: "100%",
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "right",
  },

  mutedValue: {
    color: "#9CA3AF",
    fontWeight: "500",
  },

  noteRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 7,
  },

  note: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: "#6B7280",
    textAlign: "right",
  },

  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  stateIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
  },

  stateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },

  stateText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color: "#9CA3AF",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#111827",
  },

  retryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  footer: {
    alignItems: "center",
    paddingVertical: 18,
  },
});

