import { gt, valid } from "semver";

function isReleaseVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+(?:-custom\.[1-9]\d*)?$/.test(version) && valid(version) !== null;
}

export function isNewerStableVersion(candidate: string, current: string): boolean {
  return isReleaseVersion(candidate) && isReleaseVersion(current) && gt(candidate, current);
}

export function getPiWebReleaseUrl(version: string): string | null {
  if (!isReleaseVersion(version)) return null;
  return `https://github.com/eezd/pi-web/releases/tag/v${version}`;
}
