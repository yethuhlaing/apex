# Development Guide & Folder Structure Rules

This document defines the development workflow, folder structure conventions, and rules that AI agents should follow when working on this project.

## 🏗️ Folder Structure Architecture

This project follows a **feature-based architecture** pattern combined with Next.js 14+ App Router conventions. All code should be organized according to this structure.

### Standard Project Structure

```
src/
├── app/                          # Next.js 14+ App Router
│   ├── (auth)/                   # Route groups (parentheses = no URL segment)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── [workspace]/
│   ├── api/                      # API routes (for webhooks, external integrations)
│   │   └── webhooks/
│   └── layout.tsx
│
├── features/                     # Feature-based modules (CORE PATTERN)
│   ├── auth/
│   │   ├── actions/              # Server actions
│   │   ├── queries/              # Data fetching functions
│   │   ├── components/           # Feature-specific components
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   ├── workspace/
│   ├── analytics/
│   └── billing/
│
├── lib/                          # Shared infrastructure
│   ├── supabase/
│   │   ├── client.ts             # Client-side instance
│   │   ├── server.ts             # Server-side instance
│   │   └── middleware.ts
│   ├── db/                       # ORM/Prisma
│   │   ├── schema.prisma
│   │   ├── client.ts
│   │   └── migrations/
│   ├── integrations/             # Third-party services
│   │   ├── posthog/
│   │   ├── stripe/
│   │   └── resend/
│   └── utils/                    # Shared utilities
│       ├── cn.ts                 # Tailwind merge
│       ├── format.ts
│       └── validation.ts
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui or design system
│   ├── layouts/
│   ├── forms/
│   └── providers/                # Context providers
│
├── config/                       # Configuration
│   ├── site.ts                   # Site metadata
│   ├── env.ts                    # Env validation (t3-env)
│   └── constants.ts
│
├── types/                        # Global TypeScript types
│   ├── database.ts               # Supabase generated types
│   ├── api.ts
│   └── index.ts
│
└── middleware.ts                 # Next.js middleware
```

## 📋 Core Rules for AI Agents

### Rule 1: Feature-Based Organization (PRIMARY PATTERN)

**CRITICAL**: All feature-specific code MUST be placed in `src/features/[feature-name]/`

**What goes in features:**
- ✅ Feature-specific components
- ✅ Feature-specific hooks
- ✅ Feature-specific server actions
- ✅ Feature-specific data fetching (queries)
- ✅ Feature-specific types
- ✅ Feature-specific utilities
- ✅ Feature-specific constants

**What does NOT go in features:**
- ❌ Shared UI components → `components/ui/`
- ❌ Shared utilities → `lib/utils/`
- ❌ Global types → `types/`
- ❌ API routes → `app/api/`
- ❌ Layouts → `app/` or `components/layouts/`

### Rule 2: Feature Module Structure

Every feature module MUST follow this structure:

```
features/[feature-name]/
├── actions/          # Server actions (use "use server")
├── queries/          # Data fetching functions (React Query, SWR, etc.)
├── components/       # Feature-specific React components
├── hooks/            # Feature-specific React hooks
├── types/            # Feature-specific TypeScript types
├── utils/            # Feature-specific utility functions
└── constants/        # Feature-specific constants
```

**Example:**
```typescript
// ✅ CORRECT: Feature-specific component
features/auth/components/LoginForm.tsx

// ❌ WRONG: Should not be in shared components
components/auth/LoginForm.tsx
```

### Rule 3: App Router Conventions

**Route Groups**: Use parentheses `(group-name)` for organization without affecting URLs
- `app/(auth)/login/` → URL: `/login` (not `/auth/login`)
- `app/(dashboard)/workspace/` → URL: `/workspace`

**Dynamic Routes**: Use brackets for dynamic segments
- `app/[workspace]/` → URL: `/any-workspace-name`
- `app/api/webhooks/[provider]/` → URL: `/api/webhooks/stripe`

**Layouts**: Place layout files at the appropriate level
- `app/layout.tsx` → Root layout (applies to all routes)
- `app/(dashboard)/layout.tsx` → Dashboard-specific layout

### Rule 4: Shared vs Feature-Specific

**Shared Code** (used by multiple features):
- Place in `lib/`, `components/`, or `types/`
- Examples: `lib/utils/cn.ts`, `components/ui/button.tsx`

**Feature-Specific Code** (only used by one feature):
- Place in `features/[feature-name]/`
- Examples: `features/auth/components/LoginForm.tsx`

**Decision Tree:**
```
Is this code used by multiple features?
├─ YES → Place in shared location (lib/, components/, types/)
└─ NO → Place in features/[feature-name]/
```

