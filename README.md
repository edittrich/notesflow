# NotesFlow

NotesFlow is a production-grade, full-stack notes application built with Next.js 15, PostgreSQL (via Supabase), Drizzle ORM, and GraphQL. It is designed to showcase modern engineering practices, clean architecture, and localized user experience (English and German) with theme switching (light/dark/system).

---

## Architecture & Technology Stack

NotesFlow separates frontend and backend logic using the **Next.js App Router** and a dedicated **GraphQL API endpoint**.

```mermaid
graph TD
    Client[Next.js Client Components] -- GraphQL HTTP Post --> GQL[GraphQL Endpoint /api/graphql]
    Client -- Auth & Cookie Session --> SupabaseAuth[Supabase Auth]
    GQL -- Session Validate --> SupabaseAuth
    GQL -- Database Query --> Drizzle[Drizzle ORM]
    Drizzle -- PostgreSQL direct connection --> PG[(Supabase PostgreSQL)]
```

### Stack Components

*   **Frontend**: Next.js 15 (App Router, TypeScript, React 19)
*   **Styling & UI**: Tailwind CSS v4, Lucide Icons, custom premium Shadcn-style components
*   **Data Fetching**: TanStack Query (React Query) communicating with the `/api/graphql` endpoint
*   **Backend**: Next.js Route Handlers exposing a GraphQL endpoint using `graphql-yoga`
*   **Authentication**: Supabase Auth (email/password only) with cookie-based session persistence
*   **Database & ORM**: PostgreSQL database (Supabase) managed via Drizzle ORM
*   **Internationalization**: Localized routing and messaging via `next-intl` (supporting English/German)
*   **Theme**: Smooth theme switching using `next-themes` (Dark, Light, System)

---

## Folder Structure

The project implements a feature-oriented layout:

```
/
├── supabase/                 # Supabase configuration & SQL migrations
│   ├── migrations/           # Schema migration scripts
│   └── config.toml           # Local Supabase engine configurations
├── src/
│   ├── app/                  # Next.js App Router Page/API routes
│   │   ├── [locale]/         # Localized routes
│   │   │   ├── (auth)/       # Auth pages (login, signup)
│   │   │   └── dashboard/    # Protected notes board page
│   │   ├── api/
│   │   │   └── graphql/      # GraphQL Route Handler (GET/POST)
│   │   ├── layout.tsx        # Pass-through base layout
│   │   └── page.tsx          # Root URL locale redirect
│   ├── components/           # UI and layout React components
│   │   ├── ui/               # Reusable base elements (Button, Card, Input, etc.)
│   │   ├── Navbar.tsx        # Global header with theme, language toggles, sign out
│   │   ├── NoteCard.tsx      # Renders an individual note
│   │   ├── NoteForm.tsx      # Note edit/create validation form
│   │   └── Providers.tsx     # Combined TanStack Query & next-themes wrapper
│   ├── db/                   # Database files
│   │   ├── index.ts          # Drizzle client configuration
│   │   └── schema.ts         # User and Note Drizzle tables
│   ├── graphql/              # GraphQL configuration
│   │   ├── context.ts        # Extracting auth session from cookies
│   │   ├── resolvers.ts      # Query/Mutation controllers
│   │   └── schema.ts         # GraphQL type definitions (SDL)
│   ├── hooks/                # Custom React hooks (useNotes CRUD hooks)
│   ├── i18n/                 # next-intl localized router setup
│   ├── lib/                  # General utility configurations
│   │   ├── supabase/         # Supabase client, server, and middleware session helpers
│   │   └── utils.ts          # Styling merge helper (cn)
│   └── messages/             # i18n Translation dictionaries (en.json, de.json)
├── drizzle.config.ts         # Drizzle Kit migration tool configurations
├── package.json
└── tsconfig.json
```

---

## Environment Variables

Copy the template variables file to your local variables file:
```bash
cp .env.example .env.local
```

### Variable Explanations

| Variable | Description | Source / Local Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | The public gateway URL for the Supabase project. | `http://127.0.0.1:54321` (Local) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public access key for supabase client auth. | Provided in CLI output on `supabase start` |
| `DATABASE_URL` | Direct connection string to Postgres. | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (Local) |

---

## Local Setup

Follow these commands to install dependencies, run migrations, and launch local development:

### 1. Installation
```bash
npm install
```

### 2. Start Local Database (Docker required)
```bash
supabase start
```
This spins up local Supabase containers and outputs your API URLs and Auth keys.

### 3. Reset Database and Run Migrations
```bash
supabase db reset
```
This drops the local database schema, recreates it, and runs all migrations stored in `supabase/migrations/`.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Run Unit Tests
```bash
npm run test
```
This runs the unit tests verifying sorting logic using Node's native test runner.

---

## Database Migration Workflow

