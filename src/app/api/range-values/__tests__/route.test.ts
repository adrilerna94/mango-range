// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "../route";

describe("GET /api/range-values", () => {
  it("responde con status 200", () => {
    const response = GET();

    expect(response.status).toBe(200);
  });

  it("devuelve la lista de valores fijos", async () => {
    const response = GET();

    expect(await response.json()).toEqual({
      rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
    });
  });
});
