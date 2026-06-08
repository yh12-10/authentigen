import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 99,
    openId: "batch-user",
    email: "b@example.com",
    name: "Batch User",
    loginMethod: "email",
    role: "user",
    credits: 0,
    bonusClaimed: 0,
    stripeCustomerId: null,
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

describe("batch router", () => {
  it("rejects empty batch input via zod", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.batch.create({ files: [] })).rejects.toThrow();
  });

  it("rejects more than 10 files via zod", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const fakeFile = {
      filename: "x.png",
      mimeType: "image/png" as const,
      intensity: "light" as const,
      fileDataBase64: "AAAA",
    };
    await expect(
      caller.batch.create({ files: Array.from({ length: 11 }, () => fakeFile) })
    ).rejects.toThrow();
  });
});
