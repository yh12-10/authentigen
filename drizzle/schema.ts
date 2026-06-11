import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    // openId stays for compatibility — generated UUID for native signups, optional for future SSO providers.
    openId: varchar("openId", { length: 64 }).unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: varchar("passwordHash", { length: 255 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  t => ({
    usersEmailUnique: uniqueIndex("users_email_unique").on(t.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const jobs = mysqlTable(
  "jobs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["image"]).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "processing",
      "completed",
      "failed",
    ])
      .default("pending")
      .notNull(),
    intensity: mysqlEnum("intensity", ["light", "medium", "heavy"])
      .default("medium")
      .notNull(),
    originalKey: varchar("originalKey", { length: 512 }).notNull(),
    originalUrl: varchar("originalUrl", { length: 1024 }).notNull(),
    originalFilename: varchar("originalFilename", { length: 255 }).notNull(),
    originalMimeType: varchar("originalMimeType", { length: 64 }).notNull(),
    processedKey: varchar("processedKey", { length: 512 }),
    processedUrl: varchar("processedUrl", { length: 1024 }),
    progress: int("progress").default(0).notNull(),
    errorMessage: text("errorMessage"),
    batchId: varchar("batchId", { length: 36 }),
    processingStartedAt: timestamp("processingStartedAt"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    jobsBatchIdIdx: index("jobs_batchId_idx").on(t.batchId),
  })
);

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
