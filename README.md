# Notification Service

A scalable notification service supporting multiple delivery channels (email, SMS, push), asynchronous processing, and event analytics.

---

## Architecture

The project is built using a modular monorepo structure:

apps/
api         → HTTP API
worker      → background processing (delivery, analytics)
scheduler   → outbox processing (retry, dispatch)

libs/
auth        → authentication (JWT)
database    → entities and DB config
queue       → RabbitMQ integration
metrics     → metrics collection
query       → SQL queries
analytics   → ClickHouse client
templates   → notification templates

---

## Features

- Multi-channel notification delivery
- Outbox pattern for reliable event processing
- Retry mechanism with backoff strategy
- Asynchronous processing via queue
- Event analytics (ClickHouse)
- Healthcheck endpoint
- Strict TypeScript configuration
- Modular NestJS architecture

---

## Getting Started

### Start services

make up

### Build containers

make build

### Stop services

make down

### View logs

make logs

---

## Running services

### API

make api

### Worker

make worker

### Scheduler

make scheduler

---

## Container access

make sh

---

## Dependency management

make install pkg=<package>
make add pkg=<package>
make remove pkg=<package>

---

## Database migrations

make migrate
make migration-generate
make migration-revert

---

## Testing

npm run test

---

## Healthcheck

GET /health

Example response:

{
"status": "ok",
"timestamp": "2026-05-03T10:00:00.000Z",
"services": {
"database": "up"
}
}

---

## Data Flow

API → Database → Outbox → Scheduler → Queue → Worker → Delivery / Analytics

---

## Tech Stack

- NestJS
- TypeScript (strict mode)
- PostgreSQL
- RabbitMQ
- ClickHouse
- Docker

---

## Implementation Highlights

- No usage of `any` (strict typing)
- Unit tests for core business logic
- Environment isolation (dev / test)
- Clear separation of responsibilities (api / worker / scheduler)
- Fault tolerance via retry + outbox pattern

---

## Notes

This project is designed to demonstrate backend architecture patterns:

- Outbox pattern
- Event-driven processing
- Scalability
- Fault tolerance