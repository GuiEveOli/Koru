# Koru

Use this repository to run and edit the app locally as a standalone Vite app.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.

## Run Locally

Run the frontend from the project root:

```bash
npm run dev
```

Open the local URL printed by Vite.

The app stores its data in Supabase when configured and keeps a local cache for
offline fallback. Copy `.env.example` to `.env.local`, fill in the Supabase
credentials, and run the SQL in `supabase/schema.sql` in the Supabase SQL
Editor. Anonymous sign-in must be enabled in Supabase Authentication for the
initial local-to-cloud migration.

## Build

```bash
npm run build
```

## Supabase

```bash
cp .env.example .env.local
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. The first
startup imports the existing `finance_app_data` browser cache when that
Supabase user has no saved data. The `service_role` key must never be used in
the frontend.

## Docs & Support

Support: open an issue in this repository.
