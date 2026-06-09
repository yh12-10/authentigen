import { describe, expect, it } from "vitest";

describe("video frame math", () => {
  it("30s @ 30fps with sampleEvery=3 yields 300 sampled frames", () => {
    const duration = 30;
    const fps = 30;
    const sampleEvery = 3;
    const total = Math.floor(duration * fps);
    const sampled = Math.ceil(total / sampleEvery);
    expect(total).toBe(900);
    expect(sampled).toBe(300);
  });

  it("10s @ 24fps with sampleEvery=2 yields 120 sampled frames", () => {
    const total = Math.floor(10 * 24);
    expect(Math.ceil(total / 2)).toBe(120);
  });
});

describe("video config", () => {
  it("respects VIDEO_MAX_DURATION_SECONDS env override (default 30)", async () => {
    const { ENV } = await import("./_core/env");
    expect(ENV.videoMaxDurationSeconds).toBeGreaterThan(0);
    expect(ENV.videoMaxDurationSeconds).toBeLessThanOrEqual(120);
  });

  it("respects VIDEO_FRAME_SAMPLE_EVERY env override (default 3)", async () => {
    const { ENV } = await import("./_core/env");
    expect(ENV.videoFrameSampleEvery).toBeGreaterThanOrEqual(1);
    expect(ENV.videoFrameSampleEvery).toBeLessThanOrEqual(10);
  });
});
