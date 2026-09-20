import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { accountStats } from "../../src/data/account-stats";
import { accounts } from "../../src/data/accounts";

test("brain leaves mobile layout and restores desktop controls without trapping focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");
  const frontal = page.locator('[data-region-select="frontal"]');
  await frontal.click();
  await page.setViewportSize({ width: 720, height: 900 });
  await expect(page.locator("[data-brain-model]")).toBeHidden();
  await expect(page.locator(".hero__actions a").first()).toBeFocused();
  await page.setViewportSize({ width: 721, height: 900 });
  await expect(frontal).toBeVisible();
  await frontal.click();
  await expect(frontal).toHaveAttribute("aria-pressed", "true");
});

test("all six account links and native expansions work in both themes", async ({
  page,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/about/");
    await expect(page.locator(".account-card")).toHaveCount(6);
    for (const account of accounts) {
      const card = page.locator(`[data-account="${account.id}"]`);
      await expect(card.getByRole("link").first()).toHaveAttribute(
        "href",
        account.url,
      );
      await expect(card.locator(".account-card__headline > div")).toHaveCount(
        accountStats.find((item) => item.id === account.id)!.headline.length +
          (account.platform === "leetcode" &&
          accountStats.find((item) => item.id === account.id)!.snapshot?.metrics
            .rating === undefined
            ? 1
            : 0),
      );
      const summary = card.locator(".account-card__details > summary");
      await summary.focus();
      await summary.press("Enter");
      await expect(card.locator(".account-card__details")).toHaveAttribute(
        "open",
        "",
      );
      await expect(
        card.getByRole("link", {
          name: `Source: ${account.platform === "github" ? "GitHub" : account.platform === "youtube" ? "YouTube" : account.platform === "leetcode" ? "LeetCode" : account.platform === "atcoder" ? "AtCoder" : account.platform === "eolymp" ? "Eolymp" : "Codeforces"} profile`,
        }),
      ).toBeVisible();
      await summary.press("Space");
      await expect(card.locator(".account-card__expanded")).toBeHidden();
    }
    expect(
      (await new AxeBuilder({ page }).include("#accounts").analyze())
        .violations,
    ).toEqual([]);
  }
});

test("ticker pauses manually, on hover/focus, and outside viewport", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const strip = page.locator("[data-stats-strip]");
  const track = strip.locator(".stats-strip__track");
  await expect(strip).toHaveAttribute("data-paused", "true");
  await strip.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(strip).toHaveAttribute("data-paused", "false");
  await strip.locator(".stats-strip__viewport").hover();
  await expect(strip).toHaveAttribute("data-paused", "true");
  await page.mouse.move(0, 0);
  await expect(strip).toHaveAttribute("data-paused", "false");
  await strip.getByRole("button", { name: "Pause scrolling" }).click();
  await expect(
    strip.getByRole("button", { name: "Resume scrolling" }),
  ).toBeVisible();
  await page.locator(".hero__actions a").first().focus();
  await strip.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(strip).toHaveAttribute("data-paused", "true");
  await strip.getByRole("button", { name: "Resume scrolling" }).click();
  await expect(strip).toHaveAttribute("data-paused", "true"); // Focus keeps motion paused.
  await page.locator(".hero__actions a").first().focus();
  await strip.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(strip).toHaveAttribute("data-paused", "false");
  await expect(track).toHaveCSS("animation-play-state", "running");
  await expect(strip.locator(".stats-strip__viewport")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect(strip.locator("ul")).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(strip).toHaveAttribute("data-paused", "true");
});

for (const mode of ["no-js", "reduced-motion"] as const) {
  test(`${mode}: static statistics, native cards, and mobile brain removal`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: mode !== "no-js",
      reducedMotion: mode === "reduced-motion" ? "reduce" : "no-preference",
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-brain-model]")).toBeHidden();
    await expect(page.locator(".stats-strip__static")).toBeVisible();
    await expect(page.locator(".stats-strip__viewport")).toBeHidden();
    await expect(page.locator("[data-strip-toggle]")).toBeHidden();
    await page.goto("/about/");
    const card = page.locator(".account-card").first();
    await card.locator("summary").tap();
    await expect(card.locator(".account-card__expanded")).toBeVisible();
    await context.close();
  });
}

test("identity dots alternate on hover and keyboard focus, but never with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.locator(
      ".hero__eyebrow .accent-mark, .brain-model__heading .accent-mark",
    ),
  ).toHaveCount(0);
  const brand = page
    .locator(".site-header a")
    .filter({ has: page.locator(".accent-mark") })
    .first();
  const dots = brand.locator(".accent-dot");
  await brand.hover();
  await expect(dots.nth(0)).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 3)");
  await expect(dots.nth(1)).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -3)");
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await brand.focus();
  await expect(dots.nth(2)).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 3)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const dot of await dots.all())
    await expect(dot).toHaveCSS("transform", "none");
});
