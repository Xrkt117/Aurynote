import { test, expect, _electron as electron } from "@playwright/test";
test("production desktop opens offline with isolated renderer", async () => {
  const env = { ...process.env, AURYNOTE_TEST_MODE: "1" };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    args: process.env.AURYNOTE_EXECUTABLE ? [] : ["."],
    executablePath: process.env.AURYNOTE_EXECUTABLE,
    env,
  });
  try {
    const page = await app.firstWindow();
    await expect(
      page.getByRole("heading", { name: /A little listening/ }),
    ).toBeVisible();
    expect(page.url()).toMatch(/^file:/);
    expect(
      await page.evaluate(
        () => typeof (window as unknown as { require?: unknown }).require,
      ),
    ).toBe("undefined");
    await page.screenshot({
      path: "artifacts/desktop.png",
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Scales & chords", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "C major", exact: true }),
    ).toBeVisible();
  } finally {
    await app.close();
  }
});
