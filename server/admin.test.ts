import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(role: "user" | "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "x",
    email: "u@example.com",
    name: "U",
    loginMethod: "email",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("admin procedures", () => {
  it("rejects non-admin with FORBIDDEN", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.admin.stats()).rejects.toThrow(TRPCError);
    await expect(caller.admin.stats()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("admin caller passes the role gate (DB calls may return zeros without DATABASE_URL)", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    // We don't assert payload — just that it doesn't throw on the auth gate.
    await expect(caller.admin.stats()).resolves.toBeDefined();
  });
});
