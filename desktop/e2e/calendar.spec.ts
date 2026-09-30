import { test, expect } from "@playwright/test";
test("calendar uses saved practice and supports keyboard and narrow layouts", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const key = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const today = new Date(),
      yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    localStorage.setItem(
      "aurynote.studio.v1",
      JSON.stringify({
        version: 2,
        attempts: [
          { day: key(today), target: 0, right: true, mode: "ear" },
          { day: key(today), target: 7, right: false, mode: "staff" },
          { day: key(yesterday), target: 0, right: true, mode: "ear" },
        ],
      }),
    );
  });
  await page.goto("/");
  const calendar = page.locator(".practice-activity");
  await expect(calendar).toContainText("3 answers · 2 active days");
  await expect(calendar.locator(".calendar-day")).toHaveCount(365);
  const today = calendar.getByRole("button", { name: /2 practice answers$/ });
  await today.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(calendar.locator("[role=status]")).toContainText(
    "0 practice answers",
  );
  await page.keyboard.press("End");
  await expect(today).toBeFocused();
  await calendar.screenshot({
    path: "artifacts/practice-calendar.png",
    animations: "disabled",
  });
  await page.setViewportSize({ width: 900, height: 760 });
  await expect(page.locator(".calendar-scroll")).toBeVisible();
  expect(
    await page
      .locator(".calendar-scroll")
      .evaluate((e) => e.scrollWidth > e.clientWidth),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await expect(page.locator(".practice-activity")).toContainText(
    "3 answers · 2 active days",
  );
});
