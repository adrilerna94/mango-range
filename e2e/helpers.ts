import { expect, type Locator, type Page } from "@playwright/test";

type Point = { x: number; y: number };

export function getHandles(page: Page) {
  return {
    minHandle: page.getByRole("slider", { name: "Precio mínimo" }),
    maxHandle: page.getByRole("slider", { name: "Precio máximo" }),
  };
}

async function center(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

/** Punto de la barra (el padre de los tiradores) en el porcentaje indicado. */
export async function trackPoint(
  handle: Locator,
  percent: number,
): Promise<Point> {
  const box = await handle.locator("..").boundingBox();
  expect(box).not.toBeNull();
  return {
    x: box!.x + (box!.width * percent) / 100,
    y: box!.y + box!.height / 2,
  };
}

export async function dragWithMouse(
  page: Page,
  handle: Locator,
  toPercent: number,
) {
  const from = await center(handle);
  const to = await trackPoint(handle, toPercent);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.mouse.up();
}

/**
 * Arrastre táctil real con CDP: `page.touchscreen` solo permite toques
 * sueltos.
 */
export async function dragWithTouch(
  page: Page,
  handle: Locator,
  toPercent: number,
) {
  const cdp = await page.context().newCDPSession(page);
  const from = await center(handle);
  const to = { x: (await trackPoint(handle, toPercent)).x, y: from.y };
  const touch = ({ x, y }: Point) => [{ x, y, id: 1, radiusX: 4, radiusY: 4 }];
  const steps = 10;

  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: touch(from),
  });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: touch({
        x: from.x + ((to.x - from.x) * i) / steps,
        y: from.y,
      }),
    });
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
}

export async function valueNow(handle: Locator): Promise<number> {
  return Number(await handle.getAttribute("aria-valuenow"));
}
