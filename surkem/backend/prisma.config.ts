import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

// Muat variabel lingkungan dari file .env
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});