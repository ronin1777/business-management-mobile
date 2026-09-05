
export type Supplier = {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
};

export type SupplierDetail = {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SuppliersPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Supplier[];
};

export type SuppliersResponse = {
  success: boolean;
  data: SuppliersPagination;
  message: string | null;
  errors: unknown;
};

export type SupplierDetailResponse = {
  success: boolean;
  data: SupplierDetail;
  message: string | null;
  errors: unknown;
};

export type SupplierListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
};

export type SupplierAccount = {
  supplier: {
    id: number;
    name: string;
  };
  debit: number;
  credit: number;
  balance: number;
  direction: string | null;
};

export type SupplierAccountResponse = {
  success: boolean;
  data: SupplierAccount;
  message: string | null;
  errors: unknown;
};

export type SupplierTransaction = {
  id: number;
  supplier: number;
  transaction_type: string;
  transaction_type_display: string;
  direction: string;
  direction_display: string;
  amount: number;
  purchase: number | null;
  payment: number | null;
  note: string;
  created_at: string;
};

export type SupplierTransactionsPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: SupplierTransaction[];
};

export type SupplierTransactionsResponse = {
  success: boolean;
  data: SupplierTransactionsPagination;
  message: string | null;
  errors: unknown;
};

export type SupplierTransactionListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  supplier?: number;
  transactionType?: string;
  direction?: string;
  purchase?: number;
};

export type CreateSupplierPayload = {
  name: string;
  phone?: string;
  is_active?: boolean;
};

export type CreateSupplierResponse = {
  success: boolean;
  data: SupplierDetail;
  message: string | null;
  errors: unknown;
};

export type UpdateSupplierPayload = {
  name?: string;
  phone?: string;
  is_active?: boolean;
};

export type CreateSupplierRefundPayload = {
  supplier: number;
  purchase: number;
  amount: number;
  note?: string;
};

export type CreateSupplierRefundResponse = {
  success: boolean;
  data: unknown;
  message: string | null;
  errors: unknown;
};
