import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

test("work pages are up to date with work/projects.json", () => {
  assert.doesNotThrow(() => execFileSync("node", ["scripts/build-work.mjs", "--check"], { stdio: "pipe" }));
});
