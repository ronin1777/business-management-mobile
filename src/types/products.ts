
export type Product = {
  id: number;
  name: string;
  selling_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_valid_recipe?: boolean;
};

export type ProductsPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
};

export type ProductsResponse = {
  success: boolean;
  data: ProductsPagination;
  message: string | null;
  errors: unknown;
};

export type ProductListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  orderedAt?: string;
};

export type ProductResponse = {
  success: boolean;
  data: Product;
  message: string | null;
  errors: unknown;
};

export type CreateProductPayload = {
  name: string;
  selling_price: number;
  is_active?: boolean;
};

export type UpdateProductPayload = {
  name?: string;
  selling_price?: number;
  is_active?: boolean;
};

