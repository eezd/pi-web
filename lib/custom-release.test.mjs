import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { load } from "js-yaml";
import { getNextCustomVersion } from "../scripts/release.mjs";

const readJson = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
const readWorkflow = (name) => load(readFileSync(new URL(`../.github/workflows/${name}.yml`, import.meta.url), "utf8"));

test("custom releases retain the upstream version and increment numerically", () => {
  assert.equal(getNextCustomVersion("0.17.0"), "0.17.0-custom.1");
  assert.equal(getNextCustomVersion("0.17.0-custom.1"), "0.17.0-custom.2");
  assert.equal(getNextCustomVersion("0.17.0-custom.9"), "0.17.0-custom.10");
  assert.equal(getNextCustomVersion("0.17.0-custom.9", "0.18.0"), "0.18.0-custom.1");
  assert.equal(getNextCustomVersion("0.17.0-custom.9", "0.17.0"), "0.17.0-custom.10");
});

test("custom releases reject malformed, overflowing and backwards versions", () => {
  for (const version of ["dev", "0.17.0-beta.1", "0.17.0-custom.0", "0.17.0-custom.01", "0.17.0-custom.9007199254740991"]) {
    assert.throws(() => getNextCustomVersion(version));
  }
  for (const version of ["patch", "0.18", "v0.18.0", "0.18.0-beta.1", "0.18.0-custom.1", "0.18.0+meta", "0.16.0"]) {
    assert.throws(() => getNextCustomVersion("0.17.0-custom.1", version));
  }
});

test("release uses one runner and a shared lock across all versions", () => {
  const workflow = readWorkflow("publish");
  assert.deepEqual(workflow.on, { push: { tags: ["v*-custom.*"] } });
  assert.deepEqual(Object.keys(workflow.jobs), ["release"]);
  assert.equal(workflow.concurrency.group, "custom-release");
  assert.equal(workflow.concurrency["cancel-in-progress"], false);
  assert.equal(workflow.jobs.release.strategy, undefined);
  assert.equal(workflow.jobs.release.if, "github.repository == 'eezd/pi-web'");
  const commands = workflow.jobs.release.steps.map((step) => step.run ?? "").join("\n");
  const checks = ["npm ci", "npm run lint", "npx tsc --noEmit", "npm test", "npm run build", "npm run test:e2e", "npm pack", "npm publish", "gh release create"];
  let previous = -1;
  for (const command of checks) {
    const index = commands.search(new RegExp(`^\\s*${command}\\b`, "m"));
    assert.ok(index > previous, `${command} must run after prior checks`);
    previous = index;
  }
  assert.match(commands, /npm publish .*--tag latest --provenance/);
});

test("other upstream workflows never allocate a runner in the custom fork", () => {
  for (const name of ["ci", "demo-pages"]) {
    for (const job of Object.values(readWorkflow(name).jobs)) {
      assert.match(job.if, /^github\.repository == 'agegr\/pi-web'/);
    }
  }
});

test("package and lockfile agree on the custom publication identity", () => {
  const pkg = readJson("../package.json");
  const lock = readJson("../package-lock.json");
  assert.equal(pkg.name, "@eezd/pi-web");
  assert.match(pkg.version, /^\d+\.\d+\.\d+-custom\.[1-9]\d*$/);
  for (const manifest of [lock, lock.packages[""]]) {
    assert.equal(manifest.name, pkg.name);
    assert.equal(manifest.version, pkg.version);
  }
  assert.equal(pkg.publishConfig.tag, "latest");
});
