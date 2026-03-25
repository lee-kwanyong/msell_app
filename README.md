# Msell

A clean starter for **Msell** — a marketplace/community for trading creator digital assets (e.g., Instagram/YouTube channels).

## 1) Install
```bash
npm i
```

## 2) Env
Copy and fill:
```bash
cp .env.local.example .env.local
```

## 3) Supabase
Create a Supabase project, then run SQL:
- `sql/001_init.sql`
- `sql/002_auth_trigger.sql`
- `sql/003_rls.sql`

## 4) Run
```bash
npm run dev
```

## Pages
- `/` listings (public)
- `/login` / `/signup`
- `/dashboard` (protected)
- `/listings/new` (protected)

## Note
This starter focuses on authentication + listings CRUD skeleton.
