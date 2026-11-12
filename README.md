# FitHub Pro — Gym Management System

A full-stack gym management application with an admin dashboard and member portal.

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, GSAP, Lucide Icons |
| Backend  | Node.js, Express, Better-SQLite3, JWT, Bcrypt   |
| Database | SQLite                                          |

## Features

- **Admin Dashboard** — overview stats, member management (CRUD), expiry notifications
- **Member Portal** — personal dashboard with membership details
- **Auth** — JWT-based login with role-based access (admin / member)
- **Security** — Helmet, CORS, rate limiting, bcrypt password hashing
- **Photo Uploads** — member profile photos via Multer

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Installation

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Seed the Database

```bash
npm run seed
```

### Run in Development

```bash
# Terminal 1 — backend
npm run dev:backend

# Terminal 2 — frontend
npm run dev:frontend
```

### Run Tests

```bash
npm test
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, rate limiter, uploads, errors
│   │   ├── routes/        # API routes
│   │   ├── seeds/         # Database seeder
│   │   └── server.js      # Entry point
│   ├── tests/             # API & unit tests
│   └── uploads/           # Member photos
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context
│   │   ├── hooks/         # Custom hooks (GSAP)
│   │   ├── pages/         # Admin & member pages
│   │   ├── services/      # API client
│   │   └── utils/         # Helpers
│   └── index.html
└── package.json           # Root scripts
```

## License

MIT
