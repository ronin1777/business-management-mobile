
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { getCustomers } from "@/services/api/customers";
import { getProducts } from "@/services/api/products";
import { createOrder } from "@/services/api/orders";

import type { Customer } from "@/types/customers";
import type { Product } from "@/types/products";

type OrderItem = {
  product: Product;
  quantity: number;
};

export default function CreateOrderScreen() {
  const router = useRouter();

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [items, setItems] =
    useState<OrderItem[]>([]);

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [productSearch, setProductSearch] =
    useState("");

  const [note, setNote] =
    useState("");

  const [loadingCustomers, setLoadingCustomers] =
    useState(true);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [customerSelectorVisible, setCustomerSelectorVisible] =
    useState(false);

  const [productSelectorVisible, setProductSelectorVisible] =
    useState(false);

  const loadCustomers = useCallback(
    async (searchValue = "") => {
      try {
        setLoadingCustomers(true);

        const response =
          await getCustomers({
            page: 1,
            pageSize: 50,
            search:
              searchValue.trim() ||
              undefined,
            ordering: "name",
          });

        setCustomers(
          response.data.results,
        );
      } catch {
        setError(
          "دریافت مشتری‌ها ناموفق بود.",
        );
      } finally {
        setLoadingCustomers(false);
      }
    },
    [],
  );

  const loadProducts = useCallback(
    async (searchValue = "") => {
      try {
        setLoadingProducts(true);

        const response =
          await getProducts({
            page: 1,
            pageSize: 50,
            search:
              searchValue.trim() ||
              undefined,
            ordering: "name",
            orderedAt:
              new Date().toISOString(),
          });

        console.log(
          "PRODUCTS:",
          JSON.stringify(
            response.data.results,
            null,
            2,
          ),
        );

        const activeProducts =
          response.data.results.filter(
            (product) =>
              product.is_active,
          );

        setProducts(
          activeProducts,
        );

        const validProductIds =
          new Set(
            activeProducts
              .filter(
                (product) =>
                  product.has_valid_recipe !==
                  false,
              )
              .map(
                (product) =>
                  product.id,
              ),
          );

        setItems((current) =>
          current.filter((item) =>
            validProductIds.has(
              item.product.id,
            ),
          ),
        );
      } catch {
        setError(
          "دریافت محصولات ناموفق بود.",
        );
      } finally {
        setLoadingProducts(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, [
    loadCustomers,
    loadProducts,
  ]);

  const totalAmount = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        item.product.selling_price *
          item.quantity,
      0,
    );
  }, [items]);

  const addProduct = (
    product: Product,
  ) => {
    if (
      product.has_valid_recipe ===
      false
    ) {
      return;
    }

    setItems((current) => {
      const existing =
        current.find(
          (item) =>
            item.product.id ===
            product.id,
        );

      if (existing) {
        return current.map(
          (item) =>
            item.product.id ===
            product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item,
        );
      }

      return [
        ...current,
        {
          product,
          quantity: 1,
        },
      ];
    });

    setProductSelectorVisible(false);
    setProductSearch("");
  };

  const increaseQuantity = (
    productId: number,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.product.id ===
        productId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (
    productId: number,
  ) => {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id ===
          productId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item,
        )
        .filter(
          (item) =>
            item.quantity > 0,
        ),
    );
  };

  const removeItem = (
    productId: number,
  ) => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.product.id !==
          productId,
      ),
    );
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError(
        "حداقل یک محصول به سفارش اضافه کنید.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await createOrder({
        customer:
          selectedCustomer?.id ??
          null,
        ordered_at:
          new Date().toISOString(),
        items: items.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),
        note:
          note.trim() ||
          undefined,
      });

      router.replace(
        "/(dashboard)/orders",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ثبت سفارش ناموفق بود.",
      );
    } finally {
      setSaving(false);
    }
  };

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
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="chevron-forward"
              size={21}
              color="#404040"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              سفارش جدید
            </Text>

            <Text
              style={styles.subtitle}
            >
              ثبت سفارش فروش
            </Text>
          </View>
        </View>

        {error && (
          <View
            style={styles.errorBox}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#dc2626"
            />

            <Text
              style={styles.errorText}
            >
              {error}
            </Text>

            <Pressable
              onPress={() =>
                setError(null)
              }
            >
              <Ionicons
                name="close"
                size={18}
                color="#dc2626"
              />
            </Pressable>
          </View>
        )}

        {/* Customer */}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            مشتری
          </Text>

          <Pressable
            style={styles.selector}
            onPress={() =>
              setCustomerSelectorVisible(
                true,
              )
            }
          >
            <View
              style={styles.selectorIcon}
            >
              <Ionicons
                name="person-outline"
                size={19}
                color="#525252"
              />
            </View>

            <View
              style={styles.selectorContent}
            >
              <Text
                style={
                  selectedCustomer
                    ? styles.selectorValue
                    : styles.selectorPlaceholder
                }
              >
                {selectedCustomer?.name ??
                  "انتخاب مشتری"}
              </Text>

              {selectedCustomer && (
                <Text
                  style={
                    styles.selectorDescription
                  }
                >
                  {selectedCustomer.phone ||
                    "بدون شماره تماس"}
                </Text>
              )}
            </View>

            <Ionicons
              name="chevron-back"
              size={18}
              color="#a3a3a3"
            />
          </Pressable>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              محصولات سفارش
            </Text>

            <Text
              style={styles.itemCount}
            >
              {new Intl.NumberFormat(
                "fa-IR",
              ).format(items.length)}{" "}
              محصول
            </Text>
          </View>

          {items.length === 0 ? (
            <View
              style={styles.emptyProducts}
            >
              <Ionicons
                name="cart-outline"
                size={27}
                color="#737373"
              />

              <Text
                style={
                  styles.emptyProductsTitle
                }
              >
                هنوز محصولی اضافه نشده
              </Text>

              <Text
                style={
                  styles.emptyProductsText
                }
              >
                محصولات سفارش را از لیست
                انتخاب کنید.
              </Text>
            </View>
          ) : (
            <View>
              {items.map((item) => (
                <View
                  key={item.product.id}
                  style={
                    styles.orderItem
                  }
                >
                  <View
                    style={
                      styles.orderItemInfo
                    }
                  >
                    <Text
                      style={
                        styles.orderItemName
                      }
                      numberOfLines={1}
                    >
                      {item.product.name}
                    </Text>

                    <Text
                      style={
                        styles.orderItemPrice
                      }
                    >
                      {new Intl.NumberFormat(
                        "fa-IR",
                      ).format(
                        item.product
                          .selling_price,
                      )}{" "}
                      تومان
                    </Text>
                  </View>

                  <View
                    style={
                      styles.quantityContainer
                    }
                  >
                    <Pressable
                      style={
                        styles.quantityButton
                      }
                      onPress={() =>
                        increaseQuantity(
                          item.product
                            .id,
                        )
                      }
                    >
                      <Ionicons
                        name="add"
                        size={17}
                        color="#404040"
                      />
                    </Pressable>

                    <Text
                      style={
                        styles.quantityText
                      }
                    >
                      {new Intl.NumberFormat(
                        "fa-IR",
                      ).format(
                        item.quantity,
                      )}
                    </Text>

                    <Pressable
                      style={
                        styles.quantityButton
                      }
                      onPress={() =>
                        decreaseQuantity(
                          item.product
                            .id,
                        )
                      }
                    >
                      <Ionicons
                        name="remove"
                        size={17}
                        color="#404040"
                      />
                    </Pressable>
                  </View>

                  <Pressable
                    style={
                      styles.removeButton
                    }
                    onPress={() =>
                      removeItem(
                        item.product.id,
                      )
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#737373"
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={styles.addProductButton}
            onPress={() =>
              setProductSelectorVisible(
                true,
              )
            }
          >
            <Ionicons
              name="add"
              size={19}
              color="#404040"
            />

            <Text
              style={
                styles.addProductText
              }
            >
              افزودن محصول
            </Text>
          </Pressable>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            توضیحات
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="توضیحات سفارش..."
            placeholderTextColor="#a3a3a3"
            multiline
            textAlign="right"
            textAlignVertical="top"
            style={styles.noteInput}
          />
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View
            style={styles.summaryRow}
          >
            <Text
              style={styles.summaryLabel}
            >
              تعداد آیتم‌ها
            </Text>

            <Text
              style={styles.summaryValue}
            >
              {new Intl.NumberFormat(
                "fa-IR",
              ).format(
                items.reduce(
                  (sum, item) =>
                    sum +
                    item.quantity,
                  0,
                ),
              )}
            </Text>
          </View>

          <View
            style={styles.summaryDivider}
          />

          <View
            style={styles.summaryRow}
          >
            <Text
              style={styles.totalLabel}
            >
              مبلغ کل
            </Text>

            <Text
              style={styles.totalValue}
            >
              {new Intl.NumberFormat(
                "fa-IR",
              ).format(totalAmount)}{" "}
              تومان
            </Text>
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            (pressed || saving) &&
              styles.submitButtonPressed,
            (saving ||
              items.length === 0) &&
              styles.submitButtonDisabled,
          ]}
          disabled={
            saving ||
            items.length === 0
          }
          onPress={handleSubmit}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
            />
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={20}
                color="#ffffff"
              />

              <Text
                style={
                  styles.submitButtonText
                }
              >
                ثبت سفارش
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Customer Selector */}
      {customerSelectorVisible && (
        <View
          style={styles.overlay}
        >
          <View
            style={styles.modal}
          >
            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                انتخاب مشتری
              </Text>

              <Pressable
                onPress={() =>
                  setCustomerSelectorVisible(
                    false,
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#404040"
                />
              </Pressable>
            </View>

            <View
              style={styles.modalSearch}
            >
              <Ionicons
                name="search-outline"
                size={19}
                color="#737373"
              />

              <TextInput
                value={customerSearch}
                onChangeText={(value) => {
                  setCustomerSearch(
                    value,
                  );
                  loadCustomers(value);
                }}
                placeholder="جستجوی مشتری..."
                placeholderTextColor="#a3a3a3"
                style={
                  styles.modalSearchInput
                }
                textAlign="right"
              />
            </View>

            <FlatList
              data={customers}
              keyExtractor={(item) =>
                String(item.id)
              }
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={
                    styles.option
                  }
                  onPress={() => {
                    setSelectedCustomer(
                      item,
                    );
                    setCustomerSelectorVisible(
                      false,
                    );
                  }}
                >
                  <View
                    style={
                      styles.optionIcon
                    }
                  >
                    <Ionicons
                      name="person-outline"
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
                        styles.optionTitle
                      }
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={
                        styles.optionDescription
                      }
                    >
                      {item.phone ||
                        "بدون شماره تماس"}
                    </Text>
                  </View>

                  {selectedCustomer?.id ===
                    item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color="#171717"
                    />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                loadingCustomers ? (
                  <View
                    style={
                      styles.modalState
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color="#525252"
                    />

                    <Text
                      style={
                        styles.modalStateText
                      }
                    >
                      در حال دریافت مشتری‌ها...
                    </Text>
                  </View>
                ) : (
                  <View
                    style={
                      styles.modalState
                    }
                  >
                    <Text
                      style={
                        styles.modalStateText
                      }
                    >
                      مشتری‌ای پیدا نشد.
                    </Text>
                  </View>
                )
              }
            />
          </View>
        </View>
      )}

      {/* Product Selector */}
      {productSelectorVisible && (
        <View
          style={styles.overlay}
        >
          <View
            style={styles.modal}
          >
            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                انتخاب محصول
              </Text>

              <Pressable
                onPress={() =>
                  setProductSelectorVisible(
                    false,
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#404040"
                />
              </Pressable>
            </View>

            <View
              style={styles.modalSearch}
            >
              <Ionicons
                name="search-outline"
                size={19}
                color="#737373"
              />

              <TextInput
                value={productSearch}
                onChangeText={(value) => {
                  setProductSearch(
                    value,
                  );
                  loadProducts(value);
                }}
                placeholder="جستجوی محصول..."
                placeholderTextColor="#a3a3a3"
                style={
                  styles.modalSearchInput
                }
                textAlign="right"
              />
            </View>

            <FlatList
              data={products}
              keyExtractor={(item) =>
                String(item.id)
              }
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const alreadyAdded =
                  items.some(
                    (orderItem) =>
                      orderItem.product
                        .id ===
                      item.id,
                  );

                const hasValidRecipe =
                  item.has_valid_recipe !==
                  false;

                return (
                  <Pressable
                    style={[
                      styles.option,
                      !hasValidRecipe &&
                        styles.optionDisabled,
                    ]}
                    disabled={
                      !hasValidRecipe
                    }
                    onPress={() =>
                      addProduct(item)
                    }
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        !hasValidRecipe &&
                          styles.optionIconDisabled,
                      ]}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={18}
                        color={
                          hasValidRecipe
                            ? "#525252"
                            : "#a3a3a3"
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.optionContent
                      }
                    >
                      <Text
                        style={[
                          styles.optionTitle,
                          !hasValidRecipe &&
                            styles.optionTitleDisabled,
                        ]}
                      >
                        {item.name}
                      </Text>

                      {hasValidRecipe ? (
                        <Text
                          style={
                            styles.optionDescription
                          }
                        >
                          {new Intl.NumberFormat(
                            "fa-IR",
                          ).format(
                            item.selling_price,
                          )}{" "}
                          تومان
                        </Text>
                      ) : (
                        <Text
                          style={
                            styles.noRecipeText
                          }
                        >
                          بدون دستور تهیه
                        </Text>
                      )}
                    </View>

                    {hasValidRecipe &&
                      (alreadyAdded ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color="#171717"
                        />
                      ) : (
                        <Ionicons
                          name="add-circle-outline"
                          size={21}
                          color="#737373"
                        />
                      ))}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                loadingProducts ? (
                  <View
                    style={
                      styles.modalState
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color="#525252"
                    />

                    <Text
                      style={
                        styles.modalStateText
                      }
                    >
                      در حال دریافت محصولات...
                    </Text>
                  </View>
                ) : (
                  <View
                    style={
                      styles.modalState
                    }
                  >
                    <Text
                      style={
                        styles.modalStateText
                      }
                    >
                      محصولی پیدا نشد.
                    </Text>
                  </View>
                )
              }
            />
          </View>
        </View>
      )}
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

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    alignItems: "flex-end",
  },

  backButton: {
    width: 42,
    height: 42,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
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
    padding: 11,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    color: "#dc2626",
    textAlign: "right",
  },

  section: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
    textAlign: "right",
  },

  itemCount: {
    fontSize: 11,
    color: "#a3a3a3",
  },

  selector: {
    minHeight: 66,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  selectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  selectorContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  selectorValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  selectorPlaceholder: {
    fontSize: 13,
    color: "#a3a3a3",
    textAlign: "right",
  },

  selectorDescription: {
    marginTop: 3,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  emptyProducts: {
    minHeight: 170,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyProductsTitle: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#404040",
  },

  emptyProductsText: {
    marginTop: 5,
    fontSize: 11,
    color: "#a3a3a3",
  },

  orderItem: {
    minHeight: 76,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },

  orderItemInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  orderItemName: {
    maxWidth: "100%",
    fontSize: 12,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  orderItemPrice: {
    marginTop: 5,
    fontSize: 10,
    color: "#737373",
    textAlign: "right",
  },

  quantityContainer: {
    height: 34,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  quantityButton: {
    width: 31,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    minWidth: 25,
    fontSize: 11,
    fontWeight: "600",
    color: "#404040",
    textAlign: "center",
  },

  removeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  addProductButton: {
    height: 44,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 12,
    borderStyle: "dashed",
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  addProductText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
  },

  noteInput: {
    minHeight: 110,
    padding: 13,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    fontSize: 12,
    lineHeight: 20,
    color: "#171717",
  },

  summary: {
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },

  summaryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#737373",
  },

  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#404040",
  },

  summaryDivider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: "#f0f0f0",
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
  },

  totalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
  },

  submitButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: "#171717",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  submitButtonPressed: {
    opacity: 0.7,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },

  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modal: {
    maxHeight: "82%",
    padding: 16,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "#fafafa",
  },

  modalHeader: {
    marginBottom: 13,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#171717",
  },

  modalSearch: {
    height: 46,
    paddingHorizontal: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  modalSearchInput: {
    flex: 1,
    height: 44,
    fontSize: 12,
    color: "#171717",
  },

  option: {
    minHeight: 62,
    padding: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 13,
    backgroundColor: "#ffffff",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },

  optionDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e5e5e5",
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  optionIconDisabled: {
    backgroundColor: "#eeeeee",
  },

  optionContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  optionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#262626",
    textAlign: "right",
  },

  optionTitleDisabled: {
    color: "#a3a3a3",
  },

  optionDescription: {
    marginTop: 3,
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "right",
  },

  /*
   * This is intentionally a separate Text style.
   * It is NOT combined with optionDescription.
   */
  noRecipeText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: "#dc2626",
    textAlign: "right",
  },

  modalState: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
  },

  modalStateText: {
    marginTop: 8,
    fontSize: 11,
    color: "#737373",
  },
});

