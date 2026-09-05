
export type Customer = {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerDetail = {
  id: number;
  name: string;
  phone: string;
  note: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomersPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
};

export type CustomersResponse = {
  success: boolean;
  data: CustomersPagination;
  message: string | null;
  errors: unknown;
};

export type CustomerDetailResponse = {
  success: boolean;
  data: CustomerDetail;
  message: string | null;
  errors: unknown;
};

export type CustomerListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
};

export type CustomerAccount = {
  customer: {
    id: number;
    name: string;
  };
  debit: number;
  credit: number;
  balance: number;
  direction: string | null;
};

export type CustomerAccountResponse = {
  success: boolean;
  data: CustomerAccount;
  message: string | null;
  errors: unknown;
};

export type CustomerTransaction = {
  id: number;
  transaction_type: string;
  transaction_type_display: string;
  direction: string;
  direction_display: string;
  amount: number;
  order: number | null;
  payment: number | null;
  note: string;
  created_at: string;
};

export type CustomerTransactionsPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerTransaction[];
};

export type CustomerTransactionsResponse = {
  success: boolean;
  data: CustomerTransactionsPagination;
  message: string | null;
  errors: unknown;
};

export type CustomerTransactionListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  customer?: number;
  transactionType?: string;
  direction?: string;
};

