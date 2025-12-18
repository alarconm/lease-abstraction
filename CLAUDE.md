# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Commercial Real Estate (CRE) Lease Abstraction Tool - extracts business terms from lease documents using AI (Gemini 3 Flash) and stores them in a database for review and export.

## Tech Stack

- **Backend:** Express.js + TypeScript
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Database:** PostgreSQL via Neon (serverless) with Drizzle ORM
- **AI:** Google Gemini 3 Flash API (gemini-3-flash-preview)
- **Excel Export:** ExcelJS

## Common Commands

```bash
# Development
npm run dev              # Start backend server (port 3000)
cd client && npm run dev # Start frontend with Vite (port 5173)

# Database
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio to browse data

# Build & Check
npm run check           # TypeScript type checking
npm run build           # Build for production
```

## Project Structure

```
server/
  index.ts              # Express server entry point
  db/schema.ts          # Drizzle database schema (properties, tenants, leases, abstracts)
  db/index.ts           # Database connection and exports
  routes/               # API endpoints
  services/
    gemini.ts           # Gemini API integration
    lease-knowledge.ts  # Knowledge base for lease extraction (MOST IMPORTANT FOR EXTRACTION)

client/src/
  App.tsx               # Routes configuration
  components/Layout.tsx # Main layout with navigation
  pages/                # Page components (Home, Import, Search, Abstract, Property)
```

## Key Patterns

### Adding a New Business Term to Extract

1. Add to `LEASE_BUSINESS_TERMS` array in `server/services/lease-knowledge.ts`
2. Add detailed extraction instructions in `LEASE_ABSTRACTION_KNOWLEDGE`
3. Add database field in `server/db/schema.ts` (leaseAbstracts table)
4. Run `npm run db:push`
5. Update export in `server/routes/export.ts`
6. Update UI in `client/src/pages/AbstractPage.tsx`

### Modifying Extraction Behavior

Edit `server/services/lease-knowledge.ts`:
- `LEASE_ABSTRACTION_KNOWLEDGE` - The full knowledge base sent to Gemini
- `LEASE_ABSTRACTION_SYSTEM_PROMPT` - System prompt wrapper

### Database Operations

Using Drizzle ORM pattern:
```typescript
import { db, properties, eq } from "../db";

// Select
const result = await db.select().from(properties).where(eq(properties.id, id));

// Insert
const newItem = await db.insert(properties).values({ name: "Test" }).returning();

// Update
await db.update(properties).set({ name: "New" }).where(eq(properties.id, id));
```

### API Route Pattern

Routes are in `server/routes/`. Each exports an Express router:
```typescript
import express from "express";
import { db, tableName, eq } from "../db";

export const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await db.select().from(tableName);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
```

### Frontend Data Fetching

Using TanStack Query:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["resource", id],
  queryFn: async () => {
    const res = await fetch(`/api/resource/${id}`);
    return res.json();
  },
});
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `GEMINI_API_KEY` - Google AI Studio API key

## Business Terms Extracted

The tool extracts 35+ commercial lease terms including:
- Tenant Name, Suite Number, RSF
- Lease/Rent Commencement Dates
- TI Allowance, Expense Recovery Type, Base Year
- Guarantor, Letter of Credit, Signing Entity
- Termination Options, Renewal Options, Parking Rights
- Right of First Offer/Refusal, Exclusive Use
- Rent Schedule with periods and escalations

Full list in `server/services/lease-knowledge.ts`.

## Amendment Handling

When processing amendments:
1. Process documents in order (original lease first, then amendments)
2. Track which terms are modified
3. Store original values with strikethrough notation
4. Store new values with effective dates
5. All changes include citations to source document

## Future Integrations Planned

- Box API (document storage)
- Salesforce (CRM sync)
- User authentication
- PDF viewer alongside abstract

## Notes

- Created December 17, 2025
- Uses latest Gemini 3 Flash model (released same day)
- Designed for iteration with Claude Code
- See PROJECT_PLAN.md for detailed architecture and roadmap
