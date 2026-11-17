import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RangeLabel } from "../range-label";

// El comportamiento de edición se prueba en editable-label.test.tsx.

describe("RangeLabel", () => {
  it("muestra el valor formateado como precio", () => {
    render(<RangeLabel label="Precio mínimo" value={5.99} />);

    expect(screen.getByText("5.99€")).toBeInTheDocument();
  });

  it("no se puede editar si no recibe onValueChange", () => {
    render(<RangeLabel label="Precio mínimo" value={5.99} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("se puede editar si recibe onValueChange", () => {
    render(
      <RangeLabel label="Precio mínimo" value={1} onValueChange={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "Editar precio mínimo: 1€" }),
    ).toBeInTheDocument();
  });
});
