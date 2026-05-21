# AI-Powered Project Management Assistant

A full-stack web application with a React frontend, NestJS backend, and a LangGraph GenAI assistant.

## Features
- JWT Authentication & RBAC
- Project & Task Management
- AI Assistant for project insights, summaries, and next actions

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query, React Hook Form
- **Backend**: NestJS, PostgreSQL, Prisma ORM, Passport.js, Swagger
- **AI**: LangChain, LangGraph, OpenAI GPT-4o, pgvector
- **DevOps**: Docker, docker-compose

## Prerequisites
- Node.js 20+
- Docker and docker-compose
- PostgreSQL (or use the provided Docker setup)

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and API keys
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Running with Docker
```bash
cd backend
docker-compose up -d
```
