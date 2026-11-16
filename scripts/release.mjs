import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import semver from "semver";

export function getNextCustomVersion(currentVersion, upstreamVersion = currentVersion.split("-")[0]) {
  if (!semver.valid(currentVersion) || !/^\d+\.\d+\.\d+(?:-custom\.[1-9]\d*)?$/.test(currentVersion)) {
    throw new Error(`Unsupported current version: ${currentVersion}`);
  }
  if (!semver.valid(upstreamVersion) || !/^\d+\.\d+\.\d+$/.test(upstreamVersion)) {
    throw new Error("Upstream version must be an exact X.Y.Z release");
  }
  const currentBase = currentVersion.split("-")[0];
  if (semver.lt(upstreamVersion, currentBase)) {
    throw new Error("Upstream version cannot go backwards");
  }
  const previous = currentVersion.match(/-custom\.(\d+)$/);
  const revision = upstreamVersion === currentBase && previous ? Number(previous[1]) + 1 : 1;
  const version = `${upstreamVersion}-custom.${revision}`;
  if (!Number.isSafeInteger(revision) || !semver.valid(version)) {
    throw new Error("Custom revision exceeds the supported integer range");
  }
  return version;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 3) throw new Error("Usage: npm run release -- [upstream X.Y.Z]");
    const { version } = JSON.parse(readFileSync("package.json", "utf8"));
    const next = getNextCustomVersion(version, process.argv[2]);
    execFileSync("npm", ["version", next, "-m", "Release v%s", "--tag-version-prefix=v"], { stdio: "inherit" });
    console.log(`Prepared v${next}. Publish with: git push origin main v${next}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
