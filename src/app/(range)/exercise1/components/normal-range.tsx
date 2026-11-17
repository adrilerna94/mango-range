import { connection } from "next/server";
import { Range } from "@/components/range/range";
import { getRangeLimits } from "@/lib/api/range.api";

export async function NormalRange() {
  // Renderizado en cada petición: así `next build` no llama al mock (no hay
  // servidor durante el build). Los datos siguen cacheados 1 h en el servicio.
  await connection();
  const { min, max } = await getRangeLimits();

  return <Range mode="normal" min={min} max={max} />;
}
