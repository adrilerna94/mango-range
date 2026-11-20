import { expect, test } from "@playwright/test";
import { dragWithMouse, getHandles, valueNow } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/exercise1");
});

test.describe("Ejercicio 1: rango normal", () => {
  test("carga los límites del servicio HTTP", async ({ page }) => {
    const { minHandle, maxHandle } = getHandles(page);

    await expect(minHandle).toHaveAttribute("aria-valuetext", "1\u00a0€");
    await expect(maxHandle).toHaveAttribute("aria-valuetext", "100\u00a0€");
    await expect(
      page.getByRole("button", { name: "Editar precio mínimo: 1\u00a0€" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Editar precio máximo: 100\u00a0€" }),
    ).toBeVisible();
  });

  test("arrastra los tiradores con el ratón", async ({ page }) => {
    const { minHandle, maxHandle } = getHandles(page);

    await dragWithMouse(page, minHandle, 25);
    await dragWithMouse(page, maxHandle, 75);

    expect(await valueNow(minHandle)).toBeGreaterThanOrEqual(24);
    expect(await valueNow(minHandle)).toBeLessThanOrEqual(27);
    expect(await valueNow(maxHandle)).toBeGreaterThanOrEqual(74);
    expect(await valueNow(maxHandle)).toBeLessThanOrEqual(77);
  });

  test("solo arrastra con el botón principal del ratón", async ({ page }) => {
    const { minHandle } = getHandles(page);

    await dragWithMouse(page, minHandle, 50, "right");
    await expect(minHandle).toHaveAttribute("aria-valuenow", "1");

    await dragWithMouse(page, minHandle, 50, "middle");
    await expect(minHandle).toHaveAttribute("aria-valuenow", "1");
  });

  test("los tiradores no se cruzan al arrastrar", async ({ page }) => {
    const { minHandle, maxHandle } = getHandles(page);

    await dragWithMouse(page, minHandle, 100);

    await expect(minHandle).toHaveAttribute("aria-valuenow", "99");
    await expect(maxHandle).toHaveAttribute("aria-valuenow", "100");
  });

  test("el tirador se agranda y cambia el cursor al pasar el ratón y al arrastrar", async ({
    page,
  }) => {
    const { minHandle } = getHandles(page);
    const scale = () =>
      minHandle.evaluate((element) => getComputedStyle(element).scale);

    await expect(minHandle).toHaveCSS("cursor", "grab");

    await minHandle.hover();
    await expect.poll(scale).toBe("1.25");

    await page.mouse.down();
    await expect(page.locator("body")).toHaveCSS("cursor", "grabbing");
    await expect.poll(scale).toBe("1.25");

    await page.mouse.up();
    await expect(page.locator("body")).not.toHaveCSS("cursor", "grabbing");
  });

  test("al editar una etiqueta se mueve su tirador", async ({ page }) => {
    const { minHandle } = getHandles(page);

    await page.getByRole("button", { name: /Editar precio mínimo/ }).click();
    await page.getByRole("spinbutton", { name: "Precio mínimo" }).fill("30");
    await page.keyboard.press("Enter");

    await expect(minHandle).toHaveAttribute("aria-valuenow", "30");
    await expect(
      page.getByRole("button", { name: "Editar precio mínimo: 30\u00a0€" }),
    ).toBeFocused();
  });

  test("un valor escrito fuera de los límites se ajusta al rango", async ({
    page,
  }) => {
    const { maxHandle } = getHandles(page);

    await page.getByRole("button", { name: /Editar precio máximo/ }).click();
    await page.getByRole("spinbutton", { name: "Precio máximo" }).fill("500");
    await page.keyboard.press("Enter");

    await expect(maxHandle).toHaveAttribute("aria-valuenow", "100");
  });

  test("se maneja con el teclado", async ({ page }) => {
    const { minHandle, maxHandle } = getHandles(page);

    await minHandle.focus();
    await page.keyboard.press("ArrowRight");
    await expect(minHandle).toHaveAttribute("aria-valuenow", "2");

    await page.keyboard.press("Tab");
    await expect(maxHandle).toBeFocused();
    await page.keyboard.press("Home");
    await expect(maxHandle).toHaveAttribute("aria-valuenow", "3");
  });
});
