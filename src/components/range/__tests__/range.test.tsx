import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Range } from "../range";

function renderRange() {
  render(<Range mode="normal" min={0} max={100} />);

  return {
    minHandle: screen.getByRole("slider", { name: "Precio mínimo" }),
    maxHandle: screen.getByRole("slider", { name: "Precio máximo" }),
  };
}

async function editLabel(user: UserEvent, name: RegExp, value: string) {
  await user.click(screen.getByRole("button", { name }));
  const input = screen.getByRole("spinbutton");
  await user.clear(input);
  await user.type(input, `${value}{Enter}`);
}

function mockTrackSize(left: number, width: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left,
    width,
  } as DOMRect);
}

function movePointer(clientX: number) {
  act(() => {
    window.dispatchEvent(new MouseEvent("pointermove", { clientX }));
  });
}

function releasePointer() {
  act(() => {
    window.dispatchEvent(new MouseEvent("pointerup"));
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Range en modo normal: estado inicial", () => {
  it("agrupa los dos tiradores bajo un nombre accesible", () => {
    renderRange();

    expect(
      screen.getByRole("group", { name: "Rango de precios" }),
    ).toBeInTheDocument();
  });

  it("empieza con los tiradores en los límites", () => {
    const { minHandle, maxHandle } = renderRange();

    expect(minHandle).toHaveAttribute("aria-valuenow", "0");
    expect(maxHandle).toHaveAttribute("aria-valuenow", "100");
  });

  it("coloca los tiradores en los extremos de la barra", () => {
    const { minHandle, maxHandle } = renderRange();

    expect(minHandle).toHaveStyle({ left: "0%" });
    expect(maxHandle).toHaveStyle({ left: "100%" });
  });

  it("muestra los límites como etiquetas de precio", () => {
    renderRange();

    expect(
      screen.getByRole("button", { name: /precio mínimo: 0€/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /precio máximo: 100€/i }),
    ).toBeInTheDocument();
  });
});

describe("Range en modo normal: edición de etiquetas", () => {
  it("mueve el tirador al escribir un nuevo valor mínimo", async () => {
    const user = userEvent.setup();
    const { minHandle } = renderRange();

    await editLabel(user, /editar precio mínimo/i, "30");

    expect(minHandle).toHaveAttribute("aria-valuenow", "30");
    expect(minHandle).toHaveStyle({ left: "30%" });
    expect(
      screen.getByRole("button", { name: /precio mínimo: 30€/i }),
    ).toBeInTheDocument();
  });

  it("limita el valor escrito al máximo del rango", async () => {
    const user = userEvent.setup();
    const { maxHandle } = renderRange();

    await editLabel(user, /editar precio máximo/i, "500");

    expect(maxHandle).toHaveAttribute("aria-valuenow", "100");
  });

  it("no deja que un valor escrito cruce el otro tirador", async () => {
    const user = userEvent.setup();
    const { minHandle } = renderRange();

    await editLabel(user, /editar precio máximo/i, "40");
    await editLabel(user, /editar precio mínimo/i, "90");

    expect(minHandle).toHaveAttribute("aria-valuenow", "39");
  });

  it("actualiza los límites ARIA de cada tirador según el otro", async () => {
    const user = userEvent.setup();
    const { minHandle, maxHandle } = renderRange();

    await editLabel(user, /editar precio mínimo/i, "20");
    await editLabel(user, /editar precio máximo/i, "60");

    expect(minHandle).toHaveAttribute("aria-valuemax", "59");
    expect(maxHandle).toHaveAttribute("aria-valuemin", "21");
  });
});

describe("Range en modo normal: arrastre y teclado", () => {
  it("mueve el tirador mínimo al arrastrarlo", () => {
    mockTrackSize(0, 200);
    const { minHandle } = renderRange();

    fireEvent.pointerDown(minHandle);
    movePointer(50);

    expect(minHandle).toHaveAttribute("aria-valuenow", "25");
  });

  it("mueve el tirador máximo al arrastrarlo", () => {
    mockTrackSize(0, 200);
    const { maxHandle } = renderRange();

    fireEvent.pointerDown(maxHandle);
    movePointer(150);

    expect(maxHandle).toHaveAttribute("aria-valuenow", "75");
  });

  it("muestra el cursor de arrastre solo mientras se arrastra", () => {
    mockTrackSize(0, 200);
    const { minHandle } = renderRange();

    fireEvent.pointerDown(minHandle);
    expect(minHandle).toHaveClass("cursor-grabbing");

    releasePointer();
    expect(minHandle).toHaveClass("cursor-grab");
  });

  it("mueve el tirador con las flechas del teclado", async () => {
    const user = userEvent.setup();
    const { minHandle } = renderRange();

    minHandle.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");

    expect(minHandle).toHaveAttribute("aria-valuenow", "2");
    expect(minHandle).toHaveStyle({ left: "2%" });
  });
});

const FIXED_VALUES = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

function renderFixedRange() {
  render(<Range mode="fixed" values={FIXED_VALUES} />);

  return {
    minHandle: screen.getByRole("slider", { name: "Precio mínimo" }),
    maxHandle: screen.getByRole("slider", { name: "Precio máximo" }),
  };
}

describe("Range en modo fijo: estado inicial", () => {
  it("empieza con los tiradores en el primer y el último valor", () => {
    const { minHandle, maxHandle } = renderFixedRange();

    expect(minHandle).toHaveAttribute("aria-valuetext", "1.99€");
    expect(maxHandle).toHaveAttribute("aria-valuetext", "70.99€");
  });

  it("usa la posición en la lista como valor numérico del slider", () => {
    const { minHandle, maxHandle } = renderFixedRange();

    expect(minHandle).toHaveAttribute("aria-valuenow", "0");
    expect(maxHandle).toHaveAttribute("aria-valuenow", "5");
  });

  it("coloca los tiradores en los extremos de la barra", () => {
    const { minHandle, maxHandle } = renderFixedRange();

    expect(minHandle).toHaveStyle({ left: "0%" });
    expect(maxHandle).toHaveStyle({ left: "100%" });
  });

  it("muestra los precios como texto", () => {
    renderFixedRange();

    expect(screen.getByText("1.99€")).toBeInTheDocument();
    expect(screen.getByText("70.99€")).toBeInTheDocument();
  });

  it("no permite editar los precios", () => {
    renderFixedRange();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("Range en modo fijo: arrastre y teclado", () => {
  it("ajusta el tirador al valor más cercano de la lista", () => {
    mockTrackSize(0, 200);
    const { minHandle } = renderFixedRange();

    fireEvent.pointerDown(minHandle);
    movePointer(90);

    expect(minHandle).toHaveAttribute("aria-valuetext", "10.99€");
    expect(minHandle).toHaveStyle({ left: "40%" });
  });

  it("actualiza la etiqueta con el precio seleccionado", () => {
    mockTrackSize(0, 200);
    const { minHandle } = renderFixedRange();

    fireEvent.pointerDown(minHandle);
    movePointer(90);

    expect(screen.getByText("10.99€")).toBeInTheDocument();
  });

  it("no deja que los tiradores coincidan en el mismo valor", () => {
    mockTrackSize(0, 200);
    const { maxHandle } = renderFixedRange();

    fireEvent.pointerDown(maxHandle);
    movePointer(0);

    expect(maxHandle).toHaveAttribute("aria-valuetext", "5.99€");
  });

  it("pasa al siguiente valor de la lista con las flechas", async () => {
    const user = userEvent.setup();
    const { minHandle } = renderFixedRange();

    minHandle.focus();
    await user.keyboard("{ArrowRight}");

    expect(minHandle).toHaveAttribute("aria-valuetext", "5.99€");
    expect(screen.getByText("5.99€")).toBeInTheDocument();
  });

  it("con End se queda en el valor anterior al del otro tirador", async () => {
    const user = userEvent.setup();
    const { minHandle } = renderFixedRange();

    minHandle.focus();
    await user.keyboard("{End}");

    expect(minHandle).toHaveAttribute("aria-valuetext", "50.99€");
  });
});
