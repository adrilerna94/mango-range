// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "../route";

describe("GET /api/range", () => {
  it("responde con status 200", () => {
    const response = GET();

    expect(response.status).toBe(200);
  });

  it("devuelve el mínimo y el máximo", async () => {
    const response = GET();

    expect(await response.json()).toEqual({ min: 1, max: 100 });
  });
});
