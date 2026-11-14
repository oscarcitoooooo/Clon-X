# Clon de X

A React single-page application that recreates selected X social network screens for a class project.

## Project status

- **Milestone 1:** Main screens, navigation, account pages, and pagination are implemented.
- **Milestone 2:** Firebase Authentication supports Google and username/password accounts. Account registration, tweet publishing, the feed, and following actions use Cloud Firestore.
- **Milestone 3 in progress:** User profiles, profile posts, and the signed-in user's follower list are being connected to Firestore.

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
- Chronological Firestore feed with pagination.
- User profiles with tweets and counters.
- User profiles and their posts loaded from Firestore.
- Followers and following lists loaded from Firestore for the signed-in account.
- Pagination with a maximum of 10 items per page.

The mock data file remains for sample content and screens not yet migrated; current publishing, feed, profile, and follower/following features use Firestore.

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

The `/users/:username` route resolves a public profile through `usernameIndex`, then listens for that user's tweets and sorts them newest first. The `/followers` page uses a collection-group query restricted to relationships whose `followedId` is the signed-in user's ID. A user can read their own outgoing relationships and incoming relationships, but cannot inspect other users' private follow lists.

Follow and unfollow operations update the relationship and both public profile counters in one Firestore transaction. The home and profile pages listen to the profile document, so the counters update in real time. Firestore rules require the relationship and matching counter changes to happen together and reject counter-only changes. Existing profiles with follow relationships created before counters were maintained must have `followersCount` and `followingCount` initialized to the actual totals once in the Firebase console before using unfollow; the Firebase console uses privileged access and bypasses client rules.
