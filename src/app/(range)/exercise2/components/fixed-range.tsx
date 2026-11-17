import { connection } from "next/server";
import { Range } from "@/components/range/range";
import { getRangeValues } from "@/lib/api/range.api";

export async function FixedRange() {
  // Renderizado en cada petición: así `next build` no llama al mock (no hay
  // servidor durante el build). Los datos siguen cacheados 1 h en el servicio.
  await connection();
  const { rangeValues } = await getRangeValues();

  return <Range mode="fixed" values={rangeValues} />;
}
