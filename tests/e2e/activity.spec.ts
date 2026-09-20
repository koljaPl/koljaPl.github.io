import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import raw from "../../src/data/generated/activity.json" with { type: "json" };
import { validateActivityCache } from "../../src/data/activity";
import { validateAccountCache } from "../../src/data/account-cache";
const snapshots = validateActivityCache(raw).accounts;
for (const id of ["github-koljapl", "leetcode-nicklaspl"]) {
  test(`${id}: dated calendar, accessible daily values and mobile scrolling`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/about/#account-${id}`);
    const card = page.locator(`#account-${id}`);
    await expect(card).not.toContainText("Approximately 9 years");
    await expect(card.locator(".account-card__details")).toHaveAttribute(
      "open",
      "",
    );
    const snapshot = snapshots[id];
    expect(snapshot).toBeDefined();
    await expect(
      card.locator(
        ".activity-calendar__day:not(.activity-calendar__day--padding)",
      ),
    ).toHaveCount(365);
    await expect(card).toContainText(snapshot!.start);
    await expect(card).toContainText("Last day may be partial");
    const chart = card.locator(".activity-calendar__scroll");
    await chart.focus();
    await expect(chart).toBeFocused();
    expect(await chart.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(
      true,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await card.getByText("Daily values", { exact: true }).click();
    await expect(card.locator("tbody tr")).toHaveCount(365);
    await expect(card.locator("tbody tr").first()).toContainText(snapshot!.end);
    expect(
      (await new AxeBuilder({ page }).include(`#account-${id}`).analyze())
        .violations,
    ).toEqual([]);
  });
}
test("LeetCode shows solved totals and an honest missing-rating label", async ({
  page,
}) => {
  await page.goto("/about/");
  const card = page.locator("#account-leetcode-nicklaspl");
  await expect(card.locator(".account-card__headline")).toContainText(
    "Problems solved",
  );
  await expect(card.locator(".account-card__headline")).toContainText(
    "Contest rating",
  );
  // Snapshot decides availability; no zero or estimated rating is substituted.
  const account = await import("../../src/data/generated/accounts.json", {
    with: { type: "json" },
  });
  if (
    validateAccountCache(account.default).accounts["leetcode-nicklaspl"]!
      .metrics.rating === undefined
  )
    await expect(card.locator(".account-card__missing")).toHaveText(
      "Not available",
    );
});
test("calendar and daily table work without JavaScript and make no provider requests", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 768, height: 1024 },
  });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/about/");
  for (const id of ["github-koljapl", "leetcode-nicklaspl"]) {
    const card = page.locator(`#account-${id}`);
    await card.locator(".account-card__details > summary").click();
    await card.getByText("Daily values", { exact: true }).click();
    await expect(card.locator("tbody tr")).toHaveCount(365);
  }
  expect(
    requests.filter((url) =>
      /api\.github\.com|leetcode\.com|graphql/.test(url),
    ),
  ).toEqual([]);
  await context.close();
});
