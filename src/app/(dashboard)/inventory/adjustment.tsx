"use client";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react-native";

import {
  createInventoryAdjustment,
} from "@/services/api/inventory";

import { getIngredients } from "@/services/api/ingredients";

import type { Ingredient } from "@/types/ingredients";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value))} تومان`;
}

function parseNumber(value: string) {
  const normalized = value
    .replace(/٬/g, "")
    .replace(/,/g, "")
    .replace(/[۰-۹]/g, (char) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(char)),
    )
    .replace(/[٠-٩]/g, (char) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(char)),
    );

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function IngredientPicker({
  visible,
  ingredients,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  ingredients: Ingredient[];
  selectedId: number | null;
  onSelect: (ingredient: Ingredient) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return ingredients;

    return ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(query),
    );
  }, [ingredients, search]);

  useEffect(() => {
    if (!visible) {
      setSearch("");
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              انتخاب ماده اولیه
            </Text>

            <Pressable
              onPress={onClose}
              style={styles.modalClose}
            >
              <X size={19} color="#525252" />
            </Pressable>
          </View>

          <View style={styles.modalSearch}>
            <Search size={18} color="#737373" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="جستجو..."
              placeholderTextColor="#a3a3a3"
              style={styles.modalSearchInput}
            />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalList}
          >
            {filteredIngredients.map((ingredient) => {
              const selected = ingredient.id === selectedId;

              return (
                <Pressable
                  key={ingredient.id}
                  onPress={() => onSelect(ingredient)}
                  style={[
                    styles.ingredientOption,
                    selected &&
                      styles.ingredientOptionSelected,
                  ]}
                >
                  <View style={styles.ingredientOptionIcon}>
                    <Package
                      size={18}
                      color={selected ? "#ffffff" : "#525252"}
                    />
                  </View>

                  <View style={styles.ingredientOptionContent}>
                    <Text
                      style={[
                        styles.ingredientOptionName,
                        selected &&
                          styles.ingredientOptionNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {ingredient.name}
                    </Text>

                    <Text
                      style={[
                        styles.ingredientOptionStock,
                        selected &&
                          styles.ingredientOptionStockSelected,
                      ]}
                    >
                      موجودی: {formatNumber(ingredient.current_stock)}{" "}
                      {ingredient.base_unit}
                    </Text>
                  </View>

                  {selected && (
                    <Check size={19} color="#ffffff" />
                  )}
                </Pressable>
              );
            })}

            {filteredIngredients.length === 0 && (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>
                  ماده اولیه‌ای پیدا نشد.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function InventoryAdjustmentScreen() {
  const router = useRouter();

  const [ingredients, setIngredients] = useState<Ingredient[]>(
    [],
  );

  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");

  const [pickerVisible, setPickerVisible] = useState(false);

  const [loadingIngredients, setLoadingIngredients] =
    useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIngredients = useCallback(async () => {
    try {
      setLoadingIngredients(true);
      setError(null);

      const response = await getIngredients({
        page: 1,
        pageSize: 100,
        ordering: "name",
      });

      setIngredients(response.data.results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "دریافت مواد اولیه ناموفق بود.",
      );
    } finally {
      setLoadingIngredients(false);
    }
  }, []);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  const adjustmentValue = useMemo(
    () => parseNumber(quantity),
    [quantity],
  );

  const currentStock =
    selectedIngredient?.current_stock ?? 0;

  const resultingStock = currentStock + adjustmentValue;

  const isDecrease = adjustmentValue < 0;
  const isIncrease = adjustmentValue > 0;
  const isZero = adjustmentValue === 0;

  const resultingStockIsNegative = resultingStock < 0;

  const isFormValid =
    Boolean(selectedIngredient) &&
    !isZero &&
    !Number.isNaN(adjustmentValue) &&
    (unitCost.trim() === "" ||
      parseNumber(unitCost) >= 0);

  const handleSelectIngredient = (
    ingredient: Ingredient,
  ) => {
    setSelectedIngredient(ingredient);
    setPickerVisible(false);
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
  };

  const handleUnitCostChange = (value: string) => {
    setUnitCost(value);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedIngredient) {
      setError("ابتدا یک ماده اولیه انتخاب کنید.");
      return;
    }

    if (isZero) {
      setError(
        "مقدار اصلاح موجودی نمی‌تواند صفر باشد.",
      );
      return;
    }

    if (
      unitCost.trim() !== "" &&
      parseNumber(unitCost) < 0
    ) {
      setError("هزینه واحد نمی‌تواند منفی باشد.");
      return;
    }

    try {
      setSubmitting(true);

      await createInventoryAdjustment({
        ingredient: selectedIngredient.id,
        quantity: adjustmentValue,
        unit_cost:
          unitCost.trim() === ""
            ? null
            : parseNumber(unitCost),
        note: note.trim() || undefined,
      });

      router.replace("/(dashboard)/inventory");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ثبت اصلاح موجودی ناموفق بود.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingIngredients) {
    return (
      <View style={styles.loadingScreen}>
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <RefreshCw size={22} color="#404040" />
          </View>

          <View style={styles.introText}>
            <Text style={styles.title}>
              اصلاح موجودی
            </Text>

            <Text style={styles.subtitle}>
              افزایش یا کاهش دستی موجودی یک ماده اولیه
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <AlertCircle
              size={18}
              color="#dc2626"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              onPress={() => setError(null)}
              hitSlop={8}
            >
              <X size={16} color="#b91c1c" />
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            ماده اولیه
          </Text>

          <Pressable
            onPress={() => setPickerVisible(true)}
            style={styles.selectButton}
          >
            {selectedIngredient ? (
              <>
                <View style={styles.selectedIngredientIcon}>
                  <Package size={18} color="#404040" />
                </View>

                <View style={styles.selectedIngredientContent}>
                  <Text
                    style={styles.selectedIngredientName}
                    numberOfLines={1}
                  >
                    {selectedIngredient.name}
                  </Text>

                  <Text style={styles.selectedIngredientStock}>
                    موجودی فعلی:{" "}
                    {formatNumber(currentStock)}{" "}
                    {selectedIngredient.base_unit}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.placeholderText}>
                یک ماده اولیه انتخاب کنید
              </Text>
            )}

            <ChevronDown
              size={19}
              color="#737373"
            />
          </Pressable>
        </View>

        {selectedIngredient && (
          <View style={styles.stockCard}>
            <View style={styles.stockCardHeader}>
              <View style={styles.stockCardIcon}>
                <Package size={19} color="#525252" />
              </View>

              <View>
                <Text style={styles.stockCardLabel}>
                  موجودی فعلی
                </Text>

                <Text style={styles.stockCardName}>
                  {selectedIngredient.name}
                </Text>
              </View>
            </View>

            <View style={styles.stockValueRow}>
              <Text style={styles.stockValue}>
                {formatNumber(currentStock)}
              </Text>

              <Text style={styles.stockUnit}>
                {selectedIngredient.base_unit}
              </Text>
            </View>

            <Text style={styles.stockCost}>
              ارزش فعلی:{" "}
              {formatMoney(
                selectedIngredient.current_inventory_value,
              )}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionLabel}>
              مقدار اصلاح
            </Text>

            <Text style={styles.helperText}>
              مثبت = افزایش / منفی = کاهش
            </Text>
          </View>

          <View style={styles.quantityInputWrapper}>
            <TextInput
              value={quantity}
              onChangeText={handleQuantityChange}
              placeholder="مثلاً 10 یا -5"
              placeholderTextColor="#a3a3a3"
              keyboardType="numbers-and-punctuation"
              style={styles.quantityInput}
              textAlign="right"
            />

            {selectedIngredient && (
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>
                  {selectedIngredient.base_unit}
                </Text>
              </View>
            )}
          </View>
        </View>

        {selectedIngredient && !isZero && (
          <View
            style={[
              styles.previewCard,
              isIncrease
                ? styles.previewIncrease
                : styles.previewDecrease,
            ]}
          >
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                پیش‌نمایش موجودی
              </Text>

              <View
                style={[
                  styles.directionBadge,
                  isIncrease
                    ? styles.directionBadgeIncrease
                    : styles.directionBadgeDecrease,
                ]}
              >
                {isIncrease ? (
                  <Plus size={13} color="#15803d" />
                ) : (
                  <Minus size={13} color="#dc2626" />
                )}

                <Text
                  style={[
                    styles.directionText,
                    isIncrease
                      ? styles.directionTextIncrease
                      : styles.directionTextDecrease,
                  ]}
                >
                  {isIncrease
                    ? "افزایش"
                    : "کاهش"}
                </Text>
              </View>
            </View>

            <View style={styles.previewValues}>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>
                  فعلی
                </Text>

                <Text style={styles.previewValue}>
                  {formatNumber(currentStock)}
                </Text>
              </View>

              <Text style={styles.previewArrow}>
                ←
              </Text>

              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>
                  بعد از اصلاح
                </Text>

                <Text
                  style={[
                    styles.previewValue,
                    resultingStockIsNegative &&
                      styles.previewValueDanger,
                  ]}
                >
                  {formatNumber(resultingStock)}
                </Text>
              </View>
            </View>

            {resultingStockIsNegative && (
              <View style={styles.warningRow}>
                <AlertCircle
                  size={16}
                  color="#b45309"
                />

                <Text style={styles.warningText}>
                  موجودی نهایی منفی می‌شود و ممکن است
                  سرور ثبت این اصلاح را رد کند.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionLabel}>
              هزینه واحد
            </Text>

            <Text style={styles.optionalText}>
              اختیاری
            </Text>
          </View>

          <View style={styles.moneyInputWrapper}>
            <TextInput
              value={unitCost}
              onChangeText={handleUnitCostChange}
              placeholder="مثلاً 250000"
              placeholderTextColor="#a3a3a3"
              keyboardType="numeric"
              style={styles.moneyInput}
              textAlign="right"
            />

            <Text style={styles.moneyUnit}>
              تومان
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionLabel}>
              یادداشت
            </Text>

            <Text style={styles.optionalText}>
              اختیاری
            </Text>
          </View>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="دلیل اصلاح موجودی را وارد کنید..."
            placeholderTextColor="#a3a3a3"
            multiline
            numberOfLines={4}
            textAlign="right"
            textAlignVertical="top"
            style={styles.noteInput}
          />
        </View>

        <View style={styles.infoBox}>
          <AlertCircle size={17} color="#737373" />

          <Text style={styles.infoText}>
            برای افزایش موجودی مقدار مثبت و برای کاهش
            موجودی مقدار منفی وارد کنید.
          </Text>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={!isFormValid || submitting}
          style={[
            styles.submitButton,
            (!isFormValid || submitting) &&
              styles.submitButtonDisabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
            />
          ) : (
            <Check size={18} color="#ffffff" />
          )}

          <Text style={styles.submitButtonText}>
            {submitting
              ? "در حال ثبت..."
              : "ثبت اصلاح موجودی"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={submitting}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>
            انصراف
          </Text>
        </Pressable>
      </ScrollView>

      <IngredientPicker
        visible={pickerVisible}
        ingredients={ingredients}
        selectedId={selectedIngredient?.id ?? null}
        onSelect={handleSelectIngredient}
        onClose={() => setPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 12,
    color: "#737373",
  },

  intro: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 18,
  },

  introIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  introText: {
    flex: 1,
    marginRight: 11,
    alignItems: "flex-end",
  },

  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#171717",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#737373",
    textAlign: "right",
  },

  errorBox: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: "#fef2f2",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: "#b91c1c",
    textAlign: "right",
  },

  section: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  helperText: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  optionalText: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  selectButton: {
    minHeight: 58,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  selectedIngredientIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedIngredientContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  selectedIngredientName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
  },

  selectedIngredientStock: {
    marginTop: 3,
    fontSize: 10,
    color: "#737373",
  },

  placeholderText: {
    flex: 1,
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "right",
  },

  stockCard: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    marginBottom: 18,
  },

  stockCardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },

  stockCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  stockCardLabel: {
    fontSize: 10,
    color: "#737373",
    textAlign: "right",
  },

  stockCardName: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  stockValueRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    marginTop: 15,
    gap: 6,
  },

  stockValue: {
    fontSize: 27,
    fontWeight: "700",
    color: "#171717",
  },

  stockUnit: {
    fontSize: 11,
    color: "#737373",
  },

  stockCost: {
    marginTop: 4,
    fontSize: 10,
    color: "#737373",
    textAlign: "right",
  },

  quantityInputWrapper: {
    minHeight: 52,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },

  quantityInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: "#171717",
    paddingVertical: 0,
  },

  unitBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },

  unitBadgeText: {
    fontSize: 10,
    color: "#525252",
    fontWeight: "600",
  },

  previewCard: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },

  previewIncrease: {
    backgroundColor: "#f0fdf4",
    borderColor: "#dcfce7",
  },

  previewDecrease: {
    backgroundColor: "#fef2f2",
    borderColor: "#fee2e2",
  },

  previewHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  previewTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
  },

  directionBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  directionBadgeIncrease: {
    backgroundColor: "#dcfce7",
  },

  directionBadgeDecrease: {
    backgroundColor: "#fee2e2",
  },

  directionText: {
    fontSize: 10,
    fontWeight: "600",
  },

  directionTextIncrease: {
    color: "#15803d",
  },

  directionTextDecrease: {
    color: "#dc2626",
  },

  previewValues: {
    marginTop: 17,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },

  previewItem: {
    alignItems: "center",
    minWidth: 85,
  },

  previewLabel: {
    fontSize: 10,
    color: "#737373",
    marginBottom: 4,
  },

  previewValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#262626",
  },

  previewValueDanger: {
    color: "#dc2626",
  },

  previewArrow: {
    fontSize: 19,
    color: "#a3a3a3",
  },

  warningRow: {
    marginTop: 14,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#fed7aa",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 7,
  },

  warningText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 17,
    color: "#b45309",
    textAlign: "right",
  },

  moneyInputWrapper: {
    minHeight: 52,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },

  moneyInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: "#171717",
    paddingVertical: 0,
  },

  moneyUnit: {
    fontSize: 10,
    color: "#737373",
  },

  noteInput: {
    minHeight: 100,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    fontSize: 12,
    lineHeight: 20,
    color: "#171717",
  },

  infoBox: {
    padding: 13,
    borderRadius: 13,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 18,
  },

  infoText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 17,
    color: "#737373",
    textAlign: "right",
  },

  submitButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  submitButtonDisabled: {
    backgroundColor: "#a3a3a3",
  },

  submitButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  cancelButton: {
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  cancelButtonText: {
    fontSize: 12,
    color: "#737373",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    maxHeight: "82%",
    backgroundColor: "#fafafa",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 9,
    paddingHorizontal: 16,
    paddingBottom: 25,
  },

  modalHandle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#d4d4d4",
    marginBottom: 15,
  },

  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
  },

  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  modalSearch: {
    height: 46,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },

  modalSearchInput: {
    flex: 1,
    fontSize: 12,
    color: "#171717",
    textAlign: "right",
    paddingVertical: 0,
  },

  modalList: {
    paddingBottom: 15,
  },

  ingredientOption: {
    minHeight: 60,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
    marginBottom: 8,
  },

  ingredientOptionSelected: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },

  ingredientOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  ingredientOptionContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  ingredientOptionName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#262626",
  },

  ingredientOptionNameSelected: {
    color: "#ffffff",
  },

  ingredientOptionStock: {
    marginTop: 3,
    fontSize: 10,
    color: "#737373",
  },

  ingredientOptionStockSelected: {
    color: "#d4d4d4",
  },

  modalEmpty: {
    paddingVertical: 40,
    alignItems: "center",
  },

  modalEmptyText: {
    fontSize: 12,
    color: "#737373",
  },
});