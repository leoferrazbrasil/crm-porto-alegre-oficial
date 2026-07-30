# CRM Authentication Design

## Goal

Implement the first authenticated access layer for the Porto Alegre Oficial CRM so Leonardo can access the operational dashboard with an administrator account and the owner can later receive an administrator account as well.

## Approved Access Model

- Authentication method: email and password through Supabase Auth.
- First user: `leonardoferrazbrasil@gmail.com`.
- Initial password: `202122`, to be changed after first access.
- Public signup: disabled in the application.
- Initial allowed role: `admin`.
- Owner access: prepared for a future administrator account, not created in this step.

## Architecture

The CRM will use Supabase Auth as the identity provider and Next.js App Router as the session boundary. Sessions will be stored through Supabase SSR cookies, not browser-only local storage. A Next.js `proxy.ts` file will refresh auth cookies and redirect unauthenticated users to `/login`.

Server-side CRM pages will read the authenticated user, then validate that the user has an active `profiles` row with role `admin`. The app will keep the commercial dashboard data mocked for this step; this feature protects the CRM shell and prepares the data boundary for later live Supabase queries.

## User-Facing Flow

- `/login` shows a focused email/password form.
- Successful login redirects to `/`.
- Unauthenticated access to `/` redirects to `/login`.
- Authenticated users visiting `/login` redirect to `/`.
- A logout action clears the session and returns to `/login`.
- Password recovery and password update screens are available so the initial password can be changed without developer involvement.

## Components And Files

- Supabase client factory for browser usage.
- Supabase server client factory for cookie-aware server usage.
- Supabase middleware/proxy client for session refresh.
- Authentication helpers for retrieving the current profile and enforcing admin access.
- Login, password recovery, password update, and sign-out server actions.
- Updated dashboard page with server-side auth guard and logged-in account context.
- Tests for config resolution, route decisions, and role-access behavior.

## Error Handling

- Login failures show a generic Portuguese error message.
- Missing Supabase environment variables fail with a clear local configuration error.
- Users without an active `admin` profile are blocked from the CRM.
- Password recovery responses avoid confirming whether an email exists.
- No service role key or secret token is exposed to the browser.

## Testing

Implementation will follow TDD. The first tests will cover:

- Public and protected route classification for the auth proxy.
- Supabase configuration requirements.
- Admin profile authorization rules.
- Login action behavior for success and invalid credentials using mocked Supabase clients.

After implementation, validation will run:

- `npm test`
- `npm run lint`
- `npm run build`

## Out Of Scope

- Instagram integration.
- WhatsApp integration.
- Public user registration.
- Owner account creation.
- Live commercial data queries.
- Hostinger deployment configuration changes.
- Pricing, contracts, or proposal content.

## Open Decisions

There are no open implementation decisions for this step. The approved path is email and password authentication with a temporary initial password for Leonardo.
