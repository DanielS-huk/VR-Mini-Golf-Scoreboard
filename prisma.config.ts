import fs from "node:fs";
import path from "node:path";

import { defineConfig } from "prisma/config";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const envContents = fs.readFileSync(envPath, "utf8");
  const entries = envContents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^"(.*)"$/, "$1");
      return [key, value] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  return Object.fromEntries(entries);
}

const envFromFile = loadEnvFile();

for (const [key, value] of Object.entries(envFromFile)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const fallbackDatabaseUrl = process.env.DATABASE_URL ?? envFromFile.DATABASE_URL ?? "";
const pooledDatabaseUrl =
  process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL ?? fallbackDatabaseUrl;
const directDatabaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? fallbackDatabaseUrl;

if (!process.env.POSTGRES_PRISMA_URL && pooledDatabaseUrl) {
  process.env.POSTGRES_PRISMA_URL = pooledDatabaseUrl;
}

if (!process.env.POSTGRES_URL_NON_POOLING && directDatabaseUrl) {
  process.env.POSTGRES_URL_NON_POOLING = directDatabaseUrl;
}

const prismaUrl = process.env.POSTGRES_PRISMA_URL ?? pooledDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: prismaUrl,
  },
});
