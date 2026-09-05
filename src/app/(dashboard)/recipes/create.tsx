"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { createRecipe } from "@/services/api/recipes";
import { getProducts } from "@/services/api/products";
import { getIngredients } from "@/services/api/ingredients";

import type { Product } from "@/types/products";
import type { Ingredient } from "@/types/ingredients";
import type { CreateRecipeItemPayload } from "@/types/recipes";

type RecipeItemForm = {
  localId: string;
  ingredient: number | null;
  ingredientName: string;
  quantity: string;
  unit: string;
};

function formatDateForApi(value: string) {
  const parts = value.split("/");

  if (parts.length !== 3) {
    return value;
  }

  return value;
}

function validateDate(value: string) {
  if (!value.trim()) {
    return true;
  }

  const pattern = /^\d{4}-\d{2}-\d{2}$/;

  return pattern.test(value);
}

export default function CreateRecipeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [productId, setProductId] = useState<number | null>(null);
  const [productPickerOpen, setProductPickerOpen] =
    useState(false);

  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [ingredientPickerIndex, setIngredientPickerIndex] =
    useState<number | null>(null);

  const [items, setItems] = useState<RecipeItemForm[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError(null);

        const [productsResponse, ingredientsResponse] =
          await Promise.all([
            getProducts({
              page: 1,
              pageSize: 100,
              ordering: "name",
            }),
            getIngredients({
              page: 1,
              pageSize: 100,
              ordering: "name",
            }),
          ]);

        if (!productsResponse.success) {
          throw new Error(
            productsResponse.message ||
              "دریافت محصولات ناموفق بود.",
          );
        }

        if (!ingredientsResponse.success) {
          throw new Error(
            ingredientsResponse.message ||
              "دریافت مواد اولیه ناموفق بود.",
          );
        }

        setProducts(productsResponse.data.results);
        setIngredients(
          ingredientsResponse.data.results,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "خطایی در دریافت اطلاعات رخ داد.",
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) => product.id === productId,
      ) ?? null,
    [products, productId],
  );

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        localId: `${Date.now()}-${Math.random()}`,
        ingredient: null,
        ingredientName: "",
        quantity: "",
        unit: "",
      },
    ]);
  };

  const removeItem = (localId: string) => {
    setItems((current) =>
      current.filter(
        (item) => item.localId !== localId,
      ),
    );
  };

  const updateItem = (
    localId: string,
    changes: Partial<RecipeItemForm>,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.localId === localId
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    );
  };

  const handleIngredientSelect = (
    ingredient: Ingredient,
  ) => {
    if (ingredientPickerIndex === null) {
      return;
    }

    const item = items[ingredientPickerIndex];

    if (!item) {
      return;
    }

    updateItem(item.localId, {
      ingredient: ingredient.id,
      ingredientName: ingredient.name,
      unit: ingredient.base_unit,
    });

    setIngredientPickerIndex(null);
  };

  const validateForm = () => {
    if (!productId) {
      return "لطفاً محصول را انتخاب کنید.";
    }

    if (!validFrom.trim()) {
      return "تاریخ شروع اعتبار را وارد کنید.";
    }

    if (!validateDate(validFrom)) {
      return "تاریخ شروع باید با فرمت YYYY-MM-DD باشد.";
    }

    if (validTo.trim() && !validateDate(validTo)) {
      return "تاریخ پایان باید با فرمت YYYY-MM-DD باشد.";
    }

    if (
      validTo.trim() &&
      validFrom.trim() &&
      validTo < validFrom
    ) {
      return "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.";
    }

    if (items.length === 0) {
      return "حداقل یک ماده اولیه به رسپی اضافه کنید.";
    }

    const selectedIngredients = new Set<number>();

    for (const item of items) {
      if (!item.ingredient) {
        return "برای تمام آیتم‌ها ماده اولیه انتخاب کنید.";
      }

      if (!item.quantity.trim()) {
        return "مقدار تمام مواد اولیه را وارد کنید.";
      }

      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return "مقدار ماده اولیه باید بیشتر از صفر باشد.";
      }

      if (!item.unit.trim()) {
        return "واحد تمام مواد اولیه باید مشخص باشد.";
      }

      if (selectedIngredients.has(item.ingredient)) {
        return "یک ماده اولیه را نمی‌توانید بیشتر از یک بار اضافه کنید.";
      }

      selectedIngredients.add(item.ingredient);
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payloadItems: CreateRecipeItemPayload[] =
        items.map((item) => ({
          ingredient: item.ingredient as number,
          quantity: Number(item.quantity),
          unit: item.unit,
        }));

      await createRecipe({
        product: productId as number,
        valid_from: formatDateForApi(validFrom.trim()),
        valid_to: validTo.trim()
          ? formatDateForApi(validTo.trim())
          : null,
        is_active: isActive,
        items: payloadItems,
      });

      router.replace("/(dashboard)/recipes");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "ثبت رسپی ناموفق بود.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOptions) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="small"
          color="#525252"
        />

        <Text style={styles.loadingText}>
          در حال آماده‌سازی فرم...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#404040"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              ساخت رسپی
            </Text>

            <Text style={styles.subtitle}>
              فرمول و مواد اولیه محصول را مشخص کنید
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color="#dc2626"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            اطلاعات اصلی
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              محصول
              <Text style={styles.required}> *</Text>
            </Text>

            <Pressable
              onPress={() =>
                setProductPickerOpen(
                  !productPickerOpen,
                )
              }
              style={styles.select}
            >
              <Ionicons
                name={
                  productPickerOpen
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color="#737373"
              />

              <Text
                style={[
                  styles.selectText,
                  !selectedProduct &&
                    styles.placeholder,
                ]}
                numberOfLines={1}
              >
                {selectedProduct?.name ||
                  "انتخاب محصول"}
              </Text>
            </Pressable>

            {productPickerOpen && (
              <View style={styles.optionsContainer}>
                {products.length === 0 ? (
                  <Text style={styles.noOptionText}>
                    محصولی پیدا نشد.
                  </Text>
                ) : (
                  products.map((product) => (
                    <Pressable
                      key={product.id}
                      onPress={() => {
                        setProductId(product.id);
                        setProductPickerOpen(false);
                      }}
                      style={styles.option}
                    >
                      <Ionicons
                        name={
                          product.id === productId
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={19}
                        color={
                          product.id === productId
                            ? "#171717"
                            : "#a3a3a3"
                        }
                      />

                      <Text
                        style={[
                          styles.optionText,
                          product.id === productId &&
                            styles.selectedOptionText,
                        ]}
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>
                شروع اعتبار
                <Text style={styles.required}>
                  {" "}
                  *
                </Text>
              </Text>

              <TextInput
                value={validFrom}
                onChangeText={setValidFrom}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>
                پایان اعتبار
              </Text>

              <TextInput
                value={validTo}
                onChangeText={setValidTo}
                placeholder="اختیاری"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.activeRow}>
            <View style={styles.activeTextContainer}>
              <Text style={styles.activeTitle}>
                رسپی فعال باشد
              </Text>

              <Text style={styles.activeDescription}>
                رسپی فعال به عنوان فرمول معتبر محصول
                در نظر گرفته می‌شود.
              </Text>
            </View>

            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{
                false: "#d4d4d4",
                true: "#737373",
              }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                مواد اولیه
              </Text>

              <Text style={styles.sectionDescription}>
                مواد تشکیل‌دهنده و مقدار مصرف را مشخص کنید
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {items.length}
              </Text>
            </View>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <View style={styles.emptyItemsIcon}>
                <Ionicons
                  name="flask-outline"
                  size={25}
                  color="#737373"
                />
              </View>

              <Text style={styles.emptyItemsTitle}>
                هنوز ماده‌ای اضافه نشده
              </Text>

              <Text style={styles.emptyItemsDescription}>
                برای ساخت رسپی حداقل یک ماده اولیه
                اضافه کنید.
              </Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {items.map((item, index) => (
                <View
                  key={item.localId}
                  style={styles.itemCard}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.itemNumber}>
                      <Text
                        style={styles.itemNumberText}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <Text style={styles.itemTitle}>
                      ماده اولیه
                    </Text>

                    <Pressable
                      onPress={() =>
                        removeItem(item.localId)
                      }
                      hitSlop={8}
                      style={styles.deleteButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#737373"
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.label}>
                    ماده اولیه
                    <Text style={styles.required}>
                      {" "}
                      *
                    </Text>
                  </Text>

                  <Pressable
                    onPress={() =>
                      setIngredientPickerIndex(
                        ingredientPickerIndex === index
                          ? null
                          : index,
                      )
                    }
                    style={styles.select}
                  >
                    <Ionicons
                      name={
                        ingredientPickerIndex === index
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={18}
                      color="#737373"
                    />

                    <Text
                      style={[
                        styles.selectText,
                        !item.ingredientName &&
                          styles.placeholder,
                      ]}
                      numberOfLines={1}
                    >
                      {item.ingredientName ||
                        "انتخاب ماده اولیه"}
                    </Text>
                  </Pressable>

                  {ingredientPickerIndex === index && (
                    <View
                      style={styles.optionsContainer}
                    >
                      {ingredients
                        .filter(
                          (ingredient) =>
                            !items.some(
                              (existingItem) =>
                                existingItem.ingredient ===
                                  ingredient.id &&
                                existingItem.localId !==
                                  item.localId,
                            ),
                        )
                        .map((ingredient) => (
                          <Pressable
                            key={ingredient.id}
                            onPress={() =>
                              handleIngredientSelect(
                                ingredient,
                              )
                            }
                            style={styles.option}
                          >
                            <Text
                              style={styles.unitOption}
                            >
                              {ingredient.base_unit}
                            </Text>

                            <Text
                              style={styles.optionText}
                              numberOfLines={1}
                            >
                              {ingredient.name}
                            </Text>
                          </Pressable>
                        ))}

                      {ingredients.length === 0 && (
                        <Text
                          style={styles.noOptionText}
                        >
                          ماده اولیه‌ای پیدا نشد.
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.quantityRow}>
                    <View style={styles.quantityField}>
                      <Text style={styles.label}>
                        مقدار
                        <Text
                          style={styles.required}
                        >
                          {" "}
                          *
                        </Text>
                      </Text>

                      <TextInput
                        value={item.quantity}
                        onChangeText={(value) =>
                          updateItem(item.localId, {
                            quantity: value,
                          })
                        }
                        placeholder="مثلاً 2.5"
                        placeholderTextColor="#a3a3a3"
                        keyboardType="decimal-pad"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.unitField}>
                      <Text style={styles.label}>
                        واحد
                      </Text>

                      <View
                        style={[
                          styles.readonlyInput,
                          !item.unit &&
                            styles.readonlyEmpty,
                        ]}
                      >
                        <Text
                          style={[
                            styles.readonlyText,
                            !item.unit &&
                              styles.placeholder,
                          ]}
                        >
                          {item.unit ||
                            "پس از انتخاب ماده"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Pressable
            onPress={addItem}
            style={({ pressed }) => [
              styles.addItemButton,
              pressed && styles.addItemButtonPressed,
            ]}
          >
            <Ionicons
              name="add"
              size={19}
              color="#404040"
            />

            <Text style={styles.addItemText}>
              افزودن ماده اولیه
            </Text>
          </Pressable>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#525252"
            />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>
              خلاصه رسپی
            </Text>

            <Text style={styles.summaryDescription}>
              {selectedProduct
                ? `این رسپی برای «${selectedProduct.name}» با ${items.length} ماده اولیه ثبت خواهد شد.`
                : "ابتدا محصول و مواد اولیه را انتخاب کنید."}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.back()}
            disabled={submitting}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>
              انصراف
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitButton,
              pressed &&
                !submitting &&
                styles.submitButtonPressed,
              submitting && styles.submitButtonDisabled,
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
                  name="checkmark"
                  size={19}
                  color="#ffffff"
                />

                <Text style={styles.submitText}>
                  ثبت رسپی
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
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

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    alignItems: "flex-end",
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

  errorBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#fef2f2",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: "#b91c1c",
    textAlign: "right",
  },

  section: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 17,
    backgroundColor: "#ffffff",
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  sectionDescription: {
    marginTop: 4,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  field: {
    marginBottom: 16,
  },

  row: {
    flexDirection: "row-reverse",
    gap: 10,
  },

  halfField: {
    flex: 1,
  },

  label: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: "500",
    color: "#525252",
    textAlign: "right",
  },

  required: {
    color: "#dc2626",
  },

  input: {
    height: 46,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#171717",
    fontSize: 12,
    textAlign: "right",
  },

  select: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  selectText: {
    flex: 1,
    fontSize: 12,
    color: "#262626",
    textAlign: "right",
  },

  placeholder: {
    color: "#a3a3a3",
  },

  optionsContainer: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  option: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },

  optionText: {
    flex: 1,
    fontSize: 12,
    color: "#404040",
    textAlign: "right",
  },

  selectedOptionText: {
    fontWeight: "600",
    color: "#171717",
  },

  unitOption: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    fontSize: 9,
    color: "#737373",
  },

  noOptionText: {
    padding: 14,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "center",
  },

  activeRow: {
    marginTop: 2,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  activeTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  activeTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  activeDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: "#a3a3a3",
    textAlign: "right",
  },

  countBadge: {
    minWidth: 27,
    height: 27,
    paddingHorizontal: 7,
    borderRadius: 9,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
  },

  emptyItems: {
    paddingVertical: 25,
    alignItems: "center",
  },

  emptyItemsIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  emptyItemsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
  },

  emptyItemsDescription: {
    maxWidth: 250,
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: "#a3a3a3",
    textAlign: "center",
  },

  itemsList: {
    gap: 10,
  },

  itemCard: {
    padding: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#fafafa",
  },

  itemHeader: {
    marginBottom: 13,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  itemNumber: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },

  itemNumberText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#525252",
  },

  itemTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
    textAlign: "right",
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityRow: {
    marginTop: 12,
    flexDirection: "row-reverse",
    gap: 10,
  },

  quantityField: {
    flex: 1,
  },

  unitField: {
    flex: 1,
  },

  readonlyInput: {
    height: 46,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "flex-end",
  },

  readonlyEmpty: {
    backgroundColor: "#fafafa",
  },

  readonlyText: {
    fontSize: 12,
    color: "#525252",
  },

  addItemButton: {
    height: 45,
    marginTop: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d4d4d4",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  addItemButtonPressed: {
    backgroundColor: "#f5f5f5",
  },

  addItemText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#525252",
  },

  summary: {
    marginBottom: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryText: {
    flex: 1,
    alignItems: "flex-end",
  },

  summaryTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
  },

  summaryDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: "#737373",
    textAlign: "right",
  },

  actions: {
    flexDirection: "row-reverse",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#525252",
  },

  submitButton: {
    flex: 2,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  submitButtonPressed: {
    opacity: 0.8,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
});