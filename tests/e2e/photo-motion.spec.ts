import { expect, test } from "@playwright/test";

for (const [route, name] of [
  ["/projects/", "satellite"],
  ["/about/", "butterfly"],
] as const) {
  test(`${name} settles once before revealing its source`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(route);
    const figure = page.locator(`[data-photo-entrance="${name}"]`);
    await expect(figure).toHaveAttribute("data-arrival", "arriving");
    await expect(figure.locator("[data-photo-credit]")).toBeHidden();
    await expect(figure).toHaveAttribute("data-arrival", "settled", {
      timeout: 7000,
    });
    await expect(figure.locator("[data-photo-credit]")).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(figure.locator("[data-photo-credit]")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator("footer").scrollIntoViewIfNeeded();
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toHaveAttribute("data-arrival", "settled", {
      timeout: 7000,
    });
    if (name === "butterfly") {
      await expect(figure.locator(".butterfly-wing").first()).toHaveCSS(
        "animation-duration",
        "8s",
      );
      await page.locator("footer").scrollIntoViewIfNeeded();
      await expect(figure).toHaveAttribute("data-moving", "false");
    }
  });
  test(`${name} has immediately usable static credits without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(route);
    const figure = page.locator(`[data-photo-entrance="${name}"]`);
    await expect(figure.locator("[data-photo-credit]")).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(figure.locator(".photo-flight")).toHaveCSS(
      "animation-name",
      "none",
    );
    await context.close();
  });
}

test("reduced motion during arrival immediately settles photographs and credits", async ({
  page,
}) => {
  await page.goto("/about/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-butterfly]")).toHaveAttribute(
    "data-arrival",
    "settled",
  );
  await expect(
    page.locator("[data-butterfly] [data-photo-credit]"),
  ).toBeVisible();
  await expect(page.locator(".photo-flight")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("captures brain starting view and six anatomical viewpoints", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-brain-model]")).toHaveAttribute(
    "data-rendered",
    "3d",
  );
  const canvas = page.locator("[data-brain-3d] canvas");
  for (const [view, key, steps] of [
    ["default", "ArrowRight", 0],
    ["left", "ArrowLeft", 7],
    ["right", "ArrowRight", 13],
    ["front", "ArrowRight", 3],
    ["rear", "ArrowLeft", 16],
    ["top", "ArrowDown", 10],
    ["underside", "ArrowUp", 10],
  ] as const) {
    await canvas.focus();
    await canvas.press("Home");
    if (view === "top" || view === "underside") {
      for (let i = 0; i < 7; i++) await canvas.press("ArrowLeft");
    }
    for (let i = 0; i < steps; i++) await canvas.press(key);
    await canvas.screenshot({ path: `artifacts/visual/brain-${view}.png` });
  }
});

test("satellite takes a slow upper-left path across the introduction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/projects/");
  const figure = page.locator("[data-photo-entrance='satellite']");
  await expect(figure).toHaveAttribute("data-arrival", "arriving");
  const flight = figure.locator(".photo-flight");
  await expect(flight).toHaveCSS("animation-duration", "5s");
  await flight.evaluate((node) => {
    const animation = node.getAnimations()[0]!;
    animation.pause();
    animation.currentTime = 1900;
  });
  const bounds = await flight.boundingBox();
  const text = await page.locator(".projects-intro .page-intro").boundingBox();
  expect(bounds!.x).toBeLessThan(text!.x + text!.width);
  expect(bounds!.x + bounds!.width).toBeGreaterThan(text!.x);
  expect(bounds!.y).toBeLessThan(text!.y + text!.height);
  expect(bounds!.y + bounds!.height).toBeGreaterThan(text!.y);
  await expect(figure).toHaveCSS("z-index", "3");
  await expect(figure.locator("[data-photo-credit]")).toBeHidden();
  await page.screenshot({ path: "artifacts/visual/satellite-over-text.png" });
  await flight.evaluate((node) => node.getAnimations()[0]!.finish());
  await expect(figure).toHaveAttribute("data-arrival", "settled", {
    timeout: 7000,
  });
});

test("butterfly enters from the right and responds with exactly two wingbeats", async ({
  page,
}) => {
  await page.goto("/about/");
  const figure = page.locator("[data-butterfly]");
  await expect(figure).toHaveAttribute("data-arrival", "arriving");
  const flight = figure.locator(".photo-flight");
  await flight.evaluate((node) => {
    const animation = node.getAnimations()[0]!;
    animation.pause();
    animation.currentTime = 0;
  });
  expect((await flight.boundingBox())!.x).toBeGreaterThan(
    await page.evaluate(() => innerWidth),
  );
  await flight.evaluate((node) => node.getAnimations()[0]!.finish());
  const flutter = figure.getByRole("button", {
    name: "Flutter butterfly wings twice",
  });
  await flutter.focus();
  await flutter.press("Enter");
  await expect(figure).toHaveAttribute("data-fluttering", "true");
  expect(
    await figure
      .locator(".butterfly-wing")
      .first()
      .evaluate((node) =>
        node.getAnimations().map((a) => a.effect!.getTiming().iterations),
      ),
  ).toEqual([2]);
  await expect(figure).not.toHaveAttribute("data-fluttering", "true");
  await expect(flutter).toBeFocused();
  await flutter.press("Space");
  await expect(figure).toHaveAttribute("data-fluttering", "true");
  await figure
    .getByRole("button", { name: "Pause butterfly animation" })
    .click();
  await expect(figure).not.toHaveAttribute("data-fluttering", "true");
  await expect(figure).toHaveAttribute("data-moving", "false");
});

test("touch flutter cancels safely for reduced motion and scrolling", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/about/");
  const figure = page.locator("[data-butterfly]");
  await expect(figure).toHaveAttribute("data-arrival", "settled");
  const flutter = figure.getByRole("button", {
    name: "Flutter butterfly wings twice",
  });
  await flutter.tap();
  await expect(figure).toHaveAttribute("data-fluttering", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(figure).not.toHaveAttribute("data-fluttering", "true");
  await expect(figure.locator(".butterfly-wing").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(figure.locator("[data-photo-credit]")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await flutter.tap();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-moving", "false");
  await expect(figure).not.toHaveAttribute("data-fluttering", "true");
  await context.close();
});

test("photographic flight paths fit seven widths in both themes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 720, 721, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({
        colorScheme: theme,
        reducedMotion: "no-preference",
      });
      for (const [route, name] of [
        ["/projects/", "satellite"],
        ["/about/", "butterfly"],
      ]) {
        await page.goto(route!);
        const flight = page.locator(".photo-flight");
        await expect(page.locator("[data-photo-entrance]")).toHaveAttribute(
          "data-arrival",
          "arriving",
        );
        await flight.evaluate((node) => {
          const animation = node.getAnimations()[0]!;
          animation.pause();
          animation.currentTime =
            Number(animation.effect!.getTiming().duration) * 0.46;
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: `artifacts/visual/flight-${name}-${width}-${theme}.png`,
        });
      }
    }
  }
});
