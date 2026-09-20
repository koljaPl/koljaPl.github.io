import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test.setTimeout(180_000);

const primaryRoutes = [
  ["home", "/"],
  ["projects", "/projects/"],
  ["project-tppl", "/projects/tppl/"],
  ["project-physics", "/projects/physics-engine/"],
  ["project-algorithms", "/projects/algorithms/"],
  ["project-ml", "/projects/machine-learning/"],
  ["about", "/about/"],
  ["experience", "/experience/"],
  ["contact", "/contact/"],
  ["resume", "/resume/"],
  ["not-found", "/404.html"],
] as const;
const coreViewports = [
  ["mobile", { width: 390, height: 844 }],
  ["desktop", { width: 1440, height: 1000 }],
] as const;
const extraViewports = [
  ["mobile-boundary", { width: 720, height: 1000 }],
  ["tablet-boundary", { width: 721, height: 1000 }],
  ["tablet", { width: 768, height: 1024 }],
  ["small-desktop", { width: 1024, height: 900 }],
  ["large-desktop", { width: 1920, height: 1080 }],
] as const;
const themes = ["light", "dark"] as const;

test("captures every primary route in both themes and representative sizes", async ({
  page,
}) => {
  await mkdir("artifacts/visual", { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  for (const theme of themes) {
    await page.evaluate(
      (value) => localStorage.setItem("nicklas-theme", value),
      theme,
    );
    for (const [viewportName, viewportSize] of coreViewports) {
      await page.setViewportSize(viewportSize);
      for (const [routeName, route] of primaryRoutes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => document.fonts.ready);
        if (route === "/" && viewportSize.width > 720)
          await expect(page.locator("[data-brain-model]")).toHaveAttribute(
            "data-rendered",
            /2d|3d/,
          );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${route} overflows at ${viewportName} in ${theme} mode`,
        ).toBe(true);
        await page.screenshot({
          path: `artifacts/visual/${routeName}-${viewportName}-${theme}.png`,
          fullPage: true,
        });
      }
    }
  }

  for (const theme of themes) {
    await page.evaluate(
      (value) => localStorage.setItem("nicklas-theme", value),
      theme,
    );
    for (const [viewportName, viewportSize] of extraViewports) {
      await page.setViewportSize(viewportSize);
      for (const [routeName, route] of primaryRoutes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => document.fonts.ready);
        if (route === "/" && viewportSize.width > 720)
          await expect(page.locator("[data-brain-model]")).toHaveAttribute(
            "data-rendered",
            /2d|3d/,
          );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${route} overflows at ${viewportName} in ${theme} mode`,
        ).toBe(true);
        await page.screenshot({
          path: `artifacts/visual/${routeName}-${viewportName}-${theme}.png`,
          fullPage: true,
        });
      }
    }
  }
});

test("captures selected brain panels in every required viewport and theme", async ({
  page,
}) => {
  await mkdir("artifacts/visual", { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of themes) {
    await page.emulateMedia({ colorScheme: theme });
    for (const [viewportName, viewportSize] of [
      ...coreViewports,
      ...extraViewports,
    ]) {
      await page.setViewportSize(viewportSize);
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      if (viewportSize.width <= 720) {
        await expect(page.locator("[data-brain-model]")).toBeHidden();
        continue;
      }
      await page.locator('[data-region-select="brainstem"]').click();
      await page.screenshot({
        path: `artifacts/visual/brain-selected-${viewportName}-${theme}.png`,
      });
      const panel = await page.locator(".brain-panel").boundingBox();
      expect(panel!.x).toBeGreaterThanOrEqual(0);
      expect(panel!.x + panel!.width).toBeLessThanOrEqual(viewportSize.width);
      expect(panel!.y).toBeGreaterThanOrEqual(60);
      expect(panel!.y + panel!.height).toBeLessThanOrEqual(viewportSize.height);
    }
  }
});

test("expanded account cards fit every requested width in both themes", async ({
  page,
}) => {
  await mkdir("artifacts/visual", { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of themes) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [390, 720, 721, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/about/#accounts");
      await page.evaluate(() => document.fonts.ready);
      // Same-URL navigation can preserve native disclosure state between widths.
      // Open parents first, then the daily tables; never blindly toggle them shut.
      for (const details of await page
        .locator(".account-card__details")
        .all()) {
        if (
          !(await details.evaluate(
            (element) => (element as HTMLDetailsElement).open,
          ))
        )
          await details.locator(":scope > summary").click();
        await expect(details).toHaveAttribute("open", "");
      }
      for (const details of await page
        .locator(".activity-calendar__values")
        .all()) {
        if (
          !(await details.evaluate(
            (element) => (element as HTMLDetailsElement).open,
          ))
        )
          await details.locator(":scope > summary").click();
      }
      await page.locator("#accounts").scrollIntoViewIfNeeded();
      const overflow = await page
        .locator(
          ".account-card, .account-card a, .account-card summary, .account-card dd",
        )
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.left < 0 || rect.right > innerWidth;
            })
            .map((element) => element.textContent),
        );
      expect(overflow).toEqual([]);
      await page.screenshot({
        path: `artifacts/visual/accounts-expanded-${width}-${theme}.png`,
        fullPage: true,
      });
    }
  }
});
