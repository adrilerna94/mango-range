type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse rounded-md bg-border motion-reduce:animate-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
