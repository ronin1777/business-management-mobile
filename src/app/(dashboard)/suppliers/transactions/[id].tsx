
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useEffect,
  useState,
} from "react";

import {
  getSupplierTransactions,
} from "@/services/api/suppliers";

import type {
  SupplierTransaction,
} from "@/types/suppliers";

export default function SupplierTransactionDetailScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const transactionId = Number(id);

  const [
    transaction,
    setTransaction,
  ] = useState<SupplierTransaction | null>(
    null,
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadTransaction =
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await getSupplierTransactions({
              page: 1,
              pageSize: 100,
              ordering: "-created_at",
            });

          const found =
            response.data.results.find(
              (item) =>
                item.id === transactionId,
            );

          if (!found) {
            throw new Error(
              "تراکنش موردنظر پیدا نشد.",
            );
          }

          setTransaction(found);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "دریافت تراکنش ناموفق بود.",
          );
        } finally {
          setLoading(false);
        }
      };

    loadTransaction();
  }, [transactionId]);

  const formatAmount = (
    amount: number,
  ) => {
    return `${new Intl.NumberFormat(
      "fa-IR",
    ).format(amount)} تومان`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#262626"
        />

        <Text style={styles.loadingText}>
          در حال دریافت تراکنش...
        </Text>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={38}
          color="#525252"
        />

        <Text style={styles.errorTitle}>
          تراکنش پیدا نشد
        </Text>

        <Text style={styles.errorMessage}>
          {error}
        </Text>

        <Pressable
          style={styles.backAction}
          onPress={() => router.back()}
        >
          <Text style={styles.backActionText}>
            بازگشت
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-forward"
            size={21}
            color="#262626"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            جزئیات تراکنش
          </Text>

          <Text style={styles.subtitle}>
            تراکنش شماره {transaction.id}
          </Text>
        </View>
      </View>

      <View style={styles.amountCard}>
        <View style={styles.amountIcon}>
          <Ionicons
            name="swap-vertical-outline"
            size={27}
            color="#525252"
          />
        </View>

        <Text style={styles.amountLabel}>
          مبلغ تراکنش
        </Text>

        <Text style={styles.amount}>
          {formatAmount(
            transaction.amount,
          )}
        </Text>

        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {
              transaction.transaction_type_display
            }
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <InfoRow
          label="نوع تراکنش"
          value={
            transaction.transaction_type_display
          }
        />

        <Divider />

        <InfoRow
          label="جهت"
          value={
            transaction.direction_display
          }
        />

        <Divider />

        <InfoRow
          label="شناسه تأمین‌کننده"
          value={String(
            transaction.supplier,
          )}
        />

        {transaction.purchase !==
          null && (
          <>
            <Divider />

            <InfoRow
              label="خرید"
              value={String(
                transaction.purchase,
              )}
            />
          </>
        )}

        {transaction.payment !==
          null && (
          <>
            <Divider />

            <InfoRow
              label="پرداخت"
              value={String(
                transaction.payment,
              )}
            />
          </>
        )}

        <Divider />

        <InfoRow
          label="تاریخ ثبت"
          value={new Date(
            transaction.created_at,
          ).toLocaleString("fa-IR")}
        />
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>
          توضیحات
        </Text>

        <Text style={styles.note}>
          {transaction.note ||
            "برای این تراکنش توضیحی ثبت نشده است."}
        </Text>
      </View>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  center: {
    flex: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#737373",
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },

  errorMessage: {
    marginTop: 7,
    fontSize: 12,
    color: "#737373",
    textAlign: "center",
  },

  backAction: {
    marginTop: 18,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },

  backActionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 12,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#171717",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#737373",
  },

  amountCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 22,
    alignItems: "center",
  },

  amountIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  amountLabel: {
    marginTop: 12,
    fontSize: 12,
    color: "#737373",
  },

  amount: {
    marginTop: 5,
    fontSize: 22,
    fontWeight: "700",
    color: "#262626",
  },

  typeBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },

  typeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
  },

  infoCard: {
    marginTop: 16,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
  },

  infoRow: {
    minHeight: 52,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoLabel: {
    fontSize: 12,
    color: "#737373",
  },

  infoValue: {
    maxWidth: "65%",
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },

  noteCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
  },

  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#404040",
    textAlign: "right",
  },

  note: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 20,
    color: "#737373",
    textAlign: "right",
  },
});

