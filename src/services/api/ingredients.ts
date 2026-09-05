import { apiRequest } from "./client";

import type {
  CreateIngredientPayload,
  Ingredient,
  IngredientListParams,
  IngredientResponse,
  IngredientsResponse,
  UpdateIngredientPayload,
} from "@/types/ingredients";

export async function getIngredients(
  params: IngredientListParams = {},
): Promise<IngredientsResponse> {
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

  const query =
    searchParams.toString();

  return apiRequest<IngredientsResponse>(
    `/ingredients/${query ? `?${query}` : ""}`,
  );
}

export async function getIngredient(
  ingredientId: number,
): Promise<Ingredient> {
  return apiRequest<Ingredient>(
    `/ingredients/${ingredientId}/`,
  );
}

export async function createIngredient(
  payload: CreateIngredientPayload,
): Promise<IngredientResponse> {
  return apiRequest<IngredientResponse>(
    "/ingredients/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateIngredient(
  ingredientId: number,
  payload: UpdateIngredientPayload,
): Promise<Ingredient> {
  return apiRequest<Ingredient>(
    `/ingredients/${ingredientId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}