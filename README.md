# Personal Finance Tracker

A personal finance dashboard that imports real bank transactions, categorises them automatically, and visualises spending across multiple currencies. Built as a portfolio project.

**Live demo:** https://finance-tracker-matin.vercel.app

---

## Features

- **Dashboard** — monthly stat cards, spending trend (area chart), category breakdown (donut chart)
- **Transactions** — table with month filter, search, CSV export, add, edit & delete
- **PDF Import** — upload your Erste Bank statement PDF to sync real transactions automatically
- **Budget** — per-category progress bars with inline limit editing
- **Reports** — bar chart comparison (spent vs budget), monthly summary
- **Multi-currency** — live exchange rates; display amounts in PLN, USD, EUR, TRY or AZN
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
| PDF Parsing | pdf-parse v2 |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## PDF Import

The app parses Erste Bank (formerly Santander Poland) statement PDFs. Go to **Transactions → Import PDF** and upload your statement — transactions are extracted, categorised, and deduplicated automatically.

Supported merchants are auto-categorised (Biedronka, Lidl → food; ZTM, Bolt → transport; Allegro → shopping; etc.).

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
JWT_SECRET=your-random-secret
ADMIN_PASSWORD=your-password
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

## Tests

```bash
# Backend (Jest + Supertest)
cd backend && npm test

# Frontend (Vitest + React Testing Library)
cd frontend && npm test

# E2E (Playwright)
cd frontend && npx playwright test
```

---

## Project Structure

```
personal-finance-tracker/
├── frontend/src/
│   ├── components/     # Sidebar, ErrorState, ToastStack, Skeleton
│   ├── context/        # CurrencyContext (live FX rates, multi-currency fmt)
│   ├── hooks/          # useToast
│   ├── pages/          # Dashboard, Transactions, Budget, Reports
│   ├── services/       # api.ts (Axios)
│   └── types/          # TypeScript interfaces
│
├── backend/src/
│   ├── controllers/    # transactionController, importController
│   ├── routes/         # transactions, import
│   ├── services/       # transactionService, importService (PDF parser)
│   └── lib/            # Prisma client
│
└── backend/prisma/
    ├── schema.prisma
    └── seed.ts
```
