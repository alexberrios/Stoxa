# Inventario PYMES

Aplicación web de gestión de inventario para pequeños negocios: productos, categorías, movimientos de stock, alertas de bajo stock, códigos QR e informes con exportación CSV.

## Requisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com/) (plan gratuito válido)

## Configuración de Supabase

1. Crea un proyecto nuevo en Supabase.
2. En **SQL Editor**, ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. En **SQL Editor**, ejecuta [`supabase/configuration.sql`](supabase/configuration.sql) para habilitar la sección de Configuración (usuarios y tipos de cambio).
4. En **Storage**, crea un bucket privado llamado `product-images`.
5. En **SQL Editor**, ejecuta [`supabase/storage.sql`](supabase/storage.sql) para las políticas de almacenamiento.
6. En **Authentication → Providers**, deja habilitado el proveedor **Email** (contraseña).
7. Copia **Project URL** y **anon public** key desde **Settings → API**.

## Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave anónima.
- `NEXT_PUBLIC_APP_URL` — URL pública de la app (en local: `http://localhost:3000`). Se usa en los códigos QR de producto.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), regístrate e inicia sesión.

## Producción

```bash
npm run build
npm start
```

Asegúrate de definir las mismas variables de entorno en tu plataforma de despliegue y de que `NEXT_PUBLIC_APP_URL` apunte al dominio público para que los QR sean correctos.

## Notas

- El SKU es único por usuario (no global).
- Las imágenes se guardan en Storage bajo la carpeta `{user_id}/...` con acceso restringido por RLS.
- Los movimientos de stock usan la función SQL `apply_stock_movement` para mantener el stock coherente con el historial.
