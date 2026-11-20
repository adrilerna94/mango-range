import { expect, test } from "@playwright/test";
import { dragWithTouch, getHandles } from "./helpers";

for (const { path, from, to } of [
  { path: "/exercise1", from: "1\u00a0€", to: /^(?!1\u00a0€$)\d+\u00a0€$/ },
  {
    path: "/exercise2",
    from: "1,99\u00a0€",
    to: /^(?!1,99\u00a0€$)[\d,]+\u00a0€$/,
  },
]) {
  test.describe(`Móvil ${path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test("se arrastra con el dedo", async ({ page }) => {
      const { minHandle } = getHandles(page);
      await expect(minHandle).toHaveAttribute("aria-valuetext", from);

      await dragWithTouch(page, minHandle, 60);

      await expect(minHandle).toHaveAttribute("aria-valuetext", to);
    });

    test("el tirador tiene una zona táctil de 44px", async ({ page }) => {
      const { minHandle } = getHandles(page);
      const box = (await minHandle.boundingBox())!;
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

      // El punto visible mide 16px; a 20px del centro (dentro del círculo de
      // 44px) el elemento que recibe el toque debe seguir siendo el tirador.
      // Se comprueba con hit-testing porque Chrome corrige los toques
      // imprecisos y un arrastre simulado no detectaría una zona pequeña.
      for (const [dx, dy] of [
        [20, 0],
        [-20, 0],
        [0, 20],
        [0, -20],
      ]) {
        const label = await page.evaluate(
          ({ x, y }) =>
            document.elementFromPoint(x, y)?.getAttribute("aria-label"),
          { x: center.x + dx, y: center.y + dy },
        );
        expect(label, `punto (${dx}, ${dy})`).toBe("Precio mínimo");
      }
    });

    test("las etiquetas quedan encima de la barra, que ocupa el ancho", async ({
      page,
    }) => {
      const { minHandle } = getHandles(page);
      const track = await minHandle.locator("..").boundingBox();
      const group = await page.getByRole("group").boundingBox();
      const label = await page.getByText(from, { exact: true }).boundingBox();

      expect(label!.y + label!.height).toBeLessThanOrEqual(track!.y);
      expect(track!.width).toBeCloseTo(group!.width, 0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
      ).toBe(false);
    });
  });
}
