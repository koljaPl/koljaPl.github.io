import { test, expect } from "@playwright/test";
import { brainRegions } from "../../src/data/brain";
test("3D picking, keyboard and drag rotation, reset, selection synchronization and mobile disposal", async ({
  page,
}) => {
  await page.goto("/");
  const model = page.locator("[data-brain-model]");
  await expect(model).toHaveAttribute("data-rendered", "3d");
  const host = page.locator("[data-brain-3d]"),
    canvas = host.locator("canvas");
  await canvas.focus();
  await canvas.press("ArrowRight");
  await expect(host).toHaveAttribute("data-rotation", "changed");
  await canvas.press("Home");
  await expect(host).toHaveAttribute("data-rotation", "0");
  for (const region of brainRegions) {
    await page.locator(`[data-region-select="${region.id}"]`).click();
    await expect(host).toHaveAttribute("data-selected", region.id);
  }
  await page
    .getByRole("button", { name: "Clear brain region selection" })
    .click();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 60,
    box.y + box.height / 2 + 10,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(host).toHaveAttribute("data-rotation", "changed");
  await expect(host).toHaveAttribute("data-selected", "");
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(host).toHaveAttribute("data-rotation", "0");
  // Center tissue is pickable; no synthetic selection event.
  await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
  await expect(model.locator('[aria-pressed="true"]')).toHaveCount(1);
  await canvas.focus();
  await page.setViewportSize({ width: 720, height: 900 });
  await expect(canvas).toHaveCount(0);
  await expect(page.locator(".hero__actions a").first()).toBeFocused();
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(host.locator("canvas")).toBeVisible();
});
test("mobile never downloads the renderer or atlas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  await page.goto("/");
  await page.waitForTimeout(1200);
  expect(
    urls.filter((u) => u.includes("brain-3d") || u.endsWith("atlas.glb")),
  ).toEqual([]);
});
test("WebGL failure retains selectable SVG", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator("[data-brain-model]")).toHaveAttribute(
    "data-rendered",
    "2d",
  );
  await expect(page.locator(".brain-diagram")).toBeVisible();
  await page.locator('[data-region-select="temporal"]').click();
  await expect(page.locator("[data-brain-label]")).toHaveText("Temporal lobe");
});
test("strip deep links open the matching account and reveal its heading", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".stats-strip__heading")).toHaveCount(0);
  await page
    .locator('.stats-strip__static a[href="/about/#account-github-koljapl"]')
    .first()
    .click();
  const card = page.locator("#account-github-koljapl");
  await expect(card.locator(".account-card__details")).toHaveAttribute(
    "open",
    "",
  );
  await expect(card.locator("h3")).toBeFocused();
  await expect(card).not.toContainText("Approximately 9 years");
  await expect(card.locator(".activity-calendar")).toBeVisible();
  await expect(card.locator(".account-card__headline > div")).toHaveCount(3);
});
test("hero destinations, readable name and controlled butterfly motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero__secondary-links a")).toHaveCount(1);
  await expect(page.locator(".hero__secondary-links a")).toHaveAttribute(
    "href",
    "https://github.com/koljaPl",
  );
  await expect(page.locator(".hand-underline")).toHaveCount(4);
  await expect(
    page.getByRole("heading", { name: "Nicklas Plugin", exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/about/");
  const butterfly = page.locator("[data-butterfly]");
  await expect(butterfly).toHaveAttribute("data-moving", "true");
  await butterfly
    .getByRole("button", { name: "Pause butterfly animation" })
    .click();
  await expect(butterfly).toHaveAttribute("data-moving", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(butterfly.locator("[data-butterfly-toggle]")).toBeHidden();
  await expect(butterfly.locator(".butterfly-wing").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".content-needed__title").first()).toHaveCSS(
    "font-size",
    "16.4px",
  );
});

test("2D renderer configuration uses shared controls without requesting 3D assets", async ({
  page,
}) => {
  await page.route("http://127.0.0.1:4322/", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      'data-renderer="3d"',
      'data-renderer="2d"',
    );
    await route.fulfill({ response, body });
  });
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/");
  await expect(page.locator(".brain-diagram")).toBeVisible();
  await page.locator('[data-region-select="occipital"]').click();
  await expect(page.locator("[data-brain-label]")).toHaveText("Occipital lobe");
  await page.waitForTimeout(900);
  expect(
    requests.filter(
      (url) => url.includes("brain-3d") || url.endsWith("atlas.glb"),
    ),
  ).toEqual([]);
});

test("resizing during model loading cancels cleanly and permits desktop restoration", async ({
  page,
}) => {
  await page.route("**/brain/atlas.glb", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue().catch(() => undefined);
  });
  const loading = page.waitForRequest("**/brain/atlas.glb");
  await page.goto("/");
  await loading;
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-brain-model]")).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator("[data-brain-model]")).toHaveAttribute(
    "data-rendered",
    "3d",
  );
  await expect(page.locator("[data-brain-3d] canvas")).toHaveCount(1);
});
