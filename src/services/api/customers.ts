
import { apiRequest } from "./client";

import type {
  CustomerAccountResponse,
  CustomerDetail,
  CustomerListParams,
  CustomerTransaction,
  CustomerTransactionListParams,
  CustomerTransactionsResponse,
  CustomersResponse,
} from "@/types/customers";

export async function getCustomers(
  params: CustomerListParams = {},
): Promise<CustomersResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.ordering) {
    searchParams.set("ordering", params.ordering);
  }

  const query = searchParams.toString();

  return apiRequest<CustomersResponse>(
    `/customers/${query ? `?${query}` : ""}`,
  );
}

export async function getCustomer(
  customerId: number,
): Promise<CustomerDetail> {
  return apiRequest<CustomerDetail>(
    `/customers/${customerId}/`,
  );
}

export type CreateCustomerPayload = {
  name: string;
  phone?: string;
  note?: string;
  is_active?: boolean;
};

export async function createCustomer(
  payload: CreateCustomerPayload,
): Promise<CustomerDetail> {
  return apiRequest<CustomerDetail>(
    "/customers/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type UpdateCustomerPayload = {
  name?: string;
  phone?: string;
  note?: string;
  is_active?: boolean;
};

export async function updateCustomer(
  customerId: number,
  payload: UpdateCustomerPayload,
): Promise<CustomerDetail> {
  return apiRequest<CustomerDetail>(
    `/customers/${customerId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function getCustomerAccount(
  customerId: number,
): Promise<CustomerAccountResponse> {
  return apiRequest<CustomerAccountResponse>(
    `/customer-accounts/${customerId}/`,
  );
}

export async function getCustomerTransactions(
  params: CustomerTransactionListParams = {},
): Promise<CustomerTransactionsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.ordering) {
    searchParams.set("ordering", params.ordering);
  }

  if (params.customer) {
    searchParams.set("customer", String(params.customer));
  }

  if (params.transactionType) {
    searchParams.set(
      "transaction_type",
      params.transactionType,
    );
  }

  if (params.direction) {
    searchParams.set(
      "direction",
      params.direction,
    );
  }

  const query = searchParams.toString();

  return apiRequest<CustomerTransactionsResponse>(
    `/customer-transactions/${query ? `?${query}` : ""}`,
  );
}


export async function getCustomerTransaction(
  transactionId: number,
): Promise<CustomerTransaction> {
  return apiRequest<CustomerTransaction>(
    `/customer-transactions/${transactionId}/`,
  );
}