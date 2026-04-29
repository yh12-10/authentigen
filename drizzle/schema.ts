import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  credits: int("credits").default(10).notNull(),
  bonusClaimed: int("bonusClaimed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  intensity: mysqlEnum("intensity", ["light", "medium", "heavy"]).default("medium").notNull(),
  originalKey: varchar("originalKey", { length: 512 }).notNull(),
  originalUrl: varchar("originalUrl", { length: 1024 }).notNull(),
  originalFilename: varchar("originalFilename", { length: 255 }).notNull(),
  originalMimeType: varchar("originalMimeType", { length: 64 }).notNull(),
  processedKey: varchar("processedKey", { length: 512 }),
  processedUrl: varchar("processedUrl", { length: 1024 }),
  progress: int("progress").default(0).notNull(),
  creditsUsed: int("creditsUsed").default(0).notNull(),
  errorMessage: text("errorMessage"),
  processingStartedAt: timestamp("processingStartedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

export const creditTransactions = mysqlTable("credit_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobId: int("jobId"),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "bonus", "refund"]).notNull(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
