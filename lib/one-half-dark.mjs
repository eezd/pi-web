// Windows Terminal's built-in One Half Dark scheme:
// https://github.com/microsoft/terminal/blob/main/src/cascadia/TerminalSettingsModel/defaults.json
// Background, selection and UI surfaces are app adaptations; the 16 ANSI colors are unchanged.
export const ONE_HALF_DARK_COLORS = {
  background: "#23272e", foreground: "#dcdfe4", cursor: "#ffffff",
  cursorAccent: "#23272e", selectionBackground: "#343a44",
  black: "#282c34", red: "#e06c75", green: "#98c379", yellow: "#e5c07b",
  blue: "#61afef", magenta: "#c678dd", cyan: "#56b6c2", white: "#dcdfe4",
  brightBlack: "#5a6374", brightRed: "#e06c75", brightGreen: "#98c379",
  brightYellow: "#e5c07b", brightBlue: "#61afef", brightMagenta: "#c678dd",
  brightCyan: "#56b6c2", brightWhite: "#dcdfe4",
};

/** @type {Record<string, import("react").CSSProperties>} */
export const oneHalfDarkSyntaxTheme = {
  'code[class*="language-"]': { color: ONE_HALF_DARK_COLORS.foreground, fontFamily: "var(--font-mono)", fontWeight: "var(--font-mono-weight)", textShadow: "none" },
  'pre[class*="language-"]': { color: ONE_HALF_DARK_COLORS.foreground, backgroundColor: "var(--tool-bg)", textShadow: "none" },
  // Terminal bright black is too dim for comments; retain the hue with readable contrast.
  ...Object.fromEntries(["comment", "prolog", "doctype", "cdata"].map((key) => [key, { color: "#abb2bf" }])),
  ...Object.fromEntries(["string", "char", "attr-value", "inserted"].map((key) => [key, { color: ONE_HALF_DARK_COLORS.green }])),
  ...Object.fromEntries(["keyword", "important", "regex"].map((key) => [key, { color: ONE_HALF_DARK_COLORS.magenta }])),
  ...Object.fromEntries(["number", "boolean", "constant", "symbol", "class-name"].map((key) => [key, { color: ONE_HALF_DARK_COLORS.yellow }])),
  ...Object.fromEntries(["function", "property", "builtin", "attr-name"].map((key) => [key, { color: ONE_HALF_DARK_COLORS.blue }])),
  ...Object.fromEntries(["operator", "entity", "url"].map((key) => [key, { color: ONE_HALF_DARK_COLORS.cyan }])),
  ...Object.fromEntries(["tag", "deleted", "variable"].map((key) => [key, { color: ONE_HALF_DARK_COLORS.red }])),
  punctuation: { color: ONE_HALF_DARK_COLORS.foreground },
  bold: { fontWeight: 700 },
  italic: { fontStyle: "italic" },
};
