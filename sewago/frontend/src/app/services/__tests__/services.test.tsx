import { describe, it, expect } from "vitest";
import ServicesPage, { revalidate } from "../page";

describe("/services page", () => {
  it("exports ISR revalidate", () => {
    expect(revalidate).toBe(3600);
  });

  it("renders without throwing (server)", async () => {
    const Comp = await ServicesPage();
    expect(Comp).toBeTruthy();
  });
});