### Rule 5: Import Path Conventions

**Always use path aliases:**
```typescript
// ✅ CORRECT
import { Button } from "@/components/ui/button"
import { loginUser } from "@/features/auth/actions/login"
import { cn } from "@/lib/utils/cn"

// ❌ WRONG
import { Button } from "../../components/ui/button"
```

**Path alias configuration** (should be in `tsconfig.json`):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Rule 6: Server vs Client Components

**Server Components** (default in App Router):
- No `"use client"` directive
- Can directly access server resources (DB, APIs)
- Cannot use hooks, event handlers, or browser APIs
- Place in `app/` or `features/[feature]/components/`

**Client Components**:
- Must have `"use client"` at the top
- Can use hooks, event handlers, browser APIs
- Use for interactive UI
- Place in `features/[feature]/components/` or `components/`

**Example:**
```typescript
// ✅ Server Component (default)
// features/auth/components/AuthLayout.tsx
export default function AuthLayout({ children }) {
  return <div>{children}</div>
}

// ✅ Client Component (explicit)
// features/auth/components/LoginForm.tsx
"use client"
import { useState } from "react"
export function LoginForm() {
  const [email, setEmail] = useState("")
  // ...
}
```

### Rule 7: Server Actions Pattern

**Server Actions** MUST be in `features/[feature]/actions/`:
```typescript
// features/auth/actions/login.ts
"use server"

import { z } from "zod"

export async function loginUser(formData: FormData) {
  // Server-side logic
}
```

**Naming Convention:**
- File: `features/auth/actions/login.ts`
- Function: `loginUser`, `registerUser`, etc. (verb + noun)

### Rule 8: Data Fetching Pattern

**Queries** (data fetching) in `features/[feature]/queries/`:
```typescript
// features/workspace/queries/get-workspace.ts
import { createClient } from "@/lib/supabase/server"

export async function getWorkspace(id: string) {
  const supabase = await createClient()
  // Fetch logic
}
```

**React Query / SWR** hooks in `features/[feature]/hooks/`:
```typescript
// features/workspace/hooks/use-workspace.ts
"use client"
import { useQuery } from "@tanstack/react-query"
import { getWorkspace } from "../queries/get-workspace"

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: () => getWorkspace(id)
  })
}
```

## 🔄 Development Workflow

### Step 1: Creating a New Feature

1. **Create feature directory structure:**
   ```bash
   src/features/[feature-name]/
   ├── actions/
   ├── queries/
   ├── components/
   ├── hooks/
   ├── types/
   ├── utils/
   └── constants/
   ```

2. **Create feature types:**
   ```typescript
   // features/[feature]/types/index.ts
   export interface FeatureType {
     id: string
     // ...
   }
   ```

3. **Create feature constants:**
   ```typescript
   // features/[feature]/constants/index.ts
   export const FEATURE_CONSTANTS = {
     // ...
   }
   ```

4. **Build feature components:**
   - Start with server components
   - Add client components only when needed
   - Keep components focused and small

### Step 2: Adding a New Component

**Decision Process:**
1. Is it feature-specific? → `features/[feature]/components/`
2. Is it shared UI? → `components/ui/`
3. Is it a layout? → `components/layouts/` or `app/[route]/layout.tsx`
4. Is it a form? → `components/forms/` (if shared) or `features/[feature]/components/`

**Component Structure:**
```typescript
// features/[feature]/components/ComponentName.tsx
"use client" // Only if needed

import { ComponentNameProps } from "../types"

export function ComponentName({ ...props }: ComponentNameProps) {
  // Component logic
}
```

### Step 3: Adding Server Actions

1. Create file in `features/[feature]/actions/[action-name].ts`
2. Add `"use server"` directive
3. Export async function
4. Add proper error handling
5. Add input validation (Zod recommended)

**Example:**
```typescript
// features/auth/actions/login.ts
"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function loginUser(formData: FormData) {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  })

  if (!validated.success) {
    return { error: "Invalid input" }
  }

  // Implementation
}
```

### Step 4: Adding API Routes

**API routes** go in `app/api/[route]/route.ts`:
- Use for webhooks, external integrations
- NOT for internal data fetching (use server actions instead)

**Example:**
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Webhook handling
  return NextResponse.json({ success: true })
}
```

### Step 5: Adding Types

**Feature-specific types:**
```typescript
// features/[feature]/types/index.ts
export interface FeatureType {
  // ...
}
```

**Global types:**
```typescript
// types/index.ts
export interface GlobalType {
  // ...
}
```

**Database types** (generated):
```typescript
// types/database.ts
// Auto-generated from Supabase/Prisma
```

## 🚫 Common Mistakes to Avoid

### ❌ Mistake 1: Placing Feature Code in Wrong Location
```typescript
// ❌ WRONG
components/auth/LoginForm.tsx

