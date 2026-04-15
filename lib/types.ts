export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Product = {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  min_stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type StockMovementType = "IN" | "OUT";

export type StockMovement = {
  id: string;
  user_id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  occurred_at: string;
};

export type ProductStatusFilter = "all" | "ok" | "low" | "out";

export type TeamUser = {
  id: string;
  owner_user_id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERADOR" | "LECTOR";
  active: boolean;
  created_at: string;
};

export type ExchangeRate = {
  id: string;
  user_id: string;
  code: string;
  name: string;
  rate_to_base: number;
  is_base: boolean;
  created_at: string;
  updated_at: string;
};
