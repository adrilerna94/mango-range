import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRange } from "./use-range";

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
