# 🛡️ AfriStory Audit Report

**Date:** 2026-05-17
**Auditor:** Jules (Software Engineer)
**Scope:** Security, Code Quality, Feature Completeness, Infrastructure.

---

## 1. 🚨 Security Audit (Firestore & Storage)

Critical vulnerabilities were identified in the security rules:

| Vulnerability | Description | Risk |
|---------------|-------------|------|
| **Pirate Reader** | Premium chapters have no `read` restrictions in rules, allowing anyone to bypass the paywall. | High |
| **Author Spoofing** | Any user with an artist role can create or update chapters for *any* work, not just their own. | High |
| **Storage Breach** | Any authenticated user can upload/overwrite covers and chapter images for any `workId`. | High |
| **Unprotected Profile** | `isVerified` and `role` fields in the `users` collection lack strict write protection in many paths. | Medium |
| **Missing ID Validation** | `isValidId` function is defined but never actually applied to match patterns. | Low |
| **Stats Manipulation** | Authors can manually increment `views` and `likes` via direct Firestore updates. | Medium |

---

## 2. 💻 Code Quality & Architecture

### Race Conditions
Five critical "Get-then-Update" patterns were found in `userService.ts`:
- `addFollower` / `removeFollower`
- `addToCollection` / `removeFromCollection`
- `joinBookClub`
- `joinContest`
- `addCommentReaction`

These will result in data loss if multiple users interact simultaneously. **Recommendation:** Switch to `arrayUnion` / `arrayRemove` or `runTransaction`.

### Type Fragmentation
Type definitions are scattered and duplicated:
- `UserProfile` duplicated in `roles.ts` and `types.ts`.
- `Work` interface redefined locally in `workService.ts`.
- `AfriCoinTransaction` duplicated.
- **Recommendation:** Centralize all models in `src/lib/types.ts` and export/import them everywhere.

### Logic Inconsistency
- **AfriCoins:** `purchaseCoins` is implemented in both `workService` and `subscriptionService` with different logic (one is entirely client-side).
- **Ratings:** `addReview` updates the average rating without a transaction, leading to corrupted averages.

---

## 3. 🏗️ Infrastructure & Dependencies

- **Linting:** `npm run lint` returns **230+ errors**. Codebase has significant amounts of unused imports, unused variables, and potential "undefined" access.
- **Testing:** **Zero tests found.** Documentation mentions `npm test`, but the script is missing from `package.json`. Playwright is installed but unconfigured.
- **Environment:** Heavy reliance on `.env` with many hardcoded fallbacks in production code.

---

## 4. ☁️ Cloud Functions (Backend)

- **Placeholder Code:** Email services (`sendEmail`, `sendWelcomeEmail`, etc.) are empty shells that only log to the console.
- **Cloudinary:** No validation on the `folder` parameter in `uploadImage`, allowing potential file path injection.
- **Batch Limits:** `cleanupOldNotifications` uses a single batch for deletion, which will crash if more than 500 documents are targeted.

---

## 5. 🗺️ Routing & Permissions

- `/work/:id/edit` is only protected by `requireAuth`, allowing any logged-in user to see the edit UI (though Firestore might block the save).
- `/library` protection is redundant (allows all roles).
- Inconsistent naming between `/explore` and `/explorer`.

---

## ✅ Recommendations Summary

1. **Fix Rules Immediately:** Restrict chapter reading to owners or those with an "unlock" record. Enforce ownership on chapter creation.
2. **Transaction Refactor:** Use Firestore `FieldPath` operations or Transactions for all array and counter updates.
3. **Consolidate Types:** Remove duplicate interfaces to ensure a single source of truth.
4. **Cleanup:** Run a major linting/formatting pass to remove the 230+ dead-code errors.
5. **Implement Tests:** At minimum, add unit tests for the core `subscriptionService` and `workService` logic.
