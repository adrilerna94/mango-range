import Link from "next/link";

const linkClasses =
  "block rounded-lg border border-border px-4 py-3 transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function Home() {
  return (
    <>
      <header className="grid gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Mango Range</h1>
        <p className="text-sm text-muted">Elige un ejercicio</p>
      </header>

      <nav aria-label="Ejercicios">
        <ul className="grid gap-3 text-center">
          <li>
            <Link href="/exercise1" className={linkClasses}>
              Ejercicio 1: rango normal
            </Link>
          </li>
          <li>
            <Link href="/exercise2" className={linkClasses}>
              Ejercicio 2: rango de valores fijos
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
