import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges className strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("filters out falsy values", () => {
    const result = cn("a", undefined, null, false, "b");
    expect(result).toBe("a b");
  });

  it("merges conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("TypingIndicator", () => {
  it("renders the three animated dots", () => {
    render(<TypingIndicator name="Alice" />);
    const dots = document.querySelectorAll(".animate-typing-dot-1, .animate-typing-dot-2, .animate-typing-dot-3");
    expect(dots.length).toBe(3);
  });

  it("renders an accessible container", () => {
    render(<TypingIndicator name="Alice" />);
    const container = document.querySelector(".bg-bubble-receiver");
    expect(container).not.toBeNull();
  });
});