// ✅ CORRECT
features/auth/components/LoginForm.tsx
```

### ❌ Mistake 2: Using Relative Imports
```typescript
// ❌ WRONG
import { Button } from "../../components/ui/button"

// ✅ CORRECT
import { Button } from "@/components/ui/button"
```

### ❌ Mistake 3: Mixing Server and Client Code
```typescript
// ❌ WRONG - Server action in client component file
"use client"
export async function serverAction() { }

// ✅ CORRECT - Separate files
// features/auth/actions/login.ts
"use server"
export async function loginUser() { }
```

### ❌ Mistake 4: Creating Unnecessary API Routes
```typescript
// ❌ WRONG - Internal data fetching via API route
// app/api/user/route.ts
export async function GET() {
  // Fetch user data
}

// ✅ CORRECT - Use server action or query
// features/user/queries/get-user.ts
export async function getUser(id: string) {
  // Fetch user data
}
```

### ❌ Mistake 5: Not Following Feature Structure
```typescript
// ❌ WRONG - Flat structure
features/auth.ts
features/auth-components.tsx

// ✅ CORRECT - Organized structure
features/auth/
  ├── components/
  ├── actions/
  └── types/
```

## 📝 File Naming Conventions

### Components
- **PascalCase**: `LoginForm.tsx`, `UserProfile.tsx`
- **One component per file** (unless tightly coupled)

### Server Actions
- **kebab-case**: `login-user.ts`, `create-workspace.ts`
- **Verb + noun**: `loginUser`, `createWorkspace`

### Hooks
- **kebab-case with `use-` prefix**: `use-workspace.ts`, `use-auth.ts`
- **Export hook as PascalCase**: `useWorkspace`, `useAuth`

### Types
- **kebab-case**: `index.ts` or `types.ts`
- **Export types as PascalCase**: `User`, `Workspace`

### Utils
- **kebab-case**: `format-date.ts`, `validate-email.ts`
- **Export functions as camelCase**: `formatDate`, `validateEmail`

## 🔍 Code Organization Checklist

When adding new code, verify:

- [ ] Is this feature-specific? → `features/[feature]/`
- [ ] Is this shared? → `lib/`, `components/`, or `types/`
- [ ] Is this a server action? → `features/[feature]/actions/`
- [ ] Is this a query? → `features/[feature]/queries/`
- [ ] Is this a hook? → `features/[feature]/hooks/`
- [ ] Is this a route? → `app/[route]/`
- [ ] Is this an API endpoint? → `app/api/[endpoint]/`
- [ ] Are imports using `@/` alias?
- [ ] Is `"use client"` only where needed?
- [ ] Are file names following conventions?

## 🎯 Quick Reference

### Where to Put Code

| Code Type | Location | Example |
|-----------|----------|---------|
| Feature component | `features/[feature]/components/` | `features/auth/components/LoginForm.tsx` |
| Shared UI component | `components/ui/` | `components/ui/button.tsx` |
| Server action | `features/[feature]/actions/` | `features/auth/actions/login.ts` |
| Data query | `features/[feature]/queries/` | `features/user/queries/get-user.ts` |
| Custom hook | `features/[feature]/hooks/` | `features/workspace/hooks/use-workspace.ts` |
| Feature types | `features/[feature]/types/` | `features/auth/types/index.ts` |
| Global types | `types/` | `types/index.ts` |
| Shared utils | `lib/utils/` | `lib/utils/cn.ts` |
| Feature utils | `features/[feature]/utils/` | `features/auth/utils/validate.ts` |
| API route | `app/api/[route]/` | `app/api/webhooks/stripe/route.ts` |
| Page route | `app/[route]/` | `app/login/page.tsx` |
| Layout | `app/[route]/layout.tsx` | `app/(dashboard)/layout.tsx` |
| Middleware | `middleware.ts` | `src/middleware.ts` |
| Config | `config/` | `config/env.ts` |

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run format:check # Check formatting

# Type Checking
npx tsc --noEmit     # Type check without building
```

## 📚 Additional Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Feature-Based Architecture](https://kentcdodds.com/blog/colocation)
- [Path Aliases](https://nextjs.org/docs/app/api-reference/next-config-js/paths)

---

**Remember**: When in doubt, follow the feature-based pattern. Keep feature code together, and only extract to shared locations when truly needed by multiple features.

