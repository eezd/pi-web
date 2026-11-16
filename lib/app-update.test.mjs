import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { getPiWebReleaseUrl, isNewerStableVersion } = await jiti.import("./app-update.ts");
const require = createRequire(import.meta.url);
const { isNewerStableVersion: compareCli } = require("../bin/pi-web-update.js");

for (const [name, compare] of [["web", isNewerStableVersion], ["CLI", compareCli]]) {
  test(`${name}: detects newer stable and custom Pi Web versions`, () => {
    assert.equal(compare("0.8.8", "0.8.7"), true);
    assert.equal(compare("0.9.0", "0.8.7"), true);
    assert.equal(compare("1.0.0", "0.9.9"), true);
    assert.equal(compare("0.17.0-custom.2", "0.17.0-custom.1"), true);
    assert.equal(compare("0.17.0-custom.10", "0.17.0-custom.9"), true);
    assert.equal(compare("0.18.0-custom.1", "0.17.0-custom.99"), true);
    assert.equal(compare("0.17.0-custom.1", "0.16.0"), true);
  });

  test(`${name}: rejects equal, older and unsupported versions`, () => {
    assert.equal(compare("0.8.7", "0.8.7"), false);
    assert.equal(compare("0.8.6", "0.8.7"), false);
    assert.equal(compare("0.17.0-custom.1", "0.17.0-custom.1"), false);
    assert.equal(compare("0.17.0-custom.9", "0.17.0-custom.10"), false);
    assert.equal(compare("0.17.0-custom.99", "0.18.0-custom.1"), false);
    for (const version of ["0.8.8-beta.1", "invalid", "0.17.0-custom.01", "0.17.0-custom.0", "0.17.0-custom.-1", "0.17.0-custom.1/evil", "999999999999999999.0.0-custom.1"]) {
      assert.equal(compare(version, "0.8.7"), false, version);
      assert.equal(compare("1.0.0-custom.1", version), false, version);
    }
  });
}

test("builds custom repository release URLs only for supported versions", () => {
  assert.equal(getPiWebReleaseUrl("0.8.8"), "https://github.com/eezd/pi-web/releases/tag/v0.8.8");
  assert.equal(getPiWebReleaseUrl("0.17.0-custom.1"), "https://github.com/eezd/pi-web/releases/tag/v0.17.0-custom.1");
  assert.equal(getPiWebReleaseUrl("0.8.8-beta.1"), null);
  assert.equal(getPiWebReleaseUrl("0.17.0-custom.1/evil"), null);
});
