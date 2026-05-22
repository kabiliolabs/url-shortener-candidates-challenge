-- Initial schema: `shortened_url` as a hash-partitioned table from day one.
--
-- Why partition: point lookups by `code` dominate (every /s/:code resolve).
-- Hash partitioning on the lookup key spreads reads/writes evenly across
-- partitions and prunes every query to one — billions of rows stay tractable
-- for autovacuum, index size, and pg_dump.
--
-- Why composite PK: Postgres requires the partition key in any primary key
-- on a partitioned table, so the PK is (id, code). Global uniqueness on
-- `code` is enforced by the local unique index — same-code rows always
-- route to the same partition, so the local index is sufficient.

CREATE TABLE "shortened_url" (
  "id"            BIGSERIAL       NOT NULL,
  "code"          TEXT            NOT NULL,
  "longUrl"       VARCHAR(2048)   NOT NULL,
  "createdAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clickCount"    INTEGER         NOT NULL DEFAULT 0,
  "lastClickedAt" TIMESTAMP(3),
  CONSTRAINT "shortened_url_pkey" PRIMARY KEY ("id", "code")
) PARTITION BY HASH ("code");

CREATE UNIQUE INDEX "shortened_url_code_key" ON "shortened_url" ("code");

-- 64 hash partitions. At 1B rows that's ~16M per partition — well within
-- comfortable single-table territory for index scans and autovacuum.
DO $$
DECLARE
  i INT;
BEGIN
  FOR i IN 0..63 LOOP
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF "shortened_url" FOR VALUES WITH (MODULUS 64, REMAINDER %s)',
      'shortened_url_p' || lpad(i::text, 2, '0'),
      i
    );
  END LOOP;
END $$;
