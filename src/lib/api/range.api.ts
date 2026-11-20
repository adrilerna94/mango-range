// Si un Client Component importa este módulo, el build falla: el servicio
// solo se ejecuta en el servidor.
import "server-only";
import { connection } from "next/server";

export type RangeLimits = {
  min: number;
  max: number;
};

export type RangeValues = {
  rangeValues: number[];
};

// API_URL se define en el hosting (producción). En los previews de Vercel se
// usa la URL del propio despliegue, así que cada preview prueba su propio mock.
// En local es la propia app.
const API_URL =
  process.env.API_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:8080");
const TIMEOUT_MS = 5000;

export class ApiError extends Error {
  readonly endpoint: string;
  readonly status?: number;

  constructor(
    message: string,
    {
      endpoint,
      status,
      cause,
    }: { endpoint: string; status?: number; cause?: unknown },
  ) {
    super(message, { cause });
    this.name = "ApiError";
    this.endpoint = endpoint;
    this.status = status;
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRangeLimits(data: unknown): data is RangeLimits {
  if (typeof data !== "object" || data === null) return false;

  const { min, max } = data as Record<string, unknown>;

  return isFiniteNumber(min) && isFiniteNumber(max) && min < max;
}

function isRangeValues(data: unknown): data is RangeValues {
  if (typeof data !== "object" || data === null) return false;

  const { rangeValues } = data as Record<string, unknown>;

  return (
    Array.isArray(rangeValues) &&
    rangeValues.length >= 2 &&
    rangeValues.every(isFiniteNumber) &&
    rangeValues.every(
      (value, index) => index === 0 || value > rangeValues[index - 1],
    )
  );
}

async function fetchJson<T>(
  endpoint: string,
  isValid: (data: unknown) => data is T,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new ApiError(`No se pudo conectar con ${endpoint}`, {
      endpoint,
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiError(`Error ${response.status} al llamar a ${endpoint}`, {
      endpoint,
      status: response.status,
    });
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError(`Respuesta no válida de ${endpoint}`, {
      endpoint,
      status: response.status,
      cause: error,
    });
  }

  if (!isValid(data)) {
    throw new ApiError(`Datos con formato inesperado en ${endpoint}`, {
      endpoint,
      status: response.status,
    });
  }

  return data;
}

// Los datos se piden en cada petición. `connection()` evita que se llamen al
// prerenderizar: el shell de la página (título, enlace y skeleton) es estático
// y el rango llega por streaming dentro de su <Suspense>. Si la API falla, lo
// recoge el ErrorBoundary de la página.
export async function getRangeLimits(): Promise<RangeLimits> {
  await connection();

  return fetchJson("/api/range", isRangeLimits);
}

export async function getRangeValues(): Promise<RangeValues> {
  await connection();

  return fetchJson("/api/range-values", isRangeValues);
}
