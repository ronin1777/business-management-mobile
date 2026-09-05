import { apiRequest } from "./client";

import type {
  CancelPurchaseResponse,
  CreatePurchasePayload,
  CreatePurchaseResponse,
  PurchaseDetailResponse,
  PurchaseListParams,
  PurchasesResponse,
} from "@/types/purchases";

export async function getPurchases(
  params: PurchaseListParams = {},
): Promise<PurchasesResponse> {
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

  if (params.supplier) {
    searchParams.set(
      "supplier",
      String(params.supplier),
    );
  }

  if (params.purchasedAtAfter) {
    searchParams.set(
      "purchased_at_after",
      params.purchasedAtAfter,
    );
  }

  if (params.purchasedAtBefore) {
    searchParams.set(
      "purchased_at_before",
      params.purchasedAtBefore,
    );
  }

  if (params.ordering) {
    searchParams.set(
      "ordering",
      params.ordering,
    );
  }

  const query =
    searchParams.toString();

  return apiRequest<PurchasesResponse>(
    `/purchases/${query ? `?${query}` : ""}`,
  );
}

export async function getPurchase(
  purchaseId: number,
): Promise<PurchaseDetailResponse> {
  return apiRequest<PurchaseDetailResponse>(
    `/purchases/${purchaseId}/`,
  );
}

export async function createPurchase(
  payload: CreatePurchasePayload,
): Promise<CreatePurchaseResponse> {
  return apiRequest<CreatePurchaseResponse>(
    "/purchases/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function cancelPurchase(
  purchaseId: number,
  note = "",
): Promise<CancelPurchaseResponse> {
  return apiRequest<CancelPurchaseResponse>(
    `/purchases/${purchaseId}/cancel/`,
    {
      method: "POST",
      body: JSON.stringify({
        note,
      }),
    },
  );
}