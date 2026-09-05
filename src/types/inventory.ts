export type InventoryTransactionType =
  | "purchase"
  | "order_usage"
  | "waste"
  | "adjustment"
  | "reversal";

export type InventoryTransaction = {
  id: number;
  ingredient: number;
  ingredient_name: string;
  transaction_type: InventoryTransactionType;
  transaction_type_display: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchase_item: number | null;
  order_item_ingredient: number | null;
  created_by: number | null;
  created_at: string;
};

export type InventoryTransactionDetail =
  InventoryTransaction & {
    organization: number;
    note: string;
  };

export type InventoryTransactionsPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: InventoryTransaction[];
};

export type InventoryTransactionsResponse = {
  success: boolean;
  data: InventoryTransactionsPagination;
  message: string | null;
  errors: unknown;
};

export type InventoryTransactionDetailResponse = {
  success: boolean;
  data: InventoryTransactionDetail;
  message: string | null;
  errors: unknown;
};

export type InventoryTransactionListParams = {
  page?: number;
  pageSize?: number;
  ingredient?: number;
  transaction_type?: InventoryTransactionType;
  search?: string;
  created_at_after?: string;
  created_at_before?: string;
  ordering?: string;
};

export type CreateInventoryAdjustmentPayload = {
  ingredient: number;
  quantity: number;
  unit_cost?: number | null;
  note?: string;
};

export type CreateInventoryWastePayload = {
  ingredient: number;
  quantity: number;
  note?: string;
};

export type InventoryMutationResponse = {
  success: boolean;
  data: {
    id: number;
  };
  message: string | null;
  errors: unknown;
};