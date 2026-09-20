import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/projects/",
  "/projects/tppl/",
  "/projects/physics-engine/",
  "/projects/algorithms/",
  "/projects/machine-learning/",
  "/about/",
  "/experience/",
  "/contact/",
  "/resume/",
] as const;

test.describe("static site integrity", () => {
  for (const route of routes) {
    test(`${route} renders without browser or accessibility errors`, async ({
      page,
    }) => {
      const browserErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(message.text());
      });
      page.on("pageerror", (error) => browserErrors.push(error.message));

      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.ok()).toBe(true);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(
          `^https://koljapl\\.github\\.io${route === "/" ? "/$" : route}`,
        ),
      );
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /\S+/,
      );

      const layout = await page.evaluate(() => ({
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter(
          (image) => image.complete && image.naturalWidth === 0,
        ).length,
      }));
      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
      expect(layout.brokenImages).toBe(0);

      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(accessibility.violations).toEqual([]);
      expect(browserErrors).toEqual([]);
    });
  }

  test("custom 404 is useful and non-indexable", async ({ page }) => {
    const response = await page.goto("/a-route-that-does-not-exist/", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "path does not lead anywhere",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,follow",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test("robots, sitemap, and brand assets are published", async ({
    request,
  }) => {
    const [robots, sitemap, socialImage, manifest] = await Promise.all([
      request.get("/robots.txt"),
      request.get("/sitemap-index.xml"),
      request.get("/og.png"),
      request.get("/site.webmanifest"),
    ]);
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain(
      "Sitemap: https://koljapl.github.io/sitemap-index.xml",
    );
    expect(sitemap.ok()).toBe(true);
    const sitemapIndex = await sitemap.text();
    const sitemapPath = new URL(
      sitemapIndex.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "",
    ).pathname;
    const sitemapDocument = await request.get(sitemapPath);
    expect(sitemapDocument.ok()).toBe(true);
    const indexablePaths = [
      ...(await sitemapDocument.text()).matchAll(/<loc>([^<]+)<\/loc>/g),
    ].map((match) => new URL(match[1]!).pathname);
    expect(indexablePaths.length).toBeGreaterThan(0);
    for (const path of indexablePaths) {
      const page = await request.get(path);
      expect(page.ok(), `${path} from the sitemap should resolve`).toBe(true);
      expect(await page.text()).not.toContain(
        '<meta name="robots" content="noindex,follow">',
      );
    }
    expect(socialImage.ok()).toBe(true);
    expect(socialImage.headers()["content-type"]).toContain("image/png");
    expect(manifest.ok()).toBe(true);
  });
});

test.describe("interaction and presentation", () => {
  test("theme follows the system and persists an explicit override", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("mobile navigation opens, closes with Escape, and stays in view", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const menu = page.getByLabel("Navigation menu", { exact: true });
    await menu.click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await menu.press("Escape");
    await expect(
      page.locator("details[data-mobile-navigation]"),
    ).not.toHaveAttribute("open", "");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test("published projects have real repository links and project metadata", async ({
    page,
  }) => {
    await page.goto("/projects/tppl/");
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute(
      "content",
      "noindex,follow",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /tppl.webp/,
    );
    await expect(page.locator(".case-study__actions a")).toHaveAttribute(
      "href",
      "https://github.com/koljaPl/pseudo-programming-language",
    );
    await expect(page.locator(".project-evidence")).toContainText("commits");
  });
  test("draft résumé protects blurred content and prints a readable checklist", async ({
    page,
  }) => {
    await page.goto("/resume/");
    await expect(
      page.getByRole("heading", { name: "Résumé in progress." }),
    ).toBeVisible();
    await expect(page.locator(".resume-sheet")).toHaveAttribute("inert", "");
    await expect(page.locator(".resume-sheet")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator("[data-print-resume],a[download]")).toHaveCount(
      0,
    );
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".site-header")).toBeHidden();
    await expect(page.locator(".resume-sheet")).toBeHidden();
    await expect(page.getByRole("heading", { name: "To-Do" })).toBeVisible();
  });

  test("reduced motion removes nonessential transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).not.toBeInViewport();
    await expect(page.locator(".hero__statement")).toBeVisible();
    await expect(page.locator(".hero__actions")).toBeVisible();
    await skipLink.focus();
    await expect(skipLink).toBeInViewport();
    const duration = await page
      .locator(".project-card")
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration);
    const firstDuration = duration.split(",")[0]?.trim() ?? "1s";
    const durationInSeconds = firstDuration.endsWith("ms")
      ? Number.parseFloat(firstDuration) / 1000
      : Number.parseFloat(firstDuration);
    expect(durationInSeconds).toBeLessThanOrEqual(0.00001);
  });
});
