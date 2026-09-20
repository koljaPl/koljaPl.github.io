import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { brainRegions } from "../../src/data/brain";

for (const theme of ["light", "dark"] as const) {
  test(`all regions have synchronized mouse selection and accessible content in ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/");
    const model = page.locator("[data-brain-model]");
    await expect(model.locator('[aria-pressed="true"]')).toHaveCount(0);
    for (const region of brainRegions) {
      const button = model.getByRole("button", {
        name: region.label,
        exact: true,
      });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(model.locator('[aria-pressed="true"]')).toHaveCount(1);
      await expect(model.locator(".brain-region.is-selected")).toHaveAttribute(
        "data-brain-region",
        region.id,
      );
      const panel = model.locator(".brain-panel");
      await expect(
        panel.getByRole("heading", { name: region.label }),
      ).toBeVisible();
      await expect(
        panel.getByText(region.function, { exact: true }),
      ).toBeVisible();
      await expect(
        panel.getByText(region.association, { exact: true }),
      ).toBeVisible();
      await expect(model.getByRole("status")).toContainText(
        `${region.label} selected.`,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .include("[data-brain-model]")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await model
      .getByRole("button", { name: "Clear brain region selection" })
      .click();
    await expect(
      model.getByRole("button", { name: "Brainstem", exact: true }),
    ).toBeFocused();
    await expect(model.locator(".brain-region.is-selected")).toHaveCount(0);
    await expect(model.getByRole("status")).toContainText("Selection cleared");
  });
}

test("keyboard selection, source navigation, and scoped Escape restore focus", async ({
  page,
}) => {
  await page.goto("/");
  const controls = page.getByRole("group", { name: "Select a brain region" });
  const frontal = controls.getByRole("button", {
    name: "Frontal lobe",
    exact: true,
  });
  await frontal.focus();
  await frontal.press("Enter");
  await expect(frontal).toHaveAttribute("aria-pressed", "true");
  await frontal.press("Tab");
  const parietal = controls.getByRole("button", {
    name: "Parietal lobe",
    exact: true,
  });
  await expect(parietal).toBeFocused();
  await parietal.press("Space");
  await expect(parietal).toHaveAttribute("aria-pressed", "true");
  const focusStyle = await parietal.evaluate(
    (element) => getComputedStyle(element).outlineStyle,
  );
  expect(focusStyle).not.toBe("none");
  const source = page.locator(".brain-panel").getByRole("link").first();
  await source.focus();
  await source.press("Escape");
  await expect(parietal).toBeFocused();
  await expect(controls.locator('[aria-pressed="true"]')).toHaveCount(0);
  await parietal.press("Enter");
  await page.locator(".hero__actions a").first().focus();
  await page.keyboard.press("Escape");
  await expect(parietal).toHaveAttribute("aria-pressed", "true");
});

test("each SVG region selects its matching named control", async ({ page }) => {
  await page.route("**/brain/atlas.glb", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("[data-brain-model]")).toHaveAttribute(
    "data-rendered",
    "2d",
  );
  // Explicit interior points avoid bounding boxes overlapping adjacent anatomy.
  const points = {
    frontal: [125, 110],
    parietal: [265, 90],
    temporal: [195, 192],
    occipital: [363, 150],
    cerebellum: [340, 232],
    brainstem: [257, 254],
  } as const;
  for (const region of brainRegions) {
    const diagram = page.locator(".brain-diagram");
    await diagram.scrollIntoViewIfNeeded();
    const box = await diagram.boundingBox();
    expect(box).not.toBeNull();
    // SVG preserves its viewBox aspect ratio when constrained by max-height.
    const scale = Math.min(box!.width / 420, box!.height / 290);
    const offset = (box!.width - 420 * scale) / 2;
    await page.mouse.click(
      box!.x + offset + points[region.id][0] * scale,
      box!.y + points[region.id][1] * scale,
    );
    await expect(
      page.locator(`[data-region-select="${region.id}"]`),
    ).toHaveAttribute("aria-pressed", "true");
  }
});

test("touch targets support selecting and clearing on a tablet", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  for (const region of brainRegions) {
    const button = page.locator(`[data-region-select="${region.id}"]`);
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    await button.tap();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
  await page
    .getByRole("button", { name: "Clear brain region selection" })
    .tap();
  await expect(
    page.locator('.brain-controls [aria-pressed="true"]'),
  ).toHaveCount(0);
  await context.close();
});

for (const theme of ["light", "dark"] as const) {
  test(`content and native navigation work without JavaScript in ${theme}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      colorScheme: theme,
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Nicklas Plugin", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator(".hero__actions")
        .getByRole("link", { name: "Résumé", exact: true }),
    ).toHaveAttribute("href", "/resume/");
    await expect(page.locator(".brain-controls")).toBeHidden();
    await expect(page.locator("[data-theme-toggle]")).toBeHidden();
    expect(
      await page
        .locator("body")
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    ).toBe(theme === "dark" ? "rgb(14, 16, 19)" : "rgb(251, 251, 252)");
    await page.getByText("Read all regions", { exact: true }).click();
    for (const region of brainRegions) {
      await expect(
        page.getByText(region.function, { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText(region.association, { exact: true }),
      ).toBeVisible();
    }
    await page.getByLabel("Navigation menu", { exact: true }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await context.close();
  });
}

for (const width of [390, 720, 721, 768, 900, 901, 1024, 1440, 1920]) {
  test(`header, hero actions and open brain panel fit at ${width}px in both themes`, async ({
    page,
  }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto("/");
      const desktop = page.getByRole("navigation", {
        name: "Primary navigation",
        exact: true,
      });
      if (width > 900) await expect(desktop).toBeVisible();
      else await expect(desktop).toBeHidden();
      await expect(
        page
          .locator(".hero__actions")
          .getByRole("link", { name: "Résumé", exact: true }),
      ).toHaveAttribute("href", "/resume/");
      if (width <= 720) {
        await expect(page.locator("[data-brain-model]")).toBeHidden();
      }
      for (const region of width > 720 ? brainRegions : []) {
        await page.locator(`[data-region-select="${region.id}"]`).click();
        const overflow = await page
          .locator(
            ".hero a:visible, .hero button:visible, .hero .brain-panel, .site-header a:visible, .site-header button:visible",
          )
          .evaluateAll((elements) =>
            elements
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                return rect.left < -1 || rect.right > innerWidth + 1;
              })
              .map((element) => element.textContent),
          );
        expect(overflow).toEqual([]);
      }
      const action = page.locator(".hero__actions .button--primary");
      await action.hover();
      expect(
        await action.evaluate((element) => getComputedStyle(element).transform),
      ).toBe("none");
    }
  });
}

test("reflow at 200% equivalent viewport preserves readable controls and panel", async ({
  page,
}) => {
  // A 1280px desktop at 200% browser zoom has a 640px CSS viewport.
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto("/");
  await expect(page.locator("[data-brain-model]")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".hero__actions")).toBeVisible();
});
