export type Purchase = {
  id: number;
  supplier: number | null;
  supplier_name: string | null;
  purchased_at: string;
  note: string;
  created_at: string;
};

export type PurchaseItem = {
  id: number;
  ingredient: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  base_quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  created_at: string;
};

export type PurchaseAdditionalCost = {
  id: number;
  cost_type: string;
  cost_type_display: string;
  amount: number;
  note: string;
  created_at: string;
};

export type PurchaseDetail = {
  id: number;
  supplier: number | null;
  supplier_name: string | null;
  organization: number;
  purchased_at: string;
  note: string;
  items: PurchaseItem[];
  additional_costs: PurchaseAdditionalCost[];
  items_total: number;
  additional_costs_total: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
};

export type PurchasesPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Purchase[];
};

export type PurchasesResponse = {
  success: boolean;
  data: PurchasesPagination;
  message: string | null;
  errors: unknown;
};

export type PurchaseListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  supplier?: number;
  purchasedAtAfter?: string;
  purchasedAtBefore?: string;
  ordering?: string;
};

export type PurchaseCreateItem = {
  ingredient: number;
  quantity: number;
  unit: string;
  unit_price: number;
  discount?: number;
};

export type PurchaseAdditionalCostInput = {
  cost_type: string;
  amount: number;
  note?: string;
};

export type CreatePurchasePayload = {
  supplier?: number | null;
  purchased_at: string;
  items: PurchaseCreateItem[];
  additional_costs?: PurchaseAdditionalCostInput[];
  note?: string;
};

export type CreatePurchaseResponse = {
  success: boolean;
  data: {
    id: number;
  };
  message: string | null;
  errors: unknown;
};

export type PurchaseDetailResponse = {
  success: boolean;
  data: PurchaseDetail;
  message: string | null;
  errors: unknown;
};

export type CancelPurchaseResponse = {
  id: number;
  status: "completed" | "cancelled";
};