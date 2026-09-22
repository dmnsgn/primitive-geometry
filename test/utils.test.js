import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";

describe("fullscreenTriangle", () => {
  it("has 3 xy vertices oversized past every edge of the [-1, 1] clip-space square", () => {
    const { positions } = Primitives.utils.fullscreenTriangle();
    assert.deepEqual(Array.from(positions), [-1, -1, 3, -1, -1, 3]);
  });

  it("is positions-only: no cells, normals or uvs", () => {
    const g = Primitives.utils.fullscreenTriangle();
    assert.deepEqual(Object.keys(g), ["positions"]);
  });

  it("winds CCW, facing +z", () => {
    const [ax, ay, bx, by, cx, cy] =
      Primitives.utils.fullscreenTriangle().positions;
    const ux = bx - ax;
    const uy = by - ay;
    const vx = cx - ax;
    const vy = cy - ay;
    assert.ok(ux * vy - uy * vx > 0);
  });
});
