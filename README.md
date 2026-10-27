# Clon de X

A React single-page application that recreates selected X social network screens for a class project.

## Milestone 1

This milestone focuses on the interface and navigation. It uses mock data for users, tweets, followers, and following lists. Authentication, publishing, and follow actions are presentational and are not saved yet.

## Technologies

- React
- Vite
- React Router
- Bootstrap 5.3.8
- Firebase integration is planned for a later milestone.

## Features

- Registration and login screens.
- Home screen with follower and following counters.
- Tweet composition screen.
- Chronological feed with pagination.
- User profile with tweets and counters.
- Alphabetically sorted followers and following lists.
- Pagination with a maximum of 10 items per page.

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

## Getting started

Clone the repository and enter the project folder:

```bash
git clone https://github.com/oscarcitoooooo/Clon-X.git
cd Clon-X
```

Install dependencies and start the development server.

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

## Project structure

```text
src/
  components/  Reusable tweet, user, and pagination components
  data/        Mock users, tweets, followers, and following data
  pages/       Application screens
  App.jsx      Routes and shared application layout
  main.jsx     Application entry point
```

## Team contributions

- **Oscar:** application shell, shared routes, mock data, account and publishing screens, and project documentation.
- **Yoseth:** tweet and user cards, feed, user profile, followers and following lists, and pagination.