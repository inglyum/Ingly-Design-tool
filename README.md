# INGLY OS — SaaS Enterprise Cloud

Migrazione da applicazione HTML monolitica a piattaforma SaaS Enterprise Cloud multi-tenant.

## Documentazione

- [Piano Maestro di Migrazione](./docs/migration/00-INGLY-OS-SAAS-MIGRATION-MASTER.md)

## Stack Target

| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind, Shadcn UI |
| Backend | Node.js 22, Fastify 5, TypeScript, Prisma |
| Database | PostgreSQL 16 (schema-per-tenant) |
| Cache | Redis 7 |
| Storage | S3-compatible (Cloudflare R2 / MinIO) |
| Queue | BullMQ |
| Payments | Stripe |
| Monitoring | Grafana, Prometheus, Sentry |

## Struttura Monorepo

```
apps/       — Frontend + 11 microservizi backend
packages/   — Librerie condivise (db, auth, queue, types)
infrastructure/ — Docker, Nginx, Terraform
docs/       — Documentazione architetturale
```

## Piani

| Piano | Prezzo | Moduli | Storage | AI Token/mese |
|---|---|---|---|---|
| Starter | €19/mese | 30 | 2 GB | 10.000 |
| Pro | €49/mese | 60 | 10 GB | 100.000 |
| Business | €99/mese | 85 | 50 GB | 500.000 |
| Enterprise | €199/mese | 113 | 200 GB | Illimitati |
