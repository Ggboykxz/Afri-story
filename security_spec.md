# Nexus-Hub Security Specification

## Data Invariants
1. A chapter cannot exist without a parent Work.
2. Only `artist_pro` or `artist_draft` roles can create Works.
3. Only the author of a Work can edit or delete it.
4. Premium chapters require either a Pro subscription or Nexus-Coins to unlock (logic enforced in app, but rules must prevent unauthorized reading).
5. Forums with `isPremium: true` are only readable by users with a `premium` badge.

## Security Rule Helpers
- `isSignedIn()`: User is authenticated.
- `isOwner(userId)`: `request.auth.uid == userId`.
- `hasRole(role)`: User in Firestore has the specified role.
- `isValidId(id)`: String check + size check + regex check.

## The Dirty Dozen Payloads (Targeting Firestore)
1. **The ID Injector**: Attempting to create a work with a 2MB string as ID.
2. **The Spoof Author**: Creating a work with `authorId` set to another user.
3. **The Role Escalator**: A reader trying to update their role to `artist_pro`.
4. **The Ghost Field**: Adding `isVerified: true` to a user profile.
5. **The Price Slasher**: Updating a chapter's `price` to 0 as a reader.
6. **The Views Inflator**: Any user incrementing `views` by 1,000,000.
7. **The Pirate Reader**: Reading a premium chapter without an unlock record.
8. **The Forum Crasher**: Posting 1MB of text in a comment.
9. **The Spoiler Bomb**: Mass posting spoilers in a non-spoiler forum.
10. **The Orphan Maker**: Creating a chapter for a non-existent Work ID.
11. **The Time Traveler**: Setting `createdAt` to a future date.
12. **The Metadata Hack**: Changing `isPro` on a work to bypass validation.
