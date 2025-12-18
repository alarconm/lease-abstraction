# Lease Abstraction Tool - Project Plan

## For James Childress, Senior Managing Director @ Newmark Portland

---

## About This Project

**Created:** December 17, 2025
**Built by:** Michael (alarconm) with Claude Code (Claude Opus 4.5)
**Purpose:** AI-powered commercial real estate lease abstraction tool
**Deployment:** Replit with built-in PostgreSQL
**GitHub:** https://github.com/alarconm/lease-abstraction

### Context: Newmark's Lease Abstraction Workflow

Newmark handles lease abstraction at scale - reconciling rent rolls, Argus rent rolls, and lease abstracts for portfolio acquisitions (example: 16-property portfolio with 300+ tenants). This tool aims to automate the initial extraction using AI, providing:

- Comprehensive reviews of lease documents
- Full review of source documents with citations
- Identification of termination/contraction options
- Below-market renewal options flagging
- Documentation of discrepancies

### What This Tool Does

1. **OCR & Parsing** - Upload commercial leases (PDF, Word, scanned images)
2. **AI Extraction** - Gemini 3 Flash extracts 35+ business terms with inline citations
3. **Amendment Tracking** - Tracks how amendments modify original terms (strikethrough notation)
4. **Database Storage** - PostgreSQL for search and retrieval
5. **Abstract Review** - Web interface to view, search, and manually correct
6. **Export** - Excel files matching your existing abstract and rent roll templates

---

## James Childress - Profile

**Title:** Senior Managing Director, Newmark Portland
**Specialization:** Office leasing, investment sales, capital markets
**Email:** james.childress@nmrk.com

### Recent Notable Transactions

1. **Pacwest Office Tower (October 2025)**
   - 30-story, 547,992 SF Class A office building
   - 1211 SW 5th Avenue, Portland CBD
   - Portland's fourth-tallest office building
   - Tenants: legal, banking, wealth management, investment firms

2. **Willamette Marketplace (September 2025)**
   - Mixed-use property in West Linn, Oregon
   - Medical office and retail components

### Production Tech Stack at Newmark
- **Box** - Document storage
- **Salesforce** - CRM and deal tracking
- Future integration targets for this tool

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  - Vite + TypeScript + Tailwind CSS                         │
│  - TanStack Query for data fetching                         │
│  - React Router for navigation                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  - TypeScript                                                │
│  - Multer for file uploads                                   │
│  - ExcelJS for spreadsheet generation                        │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │ Gemini API                         │ Database
         ▼                                    ▼
┌─────────────────┐              ┌─────────────────────────────┐
│  Gemini 3 Flash │              │   PostgreSQL (Replit)       │
│  - Document OCR │              │  - Drizzle ORM              │
│  - Term Extract │              │  - Properties, Tenants,     │
│  - JSON output  │              │    Leases, Abstracts        │
└─────────────────┘              └─────────────────────────────┘
```

---

## Replit Deployment

### Quick Start on Replit

1. **Fork/Import the repo** from GitHub: https://github.com/alarconm/lease-abstraction

2. **Add PostgreSQL Database:**
   - Click "Tools" in left sidebar
   - Click "PostgreSQL"
   - Click "Create Database"
   - Replit auto-populates `DATABASE_URL`

3. **Add Gemini API Key:**
   - Go to "Secrets" (lock icon in Tools)
   - Add `GEMINI_API_KEY` with your key from https://aistudio.google.com/apikey

4. **Run the app:**
   - Click "Run" button
   - App starts on port 3000

5. **Initialize database:**
   - Open Shell and run: `npm run db:push`

### Replit Files

- `.replit` - Run configuration
- `replit.nix` - System dependencies

---

## Tech Stack (AI-Native First)

| Technology | Why |
|------------|-----|
| **Gemini 3 Flash** | Released 12/17/2025, best price/performance for document processing |
| **TypeScript** | Type safety, better Claude Code assistance |
| **Drizzle ORM** | Modern, type-safe, works great with AI coding |
| **PostgreSQL** | Replit's built-in database, production-ready |
| **React + Vite** | Fast development, modern patterns |
| **TanStack Query** | Handles caching, refetching automatically |
| **Tailwind CSS** | Rapid UI development |

### AI-Native Approach

This project uses AI at every level:
- **Gemini 3 Flash** for document extraction
- **Claude Code** for development and iteration
- **Anthropic Agents SDK** compatible for future automation

---

## Project Structure

```
lease-abstraction/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/        # Layout, UI components
│   │   ├── pages/             # Home, Import, Search, Abstract, Property
│   │   ├── App.tsx            # Routes
│   │   └── main.tsx           # Entry point
│   └── index.html
├── server/                    # Backend Express app
│   ├── db/
│   │   ├── schema.ts          # Database schema ⭐
│   │   └── index.ts           # DB connection
│   ├── routes/
│   │   ├── properties.ts      # Property CRUD
│   │   ├── tenants.ts         # Tenant CRUD + search
│   │   ├── leases.ts          # File upload + processing
│   │   ├── abstracts.ts       # Abstract retrieval
│   │   └── export.ts          # Excel export ⭐
│   ├── services/
│   │   ├── gemini.ts          # Gemini API calls
│   │   └── lease-knowledge.ts # Knowledge base ⭐⭐⭐
│   └── index.ts               # Server entry
├── Example Documents/         # Sample leases for reference
├── .replit                    # Replit config
├── replit.nix                 # Nix dependencies
├── CLAUDE.md                  # Claude Code guidance
└── PROJECT_PLAN.md            # This file
```

**Key files marked with ⭐ - focus here for customization**

---

## Business Terms Extracted (35+)

### Core Terms
- Tenant Name, Suite Number
- Rentable Square Footage
- Lease/Rent Commencement Dates
- Property Address

### Financial Terms
- Tenant Improvement Allowance
- Expense Recovery Type (Full Service, NNN, Modified Gross)
- Base Year
- Cap on Management Fee
- Expense Gross Up Percentage
- Pro-Rata Share
- Building Denominator

### Legal/Entity
- Guarantor
- Letter of Credit
- Signing Entity

### Rights & Options
- Termination Options
- Parking Rights
- Options to Renew/Extend
- Right of First Offer (ROFO)
- Right of First Refusal (ROFR)
- Right of Purchase Offer
- Right of First Opportunity
- Option Space

### Other Terms
- Exclusive Use
- Additional Charges
- Controllable/Non-Controllable Expenses
- Landlord Relocation Right
- Storage, Signage, Restoration
- Rent Abatement, Free Rent

### Rent Schedule
- Period start/end dates
- Monthly and annual rent
- Rent per square foot
- Escalations

---

## Workflow: How Documents Are Processed

```
1. UPLOAD          2. EXTRACT           3. REVIEW           4. EXPORT
┌─────────┐       ┌─────────┐         ┌─────────┐        ┌─────────┐
│  PDF    │──────▶│ Gemini  │────────▶│  Web    │───────▶│  Excel  │
│  Word   │       │ 3 Flash │         │   UI    │        │  .xlsx  │
│  Image  │       │   AI    │         │         │        │         │
└─────────┘       └─────────┘         └─────────┘        └─────────┘
                       │
                       ▼
                 ┌─────────┐
                 │ Postgres│
                 │   DB    │
                 └─────────┘
