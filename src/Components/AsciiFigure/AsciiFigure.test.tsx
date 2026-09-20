import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import AsciiFigure from "./AsciiFigure";
import { IDLE, IDLE_SEQUENCES } from "./frames";

const useReducedMotion = () =>
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: true,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList);

const getFigure = (container: HTMLElement) => {
  const figure = container.querySelector("pre");
  if (!figure) throw new Error("ASCII figure did not render");
  return figure;
};

describe("AsciiFigure", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test.each([["home"], ["coffee"], ["shop"]] as const)(
    "%s is alive by default",
    (variant) => {
      vi.useFakeTimers();
      const { container } = render(<AsciiFigure variant={variant} />);
      const figure = getFigure(container);

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      // Idle cycles frames yet always stays within the planted idle set.
      expect(IDLE_SEQUENCES[variant]).toContain(figure.textContent);
    },
  );

  test("freezes in place on hover and resumes after it leaves", () => {
    vi.useFakeTimers();
    const { container } = render(<AsciiFigure />);
    const figure = getFigure(container);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const frozen = figure.textContent;

    fireEvent.mouseEnter(figure);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(figure.textContent).toBe(frozen);

    fireEvent.mouseLeave(figure);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(figure.textContent).not.toBe(frozen);
  });

  test("holds a static frame when reduced motion is requested", () => {
    vi.useFakeTimers();
    useReducedMotion();
    const { container } = render(<AsciiFigure />);
    const figure = getFigure(container);
    const first = figure.textContent;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(figure.textContent).toBe(first);
    expect(figure.textContent).toBe(IDLE.home);
  });
});
