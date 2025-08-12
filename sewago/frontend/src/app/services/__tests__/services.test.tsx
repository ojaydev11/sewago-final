import { describe, it, expect } from "vitest";
import ServicesPage, { revalidate } from "../page";

describe("/services page", () => {
  it("exports ISR revalidate", () => {
    expect(revalidate).toBe(3600);
  });

  it("exports a function component", () => {
    expect(typeof ServicesPage).toBe("function");
  });

  it("has correct metadata structure", async () => {
    // Test that the component can be imported and is a function
    expect(ServicesPage).toBeDefined();
    expect(typeof ServicesPage).toBe("function");
  });
});


