// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, getRangeLimits, getRangeValues } from "./range.api";

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockRawResponse(body: string) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
}

function mockNetworkError(error: Error) {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
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
    const fetchMock = mockFetch({ rangeValues: [1.99, 5.99] });

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

describe("errores comunes del servicio", () => {
  it("corta la petición si la API tarda demasiado", async () => {
    const fetchMock = mockFetch({ min: 1, max: 100 });

    await getRangeLimits();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("convierte un fallo de red en un ApiError con la causa original", async () => {
    const networkError = new TypeError("fetch failed");
    mockNetworkError(networkError);

    const error = await getRangeLimits().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      endpoint: "/api/range",
      cause: networkError,
    });
  });

  it("guarda el status HTTP en el ApiError", async () => {
    mockFetch({}, 503);

    await expect(getRangeValues()).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      endpoint: "/api/range-values",
    });
  });

  it("lanza un ApiError si la respuesta no es JSON", async () => {
    mockRawResponse("<html>Bad gateway</html>");

    await expect(getRangeLimits()).rejects.toThrow("Respuesta no válida");
  });
});

describe("validación de los datos", () => {
  it.each([
    ["sin max", { min: 1 }],
    ["con texto", { min: "1", max: 100 }],
    ["con el mínimo igual al máximo", { min: 10, max: 10 }],
    ["con el mínimo mayor que el máximo", { min: 100, max: 1 }],
    ["con un valor nulo", null],
  ])("rechaza unos límites %s", async (_, body) => {
    mockFetch(body);

    await expect(getRangeLimits()).rejects.toThrow("formato inesperado");
  });

  it.each([
    ["vacíos", { rangeValues: [] }],
    ["con un solo valor", { rangeValues: [1.99] }],
    ["desordenados", { rangeValues: [5.99, 1.99] }],
    ["repetidos", { rangeValues: [1.99, 1.99] }],
    ["con texto", { rangeValues: [1.99, "5.99"] }],
    ["sin la propiedad rangeValues", { values: [1.99, 5.99] }],
    ["nulos", null],
  ])("rechaza unos valores fijos %s", async (_, body) => {
    mockFetch(body);

    await expect(getRangeValues()).rejects.toThrow("formato inesperado");
  });
});
