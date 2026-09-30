import { test, expect } from "@playwright/test";
test("dashboard, guided feedback, progress, and tenor transposition", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Train your ear" }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/studio.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Start first lesson" }).click();
  await expect(
    page.getByRole("heading", { name: "Preview the notes" }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/lesson.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Start session" }).click();
  const c = page.getByRole("button", { name: "C 01", exact: true });
  await expect(c).toBeEnabled({ timeout: 10000 });
  await c.click();
  await expect(page.locator(".feedback")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.screenshot({
    path: "artifacts/feedback.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await expect(page.getByText("Answers", { exact: true })).toBeVisible();
  await page.reload();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await expect(page.getByText("Answers", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "artifacts/progress.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByLabel("Instrument key", { exact: true })
    .selectOption("tenor");
  await page
    .getByRole("button", { name: "Scales & chords", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "D major", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".tone-grid")).toContainText("F♯");
  await expect(page.locator(".tone-grid")).toContainText("C♯");
  await page.screenshot({
    path: "artifacts/tenor-scales.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Chords", exact: true }).click();
  await page.getByRole("button", { name: "Major seventh Δ7" }).click();
  await expect(page.locator(".harmony-title")).toContainText("DΔ7");
  await page.getByRole("button", { name: "Play it back", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start microphone" }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/listening-room.png",
    fullPage: true,
    animations: "disabled",
  });
});
test("staff reading advances and switching screens cancels timers", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Staff reading", exact: true })
    .click();
  await page.getByRole("button", { name: "E", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await expect(page.getByText("Question 02")).toBeVisible({ timeout: 5000 });
  await page.screenshot({
    path: "artifacts/staff.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Your studio", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Train your ear" }),
  ).toBeVisible();
});
test("small-screen layout and microphone refusal", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 900, height: 760 });
  await page.goto("/");
  await page.screenshot({
    path: "artifacts/compact.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Play it back", exact: true }).click();
  await context.clearPermissions();
  await page.getByRole("button", { name: "Start microphone" }).click();
  await expect(
    page.getByText(
      /Microphone access was declined|No microphone could be opened/,
    ),
  ).toBeVisible({ timeout: 10000 });
});

test("reference and mystery notes have separate playback labels", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start first lesson" }).click();
  await page.getByRole("button", { name: "Start session" }).click();
  await expect(page.locator(".listening-status")).toHaveText("Reference · C");
  await expect(page.locator(".listening-status")).toHaveText(
    "Mystery note · your turn",
  );
  await expect(page.locator(".listening-status")).toHaveText(
    "Your turn · choose a note",
  );
});
