
import { apiRequest } from "./client";

import type {
  CreateSupplierPayload,
  CreateSupplierRefundPayload,
  CreateSupplierRefundResponse,
  CreateSupplierResponse,
  SupplierAccountResponse,
  SupplierDetailResponse,
  SupplierListParams,
  SupplierTransactionListParams,
  SupplierTransactionsResponse,
  SuppliersResponse,
  UpdateSupplierPayload,
} from "@/types/suppliers";

// ----------------------------------------
// Suppliers
// ----------------------------------------

export async function getSuppliers(
  params: SupplierListParams = {},
): Promise<SuppliersResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.pageSize) {
    searchParams.set(
      "page_size",
      String(params.pageSize),
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.ordering) {
    searchParams.set(
      "ordering",
      params.ordering,
    );
  }

  const query = searchParams.toString();

  return apiRequest<SuppliersResponse>(
    `/suppliers/${query ? `?${query}` : ""}`,
  );
}

export async function getSupplier(
  supplierId: number,
): Promise<SupplierDetailResponse> {
  return apiRequest<SupplierDetailResponse>(
    `/suppliers/${supplierId}/`,
  );
}

export async function createSupplier(
  payload: CreateSupplierPayload,
): Promise<CreateSupplierResponse> {
  return apiRequest<CreateSupplierResponse>(
    "/suppliers/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateSupplier(
  supplierId: number,
  payload: UpdateSupplierPayload,
): Promise<SupplierDetailResponse> {
  return apiRequest<SupplierDetailResponse>(
    `/suppliers/${supplierId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

// ----------------------------------------
// Supplier Account
// ----------------------------------------

export async function getSupplierAccount(
  supplierId: number,
): Promise<SupplierAccountResponse> {
  return apiRequest<SupplierAccountResponse>(
    `/supplier-accounts/${supplierId}/`,
  );
}

// ----------------------------------------
// Supplier Transactions
// ----------------------------------------

export async function getSupplierTransactions(
  params: SupplierTransactionListParams = {},
): Promise<SupplierTransactionsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.pageSize) {
    searchParams.set(
      "page_size",
      String(params.pageSize),
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.ordering) {
    searchParams.set(
      "ordering",
      params.ordering,
    );
  }

  if (params.supplier) {
    searchParams.set(
      "supplier",
      String(params.supplier),
    );
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

  if (params.purchase) {
    searchParams.set(
      "purchase",
      String(params.purchase),
    );
  }

  const query = searchParams.toString();

  return apiRequest<SupplierTransactionsResponse>(
    `/supplier-transactions/${
      query ? `?${query}` : ""
    }`,
  );
}

// ----------------------------------------
// Supplier Refunds
// ----------------------------------------

export async function createSupplierRefund(
  payload: CreateSupplierRefundPayload,
): Promise<CreateSupplierRefundResponse> {
  return apiRequest<CreateSupplierRefundResponse>(
    "/supplier-refunds/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

