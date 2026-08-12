# The Register — School Management System

A full-stack school management app: Node.js + Express API backed by SQLite (`better-sqlite3`), with a vanilla HTML/CSS/JS frontend that talks to it over REST. Same navy/gold ledger design as the static version, now wired to a real database instead of mock data.

## Stack
- **Backend:** Node.js, Express, better-sqlite3, bcrypt (password hashing), jsonwebtoken (auth)
- **Frontend:** Vanilla HTML/CSS/JS, served as static files by Express, talking to the API with `fetch`

## Getting started

```bash
npm install
npm run seed     # creates the database, seeds an admin user + sample students/teachers/classes
npm start         # runs the server on http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

**Demo login:** `admin` / `admin123`

## Project structure

```
the-register/
├── server.js              # Express app entry point
├── db/
│   └── database.js        # SQLite schema, connection, and seed data
├── middleware/
│   └── auth.js             # JWT verification + role guard
├── routes/
│   ├── auth.js              # POST /api/auth/login, GET /api/auth/me
│   ├── students.js          # CRUD for students
│   ├── teachers.js          # CRUD for teachers
│   ├── classes.js           # CRUD for classes
│   └── dashboard.js         # GET /api/dashboard/stats
└── public/
    ├── index.html          # Landing page + login modal + dashboard shell
    ├── css/style.css
    └── js/
        ├── main.js          # Auth, ledger animation, session handling
        └── dashboard.js     # Dashboard data loading + CRUD modals
```

## API reference

All routes below `/api/students`, `/api/teachers`, `/api/classes`, `/api/dashboard` require a
`Authorization: Bearer <token>` header, obtained from `POST /api/auth/login`.

| Method | Route                  | Description             |
|--------|------------------------|--------------------------|
| POST   | `/api/auth/login`      | Log in, returns JWT      |
| GET    | `/api/auth/me`         | Current user from token  |
| GET    | `/api/students`        | List students (`?search=`) |
| POST   | `/api/students`        | Create a student         |
| PUT    | `/api/students/:id`    | Update a student         |
| DELETE | `/api/students/:id`    | Delete a student         |
| GET/POST/PUT/DELETE | `/api/teachers`, `/api/classes` | Same pattern as students |
| GET    | `/api/dashboard/stats` | Overview stats for the dashboard |

## Notes for going further
- Passwords are hashed with bcrypt; JWTs are signed with `JWT_SECRET` in `.env` — change this before deploying anywhere real.
- The frontend keeps the JWT in `localStorage`; fine for a demo/portfolio piece, but for production you'd want an httpOnly cookie instead.
- `db/register.db` is created automatically on first run — delete it and re-run `npm run seed` to reset all data.
