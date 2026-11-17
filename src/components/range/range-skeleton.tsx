import { Skeleton } from "@/components/ui/skeleton";

// Replica la rejilla y las alturas de <Range /> para que el cambio del
// esqueleto al componente real no provoque saltos de layout (CLS).
export function RangeSkeleton() {
  return (
    <div
      role="status"
      className="grid w-full grid-cols-2 items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <span className="sr-only">Cargando rango de precios</span>
      <div className="col-start-1 row-start-1 flex h-6 items-center sm:min-w-20 sm:justify-end">
        <Skeleton className="h-5 w-12" />
      </div>
      <div className="col-span-2 row-start-2 flex h-6 items-center sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <Skeleton className="h-1 w-full rounded-full" />
      </div>
      <div className="col-start-2 row-start-1 flex h-6 items-center justify-end sm:col-start-3 sm:min-w-20 sm:justify-start">
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  );
}
