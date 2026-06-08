import { describe, expect, it } from "vitest";
import { stepStateAt } from "./StepIndicators";

// Steps: upload [0,10], analyze [10,30], humanize [30,90], finalize [90,100]
describe("stepStateAt", () => {
  it("marks every step done when the job is completed", () => {
    for (let i = 0; i < 4; i++) {
      expect(stepStateAt(0, "completed", i)).toBe("done");
    }
  });

  it("advances a step from pending → current → done by progress", () => {
    // analyze step (index 1), range [10, 30]
    expect(stepStateAt(5, "processing", 1)).toBe("pending");
    expect(stepStateAt(20, "processing", 1)).toBe("current");
    expect(stepStateAt(30, "processing", 1)).toBe("done");
  });

  it("treats the first step as current then done", () => {
    expect(stepStateAt(5, "processing", 0)).toBe("current");
    expect(stepStateAt(10, "processing", 0)).toBe("done");
  });

  it("for a failed job, a step is current past its start and pending otherwise", () => {
    expect(stepStateAt(20, "failed", 1)).toBe("current"); // 20 > start(10)
    expect(stepStateAt(5, "failed", 1)).toBe("pending"); // 5 <= start(10)
  });
});
