-- Init script eseguito automaticamente al primo avvio PostgreSQL
-- Crea le estensioni necessarie

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- full text search
