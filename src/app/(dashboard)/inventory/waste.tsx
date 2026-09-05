import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createInventoryWaste } from "@/services/api/inventory";
import { getIngredients } from "@/services/api/ingredients";
import type { Ingredient } from "@/types/ingredients";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return `${formatNumber(value)} تومان`;
}

export default function InventoryWasteScreen() {
  const [ingredients, setIngredients] = useState<
    Ingredient[]
  >([]);

  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [pickerVisible, setPickerVisible] =
    useState(false);

  const [ingredientSearch, setIngredientSearch] =
    useState("");

  const [loadingIngredients, setLoadingIngredients] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadIngredients = async () => {
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
            : "دریافت مواد اولیه با خطا مواجه شد.",
        );
      } finally {
        setLoadingIngredients(false);
      }
    };

    loadIngredients();
  }, []);

  const filteredIngredients = useMemo(() => {
    const query = ingredientSearch.trim();

    if (!query) {
      return ingredients;
    }

    return ingredients.filter((item) =>
      item.name.includes(query),
    );
  }, [ingredients, ingredientSearch]);

  const parsedQuantity = Number(
    quantity.replace(/,/g, "."),
  );

  const isQuantityValid =
    quantity.trim() !== "" &&
    Number.isFinite(parsedQuantity) &&
    parsedQuantity > 0;

  const canSubmit =
    selectedIngredient !== null &&
    isQuantityValid &&
    !submitting;

  const handleSelectIngredient = (
    ingredient: Ingredient,
  ) => {
    setSelectedIngredient(ingredient);
    setPickerVisible(false);
    setIngredientSearch("");
  };

  const handleSubmit = async () => {
    if (!selectedIngredient) {
      Alert.alert(
        "ماده اولیه انتخاب نشده",
        "لطفاً یک ماده اولیه انتخاب کنید.",
      );
      return;
    }

    if (!isQuantityValid) {
      Alert.alert(
        "مقدار نامعتبر",
        "مقدار ضایعات باید بیشتر از صفر باشد.",
      );
      return;
    }

    if (parsedQuantity > selectedIngredient.current_stock) {
      Alert.alert(
        "موجودی کافی نیست",
        `مقدار ضایعات نمی‌تواند بیشتر از موجودی فعلی (${formatNumber(
          selectedIngredient.current_stock,
        )} ${selectedIngredient.base_unit}) باشد.`,
      );
      return;
    }

    try {
      setSubmitting(true);

      await createInventoryWaste({
        ingredient: selectedIngredient.id,
        quantity: parsedQuantity,
        note: note.trim(),
      });

      Alert.alert(
        "ثبت موفق",
        "ضایعات با موفقیت ثبت شد.",
        [
          {
            text: "باشه",
            onPress: () =>
              router.replace(
                "/(dashboard)/inventory",
              ),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        "ثبت ناموفق",
        err instanceof Error
          ? err.message
          : "ثبت ضایعات با خطا مواجه شد.",
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
      </View>
    );
  }

  if (error) {
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
          دریافت مواد اولیه ناموفق بود
        </Text>

        <Text style={styles.errorMessage}>
          {error}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            بازگشت
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-forward"
                size={21}
                color="#404040"
              />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                ثبت ضایعات
              </Text>

              <Text style={styles.subtitle}>
                ثبت خروجی ناشی از ضایعات مواد اولیه
              </Text>
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
              <Ionicons
                name="warning-outline"
                size={20}
                color="#a16207"
              />
            </View>

            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>
                توجه
              </Text>

              <Text style={styles.warningText}>
                ثبت ضایعات باعث کاهش مستقیم موجودی ماده
                اولیه می‌شود.
              </Text>
            </View>
          </View>

          {/* Ingredient */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ماده اولیه
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setPickerVisible(true)
              }
              style={styles.selector}
            >
              <View style={styles.selectorIcon}>
                <Ionicons
                  name="cube-outline"
                  size={19}
                  color="#525252"
                />
              </View>

              <View style={styles.selectorContent}>
                <Text
                  style={[
                    styles.selectorValue,
                    !selectedIngredient &&
                      styles.placeholder,
                  ]}
                >
                  {selectedIngredient
                    ? selectedIngredient.name
                    : "انتخاب ماده اولیه"}
                </Text>

                {selectedIngredient && (
                  <Text style={styles.selectorMeta}>
                    واحد:{" "}
                    {selectedIngredient.base_unit}
                  </Text>
                )}
              </View>

              <Ionicons
                name="chevron-down"
                size={18}
                color="#a3a3a3"
              />
            </TouchableOpacity>
          </View>

          {/* Current Stock */}
          {selectedIngredient && (
            <View style={styles.currentStockCard}>
              <View style={styles.currentStockIcon}>
                <Ionicons
                  name="layers-outline"
                  size={20}
                  color="#525252"
                />
              </View>

              <View style={styles.currentStockContent}>
                <Text style={styles.currentStockLabel}>
                  موجودی فعلی
                </Text>

                <Text style={styles.currentStockValue}>
                  {formatNumber(
                    selectedIngredient.current_stock,
                  )}{" "}
                  {selectedIngredient.base_unit}
                </Text>
              </View>

              <View style={styles.currentCost}>
                <Text style={styles.currentCostLabel}>
                  ارزش تقریبی ضایعات
                </Text>

                <Text style={styles.currentCostValue}>
                  {formatCurrency(
                    selectedIngredient.average_unit_cost *
                      (isQuantityValid
                        ? parsedQuantity
                        : 0),
                  )}
                </Text>
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              مقدار ضایعات
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="مقدار ضایعات"
                placeholderTextColor="#a3a3a3"
                keyboardType="decimal-pad"
                style={styles.input}
              />

              {selectedIngredient && (
                <View style={styles.unitBox}>
                  <Text style={styles.unitText}>
                    {selectedIngredient.base_unit}
                  </Text>
                </View>
              )}
            </View>

            {selectedIngredient &&
              isQuantityValid &&
              parsedQuantity >
                selectedIngredient.current_stock && (
                <Text style={styles.validationError}>
                  مقدار ضایعات بیشتر از موجودی فعلی است.
                </Text>
              )}
          </View>

          {/* Note */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.sectionTitle}>
                توضیحات
              </Text>

              <Text style={styles.optionalText}>
                اختیاری
              </Text>
            </View>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="دلیل یا توضیحات ضایعات..."
              placeholderTextColor="#a3a3a3"
              multiline
              textAlignVertical="top"
              style={styles.noteInput}
            />
          </View>

          {/* Preview */}
          {selectedIngredient &&
            isQuantityValid && (
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>
                    خلاصه ضایعات
                  </Text>

                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#737373"
                  />
                </View>

                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>
                    موجودی فعلی
                  </Text>

                  <Text style={styles.previewValue}>
                    {formatNumber(
                      selectedIngredient.current_stock,
                    )}{" "}
                    {selectedIngredient.base_unit}
                  </Text>
                </View>

                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>
                    مقدار ضایعات
                  </Text>

                  <Text style={styles.decreaseValue}>
                    -
                    {formatNumber(parsedQuantity)}{" "}
                    {selectedIngredient.base_unit}
                  </Text>
                </View>

                <View style={styles.previewDivider} />

                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>
                    موجودی پس از ثبت
                  </Text>

                  <Text
                    style={[
                      styles.previewFinalValue,
                      parsedQuantity >
                        selectedIngredient.current_stock &&
                        styles.dangerValue,
                    ]}
                  >
                    {formatNumber(
                      selectedIngredient.current_stock -
                        parsedQuantity,
                    )}{" "}
                    {selectedIngredient.base_unit}
                  </Text>
                </View>
              </View>
            )}

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              !canSubmit &&
                styles.submitButtonDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />
            ) : (
              <>
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#ffffff"
                />

                <Text style={styles.submitButtonText}>
                  ثبت ضایعات
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Ingredient Picker */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setPickerVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                انتخاب ماده اولیه
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setPickerVisible(false)
                }
                style={styles.modalCloseButton}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#525252"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <Ionicons
                name="search-outline"
                size={18}
                color="#737373"
              />

              <TextInput
                value={ingredientSearch}
                onChangeText={
                  setIngredientSearch
                }
                placeholder="جستجوی ماده اولیه..."
                placeholderTextColor="#a3a3a3"
                style={styles.modalSearchInput}
              />
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.ingredientList
              }
            >
              {filteredIngredients.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Ionicons
                    name="search-outline"
                    size={24}
                    color="#a3a3a3"
                  />

                  <Text style={styles.modalEmptyText}>
                    ماده اولیه‌ای پیدا نشد.
                  </Text>
                </View>
              ) : (
                filteredIngredients.map(
                  (ingredient) => {
                    const isSelected =
                      selectedIngredient?.id ===
                      ingredient.id;

                    return (
                      <TouchableOpacity
                        key={ingredient.id}
                        activeOpacity={0.75}
                        onPress={() =>
                          handleSelectIngredient(
                            ingredient,
                          )
                        }
                        style={[
                          styles.ingredientOption,
                          isSelected &&
                            styles.ingredientOptionSelected,
                        ]}
                      >
                        <View
                          style={
                            styles.optionIcon
                          }
                        >
                          <Ionicons
                            name="cube-outline"
                            size={18}
                            color="#525252"
                          />
                        </View>

                        <View
                          style={
                            styles.optionContent
                          }
                        >
                          <Text
                            style={
                              styles.optionName
                            }
                          >
                            {ingredient.name}
                          </Text>

                          <Text
                            style={
                              styles.optionMeta
                            }
                          >
                            موجودی:{" "}
                            {formatNumber(
                              ingredient.current_stock,
                            )}{" "}
                            {
                              ingredient.base_unit
                            }
                          </Text>
                        </View>

                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#171717"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  },
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginRight: 12,
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

  warningCard: {
    marginBottom: 22,
    padding: 13,
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 15,
    backgroundColor: "#fffbeb",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  warningIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },

  warningContent: {
    flex: 1,
  },

  warningTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400e",
    textAlign: "right",
  },

  warningText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 17,
    color: "#a16207",
    textAlign: "right",
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
    marginBottom: 9,
  },

  labelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionalText: {
    fontSize: 10,
    color: "#a3a3a3",
  },

  selector: {
    minHeight: 60,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  selectorIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  selectorContent: {
    flex: 1,
  },

  selectorValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  placeholder: {
    color: "#a3a3a3",
    fontWeight: "400",
  },

  selectorMeta: {
    marginTop: 3,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  currentStockCard: {
    marginBottom: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  currentStockIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  currentStockContent: {
    flex: 1,
    marginRight: 10,
  },

  currentStockLabel: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  currentStockValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  currentCost: {
    alignItems: "flex-end",
    maxWidth: 125,
  },

  currentCostLabel: {
    fontSize: 9,
    color: "#a3a3a3",
  },

  currentCostValue: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "500",
    color: "#525252",
  },

  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    overflow: "hidden",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#171717",
    textAlign: "right",
  },

  unitBox: {
    minWidth: 62,
    height: "100%",
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },

  unitText: {
    fontSize: 11,
    color: "#737373",
  },

  validationError: {
    marginTop: 7,
    fontSize: 10,
    lineHeight: 17,
    color: "#b91c1c",
    textAlign: "right",
  },

  noteInput: {
    minHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    fontSize: 13,
    lineHeight: 20,
    color: "#171717",
    textAlign: "right",
  },

  previewCard: {
    marginBottom: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },

  previewHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  previewTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
  },

  previewRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  previewLabel: {
    fontSize: 11,
    color: "#737373",
  },

  previewValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#404040",
  },

  decreaseValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#b91c1c",
  },

  previewDivider: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginVertical: 5,
  },

  previewFinalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#171717",
  },

  dangerValue: {
    color: "#b91c1c",
  },

  submitButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  submitButtonDisabled: {
    backgroundColor: "#d4d4d4",
  },

  submitButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },

  bottomSpace: {
    height: 16,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    maxHeight: "82%",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fafafa",
  },

  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
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
    gap: 8,
    marginBottom: 10,
  },

  modalSearchInput: {
    flex: 1,
    height: "100%",
    fontSize: 12,
    color: "#171717",
    textAlign: "right",
  },

  ingredientList: {
    paddingBottom: 10,
  },

  ingredientOption: {
    minHeight: 60,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  ingredientOptionSelected: {
    borderColor: "#d4d4d4",
    backgroundColor: "#f5f5f5",
  },

  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  optionContent: {
    flex: 1,
  },

  optionName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  optionMeta: {
    marginTop: 3,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  modalEmpty: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  modalEmptyText: {
    marginTop: 8,
    fontSize: 12,
    color: "#a3a3a3",
  },
});