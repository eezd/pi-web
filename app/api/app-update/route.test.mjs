import assert from "node:assert/strict";
import test, { afterEach, mock } from "node:test";
import { createJiti } from "jiti";

const previousVersion = process.env.NEXT_PUBLIC_APP_VERSION;
const previousSkip = process.env.PI_WEB_SKIP_VERSION_CHECK;
process.env.NEXT_PUBLIC_APP_VERSION = "0.17.0-custom.1";
delete process.env.PI_WEB_SKIP_VERSION_CHECK;
const jiti = createJiti(import.meta.url, { alias: { "@": process.cwd() } });
const { GET } = await jiti.import("./route.ts");
if (previousVersion === undefined) delete process.env.NEXT_PUBLIC_APP_VERSION;
else process.env.NEXT_PUBLIC_APP_VERSION = previousVersion;
if (previousSkip === undefined) delete process.env.PI_WEB_SKIP_VERSION_CHECK;
else process.env.PI_WEB_SKIP_VERSION_CHECK = previousSkip;

afterEach(() => {
  mock.restoreAll();
  delete globalThis.__piWebAppUpdateCache;
});

test("an unpublished custom package has no available update", async () => {
  mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url, "https://registry.npmjs.org/@eezd%2Fpi-web/latest");
    return new Response('{"error":"Not found"}', { status: 404 });
  });
  const response = await GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    currentVersion: "0.17.0-custom.1",
    latestVersion: "",
    updateAvailable: false,
    releaseUrl: "",
  });
});

test("registry failures remain errors rather than hiding an unavailable registry", async () => {
  mock.method(globalThis, "fetch", async () => new Response("unavailable", { status: 503 }));
  const response = await GET();
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "npm registry returned HTTP 503" });
});

test("a published custom revision offers its matching GitHub Release", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({ version: "0.17.0-custom.10" }));
  const response = await GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    currentVersion: "0.17.0-custom.1",
    latestVersion: "0.17.0-custom.10",
    updateAvailable: true,
    releaseUrl: "https://github.com/eezd/pi-web/releases/tag/v0.17.0-custom.10",
  });
});
