# CRM Leads CRUD Design

## Goal

Turn the CRM lead flow from mocked data into a real Supabase-backed operation, allowing authenticated administrators to create, list, edit, and delete leads.

## Approved Scope

- Add a protected `/leads` page with real Supabase leads.
- Add `/leads/novo` to create a new lead.
- Add `/leads/[id]` to view, edit, and delete a lead.
- Replace dashboard leads with Supabase leads, falling back to mock leads only when there are no persisted leads or when local Supabase configuration is unavailable.
- Use the authenticated admin profile as `owner_id`.
- Keep Instagram-originated leads manual: only a text/url field, no API integration.
- Use the existing Supabase RLS policies and user session.

## Fields In This Phase

- Company name.
- Contact name.
- Segment.
- Source.
- Instagram profile/link.
- Pipeline stage.
- Estimated value.
- Recurring value.
- Probability.
- Next action.
- Next action date/time.
- Loss reason, when applicable.

## Architecture

The CRM will add a focused server-side lead repository that maps Supabase snake_case rows to the existing typed `Lead` domain model. Server pages and server actions will use `createSupabaseServerClient()` plus `requireCurrentAdmin()`; no service role key is required.

Lead validation will live in a small pure module so form parsing and Supabase payload creation can be tested without external database calls. Pages will remain server-rendered and protected by the existing auth boundary.

## Error Handling

- Invalid forms return Portuguese messages and keep the user on the form.
- Supabase insert/update/delete failures return safe generic messages.
- Missing Supabase config falls back to mock dashboard data and shows empty operational pages rather than exposing secrets or stack traces.
- Delete is explicit from the lead detail page.

## Out Of Scope

- Bulk import.
- All 62 CRM fields.
- WhatsApp automation.
- Instagram API or scraping.
- Automatic messages.
- Multi-owner assignment UI.
- Event history and audit timeline.

## Testing

Implementation will follow TDD. Tests will cover:

- Supabase row to `Lead` mapping.
- Lead form validation and payload creation.
- Insert/update/delete action behavior through dependency-injected clients.
- Existing dashboard metrics with real-domain `Lead` objects.

Final validation will run `npm test`, `npm run lint`, and `npm run build`.
