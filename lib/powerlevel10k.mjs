// Powerlevel10k's Rainbow prompt uses terminal ANSI segments. These xterm colors
// extend that vocabulary to the UI and Prism; it does not define a syntax theme.
export const POWERLEVEL10K_COLORS = {
  background: "#121212", foreground: "#eeeeee", cursor: "#5fafff",
  cursorAccent: "#121212", selectionBackground: "#303030",
  black: "#121212", red: "#ff5f5f", green: "#5fd700", yellow: "#ffd75f",
  blue: "#5fafff", magenta: "#af87ff", cyan: "#5fd7ff", white: "#d0d0d0",
  brightBlack: "#a8a8a8", brightRed: "#ff8787", brightGreen: "#87ff5f",
  brightYellow: "#ffff87", brightBlue: "#87d7ff", brightMagenta: "#d7afff",
  brightCyan: "#87ffff", brightWhite: "#ffffff",
};

/** @type {Record<string, import("react").CSSProperties>} */
export const powerlevel10kSyntaxTheme = {
  'code[class*="language-"]': { color: POWERLEVEL10K_COLORS.foreground, fontFamily: "var(--font-mono)", fontWeight: "var(--font-mono-weight)", textShadow: "none" },
  'pre[class*="language-"]': { color: POWERLEVEL10K_COLORS.foreground, backgroundColor: "var(--tool-bg)", textShadow: "none" },
  ...Object.fromEntries(["comment", "prolog", "doctype", "cdata"].map((key) => [key, { color: POWERLEVEL10K_COLORS.brightBlack }])),
  ...Object.fromEntries(["string", "char", "attr-value", "inserted"].map((key) => [key, { color: POWERLEVEL10K_COLORS.green }])),
  ...Object.fromEntries(["keyword", "boolean", "important", "regex"].map((key) => [key, { color: POWERLEVEL10K_COLORS.magenta }])),
  ...Object.fromEntries(["number", "constant", "symbol", "attr-name"].map((key) => [key, { color: POWERLEVEL10K_COLORS.yellow }])),
  ...Object.fromEntries(["function", "property", "builtin"].map((key) => [key, { color: POWERLEVEL10K_COLORS.blue }])),
  ...Object.fromEntries(["operator", "entity", "url", "class-name"].map((key) => [key, { color: POWERLEVEL10K_COLORS.cyan }])),
  ...Object.fromEntries(["tag", "deleted"].map((key) => [key, { color: POWERLEVEL10K_COLORS.red }])),
  punctuation: { color: "#bcbcbc" },
  variable: { color: POWERLEVEL10K_COLORS.foreground },
  bold: { fontWeight: 700 },
  italic: { fontStyle: "italic" },
};
