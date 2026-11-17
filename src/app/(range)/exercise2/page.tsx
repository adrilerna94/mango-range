import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RangeSkeleton } from "@/components/range/range-skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
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
      <ErrorBoundary message="No se han podido cargar los valores del rango.">
        <Suspense fallback={<RangeSkeleton />}>
          <FixedRange />
        </Suspense>
      </ErrorBoundary>
      <Link
        href="/"
        className="text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        Volver al inicio
      </Link>
    </>
  );
}
