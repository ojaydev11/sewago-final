import { describe, it, expect } from "vitest";
import { POST } from "../route";
import type { NextRequest } from "next/server";

// Basic smoke test for the mock estimator route
describe("/api/estimate", () => {
  it("returns a valid range", async () => {
    const req = new Request("http://localhost/api/estimate", { method: "POST", body: JSON.stringify({ serviceType: "plumbing", hours: 2 }) });
    // Create a minimal shim that satisfies the NextRequest signature where accessed by our route
    const nextReq = req as unknown as NextRequest;
    const res = await POST(nextReq);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.min).toBeTypeOf("number");
    expect(data.max).toBeTypeOf("number");
    expect(data.max).toBeGreaterThanOrEqual(data.min);
  });
});


