import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultsChart from "@/components/ResultsChart";

describe("ResultsChart", () => {
  it("renders labels and totals", () => {
    render(
      <ResultsChart
        option1Label="Cats"
        option2Label="Dogs"
        option1Count={3}
        option2Count={1}
      />
    );
    expect(Boolean(screen.getByText(/Cats/i))).toBe(true);
    expect(Boolean(screen.getByText(/Dogs/i))).toBe(true);
    expect(Boolean(screen.getByText(/Total: 4/))).toBe(true);
  });
});


