import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getRangeLimits } from "@/lib/api/range.api";
import { Range } from "@/components/Range/range";

export const metadata: Metadata = {
  title: "Ejercicio 1",
};

async function NormalRange() {
  const { min, max } = await getRangeLimits();

  return <Range mode="normal" min={min} max={max} />;
}

export default function Exercise1Page() {
  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">Rango normal</h1>
      <Suspense fallback={<p className="text-center text-sm text-muted">Cargando...</p>}>
        <NormalRange />
      </Suspense>
      <Link href="/" className="text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline">
        Volver al inicio
      </Link>
    </>
  );
}
