
import { apiRequest } from "./client";

import type {
  Product,
  ProductListParams,
  ProductResponse,
  ProductsResponse,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/products";

export async function getProducts(
  params: ProductListParams = {},
): Promise<ProductsResponse> {
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

  if (params.orderedAt) {
    searchParams.set("ordered_at", params.orderedAt);
  }

  const query = searchParams.toString();

  return apiRequest<ProductsResponse>(
    `/products/${query ? `?${query}` : ""}`,
  );
}

export async function getProduct(
  productId: number,
): Promise<Product> {
  return apiRequest<Product>(
    `/products/${productId}/`,
  );
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<ProductResponse> {
  return apiRequest<ProductResponse>(
    "/products/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateProduct(
  productId: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  return apiRequest<Product>(
    `/products/${productId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

