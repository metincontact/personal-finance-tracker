# Personal Finance Tracker

A personal finance dashboard that tracks, categorises, and visualises spending. Built as a portfolio project.

**Live demo:** https://finance-tracker-matin.vercel.app

---

## Screenshots

> Dashboard — spending overview, trend chart, and category breakdown

![Dashboard](https://github.com/metincontact/personal-finance-tracker/assets/dashboard.png)

---

## Features

- **Dashboard** — monthly stat cards, spending trend (area chart), category breakdown (donut chart)
- **Transactions** — table with month filter, search, CSV export, add & delete
- **Budget** — per-category progress bars with inline limit editing
- **Reports** — bar chart comparison (spent vs budget), monthly summary
- **Error handling** — retry states, toast notifications
- **Responsive** — mobile-friendly with hamburger sidebar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Routing | React Router v7 |
| HTTP | Axios |
| Icons | Lucide React |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Running Locally

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database

### 1. Clone the repo

```bash
git clone https://github.com/metincontact/personal-finance-tracker.git
cd personal-finance-tracker
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://your-neon-connection-string
PORT=3000
```

Run migrations and seed:

```bash
npx prisma db push
npx prisma db seed
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

---

## Project Structure

```
personal-finance-tracker/
├── frontend/src/
│   ├── components/     # Sidebar, ErrorState, ToastStack
│   ├── hooks/          # useToast
│   ├── pages/          # Dashboard, Transactions, Budget, Reports
│   ├── services/       # api.ts (Axios)
│   └── types/          # TypeScript interfaces
│
├── backend/src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   └── lib/            # Prisma client
│
└── backend/prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Roadmap

- [ ] Salt Edge Open Banking integration — real bank transaction sync
- [ ] Connect Bank flow (OAuth)
