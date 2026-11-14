import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getRangeValues } from "@/lib/api/range.api";
import { Range } from "@/components/Range/range";

export const metadata: Metadata = {
  title: "Ejercicio 2",
};

async function FixedRange() {
  const { rangeValues } = await getRangeValues();

  return <Range mode="fixed" values={rangeValues} />;
}

export default function Exercise2Page() {
  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">Rango de valores fijos</h1>
      <Suspense fallback={<p className="text-center text-sm text-muted">Cargando...</p>}>
        <FixedRange />
      </Suspense>
      <Link href="/" className="text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline">
        Volver al inicio
      </Link>
    </>
  );
}
