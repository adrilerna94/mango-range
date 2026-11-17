import { Skeleton } from "@/components/ui/skeleton";

// Replica la rejilla y las alturas de <Range /> para que el cambio del
// esqueleto al componente real no provoque saltos de layout (CLS).
export function RangeSkeleton() {
  return (
    <div
      role="status"
      className="grid w-full max-w-md grid-cols-[5rem_1fr_5rem] items-center gap-3"
    >
      <span className="sr-only">Cargando rango de precios</span>
      <div className="flex justify-end">
        <Skeleton className="h-5 w-12" />
      </div>
      <div className="flex h-6 items-center">
        <Skeleton className="h-1 w-full rounded-full" />
      </div>
      <div className="flex">
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  );
}
