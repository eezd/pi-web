import assert from "node:assert/strict";
import test from "node:test";
import { getTerminalXtermTheme, parseTerminalTheme, TERMINAL_XTERM_THEMES } from "./terminal-theme.ts";
import { POWERLEVEL10K_COLORS } from "./powerlevel10k.mjs";

test("a missing or unknown stored terminal theme falls back to dark", () => {
  assert.equal(parseTerminalTheme("light"), "light");
  assert.equal(parseTerminalTheme("dark"), "dark");
  assert.equal(parseTerminalTheme(null), "dark");
  assert.equal(parseTerminalTheme("pine"), "dark");
});

test("Powerlevel10k follows the app palette while an explicit light terminal keeps its colors", () => {
  assert.equal(getTerminalXtermTheme("dark", "powerlevel10k"), POWERLEVEL10K_COLORS);
  assert.equal(getTerminalXtermTheme("light", "powerlevel10k"), TERMINAL_XTERM_THEMES.light);
  assert.equal(getTerminalXtermTheme("dark", "pine"), TERMINAL_XTERM_THEMES.dark);
});

test("both terminal palettes define every ANSI color", () => {
  const names = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];
  for (const theme of Object.values(TERMINAL_XTERM_THEMES)) {
    for (const name of names) {
      assert.match(theme[name], /^#[0-9a-f]{6}$/);
      assert.match(theme[`bright${name[0].toUpperCase()}${name.slice(1)}`], /^#[0-9a-f]{6}$/);
    }
  }
});
