---
name: graphity
description: Codebase knowledge graph and architectural topology mapper. Guides the agent to construct and navigate conceptual graphs of routes, database schemas, services, state stores, and component dependencies for instant structural comprehension.
---

# Graphity — Codebase Knowledge Graph Skill

## Overview
`graphity` enables the agent to map and query architectural relationships within the project as a structured graph:
`Data Model (DB) <---> Backend Services / API Routes <---> State Store (Zustand) <---> Frontend UI Components`.

## Mapping Methodology

### 1. Schema & Data Layer
- Primary Entities: `companies`, `stations`, `routes`, `schedules`, `trips`, `bookings`, `tickets`, `users`, `notifications`.
- Key Relations:
  - `companies` 1:N `routes`
  - `routes` M:N `stations` (via `departure_station_id`, `arrival_station_id`)
  - `routes` 1:N `schedules`
  - `schedules` / `trips` 1:N `bookings`
  - `users` 1:N `bookings` 1:N `tickets`

### 2. API Gateway & Endpoints
- `/api/trips`: Search and schedule queries with seat availability.
- `/api/bookings`: Ticket reservation, passenger records, status management.
- `/api/notifications`: Real-time user alert badges and inbox.
- `/api/chat`: Gemini AI travel assistant with Supabase context injection.
- `/api/payments`: Payment webhooks (MTN MoMo, Moov Money, Stripe).

### 3. Frontend Component Topology
- `src/app/[locale]/layout.tsx` -> Global shell (`Header`, `Footer`, `ChatAssistant`, `AuthProvider`).
- `src/components/traveler/` -> Search form, results list, line cards, booking seat picker.
- `src/components/admin/` & `src/components/partner/` -> Dashboards, route managers, booking validations.

### 4. Navigation Rules
- When modifying an API route, immediately verify all client caller components.
- When modifying a database column, check TypeScript interface in `src/types/database.ts` and API serializers.
