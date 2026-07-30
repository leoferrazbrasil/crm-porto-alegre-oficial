# CRM User Profile Design

## Goal

Create a protected user profile page for authenticated CRM administrators, with account information and an authenticated password-change form.

## Approved Scope

- Route: `/perfil`.
- Access: only authenticated CRM administrators.
- Display: full name, email, role, and access status.
- Action: change the current authenticated user's password.
- Navigation: add a sidebar link to the profile page.
- Password update behavior: show a success message and keep the user session active.

## Architecture

The page will reuse the existing Supabase SSR authentication boundary. Server-side rendering will call `requireCurrentAdmin()` to retrieve the current `user` and `profile`.

Password updates will reuse the existing `changePassword` helper, but through a new profile-specific server action that does not redirect to `/login`. This keeps recovery-password behavior separate from authenticated account-management behavior.

## Out Of Scope

- Editing name or email.
- Creating owner accounts.
- Changing roles.
- Adding database migrations.
- Adding profile photos or preferences.
- External integrations.

## Testing

Implementation will follow TDD with focused tests for the authenticated password action and existing password validation behavior. Final validation will run `npm test`, `npm run lint`, and `npm run build`.
