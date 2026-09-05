export type Recipe = {
  id: number;
  product: number;
  product_name: string;
  version: number;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  created_at: string;
};

export type RecipeItem = {
  id: number;
  ingredient: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  base_quantity: number;
};

export type RecipeDetail = {
  id: number;
  product: number;
  product_name: string;
  version: number;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  items: RecipeItem[];
};

export type RecipesPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Recipe[];
};

export type RecipesResponse = {
  success: boolean;
  data: RecipesPagination;
  message: string | null;
  errors: unknown;
};

export type RecipeDetailResponse = {
  success: boolean;
  data: RecipeDetail;
  message: string | null;
  errors: unknown;
};

export type RecipeListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
};

export type CreateRecipeItemPayload = {
  ingredient: number;
  quantity: number;
  unit: string;
};

export type CreateRecipePayload = {
  product: number;
  valid_from: string;
  valid_to?: string | null;
  is_active?: boolean;
  items: CreateRecipeItemPayload[];
};