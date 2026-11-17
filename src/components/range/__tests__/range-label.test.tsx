import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RangeLabel } from "../range-label";

describe("RangeLabel en modo solo lectura", () => {
  it("muestra el valor formateado como precio", () => {
    render(<RangeLabel label="Precio mínimo" value={5.99} />);

    expect(screen.getByText("5.99€")).toBeInTheDocument();
  });

  it("no se puede editar", () => {
    render(<RangeLabel label="Precio mínimo" value={5.99} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("RangeLabel en modo editable", () => {
  function renderEditable(value = 1) {
    const onValueChange = vi.fn();
    render(
      <RangeLabel
        label="Precio mínimo"
        value={value}
        onValueChange={onValueChange}
      />,
    );
    return { onValueChange };
  }

  it("muestra el valor como un botón", () => {
    renderEditable();

    expect(
      screen.getByRole("button", { name: /precio mínimo: 1€/i }),
    ).toBeInTheDocument();
  });

  it("al hacer clic muestra un campo enfocado con el valor actual", async () => {
    const user = userEvent.setup();
    renderEditable();

    await user.click(screen.getByRole("button"));

    const input = screen.getByRole("spinbutton", { name: "Precio mínimo" });
    expect(input).toHaveValue(1);
    expect(input).toHaveFocus();
  });

  it("confirma el nuevo valor al pulsar Enter", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderEditable();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "50{Enter}");

    expect(onValueChange).toHaveBeenCalledWith(50);
  });

  it("confirma el nuevo valor al salir del campo", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderEditable();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "25");
    await user.tab();

    expect(onValueChange).toHaveBeenCalledWith(25);
  });

  it("vuelve a mostrar el botón después de confirmar", async () => {
    const user = userEvent.setup();
    renderEditable();

    await user.click(screen.getByRole("button"));
    await user.type(screen.getByRole("spinbutton"), "{Enter}");

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("cancela la edición al pulsar Escape", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderEditable();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "50{Escape}");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /1€/ })).toBeInTheDocument();
  });

  it("no confirma si el campo está vacío", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderEditable();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.tab();

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("no confirma si el valor no ha cambiado", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderEditable();

    await user.click(screen.getByRole("button"));
    await user.tab();

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
