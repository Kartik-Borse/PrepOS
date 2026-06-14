# Placement Preparation Platform

A comprehensive web-based learning system designed to help students prepare for technical placements through algorithmic practice, aptitude training, core CS education, and AI-powered interview preparation.

## Features

- 🧩 **DSA Practice**: 20 pattern-based problem categories with real-time code execution
- 🧠 **Spaced Repetition**: SM-2 algorithm for optimal problem revision scheduling
- 🔥 **Gamification**: Streaks, XP, levels, and leaderboards to maintain motivation
- 📚 **Aptitude & Core CS**: Quantitative, logical, verbal reasoning, and CS fundamentals
- 🤖 **AI Assistant**: Claude-powered hints, code reviews, and mock interviews
- 📊 **Analytics**: Progress tracking and company-specific readiness scores

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- React Router for navigation
- Vitest for testing

### Backend
- Node.js + Express + TypeScript
- PostgreSQL for data persistence
- Redis for caching and sessions
- Judge0 API for code execution
- Claude API for AI features
- Jest for testing

## Project Structure

```
placement-preparation-platform/
├── packages/
│   ├── backend/          # Express.js API server
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── utils/    # Utility functions
│   │   │   └── index.ts  # Server entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/         # React application
│       ├── src/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       └── tsconfig.json
├── database/
│   └── schema.sql        # PostgreSQL database schema
├── .github/
│   └── workflows/
│       └── ci.yml        # GitHub Actions CI/CD
├── docker-compose.yml    # Docker services configuration
└── package.json          # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd placement-preparation-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

4. Start PostgreSQL and Redis with Docker:
```bash
docker-compose up -d
```

5. Start development servers:
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:5000
- Frontend dev server on http://localhost:3000

### Database Setup

The database schema and initial seed data are defined in a unified file `database/schema.sql`.

To initialize or reset the database, you can either:

1. Use the backend's migration runner:
```bash
# Apply schema and seeds
npm run migrate:up --workspace=backend

# Check status of the database tables
npm run migrate:status --workspace=backend

# Reset database (drops all tables)
npm run migrate:down --workspace=backend
```

2. Or run the SQL file manually against the Docker container:
```bash
docker exec -i placement-preparation-platform-postgres-1 psql -U placement_user -d placement_prep < database/schema.sql
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test --workspace=backend

# Run frontend tests only
npm run test --workspace=frontend

# Run tests in watch mode
npm run test:watch --workspace=backend
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Building for Production

```bash
# Build all packages
npm run build

# Build backend only
npm run build --workspace=backend

# Build frontend only
npm run build --workspace=frontend
```

## API Endpoints

### Health Check
- `GET /health` - Returns the health status of the API and its dependencies

## Testing

The project uses Jest for backend testing and Vitest for frontend testing.

- Unit tests verify specific functionality
- Integration tests verify API endpoints
- Property-based tests verify correctness properties across all inputs

Coverage reports are generated in the `coverage/` directory.

## CI/CD

GitHub Actions runs on every push and pull request:
1. Linting and type checking
2. Backend tests with PostgreSQL and Redis
3. Frontend tests
4. Build verification

## License

This project is private and proprietary.

## Contributing

This is an initial setup. Additional features will be implemented in subsequent tasks.