```

1. Upload lease documents via `/import` page
2. Gemini extracts terms with citations
3. Review on `/abstract/:id` page, make corrections
4. Export to Excel matching your templates

---

## Key File: lease-knowledge.ts

**This is the most important file for extraction quality.**

Location: `server/services/lease-knowledge.ts`

Contains:
- List of 35+ business terms
- Definitions for each term
- Extraction instructions
- Citation format requirements
- System prompt for Gemini

**To improve extraction:**
1. Edit term definitions to be more specific
2. Add examples of what to look for
3. Add edge cases or common variations
4. Test with real documents and iterate

---

## Working with Claude Code

### Quick Commands

```bash
npm run dev          # Start development
npm run db:push      # Push schema changes
npm run db:studio    # Browse database
npm run check        # Type check
```

### Common Requests for Claude Code

**"Add a new term to extract"**
1. Add to `LEASE_BUSINESS_TERMS` in lease-knowledge.ts
2. Add definition to knowledge base
3. Add field to schema.ts
4. Run `npm run db:push`
5. Update export.ts

**"Change Excel export format"**
- Edit `server/routes/export.ts`

**"Fix extraction for [term]"**
- Edit knowledge base instructions in lease-knowledge.ts

**"Connect to Box API"**
- Add Box SDK, create integration service

**"Add Salesforce sync"**
- Add jsforce package, create sync routes

---

## Phase Roadmap

### Phase 1: Core (Current) ✅
- [x] Project structure
- [x] Database schema
- [x] Gemini integration
- [x] File upload
- [x] Abstract extraction
- [x] Excel export
- [x] Basic UI

### Phase 2: Polish
- [ ] Test with James's real lease documents
- [ ] Tune extraction prompts
- [ ] Manual correction UI
- [ ] Amendment strikethrough display
- [ ] Batch processing
- [ ] Progress indicators

### Phase 3: Production
- [ ] User authentication
- [ ] Box integration
- [ ] Salesforce integration
- [ ] PDF viewer side-by-side
- [ ] Audit trail

---

## API Reference

### Properties
```
GET    /api/properties          List all
GET    /api/properties/:id      Get with tenants
POST   /api/properties          Create
PUT    /api/properties/:id      Update
DELETE /api/properties/:id      Delete
```

### Tenants
```
GET    /api/tenants             List (filter by propertyId)
GET    /api/tenants/search?q=   Search
GET    /api/tenants/:id         Get with abstract
POST   /api/tenants             Create
PUT    /api/tenants/:id         Update
DELETE /api/tenants/:id         Delete
```

### Leases
```
GET    /api/leases/tenant/:id   List for tenant
POST   /api/leases/upload/:id   Upload documents
POST   /api/leases/process/:id  Run AI extraction
DELETE /api/leases/:id          Delete
```

### Export
```
GET    /api/export/abstract/:tenantId     Excel abstract
GET    /api/export/rent-roll/:propertyId  Excel rent roll
```

---

## Resources

- **Gemini API:** https://ai.google.dev/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs
- **TanStack Query:** https://tanstack.com/query/latest
- **Tailwind CSS:** https://tailwindcss.com/docs
- **ExcelJS:** https://github.com/exceljs/exceljs
- **Newmark:** https://www.nmrk.com

---

## Contact

**Project built for:** James Childress @ Newmark Portland
**Built by:** Michael (alarconm)
**Using:** Claude Code with Claude Opus 4.5
**Date:** December 17, 2025

*This project uses Gemini 3 Flash (released 12/17/2025) and is designed for AI-native development and iteration.*
