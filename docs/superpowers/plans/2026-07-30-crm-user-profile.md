# CRM User Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a protected `/perfil` page where CRM administrators can view account details and change their password while staying logged in.

**Architecture:** Reuse `requireCurrentAdmin()` for route protection and `changePassword()` for the password update contract. Add a profile-specific server action that returns form state instead of redirecting, then render a compact CRM-style page using the existing design tokens.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase SSR, TypeScript, Vitest.

## Global Constraints

- Keep `/perfil` protected by the existing admin session guard.
- Do not add signup, role management, user creation, or migrations.
- Do not redirect to login after an authenticated password change.
- Keep dashboard data mocked.
- Run `npm test`, `npm run lint`, and `npm run build` before completion.

---

### Task 1: Profile Password Action

**Files:**
- Create: `src/app/perfil/actions.ts`
- Create: `src/app/perfil/actions.test.ts`

**Interfaces:**
- Produces: `updateProfilePasswordAction(previousState: AuthFormState, formData: FormData): Promise<AuthFormState>`
- Consumes: `changePassword(client, password): Promise<AuthFormState>`

- [ ] **Step 1: Write failing tests**

Create tests proving the profile action rejects short passwords and returns success without redirecting.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- src/app/perfil/actions.test.ts`

- [ ] **Step 3: Implement the server action**

Use `createSupabaseServerClient()` and `changePassword()`; return the result directly.

- [ ] **Step 4: Verify the tests pass**

Run: `npm test -- src/app/perfil/actions.test.ts`

### Task 2: Protected Profile Page

**Files:**
- Create: `src/app/perfil/page.tsx`
- Create: `src/app/perfil/ProfilePasswordForm.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `requireCurrentAdmin()`
- Consumes: `getProfileDisplayName(profile, fallbackEmail)`
- Consumes: `updateProfilePasswordAction(previousState, formData)`

- [ ] **Step 1: Render protected profile account details**

Create an async `/perfil` page that calls `requireCurrentAdmin()` and displays name, email, role, and status.

- [ ] **Step 2: Add authenticated password form**

Create a client form using `useActionState`, `initialAuthFormState`, and `updateProfilePasswordAction`.

- [ ] **Step 3: Add sidebar navigation**

Add a `/perfil` link to the existing sidebar.

- [ ] **Step 4: Add compact styles**

Use existing CRM tokens and avoid marketing-page layout.

### Task 3: Validation And Release

**Files:**
- All changed source and docs.

- [ ] **Step 1: Run full validation**

Run:

```powershell
npm test
npm run lint
npm run build
```

- [ ] **Step 2: Commit and push**

Run:

```powershell
git add <intended-files>
git commit -m "feat: adicionar perfil do usuario"
git push origin main
```

## Self-Review

- Spec coverage: protected profile page, account details, password update, and sidebar link are covered.
- Placeholder scan: no implementation placeholders are intentionally left.
- Type consistency: action and helper names match the current auth code.