Our database comprises two principal tables: `users` and `notes`. 

### User Synchronization Triggers
To allow Drizzle ORM to cleanly query and make relationships with users, we sync Supabase's internal auth table `auth.users` with our public table `public.users` using PostgreSQL triggers.
1. When a user registers, an `AFTER INSERT` trigger on `auth.users` runs `public.handle_new_user()` which inserts their UUID and email into `public.users`.
2. When a user changes their email, an `AFTER UPDATE` trigger updates the `public.users` record.
3. RLS is enabled on `notes` forcing the condition `auth.uid() = user_id`.

### Generating New Database Migrations
If you modify `src/db/schema.ts`:
1. Generate the migration file:
   ```bash
   npx drizzle-kit generate
   ```
2. Apply the migration directly to your local database:
   ```bash
   supabase db reset
   ```

---

## Required CLI Commands Reference

Here is a guide to the commands used during development, deployment, and reset procedures.

### Supabase CLI

*   `supabase start`  
    *Starts the local Supabase emulator stack in Docker (DB, Auth, Studio).*
*   `supabase stop`  
    *Shuts down the local Supabase stack.*
*   `supabase db reset`  
    *Resets the local database to a clean state and runs all migrations in `supabase/migrations/`.*
*   `supabase migration new <migration_name>`  
    *Creates a new blank SQL migration file under `supabase/migrations/`.*
*   `supabase gen types typescript --local > src/types/supabase.ts`  
    *Generates type definitions from the local schema.*

### Git

*   `git init`  
    *Initializes a new local Git repository.*
*   `git add .`  
    *Stages all files in the directory for the next commit.*
*   `git commit -m "Initial commit"`  
    *Commits staged changes to history.*
*   `git branch -M main`  
    *Renames the default branch to 'main'.*
*   `git remote add origin <repository-url>`  
    *Links the local repository to a remote repository.*
*   `git push -u origin main`  
    *Pushes local commits to the remote main branch and configures tracking.*

### GitHub CLI (`gh`)

*   `gh auth login`  
    *Authenticates the CLI tool with your GitHub account.*
*   `gh repo create <repo-name> --public --source=. --remote=origin`  
    *Creates a new remote repository on GitHub and registers it locally as the 'origin' remote.*
*   `gh repo view --web`  
    *Opens the linked GitHub repository in your default web browser.*

### Vercel CLI

*   `vercel login`  
    *Authenticates with your Vercel account.*
*   `vercel link`  
    *Links the local project directory to a Vercel project.*
*   `vercel env pull .env.local`  
    *Downloads environment variables configured in the Vercel project dashboard to your local file.*
*   `vercel deploy`  
    *Builds and deploys a preview version of the application.*
*   `vercel --prod`  
    *Deploys the production bundle of the application.*

---

## Deployment Guide

Deploying NotesFlow from scratch onto live environments:

### 1. Supabase Cloud Configuration
1. Create a project at [supabase.com](https://supabase.com).
2. Grab the Database Connection String from settings and set it as `DATABASE_URL` in your production environments.
3. Link your local CLI to the cloud project:
   ```bash
   supabase link --project-ref <project-reference-id>
   ```
4. Push migrations to the live database:
   ```bash
   supabase db push
   ```

### 2. GitHub Deployment
```bash
git init
git add .
git commit -m "Initial release"
git branch -M main
gh auth login
gh repo create notesflow --public --source=. --remote=origin --push
```

### 3. Vercel Hosting
1. Login to Vercel and link your project:
   ```bash
   vercel login
   vercel link
   ```
2. Configure the production environment variables inside the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` (Cloud Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Cloud Anon Key)
   - `DATABASE_URL` (Cloud Database Transaction Connection URL)
3. Deploy to production:
   ```bash
   vercel --prod
   ```

### Redeployment to New Project Instances
If redeploying to new projects:
1. Re-initialize Git if needed, or remove the old origin and add a new one:
   ```bash
   git remote remove origin
   git remote add origin <new-repo-url>
   git push -u origin main
   ```
2. Run `vercel link` again, select "Create a new project", and add the new environment variables.
3. Re-run `supabase link` using the new project reference, then execute `supabase db push`.

---

## Troubleshooting

### Local Supabase is unresponsive
If Docker containers crash or local Supabase fails to start:
*   **Fix**: Stop the stack and reset:
    ```bash
    supabase stop --backup
    supabase start
    ```

### database migration fails due to RLS or Triggers
If you hit trigger conflicts:
*   **Fix**: Ensure `auth.users` trigger doesn't conflict with existing rows. Running `supabase db reset` will safely recreate clean schemas.

### next-intl "locale not found" error
If you experience routing loop errors:
*   **Fix**: Ensure your URL has the locale prefix (e.g., `/en/dashboard`). Check that `src/middleware.ts` is running and not matching static assets or API endpoints.
