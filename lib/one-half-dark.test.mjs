import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { ONE_HALF_DARK_COLORS, oneHalfDarkSyntaxTheme } from "./one-half-dark.mjs";
import { getCustomSyntaxTheme } from "./syntax-themes.mjs";
import { powerlevel10kSyntaxTheme } from "./powerlevel10k.mjs";
import { getTerminalXtermTheme, TERMINAL_XTERM_THEMES } from "./terminal-theme.ts";
import { isDarkTheme, isThemePreference, THEME_INIT_SCRIPT } from "./theme.ts";
import vm from "node:vm";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const block = css.match(/html\[data-theme="one-half-dark"\],[\s\S]*?\n}/)[0];
const value = (key) => block.match(new RegExp(`--${key}:\\s*(#[0-9a-f]{6})`))[1];

test("One Half Dark preserves the Windows Terminal scheme in ANSI output and xterm", () => {
  const officialAnsi = ["#282c34", "#e06c75", "#98c379", "#e5c07b", "#61afef", "#c678dd", "#56b6c2", "#dcdfe4"];
  const names = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];
  for (const [index, name] of names.entries()) {
    const bright = `bright${name[0].toUpperCase()}${name.slice(1)}`;
    assert.equal(ONE_HALF_DARK_COLORS[name], officialAnsi[index]);
    assert.equal(ONE_HALF_DARK_COLORS[bright], index === 0 ? "#5a6374" : officialAnsi[index]);
    assert.equal(value(`ansi-${name}`), ONE_HALF_DARK_COLORS[name]);
    assert.equal(value(`ansi-bright-${name}`), ONE_HALF_DARK_COLORS[bright]);
  }
  assert.equal(value("bg"), ONE_HALF_DARK_COLORS.background);
  assert.equal(value("text"), ONE_HALF_DARK_COLORS.foreground);
  assert.equal(getTerminalXtermTheme("dark", "one-half-dark"), ONE_HALF_DARK_COLORS);
  assert.equal(getTerminalXtermTheme("light", "one-half-dark"), TERMINAL_XTERM_THEMES.light);
});

test("saved One Half Dark is restored before paint and treated as dark", () => {
  assert.equal(isThemePreference("one-half-dark"), true);
  assert.equal(isDarkTheme("one-half-dark"), true);
  const root = { dataset: {}, classList: { toggle: (name, on) => { root[name] = on; } } };
  vm.runInNewContext(THEME_INIT_SCRIPT, {
    localStorage: { getItem: () => "one-half-dark" },
    document: { documentElement: root },
  });
  assert.equal(root.dataset.theme, "one-half-dark");
  assert.equal(root.dark, true);
});

test("custom Prism themes share selection across chat, source and diffs", () => {
  assert.equal(getCustomSyntaxTheme("one-half-dark"), oneHalfDarkSyntaxTheme);
  assert.equal(getCustomSyntaxTheme("powerlevel10k"), powerlevel10kSyntaxTheme);
  assert.equal(getCustomSyntaxTheme("light"), undefined);
  assert.equal(getCustomSyntaxTheme("dark"), undefined);
  assert.equal(oneHalfDarkSyntaxTheme.string.color, ONE_HALF_DARK_COLORS.green);
  assert.equal(oneHalfDarkSyntaxTheme.keyword.color, ONE_HALF_DARK_COLORS.magenta);
  assert.equal(oneHalfDarkSyntaxTheme.function.color, ONE_HALF_DARK_COLORS.blue);
  assert.notEqual(oneHalfDarkSyntaxTheme.comment.color, ONE_HALF_DARK_COLORS.brightBlack);
  for (const style of Object.values(oneHalfDarkSyntaxTheme)) assert.ok(!Object.hasOwn(style, "background"));
});
