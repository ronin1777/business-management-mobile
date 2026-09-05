import { apiRequest } from "./client";

import type {
  RecipeDetail,
  RecipeDetailResponse,
  RecipeListParams,
  RecipesResponse,
  CreateRecipePayload,
} from "@/types/recipes";

export async function getRecipes(
  params: RecipeListParams = {},
): Promise<RecipesResponse> {
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

  return apiRequest<RecipesResponse>(
    `/recipes/${query ? `?${query}` : ""}`,
  );
}

export async function getRecipe(
  recipeId: number,
): Promise<RecipeDetail> {
  return apiRequest<RecipeDetail>(
    `/recipes/${recipeId}/`,
  );
}

export async function createRecipe(
  payload: CreateRecipePayload,
): Promise<RecipeDetailResponse> {
  return apiRequest<RecipeDetailResponse>(
    "/recipes/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}