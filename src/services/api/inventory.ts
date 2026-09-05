import { apiRequest } from "./client";

import type {
  CreateInventoryAdjustmentPayload,
  CreateInventoryWastePayload,
  InventoryMutationResponse,
  InventoryTransactionDetailResponse,
  InventoryTransactionListParams,
  InventoryTransactionsResponse,
} from "@/types/inventory";

export async function getInventoryTransactions(
  params: InventoryTransactionListParams = {},
): Promise<InventoryTransactionsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.set(
      "page_size",
      String(params.pageSize),
    );
  }

  if (params.ingredient) {
    searchParams.set(
      "ingredient",
      String(params.ingredient),
    );
  }

  if (params.transaction_type) {
    searchParams.set(
      "transaction_type",
      params.transaction_type,
    );
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.created_at_after) {
    searchParams.set(
      "created_at_after",
      params.created_at_after,
    );
  }

  if (params.created_at_before) {
    searchParams.set(
      "created_at_before",
      params.created_at_before,
    );
  }

  if (params.ordering) {
    searchParams.set(
      "ordering",
      params.ordering,
    );
  }

  const query = searchParams.toString();

  return apiRequest<InventoryTransactionsResponse>(
    `/inventory-transactions/${query ? `?${query}` : ""}`,
  );
}

export async function getInventoryTransaction(
  transactionId: number,
): Promise<InventoryTransactionDetailResponse> {
  return apiRequest<InventoryTransactionDetailResponse>(
    `/inventory-transactions/${transactionId}/`,
  );
}

export async function createInventoryAdjustment(
  payload: CreateInventoryAdjustmentPayload,
): Promise<InventoryMutationResponse> {
  return apiRequest<InventoryMutationResponse>(
    "/inventory-adjustments/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function createInventoryWaste(
  payload: CreateInventoryWastePayload,
): Promise<InventoryMutationResponse> {
  return apiRequest<InventoryMutationResponse>(
    "/inventory-waste/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}