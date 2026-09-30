import { test, expect } from "@playwright/test";
test("finishing a guided session offers and opens the next note pool", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.9;
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Begin your first lesson" }).click();
  await page.getByLabel("Session length", { exact: true }).selectOption("5");
  await page.getByLabel("Reference C", { exact: true }).uncheck();
  await page.getByRole("button", { name: "I'm ready. Let's listen" }).click();
  for (let i = 0; i < 5; i++) {
    await expect(
      page.getByText(`QUESTION ${i + 1} / 5`, { exact: true }),
    ).toBeVisible();
    const answer = page.getByRole("button", {
      name: i === 0 ? "C 01" : "G 02",
      exact: true,
    });
    await expect(answer).toBeEnabled();
    await answer.click();
  }
  await page.getByRole("button", { name: "Next lesson · 3 notes" }).click();
  await expect(
    page.getByRole("heading", { name: "Hear the major third", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".answer-grid .note-choice")).toHaveCount(3);
  await expect(page.getByLabel("Lesson", { exact: true })).toHaveValue("1");
  await page.getByRole("button", { name: "Your studio", exact: true }).click();
  await expect(
    page.locator(".achievement.earned").filter({ hasText: "First session" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue learning" }).click();
  await expect(page.getByLabel("Lesson", { exact: true })).toHaveValue("1");
});
test("custom notes, session settings, and new sounds persist", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin your first lesson" }).click();
  await page
    .getByLabel("Practice mode", { exact: true })
    .selectOption("custom");
  await page.getByLabel("Number of notes", { exact: true }).selectOption("4");
  await expect(page.locator(".answer-grid .note-choice")).toHaveCount(4);
  await page.getByLabel("Session length", { exact: true }).selectOption("15");
  await page.screenshot({
    path: "artifacts/custom-practice.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Playback sound").selectOption("clarinet");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Your studio", exact: true }).click();
  await page.getByLabel("Daily goal", { exact: true }).selectOption("20");
  await page.reload();
  await expect(page.getByLabel("Daily goal", { exact: true })).toHaveValue(
    "20",
  );
  await page.getByRole("button", { name: "Begin your first lesson" }).click();
  await page
    .getByLabel("Practice mode", { exact: true })
    .selectOption("custom");
  await expect(page.getByLabel("Number of notes", { exact: true })).toHaveValue(
    "4",
  );
  await expect(page.getByLabel("Session length", { exact: true })).toHaveValue(
    "15",
  );
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Playback sound")).toHaveValue("clarinet");
});
