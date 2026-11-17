import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("es decorativo y no lo leen los lectores de pantalla", () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("respeta la preferencia de movimiento reducido", () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toHaveClass(
      "animate-pulse",
      "motion-reduce:animate-none",
    );
  });

  it("añade las clases recibidas para darle tamaño", () => {
    const { container } = render(<Skeleton className="h-5 w-12" />);

    expect(container.firstChild).toHaveClass("h-5", "w-12");
  });
});
