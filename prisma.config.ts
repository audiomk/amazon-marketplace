import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  // 1. Explicitly tells Prisma 7 where to find your data models file
  schema: "prisma/schema.prisma",
  
  // 2. Maps the database connection target cleanly without cluttering your schema layout
  datasource: {
    url: env("DATABASE_URL") || "postgresql://dummy:dummy@localhost:5432/marketplace",
  },
});