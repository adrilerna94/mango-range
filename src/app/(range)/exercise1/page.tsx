import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RangeSkeleton } from "@/components/range/range-skeleton";
import { NormalRange } from "./components/normal-range";

export const metadata: Metadata = {
  title: "Ejercicio 1",
};

export default function Exercise1Page() {
  return (
    <>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Rango normal
      </h1>
      <Suspense fallback={<RangeSkeleton />}>
        <NormalRange />
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
