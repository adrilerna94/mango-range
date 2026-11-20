import type { KeyboardEvent, PointerEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRange } from "../hooks/use-range";

// Las reglas de límites y de no cruzarse se prueban en `moveHandle`
// (range.utils.test.ts). Aquí solo se prueba lo propio del hook: estado,
// arrastre con el puntero y teclado.

function createTrack(left: number, width: number) {
  const track = document.createElement("div");
  track.getBoundingClientRect = () => ({ left, width }) as DOMRect;
  return track;
}

type RangeResult = ReturnType<typeof renderRange>;
type Handle = "min" | "max";

function pointerEvent({ pointerId = 1, button = 0, clientX = 0 } = {}) {
  return {
    pointerId,
    button,
    clientX,
    currentTarget: { setPointerCapture: vi.fn() },
  } as unknown as PointerEvent<HTMLElement>;
}

function pressPointer(
  result: RangeResult,
  handle: Handle,
  init?: Parameters<typeof pointerEvent>[0],
) {
  const event = pointerEvent(init);
  act(() => result.current.getPointerHandlers(handle).onPointerDown(event));
  return event;
}

function movePointer(
  result: RangeResult,
  handle: Handle,
  clientX: number,
  pointerId = 1,
) {
  act(() =>
    result.current
      .getPointerHandlers(handle)
      .onPointerMove(pointerEvent({ clientX, pointerId })),
  );
}

function releasePointer(
  result: RangeResult,
  handle: Handle,
  type:
    "onPointerUp" | "onPointerCancel" | "onLostPointerCapture" = "onPointerUp",
  pointerId = 1,
) {
  act(() =>
    result.current
      .getPointerHandlers(handle)
      [type](pointerEvent({ pointerId })),
  );
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

    pressPointer(result, "min");

    expect(result.current.activeHandle).toBe("min");
  });

  it("captura el puntero para seguir el arrastre fuera del tirador", () => {
    const result = renderRange();

    const event = pressPointer(result, "min", { pointerId: 7 });

    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(7);
  });

  it("mueve el tirador mínimo al arrastrar", () => {
    const result = renderRange();

    pressPointer(result, "min");
    movePointer(result, "min", 50);

    expect(result.current.minValue).toBe(25);
  });

  it("mueve el tirador máximo al arrastrar", () => {
    const result = renderRange();

    pressPointer(result, "max");
    movePointer(result, "max", 150);

    expect(result.current.maxValue).toBe(75);
  });

  it("no empieza a arrastrar con un botón que no sea el principal", () => {
    const result = renderRange();

    pressPointer(result, "min", { button: 2 });
    movePointer(result, "min", 50);

    expect(result.current.activeHandle).toBeNull();
    expect(result.current.minValue).toBe(0);
  });

  it("ignora un segundo puntero mientras se arrastra", () => {
    const result = renderRange();

    pressPointer(result, "min", { pointerId: 1 });
    pressPointer(result, "max", { pointerId: 2 });
    movePointer(result, "min", 150, 2);
    releasePointer(result, "min", "onPointerUp", 2);

    expect(result.current.activeHandle).toBe("min");
    expect(result.current.minValue).toBe(0);
  });

  it("deja de arrastrar al soltar el puntero", () => {
    const result = renderRange();

    pressPointer(result, "min");
    releasePointer(result, "min");
    movePointer(result, "min", 50);

    expect(result.current.activeHandle).toBeNull();
    expect(result.current.minValue).toBe(0);
  });

  it.each(["onPointerCancel", "onLostPointerCapture"] as const)(
    "deja de arrastrar con %s",
    (type) => {
      const result = renderRange();

      pressPointer(result, "min");
      releasePointer(result, "min", type);

      expect(result.current.activeHandle).toBeNull();
    },
  );

  it("no empieza a arrastrar si la barra no está montada", () => {
    const { result } = renderHook(() => useRange({ min: 0, max: 100 }));

    pressPointer(result, "min");
    movePointer(result, "min", 50);

    expect(result.current.activeHandle).toBeNull();
    expect(result.current.minValue).toBe(0);
  });

  it("lee la posición de la barra una sola vez por arrastre", () => {
    const result = renderRange();
    const track = result.current.trackRef.current!;
    const spy = vi.spyOn(track, "getBoundingClientRect");

    pressPointer(result, "min");
    movePointer(result, "min", 20);
    movePointer(result, "min", 40);
    movePointer(result, "min", 60);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("muestra el cursor de arrastre en toda la página mientras se arrastra", () => {
    const result = renderRange();

    pressPointer(result, "min");
    expect(document.body.style.cursor).toBe("grabbing");

    releasePointer(result, "min");
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

    pressPointer(result, "min");
    releasePointer(result, "min");

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
