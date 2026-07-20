# Keeping the Documentation Current

This page explains which docs to update and how, whenever a new feature is added to LiftIQ AI.

---

## The rule

> **Before marking any feature task complete, update the relevant doc files below.**  
> Treat outdated docs as a bug.

---

## Which file to update for what

| Type of change | File(s) to update |
|---|---|
| New web app page or feature | [`web-app.md`](./web-app.md) |
| New mobile screen or component | [`mobile-app.md`](./mobile-app.md) |
| New or changed API endpoint | [`api-reference.md`](./api-reference.md) |
| New database table or column | [`data-model.md`](./data-model.md) |
| New AI-powered feature | [`ai-features.md`](./ai-features.md) |
| Subscription / billing changes | [`billing-subscriptions.md`](./billing-subscriptions.md) |
| New offline-cached screen | [`offline-support.md`](./offline-support.md) |
| New theme or theming behaviour | [`theming.md`](./theming.md) |
| New shared hook or library | The relevant feature doc + this index |

---

## Doc update checklist (per feature)

- [ ] Added/updated the feature description in the appropriate doc
- [ ] If a new page/screen, added its route and a feature summary
- [ ] If a new endpoint, added it to `api-reference.md` with request/response shape
- [ ] If a new table or column, added it to `data-model.md`
- [ ] If the feature is Pro-gated, noted it in `billing-subscriptions.md`
- [ ] Updated `README.md` if a new top-level doc file was created

---

## Writing style

- Lead with **what the user can do**, not implementation details
- Keep descriptions to 2–4 sentences per feature; link to the relevant doc for depth
- Use present tense ("The chart shows…", not "The chart will show…")
- Code snippets for API request/response shapes are welcome in `api-reference.md` and hook signatures in `mobile-app.md`

---

## This applies to agents too

If you are an AI agent working on this project: **read the relevant doc file before implementing a feature** to understand existing patterns, and **update the doc as part of the same task** before calling `markTaskComplete`. The memory system has a standing instruction to enforce this.
