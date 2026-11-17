import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("avisa del error con el mensaje recibido", () => {
    render(<ErrorState message="Fallo de red" onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Fallo de red");
  });

  it("reintenta al pulsar el botón", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Fallo de red" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
