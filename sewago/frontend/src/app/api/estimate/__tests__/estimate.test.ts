import { describe, it, expect } from "vitest";
import { POST } from "../route";

// Basic smoke test for the mock estimator route
describe("/api/estimate", () => {
  it("returns a valid range", async () => {
    const req = new Request("http://localhost/api/estimate", { method: "POST", body: JSON.stringify({ serviceType: "plumbing", hours: 2 }) });
    // Cast to unknown first to avoid eslint any complaint
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.min).toBeTypeOf("number");
    expect(data.max).toBeTypeOf("number");
    expect(data.max).toBeGreaterThanOrEqual(data.min);
  });
});


