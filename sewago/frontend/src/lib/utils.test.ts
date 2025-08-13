import { describe, it, expect } from "vitest";

type Service = { price: number; rating: number };
function filterServices(services: Service[], min?: number, max?: number, rating?: number) {
  return services.filter((s) =>
    (min === undefined || s.price >= min) &&
    (max === undefined || s.price <= max) &&
    (rating === undefined || s.rating >= rating)
  );
}

describe("filterServices", () => {
  it("filters by price and rating", () => {
    const data = [
      { price: 500, rating: 4 },
      { price: 1500, rating: 5 },
      { price: 200, rating: 3 },
    ];
    const out = filterServices(data, 300, 1600, 4);
    expect(out).toHaveLength(2);
  });
});


