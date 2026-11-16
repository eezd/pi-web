import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { POWERLEVEL10K_COLORS, powerlevel10kSyntaxTheme } from "./powerlevel10k.mjs";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const colors = css.match(/html\[data-theme="powerlevel10k"\],[\s\S]*?\n}/)[0];
const value = (key) => colors.match(new RegExp(`--${key}:\\s*(#[0-9a-f]{6})`))[1];

function contrast(a, b) {
  const luminance = (hex) => {
    const values = hex.slice(1).match(/../g).map((pair) => {
      const x = parseInt(pair, 16) / 255;
      return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("Powerlevel10k UI, ANSI output and xterm share their palette", () => {
  assert.equal(value("bg"), POWERLEVEL10K_COLORS.background);
  assert.equal(value("text"), POWERLEVEL10K_COLORS.foreground);
  assert.equal(value("accent"), POWERLEVEL10K_COLORS.blue);
  for (const name of ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]) {
    assert.equal(value(`ansi-${name}`), POWERLEVEL10K_COLORS[name]);
    assert.equal(value(`ansi-bright-${name}`), POWERLEVEL10K_COLORS[`bright${name[0].toUpperCase()}${name.slice(1)}`]);
  }
  for (const foreground of ["text", "text-muted", "text-dim", "accent"]) {
    for (const background of ["bg", "bg-panel", "bg-hover", "bg-selected"]) {
      assert.ok(contrast(value(foreground), value(background)) >= 4.5, `${foreground} on ${background}`);
    }
  }
});

test("Prism token colors stay readable and avoid background shorthands", () => {
  for (const [token, style] of Object.entries(powerlevel10kSyntaxTheme)) {
    assert.ok(!Object.hasOwn(style, "background"), token);
    if (style.color) assert.ok(contrast(style.color, value("tool-bg")) >= 4.5, token);
  }
  assert.equal(powerlevel10kSyntaxTheme.string.color, POWERLEVEL10K_COLORS.green);
  assert.equal(powerlevel10kSyntaxTheme.function.color, POWERLEVEL10K_COLORS.blue);
});

test("all bundled font faces have valid WOFF2 assets and use the exact requested family", async () => {
  const fonts = await readFile(new URL("../app/fonts.css", import.meta.url), "utf8");
  const sources = [...fonts.matchAll(/url\('(\/fonts\/maple-mono\/[^']+)'\)/g)].map((match) => match[1]);
  assert.equal(sources.length, 142);
  assert.equal(new Set(sources).size, sources.length);
  assert.equal((fonts.match(/font-family: 'Maple Mono Normal NL NF CN'/g) || []).length, sources.length);
  for (const source of sources) {
    const bytes = await readFile(new URL(`../public${source}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), "wOF2", source);
  }
  assert.match(css, /--font-ui-default: 'Maple Mono Normal NL NF CN'/);
  assert.match(css, /--font-mono-default: var\(--font-ui-default\)/);
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(layout, /next\/font\/google/);
  assert.match(layout, /maple-mono-regular-latin\.woff2/);
  const license = await readFile(new URL("../public/fonts/maple-mono/LICENSE.txt", import.meta.url), "utf8");
  assert.match(license, /SIL OPEN FONT LICENSE/);
});
