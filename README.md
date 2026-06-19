# KATAAR 🎫

**Get E-Tickets Faster with AI**

KATAAR is a next-generation e-ticketing platform built with Next.js, Prisma, and the Vercel AI SDK. By integrating Google Gemini's live web grounding capabilities, KATAAR allows users to conversationally search for, discover, and book tickets for any museum, art gallery, monument, or historic location worldwide—bypassing traditional complicated booking forms.

---

## 🌟 Key Features

- **Conversational Booking Interface:** Chat with an AI agent to search for monuments, verify timings, and book tickets instantly.
- **Live Google Grounding:** The AI engine accesses live Google Search to provide up-to-date operating hours and ticketing information for any global attraction.
- **Dynamic Maps Integration:** Visual verification of the attraction location directly within the booking panel via Google Maps.
- **Soft Luxury UI:** A premium, glassmorphism-inspired aesthetic with dynamic micro-animations built using Tailwind CSS v4.
- **Secure Authentication:** Robust user session management using NextAuth.js.
- **Instant QR Code Issuance:** Post-payment, tickets are instantly generated with unique QR codes for seamless entry.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions)
- **AI Integration:** Vercel AI SDK (`ai`, `@ai-sdk/google`)
- **Model:** Google Gemini 2.5 Flash Grounded
- **Database:** PostgreSQL (hosted via Supabase)
- **ORM:** Prisma Client with `@prisma/adapter-pg`
- **Authentication:** NextAuth.js (v5 Beta)
- **Styling:** Tailwind CSS v4 + Lucide Icons

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18 or higher) and `npm` installed. You will also need a PostgreSQL database (e.g., Supabase, Neon) and a Google AI Studio API key.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/kataar-app.git
cd kataar-app
npm install
```

### 3. Environment Variables
Copy the provided `.env.example` file to create a local `.env.local` file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your secure credentials:
- `DATABASE_URL` (Your primary Postgres connection string or transaction pooler)
- `DIRECT_URL` (Your session-mode connection string for migrations)
- `GEMINI_API_KEY` (Your Google Gemini API key)
- `AUTH_SECRET` (A 32-character random string generated via `openssl rand -base64 32`)

> **Note:** Never commit `.env.local` to version control.

### 4. Database Setup
Push the Prisma schema to your remote database to create the required tables:

```bash
npx prisma db push
```

### 5. Start Development Server
Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

---

## 🛡️ Security Note

This repository is structured for production deployment. Sensitive credentials must be handled strictly through environment variables. The `prisma.config.ts` configuration routes standard migrations appropriately. Ensure that all `.env*` files (except `.env.example`) are added to your `.gitignore`.

---

*Built for speed. Built for convenience. No more lines with KATAAR.*
