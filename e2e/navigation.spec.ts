import { expect, test } from "@playwright/test";

test.describe("Navegación", () => {
  for (const { name, path, title, heading } of [
    {
      name: /Ejercicio 1/,
      path: "/exercise1",
      title: "Ejercicio 1 | Mango Range",
      heading: "Rango normal",
    },
    {
      name: /Ejercicio 2/,
      path: "/exercise2",
      title: "Ejercicio 2 | Mango Range",
      heading: "Rango de valores fijos",
    },
  ]) {
    test(`va de la portada a ${path} y vuelve`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name }).click();

      await expect(page).toHaveURL(path);
      await expect(page).toHaveTitle(title);
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      await expect(page.getByRole("slider")).toHaveCount(2);

      await page.getByRole("link", { name: "Volver al inicio" }).click();
      await expect(page).toHaveURL("/");
    });
  }
});
