---
name: Docs update rule
description: Which documentation files to update and when — enforced before every markTaskComplete.
---

# Docs must be updated with every feature

The `docs/` directory at the repo root contains the full feature documentation for LiftIQ AI. It must be kept current as features are added.

**The rule:** before calling `markTaskComplete`, update the relevant doc file(s) for whatever was built.

## Which file for what

| Change type | File |
|---|---|
| New web page or feature | `docs/web-app.md` |
| New mobile screen or component | `docs/mobile-app.md` |
| New/changed API endpoint | `docs/api-reference.md` |
| New DB table or column | `docs/data-model.md` |
| New AI feature | `docs/ai-features.md` |
| Billing / subscription change | `docs/billing-subscriptions.md` |
| New offline-cached screen | `docs/offline-support.md` |
| New theme or colour | `docs/theming.md` |

**Why:** the user explicitly requested that docs stay current with every feature addition. Failing to update docs before marking complete will be caught by reviewers.

**How to apply:** at the end of every task, scan the list above, open and edit the matching file(s), then mark complete.
