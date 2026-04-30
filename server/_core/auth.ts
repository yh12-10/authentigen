/**
 * Native auth helpers — no third-party identity provider.
 * Email + password, bcrypt-hashed, JWT session cookie (jose).
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";
import { getDb, getUserByEmail, getUserById } from "../db";
import type { User } from "../../drizzle/schema";

const BCRYPT_ROUNDS = 10;

function getSessionSecret(): Uint8Array {
  if (!ENV.cookieSecret) {
    throw new Error("JWT_SECRET is not configured. Set it in .env (any 32+ char random string).");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(userId: number, expiresInMs = ONE_YEAR_MS): Promise<string> {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);
  const exp = Math.floor((Date.now() + expiresInMs) / 1000);
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secret);
}

export async function verifySessionToken(token: string | undefined | null): Promise<number | null> {
  if (!token) return null;
  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const uid = payload.uid;
    return typeof uid === "number" ? uid : null;
  } catch {
    return null;
  }
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const parsed = parseCookieHeader(header);
  return parsed[name] ?? undefined;
}

/** Resolve the authenticated user from a request's session cookie. Returns null if not signed in. */
export async function authenticateRequest(req: Request): Promise<User | null> {
  const token = readCookie(req, COOKIE_NAME);
  const userId = await verifySessionToken(token);
  if (!userId) return null;
  const user = await getUserById(userId);
  return user ?? null;
}

export async function signupUser(input: { email: string; password: string; name?: string }): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserByEmail(input.email);
  if (existing) throw new Error("An account with that email already exists");

  const passwordHash = await hashPassword(input.password);
  const openId = (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const { users } = await import("../../drizzle/schema");
  await db.insert(users).values({
    openId,
    email: input.email,
    name: input.name ?? null,
    passwordHash,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });

  const created = await getUserByEmail(input.email);
  if (!created) throw new Error("Signup completed but user lookup failed");
  return created;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password");
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error("Invalid email or password");

  const db = await getDb();
  if (db) {
    const { users } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  }

  return user;
}
