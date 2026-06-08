import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const { confettiMock } = vi.hoisted(() => ({ confettiMock: vi.fn() }));
vi.mock("canvas-confetti", () => ({ default: confettiMock }));

import { CompletionConfetti } from "./CompletionConfetti";

beforeEach(() => {
  confettiMock.mockClear();
  // Stop the rAF burst loop from recursing during the test.
  vi.stubGlobal("requestAnimationFrame", () => 0);
});

describe("CompletionConfetti", () => {
  it("does not fire confetti when trigger is false", () => {
    render(<CompletionConfetti trigger={false} />);
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it("fires confetti when trigger is true", () => {
    render(<CompletionConfetti trigger={true} />);
    expect(confettiMock).toHaveBeenCalled();
  });
});
