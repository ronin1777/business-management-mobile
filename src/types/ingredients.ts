export type Ingredient = {
  id: number;
  name: string;
  unit_type: string;
  base_unit: string;
  current_stock: number;
  current_inventory_value: number;
  average_unit_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type IngredientsPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ingredient[];
};

export type IngredientsResponse = {
  success: boolean;
  data: IngredientsPagination;
  message: string | null;
  errors: unknown;
};

export type IngredientResponse = {
  success: boolean;
  data: Ingredient;
  message: string | null;
  errors: unknown;
};

export type IngredientListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
};

export type CreateIngredientPayload = {
  name: string;
  unit_type: string;
  is_active?: boolean;
};

export type UpdateIngredientPayload = {
  name?: string;
  unit_type?: string;
  is_active?: boolean;
};