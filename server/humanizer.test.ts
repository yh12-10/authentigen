import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { humanizeImageBuffer, MAX_IMAGE_DIMENSION } from "./humanizer";

const INTENSITIES = ["light", "medium", "heavy"] as const;

/** A small solid-color PNG to feed through the pipeline. */
function makePng(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 90, b: 60 },
    },
  })
    .png()
    .toBuffer();
}

/** JPEG files start with the SOI marker 0xFFD8FF. */
function isJpeg(buf: Buffer): boolean {
  return (
    buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  );
}

describe("humanizeImageBuffer", () => {
  for (const intensity of INTENSITIES) {
    it(`produces a valid JPEG at ${intensity} intensity, preserving dimensions`, async () => {
      const input = await makePng(200, 150);
      const out = await humanizeImageBuffer(input, intensity);

      expect(out.length).toBeGreaterThan(0);
      expect(isJpeg(out)).toBe(true);

      const meta = await sharp(out).metadata();
      expect(meta.format).toBe("jpeg");
      expect(meta.width).toBe(200);
      expect(meta.height).toBe(150);
    });
  }

  it("rejects images larger than the max dimension instead of OOM-ing", async () => {
    const tooWide = await makePng(MAX_IMAGE_DIMENSION + 1, 4);
    await expect(humanizeImageBuffer(tooWide, "light")).rejects.toThrow(
      /too large/i
    );
  });
});
