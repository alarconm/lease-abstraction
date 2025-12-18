# Lease Abstraction Tool - Project Plan

## Project Overview

**Created:** December 17, 2025
**Purpose:** AI-powered commercial real estate (CRE) lease abstraction tool
**Status:** Initial prototype ready for iteration

### What This Tool Does

1. **OCR & Parsing** - Upload commercial leases (PDF, Word, scanned images) and extract text using AI
2. **AI Extraction** - Use Gemini 3 Flash (released 12/17/2025) to extract 35+ business terms with citations
3. **Database Storage** - Store extracted data in PostgreSQL for search and retrieval
4. **Abstract Review** - Web interface to view, search, and manually correct extracted data
5. **Export** - Generate Excel files matching your existing abstract and rent roll templates

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
│  Gemini 3 Flash │              │      PostgreSQL (Neon)      │
│  - Document OCR │              │  - Drizzle ORM              │
│  - Term Extract │              │  - Properties, Tenants,     │
│  - Grounding    │              │    Leases, Abstracts        │
└─────────────────┘              └─────────────────────────────┘
```

---

## Tech Stack (AI-Native First)

### Why These Choices

| Technology | Why |
|------------|-----|
| **Gemini 3 Flash** | Latest model (released TODAY 12/17/2025), best price/performance for document processing, native PDF understanding, Google Search grounding for real-time lookups |
| **TypeScript** | Type safety, better Claude Code assistance, catches errors early |
| **Drizzle ORM** | Modern, type-safe, works great with Claude Code |
| **Neon PostgreSQL** | Serverless Postgres, free tier, easy setup |
| **React + Vite** | Fast development, modern patterns |
| **TanStack Query** | Handles caching, refetching, loading states automatically |
| **Tailwind CSS** | Rapid UI development, consistent styling |

### AI-Native Approach

This project was built with an "AI-native" mindset:
- Use AI APIs (Gemini) instead of traditional rule-based extraction
- Leverage structured JSON output from LLMs
- Design prompts as "knowledge bases" that can be iterated on
- Build for iteration with Claude Code

---

## Project Structure

```
lease-abstraction/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── App.tsx            # Main app with routes
│   │   └── main.tsx           # Entry point
│   └── index.html
├── server/                    # Backend Express app
│   ├── db/
│   │   ├── schema.ts          # Database schema (Drizzle)
│   │   └── index.ts           # Database connection
│   ├── routes/
│   │   ├── api.ts             # API router setup
│   │   ├── properties.ts      # Property CRUD
│   │   ├── tenants.ts         # Tenant CRUD + search
│   │   ├── leases.ts          # File upload + processing
│   │   ├── abstracts.ts       # Abstract retrieval + updates
│   │   └── export.ts          # Excel export
│   ├── services/
│   │   ├── gemini.ts          # Gemini API integration
│   │   └── lease-knowledge.ts # Business terms knowledge base
│   └── index.ts               # Server entry point
├── Example Documents/         # Sample files for reference
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── drizzle.config.ts
└── .env.example               # Environment variables template
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Database - Get from Neon (https://neon.tech)
DATABASE_URL=postgresql://user:password@host/database

# Gemini API - Get from Google AI Studio (https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_key_here
```

### 3. Set Up Database

```bash
npm run db:push
```

This creates the database tables using Drizzle.

### 4. Run Development Server

```bash
npm run dev
```

This starts the backend on port 3000. In a separate terminal:

```bash
cd client && npm run dev
```

This starts the frontend on port 5173 with hot reload.

---

## Key Files to Understand

### 1. `server/services/lease-knowledge.ts`

This is the **most important file** for extraction quality. It contains:
- The list of 35+ business terms to extract
- Definitions for each term
- Instructions for how to extract and format data
- The system prompt sent to Gemini

**To improve extraction:** Edit the knowledge base prompts and term definitions.

### 2. `server/services/gemini.ts`

Handles the Gemini API integration:
- Document processing (PDF, images, text)
- API calls with proper configuration
- Response parsing

### 3. `server/db/schema.ts`

Database schema with tables for:
- `properties` - Buildings/properties
- `tenants` - Tenants within properties
- `leases` - Uploaded documents
- `leaseAbstracts` - Extracted terms with citations
- `rentSchedules` - Rent periods over time

### 4. `server/routes/export.ts`

Excel export logic using ExcelJS. Modify this to match your exact Excel templates.

---

## Workflow: How Documents Are Processed

1. **User uploads documents** via `/import` page
2. **Backend stores metadata** in `leases` table with status "pending"
3. **User triggers processing** (or auto-process on upload)
4. **Backend sends document to Gemini** with knowledge base prompt
5. **Gemini extracts terms** and returns structured JSON
6. **Backend stores results** in `leaseAbstracts` and `rentSchedules`
7. **User reviews abstract** on `/abstract/:tenantId` page
8. **User exports** to Excel when ready

---

## Next Steps / TODO

### Phase 1: Core Functionality (Current)
- [x] Basic project structure
- [x] Database schema
- [x] Gemini integration with knowledge base
- [x] File upload handling
- [x] Abstract extraction
- [x] Excel export
- [x] Basic UI for all pages

### Phase 2: Polish & Testing
- [ ] Test with real lease documents
- [ ] Tune Gemini prompts for accuracy
- [ ] Add manual correction UI for abstracts
- [ ] Add amendment tracking UI (strikethrough display)
- [ ] Batch processing for multiple documents
- [ ] Progress indicators during processing

### Phase 3: Production Features
- [ ] User authentication
- [ ] Multi-property support
- [ ] Box integration (for document storage)
- [ ] Salesforce integration (for CRM sync)
- [ ] PDF viewer alongside abstract
- [ ] Audit trail / change history

---

## Working with Claude Code

This project is designed to work well with Claude Code. Here are some tips:

### Quick Commands

```bash
# Start development
npm run dev

# Type check
npm run check

# Push database changes
npm run db:push

# View database in browser
npm run db:studio
```

### Common Tasks

**"Add a new business term to extract"**
1. Add it to `LEASE_BUSINESS_TERMS` array in `lease-knowledge.ts`
2. Add definition in the knowledge base
3. Add field to `leaseAbstracts` schema in `schema.ts`
4. Run `npm run db:push`
5. Update export logic in `export.ts`

**"Change how a term is displayed"**
1. Edit the abstract page component
2. Or edit the Excel export in `export.ts`

**"Improve extraction accuracy"**
1. Edit the system prompt in `lease-knowledge.ts`
2. Add more specific instructions or examples
3. Test with real documents

---

## API Endpoints Reference

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property with tenants
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Tenants
- `GET /api/tenants` - List tenants (optional `propertyId` filter)
- `GET /api/tenants/search?q=` - Search tenants
- `GET /api/tenants/:id` - Get tenant with leases and abstract
- `POST /api/tenants` - Create tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Leases
- `GET /api/leases/tenant/:tenantId` - List leases for tenant
- `POST /api/leases/upload/:tenantId` - Upload documents
- `POST /api/leases/process/:leaseId` - Process document with AI
- `DELETE /api/leases/:id` - Delete lease

### Abstracts
- `GET /api/abstracts/tenant/:tenantId` - Get abstract
- `PUT /api/abstracts/tenant/:tenantId` - Update abstract
- `POST /api/abstracts/tenant/:tenantId/verify` - Mark verified

### Export
- `GET /api/export/abstract/:tenantId` - Download Excel abstract
- `GET /api/export/rent-roll/:propertyId` - Download rent roll

---

## Notes for James

### Getting Started
1. Get your Gemini API key from https://aistudio.google.com/apikey (free tier available)
2. Get a Neon database from https://neon.tech (free tier available)
3. Run the setup commands above
4. Upload a test lease document and see what gets extracted

### What Claude Code Can Help With
- "Add a new field to extract from leases"
- "Change the Excel export format"
- "Fix an extraction issue with [specific term]"
- "Add a new page for [feature]"
- "Connect to Box API for document storage"

### When to Ask for Help
- Setting up API keys and environment
- Understanding why extraction is wrong for a specific document
- Major architectural changes

---

## Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Drizzle ORM Docs:** https://orm.drizzle.team/docs
- **TanStack Query:** https://tanstack.com/query/latest
- **Tailwind CSS:** https://tailwindcss.com/docs
- **ExcelJS:** https://github.com/exceljs/exceljs

---

*This project was set up on December 17, 2025 using Claude Code with Claude Opus 4.5 and designed for AI-native development.*
