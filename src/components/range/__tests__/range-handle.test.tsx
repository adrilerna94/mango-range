import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RangeHandle } from "../range-handle";

type Props = ComponentProps<typeof RangeHandle>;

function renderHandle(props: Partial<Props> = {}) {
  const defaultProps: Props = {
    label: "Precio mínimo",
    value: 25,
    min: 0,
    max: 100,
    valueText: "25€",
    percent: 25,
    isDragging: false,
    isOnTop: false,
    onPointerDown: vi.fn(),
  };

  render(<RangeHandle {...defaultProps} {...props} />);

  return screen.getByRole("slider", { name: "Precio mínimo" });
}

describe("RangeHandle", () => {
  it("se renderiza como un slider accesible con su nombre", () => {
    const handle = renderHandle();

    expect(handle).toBeInTheDocument();
  });

  it("expone sus valores con atributos ARIA", () => {
    const handle = renderHandle({
      value: 2,
      min: 0,
      max: 5,
      valueText: "10.99€",
    });

    expect(handle).toHaveAttribute("aria-valuenow", "2");
    expect(handle).toHaveAttribute("aria-valuemin", "0");
    expect(handle).toHaveAttribute("aria-valuemax", "5");
    expect(handle).toHaveAttribute("aria-valuetext", "10.99€");
  });

  it("se coloca según el porcentaje recibido", () => {
    const handle = renderHandle({ percent: 40 });

    expect(handle).toHaveStyle({ left: "40%" });
  });

  it("se puede enfocar con el teclado", async () => {
    const user = userEvent.setup();
    const handle = renderHandle();

    await user.tab();

    expect(handle).toHaveFocus();
  });

  it("avisa cuando el usuario empieza a arrastrar", () => {
    const onPointerDown = vi.fn();
    const handle = renderHandle({ onPointerDown });

    fireEvent.pointerDown(handle);

    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it("avisa cuando el usuario pulsa una tecla", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    renderHandle({ onKeyDown });

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it("muestra el cursor de agarrar cuando no se está arrastrando", () => {
    const handle = renderHandle({ isDragging: false });

    expect(handle).toHaveClass("cursor-grab");
  });

  it("muestra el cursor de arrastrar mientras se arrastra", () => {
    const handle = renderHandle({ isDragging: true });

    expect(handle).toHaveClass("cursor-grabbing");
  });

  it("queda por debajo del otro tirador por defecto", () => {
    const handle = renderHandle({ isOnTop: false });

    expect(handle).toHaveClass("z-0");
  });

  it("queda por encima del otro tirador cuando es el último movido", () => {
    const handle = renderHandle({ isOnTop: true });

    expect(handle).toHaveClass("z-10");
  });
});
