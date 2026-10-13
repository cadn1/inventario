# Despensa

Inventario de despensa: Next.js 15 + Neon Postgres + Drizzle + Tailwind 4.

## Local
1. `npm install`
2. Copia `.env.example` a `.env.local` y completa los valores.
3. `npm run db:push` (crea la tabla en Neon)
4. `npm run dev`

## Vercel
1. Sube el repo a GitHub e impórtalo en Vercel.
2. Storage → Neon: conecta la base (agrega `DATABASE_URL` sola).
3. Agrega `APP_PASSWORD` y `AUTH_SECRET` en Environment Variables.
4. Ejecuta `npm run db:push` una vez en local con la `DATABASE_URL` de Neon.
