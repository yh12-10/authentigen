import { describe, expect, it } from "vitest";
import { classifyOrphan } from "./recovery";

describe("classifyOrphan", () => {
  it("re-queues pending jobs (processing never started)", () => {
    expect(classifyOrphan("pending")).toBe("requeue");
  });

  it("fails and refunds jobs interrupted mid-processing", () => {
    expect(classifyOrphan("processing")).toBe("fail-refund");
  });

  it("skips terminal states", () => {
    expect(classifyOrphan("completed")).toBe("skip");
    expect(classifyOrphan("failed")).toBe("skip");
  });

  it("skips unknown states", () => {
    expect(classifyOrphan("anything-else")).toBe("skip");
  });
});
