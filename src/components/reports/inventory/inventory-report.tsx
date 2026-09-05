import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageX,
  Search,
  Warehouse,
  X,
} from "lucide-react-native";

import ReportKpiCard from "@/components/reports/shared/report-kpi-card";
import { getInventoryReport } from "@/services/api/reports";

import type {
  InventoryIngredient,
  InventoryReport as InventoryReportData,
} from "@/types/reports";

type InventoryStatus =
  | "all"
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "needs_supply";

function formatNumber(value: string | number): string {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("fa-IR").format(number);
}

function formatMoney(value: string | number): string {
  return `${formatNumber(value)} تومان`;
}

function formatUnit(value: string): string {
  const units: Record<string, string> = {
    kg: "کیلوگرم",
    kilogram: "کیلوگرم",
    g: "گرم",
    gram: "گرم",
    l: "لیتر",
    liter: "لیتر",
    ml: "میلی‌لیتر",
    milliliter: "میلی‌لیتر",
    pcs: "عدد",
    piece: "عدد",
    unit: "عدد",
  };

  return units[value.toLowerCase()] ?? value;
}

function getStockPercentage(
  currentStock: string,
  minimumStock: string,
): number {
  const current = Number(currentStock);
  const minimum = Number(minimumStock);

  if (minimum <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.min((current / minimum) * 100, 100);
}

function getStockBarWidth(
  currentStock: string,
  minimumStock: string,
): number {
  return getStockPercentage(
    currentStock,
    minimumStock,
  );
}

function getStatusLabel(
  ingredient: InventoryIngredient,
): string {
  if (ingredient.is_out_of_stock) {
    return "ناموجود";
  }

  if (ingredient.is_low_stock) {
    return "کم‌موجود";
  }

  return "موجود";
}

function getStatusStyle(
  ingredient: InventoryIngredient,
) {
  if (ingredient.is_out_of_stock) {
    return {
      backgroundColor: "#fef2f2",
      textColor: "#b91c1c",
    };
  }

  if (ingredient.is_low_stock) {
    return {
      backgroundColor: "#fffbeb",
      textColor: "#a16207",
    };
  }

  return {
    backgroundColor: "#f0fdf4",
    textColor: "#166534",
  };
}

function getStatusIcon(
  ingredient: InventoryIngredient,
) {
  if (ingredient.is_out_of_stock) {
    return PackageX;
  }

  if (ingredient.is_low_stock) {
    return AlertTriangle;
  }

  return CheckCircle2;
}

function getStockBarColor(
  ingredient: InventoryIngredient,
): string {
  if (ingredient.is_out_of_stock) {
    return "#dc2626";
  }

  if (ingredient.is_low_stock) {
    return "#d97706";
  }

  return "#16a34a";
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function FilterChip({
  label,
  active,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          active && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const STATUS_FILTERS: {
  value: InventoryStatus;
  label: string;
}[] = [
  {
    value: "all",
    label: "همه",
  },
  {
    value: "in_stock",
    label: "موجود",
  },
  {
    value: "low_stock",
    label: "کم‌موجود",
  },
  {
    value: "out_of_stock",
    label: "ناموجود",
  },
  {
    value: "needs_supply",
    label: "نیازمند تأمین",
  },
];

export default function InventoryReport() {
  const [report, setReport] =
    useState<InventoryReportData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<InventoryStatus>("all");

  const [unit, setUnit] =
    useState("all");

  const loadReport = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getInventoryReport();

        if (!response.success) {
          throw new Error(
            response.message ||
              "دریافت گزارش موجودی ناموفق بود.",
          );
        }

        setReport(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در دریافت گزارش موجودی رخ داد.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const units = useMemo(() => {
    if (!report) {
      return [];
    }

    return Array.from(
      new Set(
        report.ingredients.map(
          (ingredient) =>
            ingredient.base_unit,
        ),
      ),
    );
  }, [report]);

  const filteredIngredients = useMemo(() => {
    if (!report) {
      return [];
    }

    const normalizedSearch =
      search.trim().toLowerCase();

    const filtered =
      report.ingredients.filter(
        (ingredient) => {
          const matchesSearch =
            !normalizedSearch ||
            ingredient.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesUnit =
            unit === "all" ||
            ingredient.base_unit === unit;

          const matchesStatus =
            status === "all" ||
            (status === "out_of_stock" &&
              ingredient.is_out_of_stock) ||
            (status === "low_stock" &&
              !ingredient.is_out_of_stock &&
              ingredient.is_low_stock) ||
            (status === "in_stock" &&
              !ingredient.is_out_of_stock &&
              !ingredient.is_low_stock) ||
            (status === "needs_supply" &&
              (ingredient.is_out_of_stock ||
                ingredient.is_low_stock));

          return (
            matchesSearch &&
            matchesUnit &&
            matchesStatus
          );
        },
      );

    return [...filtered].sort(
      (a, b) => {
        const getWeight = (
          ingredient: InventoryIngredient,
        ) => {
          if (
            ingredient.is_out_of_stock
          ) {
            return 0;
          }

          if (ingredient.is_low_stock) {
            return 1;
          }

          return 2;
        };

        return (
          getWeight(a) -
          getWeight(b)
        );
      },
    );
  }, [
    report,
    search,
    status,
    unit,
  ]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    status !== "all" ||
    unit !== "all";

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setUnit("all");
  }

  function handleNeedsSupplyPress() {
    setSearch("");
    setUnit("all");
    setStatus("needs_supply");
  }

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text style={styles.stateText}>
          در حال دریافت گزارش موجودی...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Warehouse
            size={22}
            color="#b91c1c"
            strokeWidth={1.8}
          />
        </View>

        <Text style={styles.errorTitle}>
          دریافت گزارش ناموفق بود
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          onPress={loadReport}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            تلاش مجدد
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>
          گزارشی برای نمایش وجود ندارد.
        </Text>
      </View>
    );
  }

  const {
    summary,
    by_unit_type,
  } = report;

  return (
    <View style={styles.container}>
      {/* -------------------------------------------------------------- */}
      {/* KPI */}
      {/* -------------------------------------------------------------- */}

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="تعداد مواد اولیه"
          value={formatNumber(
            summary.ingredient_count,
          )}
        />

        <ReportKpiCard
          title="ارزش کل موجودی"
          value={formatMoney(
            summary.total_inventory_value,
          )}
        />
      </View>

      <View style={styles.kpiRow}>
        <ReportKpiCard
          title="مواد ناموجود"
          value={formatNumber(
            summary.out_of_stock_count,
          )}
        />

        <ReportKpiCard
          title="مواد کم‌موجود"
          value={formatNumber(
            summary.low_stock_count,
          )}
        />
      </View>

      {/* -------------------------------------------------------------- */}
      {/* Supply Status */}
      {/* -------------------------------------------------------------- */}

      {(summary.out_of_stock_count > 0 ||
        summary.low_stock_count > 0) && (
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <AlertTriangle
              size={19}
              color="#a16207"
              strokeWidth={1.8}
            />
          </View>

          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              وضعیت تأمین نیاز به بررسی دارد
            </Text>

            <Text style={styles.alertText}>
              {summary.out_of_stock_count >
              0
                ? `${formatNumber(
                    summary.out_of_stock_count,
                  )} ماده اولیه ناموجود`
                : "ماده ناموجودی وجود ندارد"}
              {" و "}
              {summary.low_stock_count >
              0
                ? `${formatNumber(
                    summary.low_stock_count,
                  )} ماده زیر حداقل موجودی قرار دارد.`
                : "ماده‌ای زیر حداقل موجودی نیست."}
            </Text>

            <Pressable
              onPress={
                handleNeedsSupplyPress
              }
              style={styles.alertButton}
            >
              <Text
                style={
                  styles.alertButtonText
                }
              >
                مشاهده موارد نیازمند تأمین
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Inventory By Unit */}
      {/* -------------------------------------------------------------- */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Boxes
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            خلاصه موجودی
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          نمای کلی موجودی مواد اولیه به تفکیک واحد
        </Text>
      </View>

      <View style={styles.unitGrid}>
        {by_unit_type.length === 0 ? (
          <View style={styles.emptyUnit}>
            <Text style={styles.emptyText}>
              اطلاعاتی برای نمایش وجود ندارد.
            </Text>
          </View>
        ) : (
          by_unit_type.map((item) => (
            <View
              key={item.unit_type}
              style={styles.unitCard}
            >
              <View
                style={
                  styles.unitCardHeader
                }
              >
                <Text
                  style={
                    styles.unitName
                  }
                  numberOfLines={1}
                >
                  {formatUnit(
                    item.unit_type,
                  )}
                </Text>

                <Text
                  style={
                    styles.unitCount
                  }
                >
                  {formatNumber(
                    item.ingredient_count,
                  )}{" "}
                  ماده
                </Text>
              </View>

              <Text
                style={
                  styles.unitStockValue
                }
              >
                {formatNumber(item.stock)}
              </Text>

              <Text
                style={
                  styles.unitStockLabel
                }
              >
                موجودی
              </Text>

              <View
                style={
                  styles.unitDivider
                }
              />

              <Text
                style={
                  styles.unitValueLabel
                }
              >
                ارزش موجودی
              </Text>

              <Text
                style={
                  styles.unitInventoryValue
                }
              >
                {formatMoney(
                  item.inventory_value,
                )}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* -------------------------------------------------------------- */}
      {/* Ingredients */}
      {/* -------------------------------------------------------------- */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Boxes
            size={17}
            color="#525252"
            strokeWidth={2}
          />

          <Text style={styles.sectionTitle}>
            وضعیت مواد اولیه
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          موجودی فعلی، حداقل موجودی و ارزش هر ماده اولیه
        </Text>
      </View>

      <View style={styles.ingredientsCard}>
        {/* Search */}

        <View style={styles.searchContainer}>
          <Search
            size={17}
            color="#a3a3a3"
            strokeWidth={1.8}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="جستجوی ماده اولیه..."
            placeholderTextColor="#a3a3a3"
            style={styles.searchInput}
            textAlign="right"
            returnKeyType="search"
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              style={styles.clearSearch}
            >
              <X
                size={15}
                color="#737373"
                strokeWidth={2}
              />
            </Pressable>
          )}
        </View>

        {/* Status Filters */}

        <ScrollView
          horizontal
          
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filtersContent
          }
        >
          {STATUS_FILTERS.map(
            (filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                active={
                  status ===
                  filter.value
                }
                onPress={() =>
                  setStatus(
                    filter.value,
                  )
                }
              />
            ),
          )}
        </ScrollView>

        {/* Unit Filters */}

        {units.length > 0 && (
          <View style={styles.unitFilterSection}>
            <Text
              style={
                styles.filterLabel
              }
            >
              واحد
            </Text>

            <ScrollView
              horizontal
              
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filtersContent
              }
            >
              <FilterChip
                label="همه واحدها"
                active={unit === "all"}
                onPress={() =>
                  setUnit("all")
                }
              />

              {units.map(
                (item) => (
                  <FilterChip
                    key={item}
                    label={formatUnit(
                      item,
                    )}
                    active={
                      unit === item
                    }
                    onPress={() =>
                      setUnit(item)
                    }
                  />
                ),
              )}
            </ScrollView>
          </View>
        )}

        {/* Active Filters */}

        {hasActiveFilters && (
          <View
            style={
              styles.activeFilters
            }
          >
            <View
              style={
                styles.activeFiltersInfo
              }
            >
              <Text
                style={
                  styles.activeFiltersText
                }
              >
                نمایش{" "}
                <Text
                  style={
                    styles.activeFiltersStrong
                  }
                >
                  {formatNumber(
                    filteredIngredients.length,
                  )}
                </Text>{" "}
                مورد از{" "}
                <Text
                  style={
                    styles.activeFiltersStrong
                  }
                >
                  {formatNumber(
                    report.ingredients.length,
                  )}
                </Text>
              </Text>
            </View>

            <Pressable
              onPress={clearFilters}
              style={
                styles.clearFiltersButton
              }
            >
              <Text
                style={
                  styles.clearFiltersText
                }
              >
                پاک کردن فیلترها
              </Text>
            </Pressable>
          </View>
        )}

        {/* Result Count */}

        <View
          style={
            styles.resultsHeader
          }
        >
          <Text
            style={
              styles.resultsCount
            }
          >
            {formatNumber(
              filteredIngredients.length,
            )}{" "}
            مورد
          </Text>
        </View>

        {/* Ingredients */}

        {filteredIngredients.length ===
        0 ? (
          <View
            style={
              styles.emptyIngredients
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Search
                size={20}
                color="#a3a3a3"
                strokeWidth={1.7}
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              ماده اولیه‌ای پیدا نشد
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              عبارت جستجو یا فیلترهای انتخاب‌شده
              را تغییر دهید.
            </Text>
          </View>
        ) : (
          <View>
            {filteredIngredients.map(
              (
                ingredient,
                index,
              ) => {
                const statusStyle =
                  getStatusStyle(
                    ingredient,
                  );

                const StatusIcon =
                  getStatusIcon(
                    ingredient,
                  );

                const percentage =
                  getStockPercentage(
                    ingredient.current_stock,
                    ingredient.minimum_stock,
                  );

                return (
                  <View
                    key={
                      ingredient.id
                    }
                    style={[
                      styles.ingredientRow,
                      index <
                        filteredIngredients.length -
                          1 &&
                        styles.ingredientRowBorder,
                    ]}
                  >
                    {/* Header */}

                    <View
                      style={
                        styles.ingredientHeader
                      }
                    >
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              statusStyle.backgroundColor,
                          },
                        ]}
                      >
                        <StatusIcon
                          size={12}
                          color={
                            statusStyle.textColor
                          }
                          strokeWidth={2}
                        />

                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                statusStyle.textColor,
                            },
                          ]}
                        >
                          {getStatusLabel(
                            ingredient,
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.ingredientTitleWrapper
                        }
                      >
                        <Text
                          style={
                            styles.ingredientName
                          }
                          numberOfLines={1}
                        >
                          {
                            ingredient.name
                          }
                        </Text>

                        <Text
                          style={
                            styles.ingredientUnit
                          }
                        >
                          {formatUnit(
                            ingredient.base_unit,
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.ingredientIcon
                        }
                      >
                        <Boxes
                          size={17}
                          color="#737373"
                          strokeWidth={1.8}
                        />
                      </View>
                    </View>

                    {/* Current Stock */}

                    <View
                      style={
                        styles.stockSection
                      }
                    >
                      <View
                        style={
                          styles.stockHeader
                        }
                      >
                        <Text
                          style={
                            styles.stockPercentage
                          }
                        >
                          {formatNumber(
                            Math.round(
                              percentage,
                            ),
                          )}
                          ٪
                        </Text>

                        <Text
                          style={
                            styles.stockValue
                          }
                        >
                          {formatNumber(
                            ingredient.current_stock,
                          )}{" "}
                          {formatUnit(
                            ingredient.base_unit,
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.progressTrack
                        }
                      >
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${percentage}%`,
                              backgroundColor:
                                getStockBarColor(
                                  ingredient,
                                ),
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Details */}

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <View
                        style={
                          styles.detailItem
                        }
                      >
                        <Text
                          style={
                            styles.detailLabel
                          }
                        >
                          حداقل موجودی
                        </Text>

                        <Text
                          style={
                            styles.detailValue
                          }
                        >
                          {formatNumber(
                            ingredient.minimum_stock,
                          )}{" "}
                          {formatUnit(
                            ingredient.base_unit,
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.detailItem
                        }
                      >
                        <Text
                          style={
                            styles.detailLabel
                          }
                        >
                          ارزش موجودی
                        </Text>

                        <Text
                          style={
                            styles.detailValue
                          }
                        >
                          {formatMoney(
                            ingredient.current_inventory_value,
                          )}
                        </Text>
                      </View>
                    </View>

                    {/* Footer */}

                    <View
                      style={
                        styles.ingredientFooter
                      }
                    >
                      <Text
                        style={
                          styles.averageCost
                        }
                      >
                        میانگین قیمت واحد
                      </Text>

                      <Text
                        style={
                          styles.averageCostValue
                        }
                      >
                        {formatMoney(
                          ingredient.average_unit_cost,
                        )}
                      </Text>
                    </View>
                  </View>
                );
              },
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 24,
  },

  stateContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  stateText: {
    fontSize: 12,
    color: "#737373",
    textAlign: "center",
  },

  errorContainer: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
    textAlign: "center",
  },

  errorText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: "#a3a3a3",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 14,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
  },

  kpiRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  alertCard: {
    width: "100%",
    padding: 14,
    marginTop: 2,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 16,
    backgroundColor: "#fffbeb",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
  },

  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },

  alertContent: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  alertTitle: {
    width: "100%",
    fontSize: 12,
    fontWeight: "600",
    color: "#713f12",
    textAlign: "right",
  },

  alertText: {
    width: "100%",
    marginTop: 5,
    fontSize: 10,
    lineHeight: 17,
    color: "#854d0e",
    textAlign: "right",
  },

  alertButton: {
    marginTop: 10,
    minHeight: 34,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 9,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  alertButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#854d0e",
  },

  sectionHeader: {
    alignItems: "flex-end",
    marginBottom: 10,
    marginTop: 4,
  },

  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
  },

  sectionDescription: {
    marginTop: 5,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  unitGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },

  unitCard: {
    width: "48%",
    flexGrow: 1,
    minHeight: 150,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },

  unitCardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },

  unitName: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  unitCount: {
    fontSize: 9,
    color: "#a3a3a3",
  },

  unitStockValue: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
    textAlign: "right",
  },

  unitStockLabel: {
    marginTop: 2,
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  unitDivider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: "#f0f0f0",
  },

  unitValueLabel: {
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  unitInventoryValue: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  emptyUnit: {
    width: "100%",
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "center",
  },

  ingredientsCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  searchContainer: {
    height: 46,
    margin: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    paddingVertical: 0,
    fontSize: 11,
    color: "#171717",
  },

  clearSearch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#eeeeee",
    alignItems: "center",
    justifyContent: "center",
  },

  filtersContent: {
    flexDirection: "row-reverse",
    gap: 7,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  filterChip: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 9,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipActive: {
    borderColor: "#171717",
    backgroundColor: "#171717",
  },

  filterChipText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#737373",
  },

  filterChipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  unitFilterSection: {
    paddingTop: 2,
  },

  filterLabel: {
    marginBottom: 7,
    paddingHorizontal: 14,
    fontSize: 10,
    fontWeight: "500",
    color: "#a3a3a3",
    textAlign: "right",
  },

  activeFilters: {
    marginHorizontal: 12,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  activeFiltersInfo: {
    flex: 1,
    minWidth: 0,
  },

  activeFiltersText: {
    fontSize: 9,
    color: "#737373",
    textAlign: "right",
  },

  activeFiltersStrong: {
    fontWeight: "600",
    color: "#404040",
  },

  clearFiltersButton: {
    paddingVertical: 3,
    paddingHorizontal: 2,
  },

  clearFiltersText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#404040",
  },

  resultsHeader: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "flex-end",
  },

  resultsCount: {
    fontSize: 9,
    color: "#a3a3a3",
  },

  ingredientRow: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 15,
  },

  ingredientRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  ingredientHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  ingredientIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  ingredientTitleWrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },

  ingredientName: {
    width: "100%",
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  ingredientUnit: {
    marginTop: 3,
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  statusBadge: {
    minHeight: 25,
    paddingHorizontal: 8,
    borderRadius: 7,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "600",
  },

  stockSection: {
    width: "100%",
    marginTop: 14,
  },

  stockHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stockValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  stockPercentage: {
    fontSize: 9,
    color: "#a3a3a3",
  },

  progressTrack: {
    width: "100%",
    height: 6,
    marginTop: 7,
    borderRadius: 99,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 99,
    alignSelf: "flex-end",
  },

  detailRow: {
    width: "100%",
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 12,
  },

  detailItem: {
    flex: 1,
    minWidth: 0,
    padding: 9,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    alignItems: "flex-end",
  },

  detailLabel: {
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  detailValue: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  ingredientFooter: {
    width: "100%",
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  averageCost: {
    flex: 1,
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "right",
  },

  averageCostValue: {
    fontSize: 9,
    fontWeight: "500",
    color: "#737373",
    textAlign: "left",
  },

  emptyIngredients: {
    minHeight: 220,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 11,
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "center",
  },

  emptyDescription: {
    maxWidth: 260,
    marginTop: 5,
    fontSize: 10,
    lineHeight: 17,
    color: "#a3a3a3",
    textAlign: "center",
  },
});