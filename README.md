# LoadPulse

LoadPulse is a dark developer dashboard for exploring HTTP performance metrics with repeatable synthetic benchmark scenarios.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 via the Vite plugin
- Vercel Serverless Function at `/api/load`
- Recharts-ready frontend foundation and Lucide icons

## Features

- Configurable virtual users (1–500), request volume (100–100,000), and ramp-up window
- Throughput (RPS), p50/p95/p99 latency, error rate, and HTTP status distribution
- Recent run history with selectable benchmark snapshots
- GET history and POST simulation API
- Local-preview fallback when the Vercel API is unavailable
- Responsive dark developer UI

## Safety and measurement scope

**This release is simulation-only.** The API uses the entered endpoint as a display label and does not make outbound HTTP requests. All performance values are generated synthetically and must not be interpreted as measurements of the entered service. The app is suitable for UI prototyping, metric visualization, and exercising benchmark workflows; it is not a network load generator.

## Local development

```bash
npm install
npm run dev
```

The Vite preview uses sample data and falls back to client-side synthetic results if `/api/load` is unavailable. To exercise the Vercel function locally, install the Vercel CLI and run:

```bash
npm run vercel-dev
```

## Production build

```bash
npm run build
```

Import this repository into Vercel. The Vite frontend is built from the repository root and the `api/` directory is deployed as serverless functions. No environment variables are required.

## API

- `GET /api/load` — returns the in-memory run history and `mode: "simulation"`.
- `POST /api/load` — accepts `{ "targetUrl", "virtualUsers", "requestCount", "rampUpSec" }`, validates inputs, and returns a synthetic run with RPS, p50/p95/p99, error rate, status-code counts, and duration.

History is held in serverless instance memory and is not durable across cold starts or separate instances.
