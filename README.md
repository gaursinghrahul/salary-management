# Salary Management Tool

A full-stack HR salary management application for 10,000 employees.

## Stack
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: Next.js 16 + Tailwind CSS + Recharts
- **Infrastructure**: Docker Compose

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local development)

### Run with Docker
```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api/docs

### Local Development

**Backend**
```bash
cd backend
cp .env.example .env   # edit DB credentials if needed
npm install
npm run start:dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Seed 10,000 Employees
```bash
cd backend
npm run seed
```

### Run Tests
```bash
cd backend
npm run test          # unit tests
npm run test:cov      # with coverage
```

## Project Structure
```
salary-management/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── employees/   # CRUD module
│   │   ├── insights/    # Salary analytics module
│   │   └── seed/        # Bulk seed script
│   └── test/
├── frontend/         # Next.js App Router UI
│   └── src/
│       ├── app/
│       └── components/
├── data/             # first_names.txt, last_names.txt
└── docker-compose.yml
```

## Development Approach
Built using TDD — tests written before implementation for each module.
Commits follow phase-by-phase progression to show evolution of the solution.
