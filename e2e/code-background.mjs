import assert from "node:assert/strict";

/** The fixture has one ordinary fence and one Mermaid diagram. */
export async function checkCodeBackground(page) {
  const warnings = [];
  const onConsole = (message) => {
    if (/conflicting property|style property during rerender/.test(message.text())) {
      warnings.push(message.text());
    }
  };
  page.on("console", onConsole);
  const source = page.getByRole("button", { name: "Source", exact: true });
  await source.click();
  const blocks = page.locator(".markdown-code-block pre");
  await blocks.nth(1).waitFor();
  try {
    for (const colorScheme of ["light", "dark", "light", "dark", "light"]) {
      await page.emulateMedia({ colorScheme });
      await page.waitForFunction((theme) => document.documentElement.dataset.theme === theme, colorScheme);
      await page.waitForFunction(() => {
        const probe = document.createElement("div");
        probe.style.backgroundColor = "color-mix(in srgb, var(--bg) 92%, var(--bg-panel))";
        document.body.append(probe);
        const expected = getComputedStyle(probe).backgroundColor;
        probe.remove();
        const nodes = [...document.querySelectorAll(".markdown-code-block pre")];
        return nodes.length === 2 && nodes.every((node) => (
          getComputedStyle(node).backgroundColor === expected
          && getComputedStyle(node).borderTopWidth === "0px"
          && getComputedStyle(node.querySelector("code")).backgroundColor === "rgba(0, 0, 0, 0)"
        ));
      });
    }
    const selectTheme = async (name) => {
      const sidebar = page.getByRole("button", { name: "Show sidebar", exact: true });
      const settings = page.getByRole("button", { name: "Settings", exact: true });
      if (page.viewportSize().width <= 640) await Promise.any([sidebar.waitFor(), settings.waitFor()]);
      if (await sidebar.isVisible()) await sidebar.click();
      await settings.click();
      if (page.viewportSize().width <= 640) {
        await page.locator(".settings-phone-home").getByRole("button", { name: "General", exact: true }).click();
      } else {
        await page.locator(".settings-section-tabs").getByRole("button", { name: "General", exact: true }).click();
      }
      await page.getByRole("radio", { name, exact: true }).locator("..").click();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog", { name: "Settings", exact: true }).waitFor({ state: "detached" });
    };
    for (const [name, theme, keyword] of [
      ["Powerlevel10k", "powerlevel10k", "rgb(175, 135, 255)"],
      ["One Half Dark", "one-half-dark", "rgb(198, 120, 221)"],
      ["Light", "light", null],
      ["One Half Dark", "one-half-dark", "rgb(198, 120, 221)"],
    ]) {
      await selectTheme(name);
      await page.waitForFunction((value) => document.documentElement.dataset.theme === value, theme);
      if (keyword) {
        await page.waitForFunction((color) => {
          const token = [...document.querySelectorAll(".markdown-code-block .token")].find((node) => node.textContent === "const");
          return token && getComputedStyle(token).color === color;
        }, keyword);
      }
      await page.waitForFunction(() => [...document.querySelectorAll(".markdown-code-block pre")].every((pre) => (
        getComputedStyle(pre).borderTopWidth === "0px"
        && getComputedStyle(pre.querySelector("code")).backgroundColor === "rgba(0, 0, 0, 0)"
      )));
    }
    await selectTheme("System");
    assert.deepEqual(warnings, [], "Theme switches must not mix background shorthand and backgroundColor");
  } finally {
    page.off("console", onConsole);
    await page.emulateMedia({ colorScheme: "light" });
  }
  console.log("PASS: code and Mermaid source backgrounds survive repeated theme switches");
}
