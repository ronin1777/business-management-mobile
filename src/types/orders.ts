export type OrderStatus =
  | "completed"
  | "cancelled";

export type OrderPaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid";

export type Order = {
  id: number;
  customer: number | null;
  customer_name: string | null;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  ordered_at: string;
  created_at: string;
};

export type OrdersPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
};

export type OrdersResponse = {
  success: boolean;
  data: OrdersPagination;
  message: string | null;
  errors: unknown;
};

export type OrderFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  customer?: number;
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  orderedAtAfter?: string;
  orderedAtBefore?: string;
  ordering?: string;
};

export type OrderItemIngredient = {
  id: number;
  ingredient: number;
  ingredient_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
};

export type OrderItemDetail = {
  id: number;
  product: number;
  product_name: string;
  recipe: number | null;
  recipe_version: number | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  material_cost: number;
  ingredient_usages: OrderItemIngredient[];
  created_at: string;
};

export type OrderDetail = {
  id: number;
  customer: number | null;
  customer_name: string | null;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  ordered_at: string;
  note: string;
  items: OrderItemDetail[];
  total_amount: number;
  total_material_cost: number;
  gross_profit: number;
  paid_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
};

export type OrderDetailResponse = {
  success: boolean;
  data: OrderDetail;
  message: string | null;
  errors: unknown;
};

export type CreateOrderItem = {
  product: number;
  quantity: number;
};

export type CreateOrderPayload = {
  customer?: number | null;
  ordered_at: string;
  items: CreateOrderItem[];
  note?: string;
};

export type CreateOrderResponse = {
  id: number;
  message: string;
};