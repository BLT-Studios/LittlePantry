## Summary

<!-- What does this PR change?-->

## Why

## <!-- Why are we making this change? What problem does it solve? -->

## Scope

<!-- What areas are touched? Check all that apply. -->

- [ ] UI / Layout
- [ ] Routing / Guards
- [ ] Stores (MobX)
- [ ] Services (Supabase)
- [ ] Database / SQL / Migrations
- [ ] Edge Functions
- [ ] Scripts / Tooling
- [ ] Types / Models
- [ ] Docs / README
- [ ] Other: \***\*\*\*\*\***\_\_\***\*\*\*\*\***

## Screenshots / Demo (if UI)

<!-- Add screenshots, GIFs, or a short screen recording. -->

- Before:
- After:

## How to Test

<!-- Step-by-step manual testing instructions. Be explicit. -->

1.
2.
3.

## Checklist (Required)

### Quality Gates

- [ ] I ran `yarn lint` and fixed all issues (or documented why they’re safe to ignore)
- [ ] I ran `yarn build` successfully
- [ ] I ran the app locally and verified the main flow(s) work
- [ ] I verified there are no obvious console errors/warnings in the browser

### Code Health

- [ ] Changes are small/clean and avoid unrelated refactors
- [ ] Naming is clear and consistent
- [ ] No dead code left behind (unused files, functions, exports)
- [ ] New logic is typed (no `any` unless justified)
- [ ] I did not commit secrets (`.env`, keys, tokens). Repo-safe config only.

### Data / Supabase (if applicable)

- [ ] SQL changes are reversible or safe to re-run (`create if not exists`, `drop if exists`, etc.)
- [ ] RLS policies were considered/updated for any new tables/buckets/functions
- [ ] Any schema updates are reflected in TS types (and vice versa)
- [ ] I validated the related flow(s) using a real Supabase project/env

## Breaking Changes

- [ ] No
- [ ] Yes (describe):

## Risk & Rollback

<!-- What could break? How do we undo this if needed? -->

**Risk:**

- **Rollback plan:**

-

## Notes for Reviewer

<!-- Anything you want reviewers to focus on / questions you have. -->

-

## Follow-ups

<!-- Things intentionally deferred to later PRs. -->

- [ ]
- [ ]
