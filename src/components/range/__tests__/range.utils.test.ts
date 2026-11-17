import { describe, expect, it } from "vitest";
import {
  clamp,
  clampRange,
  formatCurrency,
  getKeyboardValue,
  getPercentFromPointer,
  parseLabelValue,
  percentToValue,
  valueToPercent,
} from "../utils/range.utils";

describe("clamp", () => {
  it("devuelve el valor si está dentro de los límites", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("devuelve el mínimo si el valor es menor", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it("devuelve el máximo si el valor es mayor", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});

describe("valueToPercent", () => {
  it("devuelve 0 para el valor mínimo", () => {
    expect(valueToPercent(1, 1, 100)).toBe(0);
  });

  it("devuelve 100 para el valor máximo", () => {
    expect(valueToPercent(100, 1, 100)).toBe(100);
  });

  it("calcula el porcentaje de un valor intermedio", () => {
    expect(valueToPercent(2, 0, 5)).toBeCloseTo(40);
  });

  it("devuelve 0 si el mínimo y el máximo son iguales", () => {
    expect(valueToPercent(10, 10, 10)).toBe(0);
  });
});

describe("percentToValue", () => {
  it("devuelve el mínimo para el 0%", () => {
    expect(percentToValue(0, 1, 100)).toBe(1);
  });

  it("devuelve el máximo para el 100%", () => {
    expect(percentToValue(100, 1, 100)).toBe(100);
  });

  it("redondea al entero más cercano", () => {
    expect(percentToValue(37.4, 0, 100)).toBe(37);
  });

  it("devuelve el índice más cercano en un rango de índices", () => {
    expect(percentToValue(45, 0, 5)).toBe(2);
  });
});

describe("getPercentFromPointer", () => {
  it("calcula el porcentaje del puntero dentro de la barra", () => {
    expect(getPercentFromPointer(150, 100, 200)).toBe(25);
  });

  it("devuelve 0 si el puntero está a la izquierda de la barra", () => {
    expect(getPercentFromPointer(50, 100, 200)).toBe(0);
  });

  it("devuelve 100 si el puntero está a la derecha de la barra", () => {
    expect(getPercentFromPointer(400, 100, 200)).toBe(100);
  });

  it("devuelve 0 si la barra no tiene ancho", () => {
    expect(getPercentFromPointer(150, 100, 0)).toBe(0);
  });
});

describe("formatCurrency", () => {
  it("formatea un entero", () => {
    expect(formatCurrency(1)).toBe("1€");
  });

  it("formatea un decimal", () => {
    expect(formatCurrency(5.99)).toBe("5.99€");
  });
});

const BOUNDS = { min: 0, max: 100 };

describe("clampRange", () => {
  it("devuelve la misma selección si ya está dentro de los límites", () => {
    const selected = { min: 10, max: 90 };

    expect(clampRange(selected, BOUNDS)).toBe(selected);
  });

  it("recoloca la selección dentro de unos límites más estrechos", () => {
    expect(clampRange({ min: 0, max: 100 }, { min: 10, max: 50 })).toEqual({
      min: 10,
      max: 50,
    });
  });

  it("mantiene al menos una unidad de separación entre los tiradores", () => {
    expect(clampRange({ min: 80, max: 90 }, { min: 0, max: 50 })).toEqual({
      min: 49,
      max: 50,
    });
  });
});

describe("getKeyboardValue", () => {
  it.each([
    ["ArrowRight", 51],
    ["ArrowUp", 51],
    ["ArrowLeft", 49],
    ["ArrowDown", 49],
    ["PageUp", 60],
    ["PageDown", 40],
    ["Home", 0],
    ["End", 100],
  ])("calcula el valor para la tecla %s", (key, expected) => {
    expect(getKeyboardValue(key, 50, BOUNDS)).toBe(expected);
  });

  it("salta al menos una unidad con PageUp en rangos pequeños", () => {
    expect(getKeyboardValue("PageUp", 2, { min: 0, max: 5 })).toBe(3);
  });

  it("devuelve null si la tecla no mueve el tirador", () => {
    expect(getKeyboardValue("Tab", 50, BOUNDS)).toBeNull();
  });
});

describe("parseLabelValue", () => {
  it("convierte el texto en un número", () => {
    expect(parseLabelValue("42")).toBe(42);
  });

  it("redondea al entero más cercano", () => {
    expect(parseLabelValue("30.6")).toBe(31);
  });

  it.each(["", "   ", "abc"])("devuelve null para %j", (input) => {
    expect(parseLabelValue(input)).toBeNull();
  });
});
