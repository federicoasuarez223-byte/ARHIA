-- ARHIA PostgreSQL initialization
-- Enables pgvector extension for RAG/embeddings

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Ensure public schema has necessary permissions
GRANT ALL ON SCHEMA public TO arhia;
