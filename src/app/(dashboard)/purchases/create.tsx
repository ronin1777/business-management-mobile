import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { createPurchase } from "@/services/api/purchases";
import { getSuppliers } from "@/services/api/suppliers";
import { getIngredients } from "@/services/api/ingredients";

import type {
  CreatePurchasePayload,
  PurchaseAdditionalCostInput,
  PurchaseCreateItem,
} from "@/types/purchases";

import type { Supplier } from "@/types/suppliers";
import type { Ingredient } from "@/types/ingredients";

type PurchaseItemForm = {
  localId: string;
  ingredient: number | null;
  ingredientName: string;
  quantity: string;
  unit: string;
  totalPrice: string;
  discount: string;
};

type AdditionalCostForm = {
  localId: string;
  costType: string;
  amount: string;
  note: string;
};

const createLocalId = () =>
  `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

const createEmptyItem = (): PurchaseItemForm => ({
  localId: createLocalId(),
  ingredient: null,
  ingredientName: "",
  quantity: "",
  unit: "",
  totalPrice: "",
  discount: "0",
});

const createEmptyAdditionalCost =
  (): AdditionalCostForm => ({
    localId: createLocalId(),
    costType: "",
    amount: "",
    note: "",
  });

function parseNumber(value: string) {
  const normalized = value
    .replace(/,/g, "")
    .replace(/[۰-۹]/g, (char) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(char)),
    )
    .trim();

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    value,
  );
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CreatePurchaseScreen() {
  const router = useRouter();

  const [supplierId, setSupplierId] =
    useState<number | null>(null);

  const [supplierName, setSupplierName] =
    useState("");

  const [purchasedAt, setPurchasedAt] =
    useState(getToday());

  const [note, setNote] = useState("");

  const [items, setItems] =
    useState<PurchaseItemForm[]>([
      createEmptyItem(),
    ]);

  const [additionalCosts, setAdditionalCosts] =
    useState<AdditionalCostForm[]>([]);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [showSuppliers, setShowSuppliers] =
    useState(false);

  const [openIngredientId, setOpenIngredientId] =
    useState<string | null>(null);

  const [showCostTypeId, setShowCostTypeId] =
    useState<string | null>(null);

  const loadOptions = useCallback(
    async () => {
      try {
        setLoadingOptions(true);
        setError(null);

        const [
          suppliersResponse,
          ingredientsResponse,
        ] = await Promise.all([
          getSuppliers({
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

        setSuppliers(
          suppliersResponse.data?.results ?? [],
        );

        setIngredients(
          ingredientsResponse.data?.results ?? [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "دریافت اطلاعات اولیه ناموفق بود.",
        );
      } finally {
        setLoadingOptions(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  /*
   * قیمت واحد:
   *
   * قیمت کل ÷ مقدار
   *
   * این مقدار توسط کاربر وارد نمی‌شود.
   */
  const calculateUnitPrice = (
    item: PurchaseItemForm,
  ) => {
    const quantity = parseNumber(
      item.quantity,
    );

    const totalPrice = parseNumber(
      item.totalPrice,
    );

    if (
      quantity <= 0 ||
      totalPrice < 0
    ) {
      return 0;
    }

    return Number(
      (totalPrice / quantity).toFixed(2),
    );
  };

  /*
   * مبلغ نهایی هر قلم:
   *
   * قیمت کل - تخفیف
   */
  const calculateLineTotal = (
    item: PurchaseItemForm,
  ) => {
    const totalPrice = parseNumber(
      item.totalPrice,
    );

    const discount = parseNumber(
      item.discount,
    );

    return Math.max(
      totalPrice - discount,
      0,
    );
  };

  const itemsTotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + calculateLineTotal(item),
      0,
    );
  }, [items]);

  const additionalCostsTotal =
    useMemo(() => {
      return additionalCosts.reduce(
        (total, cost) =>
          total +
          parseNumber(cost.amount),
        0,
      );
    }, [additionalCosts]);

  const grandTotal =
    itemsTotal + additionalCostsTotal;

  const updateItem = (
    localId: string,
    field: keyof PurchaseItemForm,
    value: string | number | null,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.localId === localId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const removeItem = (localId: string) => {
    setItems((current) => {
      if (current.length === 1) {
        return [createEmptyItem()];
      }

      return current.filter(
        (item) =>
          item.localId !== localId,
      );
    });

    if (openIngredientId === localId) {
      setOpenIngredientId(null);
    }
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      createEmptyItem(),
    ]);
  };

  const updateAdditionalCost = (
    localId: string,
    field: keyof AdditionalCostForm,
    value: string,
  ) => {
    setAdditionalCosts((current) =>
      current.map((cost) =>
        cost.localId === localId
          ? {
              ...cost,
              [field]: value,
            }
          : cost,
      ),
    );
  };

  const removeAdditionalCost = (
    localId: string,
  ) => {
    setAdditionalCosts((current) =>
      current.filter(
        (cost) =>
          cost.localId !== localId,
      ),
    );

    if (showCostTypeId === localId) {
      setShowCostTypeId(null);
    }
  };

  const addAdditionalCost = () => {
    setAdditionalCosts((current) => [
      ...current,
      createEmptyAdditionalCost(),
    ]);
  };

  const selectIngredient = (
    localId: string,
    ingredient: Ingredient,
  ) => {
    /*
     * با انتخاب ماده اولیه:
     *
     * 1. ingredient ذخیره می‌شود.
     * 2. نام ماده ذخیره می‌شود.
     * 3. واحد دقیقاً از base_unit می‌آید.
     *
     * unit هیچ‌وقت توسط کاربر تغییر نمی‌کند.
     */
    setItems((current) =>
      current.map((item) =>
        item.localId === localId
          ? {
              ...item,
              ingredient: ingredient.id,
              ingredientName:
                ingredient.name,
              unit:
                ingredient.base_unit ?? "",
            }
          : item,
      ),
    );

    setOpenIngredientId(null);
  };

  const validate = () => {
    if (!purchasedAt.trim()) {
      return "تاریخ خرید را وارد کنید.";
    }

    if (items.length === 0) {
      return "حداقل یک قلم برای خرید وارد کنید.";
    }

    const selectedIngredientIds =
      items
        .map((item) => item.ingredient)
        .filter(
          (id): id is number =>
            id !== null,
        );

    /*
     * یک ماده اولیه نمی‌تواند در
     * چند ردیف تکرار شود.
     */
    if (
      new Set(selectedIngredientIds).size !==
      selectedIngredientIds.length
    ) {
      return "یک ماده اولیه نمی‌تواند در چند ردیف تکرار شود.";
    }

    for (
      let index = 0;
      index < items.length;
      index += 1
    ) {
      const item = items[index];

      if (!item.ingredient) {
        return `ماده اولیه قلم ${
          index + 1
        } را انتخاب کنید.`;
      }

      if (
        parseNumber(item.quantity) <= 0
      ) {
        return `مقدار قلم ${
          index + 1
        } باید بیشتر از صفر باشد.`;
      }

      /*
       * واحد باید از base_unit آمده باشد.
       */
      if (!item.unit.trim()) {
        return `واحد قلم ${
          index + 1
        } مشخص نشده است.`;
      }

      if (
        parseNumber(item.totalPrice) < 0
      ) {
        return `قیمت کل قلم ${
          index + 1
        } معتبر نیست.`;
      }

      if (
        parseNumber(item.discount) < 0
      ) {
        return `تخفیف قلم ${
          index + 1
        } معتبر نیست.`;
      }

      const totalPrice = parseNumber(
        item.totalPrice,
      );

      const discount = parseNumber(
        item.discount,
      );

      const subtotal = totalPrice;

      if (discount > subtotal) {
        return `تخفیف قلم ${
          index + 1
        } نمی‌تواند بیشتر از مبلغ قلم باشد.`;
      }
    }

    for (
      let index = 0;
      index < additionalCosts.length;
      index += 1
    ) {
      const cost =
        additionalCosts[index];

      if (!cost.costType.trim()) {
        return `نوع هزینه اضافی ${
          index + 1
        } را انتخاب کنید.`;
      }

      if (
        parseNumber(cost.amount) <= 0
      ) {
        return `مبلغ هزینه اضافی ${
          index + 1
        } باید بیشتر از صفر باشد.`;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const purchaseItems: PurchaseCreateItem[] =
        items.map((item) => ({
          ingredient:
            item.ingredient as number,

          quantity:
            parseNumber(item.quantity),

          /*
           * واحد از base_unit ماده اولیه آمده
           * و قابل تغییر توسط کاربر نیست.
           */
          unit:
            item.unit.trim(),

          /*
           * قیمت واحد خودکار محاسبه می‌شود.
           */
          unit_price:
            calculateUnitPrice(item),

          discount:
            parseNumber(item.discount),
        }));

      const costs: PurchaseAdditionalCostInput[] =
        additionalCosts.map((cost) => ({
          cost_type:
            cost.costType.trim(),

          amount:
            parseNumber(cost.amount),

          note:
            cost.note.trim(),
        }));

      const payload: CreatePurchasePayload = {
        supplier: supplierId,

        purchased_at:
          purchasedAt.trim(),

        items: purchaseItems,

        additional_costs:
          costs.length > 0
            ? costs
            : undefined,

        note:
          note.trim() || undefined,
      };

      await createPurchase(payload);

      Alert.alert(
        "خرید ثبت شد",
        "خرید با موفقیت ثبت شد.",
        [
          {
            text: "باشه",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ثبت خرید ناموفق بود.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderIngredientSelector = (
    item: PurchaseItemForm,
    index: number,
  ) => {
    const isOpen =
      openIngredientId ===
      item.localId;

    return (
      <View
        style={[
          styles.selectorWrapper,
          isOpen &&
            styles.selectorWrapperOpen,
        ]}
      >
        <Pressable
          onPress={() =>
            setOpenIngredientId(
              isOpen
                ? null
                : item.localId,
            )
          }
          style={styles.selector}
        >
          <Ionicons
            name={
              isOpen
                ? "chevron-up"
                : "chevron-down"
            }
            size={18}
            color="#6B7280"
          />

          <Text
            style={[
              styles.selectorText,
              !item.ingredient &&
                styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {item.ingredientName ||
              `انتخاب ماده اولیه ${
                index + 1
              }`}
          </Text>
        </Pressable>

        {isOpen ? (
          <View
            style={styles.optionsContainer}
          >
            {ingredients.length === 0 ? (
              <Text
                style={styles.noOptionText}
              >
                ماده اولیه‌ای یافت نشد.
              </Text>
            ) : (
              ingredients.map(
                (ingredient) => {
                  const alreadySelected =
                    items.some(
                      (currentItem) =>
                        currentItem.localId !==
                          item.localId &&
                        currentItem.ingredient ===
                          ingredient.id,
                    );

                  return (
                    <Pressable
                      key={ingredient.id}
                      disabled={
                        alreadySelected
                      }
                      onPress={() =>
                        selectIngredient(
                          item.localId,
                          ingredient,
                        )
                      }
                      style={({ pressed }) => [
                        styles.option,
                        pressed &&
                          styles.optionPressed,
                        alreadySelected &&
                          styles.optionDisabled,
                      ]}
                    >
                      <View
                        style={
                          styles.optionContent
                        }
                      >
                        <View
                          style={
                            styles.optionTitleRow
                          }
                        >
                          <Text
                            style={[
                              styles.optionText,
                              alreadySelected &&
                                styles.disabledText,
                            ]}
                          >
                            {
                              ingredient.name
                            }
                          </Text>

                          {alreadySelected ? (
                            <Text
                              style={
                                styles.alreadySelectedText
                              }
                            >
                              انتخاب شده
                            </Text>
                          ) : null}
                        </View>

                        {ingredient.base_unit ? (
                          <Text
                            style={
                              styles.optionMeta
                            }
                          >
                            واحد پایه:{" "}
                            {
                              ingredient.base_unit
                            }
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                },
              )
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const costTypes = [
    "حمل و نقل",
    "بسته‌بندی",
    "مالیات",
    "کارمزد",
    "سایر",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.headerButton}
        >
          <Ionicons
            name="arrow-forward"
            size={22}
            color="#111827"
          />
        </Pressable>

        <View
          style={
            styles.headerTitleContainer
          }
        >
          <Text style={styles.title}>
            خرید جدید
          </Text>

          <Text style={styles.subtitle}>
            ثبت خرید مواد اولیه
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {loadingOptions ? (
        <View style={styles.loadingOptions}>
          <ActivityIndicator
            size="small"
            color="#374151"
          />

          <Text style={styles.loadingText}>
            در حال دریافت اطلاعات...
          </Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#B91C1C"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* اطلاعات خرید */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            اطلاعات خرید
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              تأمین‌کننده
            </Text>

            <View
              style={
                styles.selectorWrapper
              }
            >
              <Pressable
                onPress={() =>
                  setShowSuppliers(
                    (current) => !current,
                  )
                }
                style={styles.selector}
              >
                <Ionicons
                  name={
                    showSuppliers
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={18}
                  color="#6B7280"
                />

                <Text
                  style={[
                    styles.selectorText,
                    !supplierId &&
                      styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {supplierName ||
                    "بدون تأمین‌کننده"}
                </Text>
              </Pressable>

              {showSuppliers ? (
                <View
                  style={
                    styles.optionsContainer
                  }
                >
                  <Pressable
                    onPress={() => {
                      setSupplierId(null);
                      setSupplierName("");
                      setShowSuppliers(false);
                    }}
                    style={styles.option}
                  >
                    <Text
                      style={
                        styles.optionText
                      }
                    >
                      بدون تأمین‌کننده
                    </Text>
                  </Pressable>

                  {suppliers.map(
                    (supplier) => (
                      <Pressable
                        key={supplier.id}
                        onPress={() => {
                          setSupplierId(
                            supplier.id,
                          );

                          setSupplierName(
                            supplier.name,
                          );

                          setShowSuppliers(
                            false,
                          );
                        }}
                        style={styles.option}
                      >
                        <Text
                          style={
                            styles.optionText
                          }
                        >
                          {supplier.name}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              تاریخ خرید
            </Text>

            <TextInput
              value={purchasedAt}
              onChangeText={setPurchasedAt}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              textAlign="right"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              توضیحات
            </Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="توضیحات خرید..."
              placeholderTextColor="#9CA3AF"
              style={[
                styles.input,
                styles.textArea,
              ]}
              textAlign="right"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* اقلام خرید */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                اقلام خرید
              </Text>

              <Text style={styles.sectionHint}>
                قیمت واحد به صورت خودکار محاسبه می‌شود.
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text
                style={
                  styles.countBadgeText
                }
              >
                {items.length}
              </Text>
            </View>
          </View>

          {items.map(
            (item, index) => {
              const unitPrice =
                calculateUnitPrice(item);

              const lineTotal =
                calculateLineTotal(item);

              return (
                <View
                  key={item.localId}
                  style={styles.itemCard}
                >
                  <View
                    style={
                      styles.itemCardHeader
                    }
                  >
                    <Text
                      style={
                        styles.itemNumber
                      }
                    >
                      قلم {index + 1}
                    </Text>

                    <Pressable
                      onPress={() =>
                        removeItem(
                          item.localId,
                        )
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#6B7280"
                      />
                    </Pressable>
                  </View>

                  {/* ماده اولیه */}

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      ماده اولیه
                    </Text>

                    {renderIngredientSelector(
                      item,
                      index,
                    )}
                  </View>

                  {/* مقدار + واحد */}

                  <View style={styles.row}>
                    <View
                      style={[
                        styles.field,
                        styles.halfField,
                      ]}
                    >
                      <Text
                        style={styles.label}
                      >
                        مقدار
                      </Text>

                      <TextInput
                        value={item.quantity}
                        onChangeText={(
                          value,
                        ) =>
                          updateItem(
                            item.localId,
                            "quantity",
                            value,
                          )
                        }
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        keyboardType="decimal-pad"
                        textAlign="right"
                      />
                    </View>

                    {/* UNIT READ ONLY */}

                    <View
                      style={[
                        styles.field,
                        styles.halfField,
                      ]}
                    >
                      <Text
                        style={styles.label}
                      >
                        واحد
                      </Text>

                      <View
                        style={
                          styles.readOnlyInput
                        }
                      >
                        <Text
                          style={[
                            styles.readOnlyText,
                            !item.unit &&
                              styles.placeholderText,
                          ]}
                          numberOfLines={1}
                        >
                          {item.unit ||
                            "پس از انتخاب ماده اولیه"}
                        </Text>

                        <Ionicons
                          name="lock-closed-outline"
                          size={15}
                          color="#9CA3AF"
                        />
                      </View>
                    </View>
                  </View>

                  {/* قیمت کل + تخفیف */}

                  <View style={styles.row}>
                    <View
                      style={[
                        styles.field,
                        styles.halfField,
                      ]}
                    >
                      <Text
                        style={styles.label}
                      >
                        قیمت کل
                      </Text>

                      <TextInput
                        value={
                          item.totalPrice
                        }
                        onChangeText={(
                          value,
                        ) =>
                          updateItem(
                            item.localId,
                            "totalPrice",
                            value,
                          )
                        }
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        keyboardType="decimal-pad"
                        textAlign="right"
                      />

                      <Text
                        style={
                          styles.fieldHint
                        }
                      >
                        تومان
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.field,
                        styles.halfField,
                      ]}
                    >
                      <Text
                        style={styles.label}
                      >
                        تخفیف
                      </Text>

                      <TextInput
                        value={item.discount}
                        onChangeText={(
                          value,
                        ) =>
                          updateItem(
                            item.localId,
                            "discount",
                            value,
                          )
                        }
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        keyboardType="decimal-pad"
                        textAlign="right"
                      />

                      <Text
                        style={
                          styles.fieldHint
                        }
                      >
                        تومان
                      </Text>
                    </View>
                  </View>

                  {/* قیمت واحد - READ ONLY */}

                  <View
                    style={
                      styles.calculatedPriceCard
                    }
                  >
                    <View
                      style={
                        styles.calculatedHeader
                      }
                    >
                      <View
                        style={
                          styles.calculatedIcon
                        }
                      >
                        <Ionicons
                          name="calculator-outline"
                          size={17}
                          color="#4B5563"
                        />
                      </View>

                      <View
                        style={
                          styles.calculatedTitleContainer
                        }
                      >
                        <Text
                          style={
                            styles.calculatedTitle
                          }
                        >
                          قیمت واحد
                        </Text>

                        <Text
                          style={
                            styles.calculatedHint
                          }
                        >
                          محاسبه خودکار
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.calculatedValueContainer
                      }
                    >
                      <Text
                        style={
                          styles.calculatedValue
                        }
                      >
                        {unitPrice > 0
                          ? formatDecimal(
                              unitPrice,
                            )
                          : "—"}
                      </Text>

                      <Text
                        style={
                          styles.calculatedCurrency
                        }
                      >
                        تومان /{" "}
                        {item.unit ||
                          "واحد"}
                      </Text>
                    </View>
                  </View>

                  {/* مبلغ نهایی قلم */}

                  <View
                    style={styles.itemTotal}
                  >
                    <Text
                      style={
                        styles.itemTotalLabel
                      }
                    >
                      مبلغ این قلم
                    </Text>

                    <Text
                      style={
                        styles.itemTotalValue
                      }
                    >
                      {formatNumber(
                        lineTotal,
                      )}{" "}
                      تومان
                    </Text>
                  </View>
                </View>
              );
            },
          )}

          <Pressable
            onPress={addItem}
            style={({ pressed }) => [
              styles.outlineButton,
              pressed &&
                styles.outlineButtonPressed,
            ]}
          >
            <Ionicons
              name="add"
              size={19}
              color="#374151"
            />

            <Text
              style={
                styles.outlineButtonText
              }
            >
              افزودن قلم
            </Text>
          </Pressable>
        </View>

        {/* هزینه های اضافی */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              هزینه‌های اضافی
            </Text>

            <Text style={styles.optionalText}>
              اختیاری
            </Text>
          </View>

          {additionalCosts.map(
            (cost, index) => {
              const isOpen =
                showCostTypeId ===
                cost.localId;

              return (
                <View
                  key={cost.localId}
                  style={styles.costCard}
                >
                  <View
                    style={
                      styles.itemCardHeader
                    }
                  >
                    <Text
                      style={
                        styles.itemNumber
                      }
                    >
                      هزینه {index + 1}
                    </Text>

                    <Pressable
                      onPress={() =>
                        removeAdditionalCost(
                          cost.localId,
                        )
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#6B7280"
                      />
                    </Pressable>
                  </View>

                  <View style={styles.field}>
                    <Text
                      style={styles.label}
                    >
                      نوع هزینه
                    </Text>

                    <View
                      style={
                        styles.selectorWrapper
                      }
                    >
                      <Pressable
                        onPress={() =>
                          setShowCostTypeId(
                            isOpen
                              ? null
                              : cost.localId,
                          )
                        }
                        style={styles.selector}
                      >
                        <Ionicons
                          name={
                            isOpen
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={18}
                          color="#6B7280"
                        />

                        <Text
                          style={[
                            styles.selectorText,
                            !cost.costType &&
                              styles.placeholderText,
                          ]}
                        >
                          {cost.costType ||
                            "انتخاب نوع هزینه"}
                        </Text>
                      </Pressable>

                      {isOpen ? (
                        <View
                          style={
                            styles.optionsContainer
                          }
                        >
                          {costTypes.map(
                            (type) => (
                              <Pressable
                                key={type}
                                onPress={() => {
                                  updateAdditionalCost(
                                    cost.localId,
                                    "costType",
                                    type,
                                  );

                                  setShowCostTypeId(
                                    null,
                                  );
                                }}
                                style={
                                  styles.option
                                }
                              >
                                <Text
                                  style={
                                    styles.optionText
                                  }
                                >
                                  {type}
                                </Text>
                              </Pressable>
                            ),
                          )}
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text
                      style={styles.label}
                    >
                      مبلغ
                    </Text>

                    <TextInput
                      value={cost.amount}
                      onChangeText={(value) =>
                        updateAdditionalCost(
                          cost.localId,
                          "amount",
                          value,
                        )
                      }
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      style={styles.input}
                      keyboardType="decimal-pad"
                      textAlign="right"
                    />

                    <Text
                      style={
                        styles.fieldHint
                      }
                    >
                      تومان
                    </Text>
                  </View>

                  <View style={styles.field}>
                    <Text
                      style={styles.label}
                    >
                      توضیحات هزینه
                    </Text>

                    <TextInput
                      value={cost.note}
                      onChangeText={(value) =>
                        updateAdditionalCost(
                          cost.localId,
                          "note",
                          value,
                        )
                      }
                      placeholder="توضیح اختیاری..."
                      placeholderTextColor="#9CA3AF"
                      style={styles.input}
                      textAlign="right"
                    />
                  </View>
                </View>
              );
            },
          )}

          <Pressable
            onPress={addAdditionalCost}
            style={({ pressed }) => [
              styles.outlineButton,
              pressed &&
                styles.outlineButtonPressed,
            ]}
          >
            <Ionicons
              name="add"
              size={19}
              color="#374151"
            />

            <Text
              style={
                styles.outlineButtonText
              }
            >
              افزودن هزینه
            </Text>
          </Pressable>
        </View>

        {/* خلاصه */}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            خلاصه خرید
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              جمع اقلام
            </Text>

            <Text style={styles.summaryValue}>
              {formatNumber(
                itemsTotal,
              )}{" "}
              تومان
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              هزینه‌های اضافی
            </Text>

            <Text style={styles.summaryValue}>
              {formatNumber(
                additionalCostsTotal,
              )}{" "}
              تومان
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text
              style={styles.grandTotalLabel}
            >
              مبلغ نهایی
            </Text>

            <Text
              style={styles.grandTotalValue}
            >
              {formatNumber(
                grandTotal,
              )}{" "}
              تومان
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={saving || loadingOptions}
          style={({ pressed }) => [
            styles.submitButton,
            (pressed ||
              saving ||
              loadingOptions) &&
              styles.submitButtonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="checkmark"
              size={21}
              color="#FFFFFF"
            />
          )}

          <Text
            style={styles.submitButtonText}
          >
            {saving
              ? "در حال ثبت..."
              : "ثبت خرید"}
          </Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: "#F9FAFB",
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: "flex-end",
  },

  headerSpacer: {
    width: 42,
  },

  title: {
    fontSize: 23,
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

  loadingOptions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 8,
  },

  loadingText: {
    fontSize: 12,
    color: "#6B7280",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
  },

  errorBox: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#B91C1C",
    textAlign: "right",
  },

  section: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },

  sectionHint: {
    marginTop: 4,
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  optionalText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  field: {
    marginBottom: 14,
  },

  label: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "right",
  },

  fieldHint: {
    marginTop: 4,
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "right",
  },

  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#111827",
  },

  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },

  /*
   * Unit input is deliberately read-only.
   */
  readOnlyInput: {
    minHeight: 46,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 11,
    backgroundColor: "#F3F4F6",
  },

  readOnlyText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#374151",
    textAlign: "right",
  },

  selectorWrapper: {
    position: "relative",
    zIndex: 10,
  },

  selectorWrapperOpen: {
    zIndex: 100,
  },

  selector: {
    minHeight: 46,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },

  selectorText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#111827",
    textAlign: "right",
  },

  placeholderText: {
    color: "#9CA3AF",
  },

  optionsContainer: {
    marginTop: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },

  option: {
    minHeight: 43,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  optionPressed: {
    backgroundColor: "#F9FAFB",
  },

  optionDisabled: {
    opacity: 0.45,
  },

  optionContent: {
    width: "100%",
    alignItems: "flex-end",
  },

  optionTitleRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionText: {
    fontSize: 13,
    color: "#374151",
    textAlign: "right",
  },

  disabledText: {
    color: "#9CA3AF",
  },

  alreadySelectedText: {
    fontSize: 10,
    color: "#9CA3AF",
  },

  optionMeta: {
    marginTop: 3,
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
  },

  noOptionText: {
    padding: 14,
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "right",
  },

  row: {
    flexDirection: "row-reverse",
    gap: 10,
  },

  halfField: {
    flex: 1,
  },

  itemCard: {
    marginBottom: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 13,
    backgroundColor: "#F9FAFB",
  },

  costCard: {
    marginBottom: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 13,
    backgroundColor: "#F9FAFB",
  },

  itemCardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  itemNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  /*
   * Auto calculated unit price.
   */
  calculatedPriceCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 11,
    backgroundColor: "#F3F4F6",
  },

  calculatedHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },

  calculatedIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
    borderRadius: 9,
    backgroundColor: "#E5E7EB",
  },

  calculatedTitleContainer: {
    alignItems: "flex-end",
  },

  calculatedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textAlign: "right",
  },

  calculatedHint: {
    marginTop: 2,
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "right",
  },

  calculatedValueContainer: {
    alignItems: "flex-start",
    marginLeft: 5,
  },

  calculatedValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    textAlign: "left",
  },

  calculatedCurrency: {
    marginTop: 2,
    fontSize: 9,
    color: "#9CA3AF",
    textAlign: "left",
  },

  itemTotal: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 1,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  itemTotalLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  itemTotalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  outlineButton: {
    minHeight: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },

  outlineButtonPressed: {
    backgroundColor: "#F9FAFB",
  },

  outlineButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  summaryCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  summaryTitle: {
    marginBottom: 14,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },

  summaryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "left",
  },

  summaryDivider: {
    height: 1,
    marginVertical: 4,
    backgroundColor: "#F3F4F6",
  },

  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  grandTotalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  submitButton: {
    minHeight: 50,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 13,
    backgroundColor: "#111827",
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  bottomSpace: {
    height: 20,
  },
});