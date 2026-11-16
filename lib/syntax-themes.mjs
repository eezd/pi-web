import { oneHalfDarkSyntaxTheme } from "./one-half-dark.mjs";
import { powerlevel10kSyntaxTheme } from "./powerlevel10k.mjs";

/** @param {string} theme */
export function getCustomSyntaxTheme(theme) {
  if (theme === "powerlevel10k") return powerlevel10kSyntaxTheme;
  if (theme === "one-half-dark") return oneHalfDarkSyntaxTheme;
  return undefined;
}
