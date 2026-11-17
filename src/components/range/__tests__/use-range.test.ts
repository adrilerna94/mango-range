import type { KeyboardEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRange } from "../hooks/use-range";

function createTrack(left: number, width: number) {
  const track = document.createElement("div");
  track.getBoundingClientRect = () => ({ left, width }) as DOMRect;
  return track;
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

function renderRange() {
  const { result } = renderHook(() => useRange({ min: 0, max: 100 }));
  result.current.trackRef.current = createTrack(0, 200);
  return result;
}

function keyEvent(key: string) {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent<HTMLElement>;
}

describe("useRange: valores", () => {
  it("empieza con los límites del rango", () => {
    const result = renderRange();

    expect(result.current.minValue).toBe(0);
    expect(result.current.maxValue).toBe(100);
  });

  it("cambia el valor de un tirador", () => {
    const result = renderRange();

    act(() => result.current.setValue("min", 30));

    expect(result.current.minValue).toBe(30);
  });

  it("limita el valor a los límites del rango", () => {
    const result = renderRange();

    act(() => result.current.setValue("min", -50));

    expect(result.current.minValue).toBe(0);
  });

  it("no deja que los tiradores se crucen", () => {
    const result = renderRange();

    act(() => result.current.setValue("max", 40));
    act(() => result.current.setValue("min", 90));

    expect(result.current.minValue).toBe(39);
    expect(result.current.maxValue).toBe(40);
  });

  it("recoloca los valores si los límites se estrechan", () => {
    const { result, rerender } = renderHook((bounds) => useRange(bounds), {
      initialProps: { min: 0, max: 100 },
    });

    rerender({ min: 10, max: 50 });

    expect(result.current.minValue).toBe(10);
    expect(result.current.maxValue).toBe(50);
  });
});

describe("useRange: arrastre", () => {
  it("no hay ningún tirador activo al empezar", () => {
    const result = renderRange();

    expect(result.current.activeHandle).toBeNull();
  });

  it("marca el tirador que se está arrastrando", () => {
    const result = renderRange();

    act(() => result.current.startDragging("min"));

    expect(result.current.activeHandle).toBe("min");
  });

  it("mueve el tirador mínimo al arrastrar", () => {
    const result = renderRange();

    act(() => result.current.startDragging("min"));
    movePointer(50);

    expect(result.current.minValue).toBe(25);
  });

  it("mueve el tirador máximo al arrastrar", () => {
    const result = renderRange();

    act(() => result.current.startDragging("max"));
    movePointer(150);

    expect(result.current.maxValue).toBe(75);
  });

  it("no deja cruzar los tiradores al arrastrar", () => {
    const result = renderRange();

    act(() => result.current.startDragging("min"));
    movePointer(200);

    expect(result.current.minValue).toBe(99);
  });

  it("deja de arrastrar al soltar el puntero", () => {
    const result = renderRange();

    act(() => result.current.startDragging("min"));
    releasePointer();
    movePointer(50);

    expect(result.current.activeHandle).toBeNull();
    expect(result.current.minValue).toBe(0);
  });

  it("muestra el cursor de arrastre en toda la página mientras se arrastra", () => {
    const result = renderRange();

    act(() => result.current.startDragging("min"));
    expect(document.body.style.cursor).toBe("grabbing");

    releasePointer();
    expect(document.body.style.cursor).toBe("");
  });
});

describe("useRange: tirador superior", () => {
  it("deja el máximo por encima al empezar", () => {
    const result = renderRange();

    expect(result.current.topHandle).toBe("max");
  });

  it("deja por encima el último tirador movido", () => {
    const result = renderRange();

    act(() => result.current.startDragging("min"));
    releasePointer();

    expect(result.current.topHandle).toBe("min");
  });
});

describe("useRange: teclado", () => {
  it("mueve el tirador con las teclas de dirección", () => {
    const result = renderRange();

    act(() => result.current.handleKeyDown("min")(keyEvent("ArrowRight")));

    expect(result.current.minValue).toBe(1);
  });

  it("evita el scroll de la página al usar una tecla del slider", () => {
    const result = renderRange();
    const event = keyEvent("PageDown");

    act(() => result.current.handleKeyDown("max")(event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.maxValue).toBe(90);
  });

  it("ignora las teclas que no mueven el tirador", () => {
    const result = renderRange();
    const event = keyEvent("Tab");

    act(() => result.current.handleKeyDown("min")(event));

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current.minValue).toBe(0);
  });
});
