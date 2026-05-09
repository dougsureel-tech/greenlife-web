# greenlife-web

Customer-facing public site for **Green Life Cannabis** (Wenatchee, WA — WSLCB #414755).

Sister repo: `seattle-cannabis-web` (same shape, Seattle store).

## Stack

- Next.js 16 App Router · TypeScript · Tailwind v4
- Postgres (Neon) via raw `postgres` driver in `lib/db.ts` — no ORM
- Clerk for customer auth (loyalty + rewards portal)
- Resend for transactional email
- Twilio for OTP / customer SMS
- iHeartJane Boost embed at `/menu` (canonical product surface)

## Getting started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Documentation

- **`AGENTS.md`** — architecture, conventions, cross-session coordination protocol
- **`/CODE/CLAUDE.md`** + **`/CODE/RANDOM/OPERATING_PRINCIPLES.md`** — Doug's working norms
- **`/CODE/INCIDENTS.md`** — closed post-mortems (grep first when diagnosing)

## Deploy

Push to `main` triggers automatic Vercel deployment. Verify with:

```bash
curl https://www.greenlifecannabis.com/api/health
```

Expected: `{"ok":true,"version":"X.Y","sha":"...","checks":{...}}`.

## License

Private. All rights reserved by Verve Mgmt LLC (the WSLCB licensee operating Green Life Cannabis).
