# Drizzle + Effect 整合研究

## 安裝套件

```bash
npm install drizzle-orm pg
npm install --save-dev drizzle-kit @types/pg
```

## `app/db/schema.ts`

```typescript
import { pgTable, serial, text, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  satelliteId: text("satellite_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  date: text("date").notNull(),
  durationHours: integer("duration_hours").notNull(),
  total: doublePrecision("total").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listingRequests = pgTable("listing_requests", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  satelliteName: text("satellite_name").notNull(),
  type: text("type").notNull(),
  orbit: text("orbit").notNull(),
  spec: text("spec").notNull(),
  pricePerHour: doublePrecision("price_per_hour").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WaitlistInsert = typeof waitlist.$inferInsert;
export type BookingInsert = typeof bookings.$inferInsert;
export type ListingRequestInsert = typeof listingRequests.$inferInsert;
```

## `app/db/client.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return new Pool({ connectionString });
};

export const createDb = () => {
  const pool = createPool();
  return drizzle(pool, { schema });
};

export type Db = ReturnType<typeof createDb>;
```

## `app/services/database.ts`

```typescript
import { Effect, Context, Layer, Data } from "effect";
import { createDb, type Db } from "../db/client";
import { waitlist, bookings, listingRequests } from "../db/schema";
import type { WaitlistInsert, BookingInsert, ListingRequestInsert } from "../db/schema";

// --- Errors ---

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string;
  cause: unknown;
}> {}

export class DuplicateEmailError extends Data.TaggedError("DuplicateEmailError")<{
  email: string;
}> {}

// --- Service Interface ---

interface DatabaseServiceImpl {
  readonly insertWaitlist: (
    data: Omit<WaitlistInsert, "id" | "createdAt">
  ) => Effect.Effect<{ id: number; email: string }, DatabaseError | DuplicateEmailError>;

  readonly insertBooking: (
    data: Omit<BookingInsert, "id" | "createdAt">
  ) => Effect.Effect<{ id: number }, DatabaseError>;

  readonly insertListingRequest: (
    data: Omit<ListingRequestInsert, "id" | "createdAt">
  ) => Effect.Effect<{ id: number }, DatabaseError>;
}

// --- Service Tag ---

export class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  DatabaseServiceImpl
>() {}

// --- Helper ---

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  (err as { code: string }).code === "23505";

// --- Layer Implementation ---

export const DatabaseServiceLive = Layer.effect(
  DatabaseService,
  Effect.try({
    try: () => createDb(),
    catch: (cause) => new DatabaseError({ operation: "connect", cause }),
  }).pipe(
    Effect.map((db: Db) => ({
      insertWaitlist: (data: Omit<WaitlistInsert, "id" | "createdAt">) =>
        Effect.tryPromise({
          try: () =>
            db.insert(waitlist).values(data)
              .returning({ id: waitlist.id, email: waitlist.email })
              .then((rows) => rows[0]),
          catch: (cause) =>
            isDuplicateKeyError(cause)
              ? new DuplicateEmailError({ email: data.email })
              : new DatabaseError({ operation: "insertWaitlist", cause }),
        }),

      insertBooking: (data: Omit<BookingInsert, "id" | "createdAt">) =>
        Effect.tryPromise({
          try: () =>
            db.insert(bookings).values(data)
              .returning({ id: bookings.id })
              .then((rows) => rows[0]),
          catch: (cause) => new DatabaseError({ operation: "insertBooking", cause }),
        }),

      insertListingRequest: (data: Omit<ListingRequestInsert, "id" | "createdAt">) =>
        Effect.tryPromise({
          try: () =>
            db.insert(listingRequests).values(data)
              .returning({ id: listingRequests.id })
              .then((rows) => rows[0]),
          catch: (cause) => new DatabaseError({ operation: "insertListingRequest", cause }),
        }),
    }))
  )
);
```

## 在 Action 中使用（Waitlist 範例）

```typescript
import { Effect } from "effect";
import { data } from "react-router";
import { DatabaseService, DatabaseServiceLive, DatabaseError, DuplicateEmailError } from "../services/database";
import { validateWaitlistEmail } from "../services/satellite";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const raw = Object.fromEntries(formData);

  const program = Effect.gen(function* () {
    const validated = yield* validateWaitlistEmail(raw);
    const db = yield* DatabaseService;
    return yield* db.insertWaitlist({ email: validated.email });
  }).pipe(Effect.provide(DatabaseServiceLive));

  const result = await Effect.runPromise(
    program.pipe(
      Effect.match({
        onFailure: (error) => {
          if (error instanceof DuplicateEmailError)
            return data({ success: false, error: "這個 Email 已經在候補名單中了。" }, { status: 409 });
          if (error instanceof DatabaseError)
            return data({ success: false, error: "資料庫發生錯誤，請稍後再試。" }, { status: 500 });
          return data({ success: false, error: "表單驗證失敗。" }, { status: 400 });
        },
        onSuccess: (result) => data({ success: true, id: result.id }, { status: 201 }),
      })
    )
  );

  return result;
}
```

## `drizzle.config.ts`（放在專案根目錄）

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Migration 指令

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```
