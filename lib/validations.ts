import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hex inválido"),
});

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  sku: z.string().min(1, "El SKU es obligatorio").max(80),
  category_id: z.string().uuid("Categoría inválida"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  quantity: z.coerce.number().int().min(0, "La cantidad no puede ser negativa"),
  min_stock: z.coerce.number().int().min(0, "El umbral no puede ser negativo"),
  image_url: z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === "") return null;
      const s = String(v).trim();
      return s === "" ? null : s;
    },
    z.union([z.string().max(500), z.null()]),
  ),
});

export const stockMovementSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  reason: z.string().max(500).optional().default(""),
  occurred_at: z.string().min(1),
});

export const teamUserSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  email: z.email("Correo inválido").max(160),
  role: z.enum(["ADMIN", "OPERADOR", "LECTOR"]),
  active: z.boolean().default(true),
});

export const exchangeRateSchema = z.object({
  code: z
    .string()
    .regex(/^[A-Z]{3}$/, "La moneda debe tener 3 letras (ej: EUR)")
    .transform((v) => v.toUpperCase()),
  name: z.string().min(1, "El nombre es obligatorio").max(80),
  rate_to_base: z.coerce
    .number()
    .positive("El tipo de cambio debe ser mayor a 0"),
  is_base: z.boolean().default(false),
});
