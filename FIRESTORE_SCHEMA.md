# AfriStory - Firestore Schema

## Collections Principales

### users
Profil utilisateur
- `userId` (string) - UID Firebase
- `email` (string)
- `displayName` (string)
- `photoURL` (string, optionnel)
- `role` (string) - visitor/reader/reader_premium/reader_supporter/artist_draft/artist_pro/artist_mentor/enterprise/moderator/supervisor/admin
- `afriCoins` (number)
- `badges` (array) - badge IDs
- `subscription` (string, optionnel) - standard/premium/supporter
- `subscriptionExpiresAt` (timestamp)
- `createdAt` (timestamp)
- `following` (array<string>)
- `favorites` (array<string>)
- `bio` (string, optionnel)
- `unlockedChapters` (array<string>, optionnel)
- `statistics` (object, optionnel)
  - `totalReads` (number)
  - `totalLikes` (number)
  - `totalComments` (number)
  - `readingTime` (number)
- `preferences` (object)
  - `notifications` (boolean)
  - `emailNotifications` (boolean)
  - `darkMode` (boolean)

### users/{userId}/favorites
- Document ID auto-généré
- `workId` (string)
- `addedAt` (timestamp)

### users/{userId}/reading_history
- Document ID auto-généré
- `workId` (string)
- `chapterId` (string)
- `readAt` (timestamp)

---

### works
Œuvres (webtoons, BDs, romans)
- `id` (string) - Document ID
- `title` (string)
- `description` (string)
- `authorId` (string)
- `authorName` (string)
- `coverUrl` (string)
- `type` (string) - webtoon/bd/roman
- `genres` (array<string>)
- `status` (string) - ongoing/completed/hiatus
- `language` (string) - french/english/other
- `maturityRating` (string) - everyone/teen/mature
- `isPremium` (boolean)
- `isExclusive` (boolean)
- `featured` (boolean)
- `totalChapters` (number)
- `totalViews` (number)
- `totalLikes` (number)
- `averageRating` (number)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### works/{workId}/chapters
Chapitres
- `id` (string) - Document ID
- `title` (string)
- `number` (number)
- `publishedAt` (timestamp)
- `isPremium` (boolean)
- `unlockPrice` (number, optionnel)
- `images` (array<string>) - URLs Firebase Storage
- `viewCount` (number)

### works/{workId}/chapters/{chapterId}/comments
Commentaires de chapitre
- `id` (string) - Document ID
- `userId` (string)
- `userName` (string)
- `userPhotoURL` (string)
- `content` (string)
- `containsSpoiler` (boolean)
- `createdAt` (timestamp)

### works/{workId}/reviews
Critiques
- `id` (string) - Document ID
- `userId` (string)
- `userName` (string)
- `rating` (number) 1-5
- `comment` (string, optionnel)
- `containsSpoiler` (boolean)
- `createdAt` (timestamp)

### works/{workId}/exclusives
Contenus exclusifs (codes promo, etc)
- `code` (string)
- `type` (string) - chapter_access/promo
- `value` (number)
- `maxUses` (number)
- `usedBy` (array<string>)
- `expiresAt` (timestamp)

---

### forums
Catégories de forum
- `id` (string)
- `name` (string)
- `description` (string)
- `icon` (string)
- `isPremium` (boolean)
- `order` (number)
- `threadCount` (number)

### forum_threads
Sujets de forum
- `id` (string)
- `title` (string)
- `content` (string)
- `authorId` (string)
- `authorName` (string)
- `categoryId` (string)
- `isPinned` (boolean)
- `isLocked` (boolean)
- `replyCount` (number)
- `lastReplyAt` (timestamp)
- `createdAt` (timestamp)

### forum_replies
Réponses aux sujets
- `id` (string)
- `threadId` (string)
- `content` (string)
- `authorId` (string)
- `authorName` (string)
- `isAnswer` (boolean)
- `createdAt` (timestamp)

---

### notifications
- `id` (string)
- `userId` (string)
- `type` (string) - like/comment/follow/review/chapter/subscription/donation
- `message` (string)
- `link` (string, optionnel)
- `isRead` (boolean)
- `createdAt` (timestamp)

---

### conversations
Messages directs
- `id` (string)
- `participants` (array<string>)
- `lastMessage` (string)
- `lastMessageAt` (timestamp)
- `createdAt` (timestamp)

### conversations/{conversationId}/messages
- `id` (string)
- `senderId` (string)
- `content` (string)
- `createdAt` (timestamp)

---

### collections
Collections utilisateur
- `id` (string)
- `userId` (string)
- `name` (string)
- `description` (string)
- `workIds` (array<string>)
- `isPublic` (boolean)
- `createdAt` (timestamp)

### book_clubs
Clubs de lecture
- `id` (string)
- `name` (string)
- `workId` (string)
- `description` (string)
- `currentChapter` (number)
- `nextMeeting` (timestamp)
- `members` (array<string>)
- `status` (string) - active/archived
- `createdAt` (timestamp)

### contests
Concours
- `id` (string)
- `title` (string)
- `description` (string)
- `type` (string) - art/story/cosplay
- `startDate` (timestamp)
- `endDate` (timestamp)
- `status` (string) - upcoming/active/ended
- `prizes` (array<string>)
- `rules` (string)
- `entries` (array<object>)
- `createdAt` (timestamp)

---

### ama_sessions
Sessions Ask Me Anything
- `id` (string)
- `artistId` (string)
- `title` (string)
- `description` (string)
- `durationMinutes` (number)
- `endTime` (timestamp)
- `status` (string) - scheduled/active/ended
- `questions` (array<object>)
- `createdAt` (timestamp)

---

### scheduled_chapters
Chapitres planifiés
- `id` (string)
- `workId` (string)
- `title` (string)
- `publishDate` (timestamp)
- `status` (string) - scheduled/published/cancelled

---

### recruitment_ads
Annonces de collaboration
- `id` (string)
- `authorId` (string)
- `title` (string)
- `description` (string)
- `lookingFor` (array<string>) - artist/writer/editor/translator
- `status` (string) - open/closed
- `createdAt` (timestamp)

### team_members
Membres d'équipe de création
- `id` (string)
- `workId` (string)
- `userId` (string)
- `role` (string)
- `joinedAt` (timestamp)

---

### reports
Signalements
- `id` (string)
- `reporterId` (string)
- `targetType` (string) - work/chapter/comment/forum_thread/reply/profile
- `targetId` (string)
- `reason` (string) - spam/harassment/inappropriate/spoiler/plagiarism/copyright
- `status` (string) - pending/reviewed/resolved/dismissed
- `createdAt` (timestamp)

### moderation_actions
Actions de modération
- `id` (string)
- `userId` (string)
- `action` (string) - warning/delete/temporary_ban/permanent_ban
- `reason` (string)
- `moderatorId` (string)
- `expiresAt` (timestamp, optionnel)
- `createdAt` (timestamp)

---

### verification_requests
Demandes de vérification artiste
- `id` (string)
- `artistId` (string)
- `portfolioUrl` (string)
- `description` (string)
- `status` (string) - pending/approved/rejected
- `reviewedBy` (string, optionnel)
- `createdAt` (timestamp)

---

### africoins_transactions
Historique des transactions AfriCoins
- `id` (string)
- `userId` (string)
- `amount` (number)
- `type` (string) - purchase/donation/bonus/gift
- `description` (string)
- `createdAt` (timestamp)

### comment_reactions
Réactions aux commentaires
- `id` (string)
- `commentId` (string)
- `userId` (string)
- `type` (string) - like/love/haha/wow/sad/angry
- `createdAt` (timestamp)