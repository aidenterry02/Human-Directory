import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // In Prisma 7, the URL lives HERE, not in the schema.
    url: "postgresql://postgres:Terraide6583!@db.ppufwyjllaluzugpjzqq.supabase.co:5432/postgres",
  },
});