import { test, expect } from "@playwright/test";
test("sound settings remain independent of instrument key and persist", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Instrument key", { exact: true }).selectOption("eb");
  await page
    .getByRole("button", { name: "Scales & chords", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A major", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.getByLabel("Playback sound").selectOption("tenor");
  await page.getByLabel("Volume", { exact: true }).fill("0.3");
  await page.screenshot({
    path: "artifacts/settings.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "A major", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Instrument key", { exact: true })).toHaveValue(
    "eb",
  );
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Playback sound")).toHaveValue("tenor");
  await expect(page.getByLabel("Volume", { exact: true })).toHaveValue("0.3");
  await page.getByLabel("Pitch notation").selectOption("concert");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("button", { name: "Scales & chords", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "C major", exact: true }),
  ).toBeVisible();
});
test("correct answers show a swift popup and advance without a review panel", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.9;
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Begin your first lesson" }).click();
  await page.getByRole("button", { name: "I'm ready. Let's listen" }).click();
  const answer = page.getByRole("button", { name: "C 01", exact: true });
  await expect(answer).toBeEnabled();
  await answer.click();
  await expect(page.locator(".correct-popup")).toContainText("Correct!");
  await expect(page.locator(".feedback")).toHaveCount(0);
  await expect(page.getByText("QUESTION 2 / 10", { exact: true })).toBeVisible({
    timeout: 2000,
  });
  await expect(page.locator(".correct-popup")).toHaveCount(0);
});

test('settings pauses a wrong-answer review', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Staff reading', exact: true }).click();
  await page.getByRole('button', { name: 'C', exact: true }).click();
  await expect(page.locator('.feedback.mistake')).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.waitForTimeout(3400);
  await expect(page.getByText('QUESTION 01', { exact: true })).toBeAttached();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByText('QUESTION 02', { exact: true })).toBeVisible();
});
