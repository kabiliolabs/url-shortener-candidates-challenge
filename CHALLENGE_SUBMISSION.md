# Submission

## What I Did

### Persistence (PostgreSQL + Prisma)

- Added a `libs/database` package with Prisma ORM and PostgreSQL via Docker Compose.
- Created a `UrlDatabase` model storing `url`, `shortCode`, `shortenCount`, `clickCount`, and timestamps.
- Implemented a layered data access pattern: `UrlRepository` interface, `prisma-url.repository.ts` (persistence), and `url.service.ts` (business logic).
- Data survives server restarts; migrations and seed scripts are wired into the monorepo.

### Core features

- **URL shortening**: form on the home page creates a short link and displays it with a copy-friendly component.
- **Redirects**: `/s/:code` resolves the short code from the database and redirects to the original URL.
- **Click tracking**: each redirect increments `clickCount`; re-shortening the same URL increments `shortenCount` instead of creating a duplicate.
- **Statistics page** (`/urls`): lists all URLs with click/shorten counts, summary cards, and a refresh button with loading state.

### Code generator

- Replaced the collision-prone 1-character generator (9 possible codes) with a 6-character alphanumeric code using `crypto.randomInt` (~56 billion combinations).

### Frontend

- Integrated **shadcn/ui** (Button, Card, Input, Table, Badge) with Tailwind CSS for a clean, consistent UI.
- Extracted reusable components: `UrlForm`, `ShortenedUrlDisplay`, `UrlStatsTable`.
- Added client-side validation (`type="url"`, `required`) and server-side error feedback displayed inline.

### Error handling & typing

- Introduced an `AppError` class with error codes for database failures.
- Handled Prisma-specific errors (unique constraint violations, record not found).
- Added a shared `Url` type on the frontend; loader data serializes dates to ISO strings for the stats table.

### Infrastructure

- Updated Docker setup (PostgreSQL service, env variables, Dockerfile) and README with local and Docker instructions.

## SOLID / Architecture

Separated concerns across layers: `engine` (code generation), `UrlRepository` + Prisma implementation (persistence), `url.service` (business logic), and reusable UI components. The web layer depends on a small public API (`createUrl`, `getAllUrls`, `resolveShortCode`) with domain types decoupled from Prisma. Main trade-off: the service uses a concrete repository singleton rather than full dependency injection — sufficient for this scope, but would need addressing for unit tests without a database.

## What I Would Do With More Time

### Not covered (time constraints)

- Automated tests
- Advanced security (rate limiting, SSRF protection, URL allowlisting)
- Pagination for table and back 

## AI Usage

### Frontend

Basically im using AI with Ask mode and Agent mode for this, to ask things about doc or architecture possibility

I used 2 prompt to create the main bases of the project and then i correct the things that i didnt liked

```bash
You are an expert in @React @Shadcn 

you need to install shadcn to the project 

then you will use this to create a view called statistics
where you will do a getReq to get all stats
view all listing urls with stats 

use this archi
components/
│   ├── ui/         
│   ├── url-form.tsx  
│   ├── shortened-url-display.tsx
│   └── url-stats-table.tsx
├── routes/
│   ├── _index.tsx
│   └── urls.tsx    
```
### Backend 

```bash
We need to add percistance to the project 

Database implementation -> use postgresql
Data survives server restarts
Repository pattern or similar abstraction
use prisma ORM

urlObject:
id
fullUrl
shortUrl
clickCount
shortenCount

we need 2 routes 
POST create urlObject
GET getAll

follow the prisma documentation
https://www.prisma.io/docs/prisma-orm/quickstart/postgresql 
```

## Feedback

- Its a good test in my opinion, i maybe took overpass the 2h because it was the first time i did use prisma, and because perfect it a bit :) 
