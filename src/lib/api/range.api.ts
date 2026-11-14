export type RangeLimits = {
  min: number;
  max: number;
};

export type RangeValues = {
  rangeValues: number[];
};

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export async function getRangeLimits(): Promise<RangeLimits> {
  const response = await fetch(`${API_URL}/api/range`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Error al obtener los límites del rango: ${response.status}`,
    );
  }

  return response.json();
}

export async function getRangeValues(): Promise<RangeValues> {
  const response = await fetch(`${API_URL}/api/range-values`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener los valores del rango: ${response.status}`,
    );
  }

  return response.json();
}
