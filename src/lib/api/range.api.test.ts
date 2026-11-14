// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRangeLimits, getRangeValues } from "./range.api";

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getRangeLimits", () => {
  it("devuelve el mínimo y el máximo de la API", async () => {
    mockFetch({ min: 1, max: 100 });

    const result = await getRangeLimits();

    expect(result).toEqual({ min: 1, max: 100 });
  });

  it("llama al endpoint /api/range", async () => {
    const fetchMock = mockFetch({ min: 1, max: 100 });

    await getRangeLimits();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/range"),
      expect.anything(),
    );
  });

  it("lanza un error si la respuesta no es correcta", async () => {
    mockFetch({}, 500);

    await expect(getRangeLimits()).rejects.toThrow("500");
  });
});

describe("getRangeValues", () => {
  it("devuelve la lista de valores de la API", async () => {
    const rangeValues = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];
    mockFetch({ rangeValues });

    const result = await getRangeValues();

    expect(result).toEqual({ rangeValues });
  });

  it("llama al endpoint /api/range-values", async () => {
    const fetchMock = mockFetch({ rangeValues: [] });

    await getRangeValues();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/range-values"),
      expect.anything(),
    );
  });

  it("lanza un error si la respuesta no es correcta", async () => {
    mockFetch({}, 404);

    await expect(getRangeValues()).rejects.toThrow("404");
  });
});
