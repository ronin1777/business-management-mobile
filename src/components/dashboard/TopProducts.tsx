
import { StyleSheet, Text, View } from "react-native";

import type { DashboardProductSales } from "@/types/dashboard";

type TopProductsProps = {
  products: DashboardProductSales[];
  formatNumber: (value: number) => string;
  formatMoney: (value: number) => string;
};

export function TopProducts({
  products,
  formatNumber,
  formatMoney,
}: TopProductsProps) {
  const topProducts = products.slice(0, 5);

  if (topProducts.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          اطلاعاتی برای نمایش وجود ندارد.
        </Text>
      </View>
    );
  }

  const maxSales = Math.max(
    ...topProducts.map((product) => product.sales),
    1,
  );

  return (
    <View style={styles.card}>
      {topProducts.map((product, index) => {
        const percentage =
          (product.sales / maxSales) * 100;

        return (
          <View
            key={product.product_id}
            style={[
              styles.productRow,
              index !== topProducts.length - 1 &&
                styles.productRowBorder,
            ]}
          >
            <View style={styles.rank}>
              <Text style={styles.rankText}>
                {formatNumber(index + 1)}
              </Text>
            </View>

            <View style={styles.productContent}>
              <View style={styles.productHeader}>
                <Text
                  style={styles.productName}
                  numberOfLines={1}
                >
                  {product.product_name}
                </Text>

                <Text style={styles.salesValue}>
                  {formatMoney(product.sales)}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.quantity}>
                  {formatNumber(product.quantity_sold)} فروش
                </Text>

                <Text style={styles.salesLabel}>
                  مبلغ فروش
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${percentage}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  productRow: {
    minHeight: 92,
    paddingHorizontal: 16,
    paddingVertical: 14,

    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },

  productRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  rank: {
    width: 32,
    height: 32,
    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#f5f5f5",
  },

  rankText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#525252",
  },

  productContent: {
    flex: 1,
    minWidth: 0,
  },

  productHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  productName: {
    flex: 1,

    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    textAlign: "right",
  },

  salesValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#171717",
    textAlign: "left",
  },

  metaRow: {
    marginTop: 6,

    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  salesLabel: {
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "right",
  },

  quantity: {
    fontSize: 11,
    color: "#737373",
    textAlign: "left",
  },

  progressTrack: {
    height: 5,
    marginTop: 10,

    borderRadius: 999,
    overflow: "hidden",

    backgroundColor: "#f0f0f0",
  },

  progressBar: {
    height: "100%",
    borderRadius: 999,

    backgroundColor: "#171717",
  },

  emptyCard: {
    minHeight: 90,

    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },

  emptyText: {
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
  },
});

