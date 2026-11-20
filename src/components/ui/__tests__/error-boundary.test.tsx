import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../error-boundary";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

let shouldFail = true;

function Content() {
  if (shouldFail) throw new Error("Detalle interno del servidor");
  return <p>Contenido cargado</p>;
}

function renderBoundary() {
  render(
    <ErrorBoundary message="No se ha podido cargar el rango.">
      <Content />
    </ErrorBoundary>,
  );
}

beforeEach(() => {
  shouldFail = true;
  refresh.mockClear();
  // React y el boundary escriben el error en consola: lo silenciamos.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("muestra los hijos si no hay errores", () => {
    shouldFail = false;
    renderBoundary();

    expect(screen.getByText("Contenido cargado")).toBeInTheDocument();
  });

  it("muestra su propio mensaje en lugar del detalle del error", () => {
    renderBoundary();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("No se ha podido cargar el rango.");
    expect(alert).not.toHaveTextContent("Detalle interno del servidor");
  });

  it("registra el error capturado", () => {
    renderBoundary();

    expect(console.error).toHaveBeenCalledWith(
      "Error capturado:",
      expect.objectContaining({ message: "Detalle interno del servidor" }),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it("al reintentar refresca la ruta y vuelve a pintar los hijos", async () => {
    const user = userEvent.setup();
    renderBoundary();

    shouldFail = false;
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Contenido cargado")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
