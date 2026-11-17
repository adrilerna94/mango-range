import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FixedRange } from "./components/fixed-range";

export const metadata: Metadata = {
  title: "Ejercicio 2",
};

export default function Exercise2Page() {
  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Rango de valores fijos
      </h1>
      <Suspense
        fallback={<p className="text-center text-sm text-muted">Cargando...</p>}
      >
        <FixedRange />
      </Suspense>
      <Link
        href="/"
        className="text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        Volver al inicio
      </Link>
    </>
  );
}
