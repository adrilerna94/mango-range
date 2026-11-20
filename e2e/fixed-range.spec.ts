import { expect, test } from "@playwright/test";
import { dragWithMouse, getHandles } from "./helpers";

const VALUES = [
  "1,99\u00a0€",
  "5,99\u00a0€",
  "10,99\u00a0€",
  "30,99\u00a0€",
  "50,99\u00a0€",
  "70,99\u00a0€",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/exercise2");
});

test.describe("Ejercicio 2: rango de valores fijos", () => {
  test("carga los valores del servicio HTTP", async ({ page }) => {
    const { minHandle, maxHandle } = getHandles(page);

    await expect(minHandle).toHaveAttribute("aria-valuetext", "1,99\u00a0€");
    await expect(maxHandle).toHaveAttribute("aria-valuetext", "70,99\u00a0€");
  });

  test("las etiquetas no son editables", async ({ page }) => {
    await expect(page.getByText("1,99\u00a0€")).toBeVisible();
    await expect(page.getByRole("button", { name: /Editar/ })).toHaveCount(0);
  });

  test("al arrastrar solo se puede elegir uno de los valores fijos", async ({
    page,
  }) => {
    const { minHandle } = getHandles(page);

    await dragWithMouse(page, minHandle, 45);

    await expect(minHandle).toHaveAttribute("aria-valuetext", "10,99\u00a0€");
    expect(VALUES).toContain(await minHandle.getAttribute("aria-valuetext"));
    await expect(page.getByText("10,99\u00a0€")).toBeVisible();
  });

  test("los tiradores no se cruzan al arrastrar", async ({ page }) => {
    const { minHandle, maxHandle } = getHandles(page);

    await dragWithMouse(page, maxHandle, 0);

    await expect(minHandle).toHaveAttribute("aria-valuetext", "1,99\u00a0€");
    await expect(maxHandle).toHaveAttribute("aria-valuetext", "5,99\u00a0€");
  });

  test("con el teclado avanza al siguiente valor fijo", async ({ page }) => {
    const { minHandle } = getHandles(page);

    await minHandle.focus();
    await page.keyboard.press("ArrowRight");

    await expect(minHandle).toHaveAttribute("aria-valuetext", "5,99\u00a0€");
  });
});
