import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RangeSkeleton } from "../range-skeleton";

describe("RangeSkeleton", () => {
  it("anuncia la carga a los lectores de pantalla", () => {
    render(<RangeSkeleton />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando rango de precios",
    );
  });

  it("oculta las formas decorativas a los lectores de pantalla", () => {
    const { container } = render(<RangeSkeleton />);

    const shapes = container.querySelectorAll(".animate-pulse");
    expect(shapes).toHaveLength(3);
    shapes.forEach((shape) =>
      expect(shape).toHaveAttribute("aria-hidden", "true"),
    );
  });
});
