type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="grid justify-items-center gap-4 py-4 text-center"
    >
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-full border border-border text-muted"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path d="M12 8v5" />
          <path d="M12 16.5v.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Algo ha salido mal
        </h2>
        <p className="text-sm text-muted">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Reintentar
      </button>
    </div>
  );
}
