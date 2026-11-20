import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditableLabel } from "../editable-label";

function renderLabel(value = 1) {
  const onValueChange = vi.fn();
  render(
    <EditableLabel
      label="Precio mínimo"
      value={value}
      onValueChange={onValueChange}
    />,
  );
  return { onValueChange, user: userEvent.setup() };
}

describe("EditableLabel", () => {
  it("muestra el valor como un botón", () => {
    renderLabel();

    expect(
      screen.getByRole("button", { name: "Editar precio mínimo: 1\u00a0€" }),
    ).toHaveTextContent("1 €");
  });

  it("al hacer clic muestra un campo enfocado con el valor actual", async () => {
    const { user } = renderLabel();

    await user.click(screen.getByRole("button"));

    const input = screen.getByRole("spinbutton", { name: "Precio mínimo" });
    expect(input).toHaveValue(1);
    expect(input).toHaveFocus();
  });

  it("muestra el símbolo del euro junto al campo", async () => {
    const { user } = renderLabel();

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("€")).toHaveAttribute("aria-hidden", "true");
  });

  it("confirma el nuevo valor al pulsar Enter", async () => {
    const { user, onValueChange } = renderLabel();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "50{Enter}");

    expect(onValueChange).toHaveBeenCalledWith(50);
  });

  it("confirma el nuevo valor al salir del campo", async () => {
    const { user, onValueChange } = renderLabel();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "25");
    await user.tab();

    expect(onValueChange).toHaveBeenCalledWith(25);
  });

  it("redondea los decimales al entero más cercano", async () => {
    const { user, onValueChange } = renderLabel();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "30.6{Enter}");

    expect(onValueChange).toHaveBeenCalledWith(31);
  });

  it("cancela la edición al pulsar Escape", async () => {
    const { user, onValueChange } = renderLabel();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "50{Escape}");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /1\u00a0€/ }),
    ).toBeInTheDocument();
  });

  it.each(["{Enter}", "{Escape}"])(
    "devuelve el foco al botón al cerrar con %s",
    async (key) => {
      const { user } = renderLabel();

      await user.click(screen.getByRole("button"));
      await user.keyboard(key);

      expect(screen.getByRole("button")).toHaveFocus();
      expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    },
  );

  it("no recupera el foco si el usuario sale del campo con Tab", async () => {
    const { user } = renderLabel();

    await user.click(screen.getByRole("button"));
    await user.tab();

    expect(screen.getByRole("button")).not.toHaveFocus();
  });

  it("no confirma si el campo está vacío", async () => {
    const { user, onValueChange } = renderLabel();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByRole("spinbutton"));
    await user.tab();

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("no confirma si el valor no ha cambiado", async () => {
    const { user, onValueChange } = renderLabel();

    await user.click(screen.getByRole("button"));
    await user.tab();

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
