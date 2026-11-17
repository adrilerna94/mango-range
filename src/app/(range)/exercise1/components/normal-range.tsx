import { Range } from "@/components/range/range";
import { getRangeLimits } from "@/lib/api/range.api";

export async function NormalRange() {
  const { min, max } = await getRangeLimits();

  return <Range mode="normal" min={min} max={max} />;
}
