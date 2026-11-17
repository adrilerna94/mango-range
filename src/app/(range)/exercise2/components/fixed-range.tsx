import { Range } from "@/components/range/range";
import { getRangeValues } from "@/lib/api/range.api";

export async function FixedRange() {
  const { rangeValues } = await getRangeValues();

  return <Range mode="fixed" values={rangeValues} />;
}
