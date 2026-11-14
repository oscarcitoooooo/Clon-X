# Clon de X

A React single-page application that recreates selected X social network screens for a class project.

## Project status

- **Milestone 1:** Main screens, navigation, account pages, and pagination are implemented.
- **Milestone 2:** Firebase Authentication supports Google and username/password accounts. Account registration, tweet publishing, the feed, and following actions use Cloud Firestore.
- **Milestone 3:** Firestore feed filtering, public profile relationship lists, follow actions, and real-time counters are implemented. The build and lint checks pass; complete the two-account manual review described below before submitting.

## Technologies

- React and Vite
- React Router
- Bootstrap 5
- Firebase Authentication
- Cloud Firestore

## Features

- Registration and login screens.
- Google sign-in and username/password sign-in.
- Protected routes and persistent Firebase sessions.
- Home screen with follower and following counters.
- Tweet composition screen.
- Real-time chronological feed containing only the signed-in user's tweets, their followers' tweets, and tweets from users they follow; paginated 10 at a time.
- User profiles with tweets and counters.
- User profiles and their posts loaded from Firestore.
- Paginated follower and following lists on user profiles, sorted by full name.
- Follow/unfollow actions from search, follower lists, and profiles, with live list and counter updates.
- Pagination with a maximum of 10 items per page.

The mock data file remains for sample content and screens not yet migrated; publishing, feed, profiles, and follower/following features use Firestore.

## Firebase setup

1. Copy `.env.example` to `.env.local` in the project root.
2. Replace the example values with the Firebase web app configuration from Firebase Project settings.
3. Enable Google and Email/Password in Firebase Authentication; add `localhost` to the authorized domains for local development.
4. Publish the rules from `firestore.rules` in the Cloud Firestore Rules tab.

Windows PowerShell command to copy the configuration template:

```powershell
Copy-Item .env.example .env.local
```

The `.env.local` file is ignored by Git. Never commit it. Each teammate needs a local copy configured for the shared Firebase project.

The username/password flow uses an internal email-style identifier derived from the username because Firebase's password provider authenticates with an email address. The contact email entered at registration is stored privately in Firestore. Email verification and password recovery are not implemented.

## Getting started

Clone the repository and enter the project folder:

```bash
git clone https://github.com/oscarcitoooooo/Clon-X.git
cd Clon-X
```

**Windows PowerShell:**

```powershell
npm.cmd install
npm.cmd run dev
```

**Other terminals:**

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Routes

| Route | Page |
| --- | --- |
| `/login` | Login |
| `/register` | Registration |
| `/home` | Home |
| `/compose` | Compose a tweet |
| `/feed` | Feed |
| `/following` | Following list |
| `/followers` | Followers list |
| `/users/:username` | User profile and tweets |

## Project structure

```text
src/
  components/  Reusable tweet, user, and pagination components
  data/        Sample content retained for screens not yet migrated
  pages/       Application screens
  firebase.js  Firebase Authentication and Firestore setup
  App.jsx      Routes and shared application layout
  main.jsx     Application entry point
```

## Team contributions

- **Oscar:** application shell, shared routes, Firebase setup, account screens, username search and follow actions, and project documentation.
- **Yoseth:** tweet and user cards, feed, user profile, followers and following lists, and pagination.

## Firestore tweet publishing

Authenticated users can publish tweets to the `tweets` collection in Cloud Firestore. Each document stores the content, author ID, username, and server creation timestamp.

The application validates that a tweet contains text and does not exceed 280 characters. Firestore rules require an authenticated user, verify that the author ID and username match the signed-in user's profile, and prevent tweet updates or deletion.

The feed listens for Firestore changes in real time and displays tweets from newest to oldest. The home page also listens for changes and displays the user's three latest tweets. When a Google user signs in without a Firestore profile, the application creates a public profile with a generated username.

Firestore security rules are maintained in `firestore.rules`. The local Firebase configuration belongs in `.env.local`; do not commit that file.

## Following users with Firestore

The `/following` page searches for an exact username, with or without `@`, and ignores letter case. It resolves the username through `usernameIndex`, displays the public Firestore profile, and lets the signed-in user follow or unfollow that account.

Follow relationships are stored at `follows/{followerId}/following/{followedId}`. Firestore rules prevent users from following themselves, creating duplicate relationships, or changing another user's follow records. The following list updates in real time.

## Firestore profiles and followers

The `/users/:username` route resolves a public profile through `usernameIndex`, then listens for that user's tweets and sorts them newest first. Its community tabs show that profile's follower and following lists, sorted by full name and paginated in groups of 10. The `/followers` page shows accounts that follow the signed-in user; the `/following` page shows accounts they follow. Signed-in users can read public follow relationships, while create/delete rules only permit changes under the signed-in user's own outgoing relationship path.

The feed listens to tweets and to the signed-in user's incoming/outgoing relationships. It displays only tweets authored by the current user, users they follow, or users who follow them; new tweets and follow changes update the feed without a manual refresh. Results are newest first and paginated 10 per page. Follow and unfollow operations update the relationship and both public profile counters in one Firestore transaction. Home and profile pages listen to profile documents, so counters update in real time. Firestore rules require each relationship and matching counter changes to happen together and reject counter-only changes. Existing profiles with follow relationships created before counters were maintained must have `followersCount` and `followingCount` initialized to actual totals once in Firebase Console before using unfollow; Console operations use privileged access and bypass client rules. Private email data remains under `privateUsers/{uid}` and readable only by its owner.

## Final verification

Run these checks from the project folder:

```powershell
npm.cmd run build
npm.cmd run lint
```

Then use two registered accounts and verify: follow/unfollow each other and confirm both profile counters and lists update; publish tweets from each account and confirm the feed shows only self/followers/following authors; refresh and confirm the data persists; create more than 10 matching tweets and relationship entries to check next/previous pagination; and confirm a third unrelated account's tweets do not appear. Verify private email data remains inaccessible from the other account. Publish the rules in `firestore.rules` to Firebase before testing these features.
