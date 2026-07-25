import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze, flippedTriangles2D } from "./helpers.js";

// mergeCentroid + a single ring: outer boundary is the last edgeSegments * 4
// vertices, in vertex-index order matching the angular sample order
// (thetaOffset default HALF_PI): top, ..., left, ..., bottom, ..., right, ...
const outerRing = (g, edgeSegments = 1) => {
  const cols = edgeSegments * 4;
  const n = g.positions.length / 3;
  return Array.from({ length: cols }, (_, i) => {
    const index = n - cols + i;
    return [g.positions[index * 3], g.positions[index * 3 + 1]];
  });
};

const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const assertClose = (actual, expected, epsilon = 1e-6) => {
  assert.equal(actual.length, expected.length);
  for (let i = 0; i < actual.length; i++) {
    assert.ok(
      Math.abs(actual[i] - expected[i]) < epsilon,
      `index ${i}: expected ${expected[i]}, got ${actual[i]}`,
    );
  }
};

describe("rhombus", () => {
  it("places vertices at top/left/bottom/right, sx/sy scaling each diagonal", () => {
    const sx = 0.7;
    const sy = 0.3;
    const radius = 0.5;
    const g = Primitives.rhombus({ sx, sy, radius, innerSegments: 1 });
    const [top, left, bottom, right] = outerRing(g);

    assertClose(top, [0, sy * radius]);
    assertClose(left, [-sx * radius, 0]);
    assertClose(bottom, [0, -sy * radius]);
    assertClose(right, [sx * radius, 0]);
  });

  it("is a square rotated 45° when sx equals sy", () => {
    const g = Primitives.rhombus({ sx: 1, sy: 1, innerSegments: 1 });
    const [top, left, bottom, right] = outerRing(g).map(([x, y]) =>
      Math.hypot(x, y),
    );
    assert.ok(Math.abs(top - left) < 1e-6);
    assert.ok(Math.abs(left - bottom) < 1e-6);
    assert.ok(Math.abs(bottom - right) < 1e-6);
  });

  it("evenly subdivides each edge (edgeSegments), matching the linear midpoint", () => {
    const sx = 0.7;
    const sy = 0.3;
    const radius = 0.5;
    const g = Primitives.rhombus({
      sx,
      sy,
      radius,
      edgeSegments: 2,
      innerSegments: 1,
    });
    const ring = outerRing(g, 2);

    const top = [0, sy * radius];
    const left = [-sx * radius, 0];
    const bottom = [0, -sy * radius];
    const right = [sx * radius, 0];

    assertClose(ring[0], top);
    assertClose(ring[1], midpoint(top, left));
    assertClose(ring[2], left);
    assertClose(ring[3], midpoint(left, bottom));
    assertClose(ring[4], bottom);
    assertClose(ring[5], midpoint(bottom, right));
    assertClose(ring[6], right);
    assertClose(ring[7], midpoint(right, top));
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.rhombus()), 0);
  });

  it("is watertight with no seams or cracks across sx/sy/theta/edgeSegments variations", () => {
    for (const options of [
      {},
      { sx: 0.3, sy: 1 },
      { theta: Math.PI },
      { thetaOffset: 0.5 },
      { innerSegments: 1 },
      { edgeSegments: 3 },
      { edgeSegments: 3, thetaOffset: 0.5 },
    ]) {
      const result = analyze(Primitives.rhombus(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
    }
  });
});

describe("kite", () => {
  it("keeps left/right symmetric (sx) but splits top/bottom by ratio", () => {
    const sx = 0.4;
    const sy = 1;
    const ratio = 0.3;
    const radius = 0.5;
    const g = Primitives.kite({ sx, sy, ratio, radius, innerSegments: 1 });
    const [top, left, bottom, right] = outerRing(g);

    assertClose(top, [0, sy * radius]);
    assertClose(left, [-sx * radius, 0]);
    assertClose(bottom, [0, -sy * ratio * radius]);
    assertClose(right, [sx * radius, 0]);
  });

  it("degenerates into a rhombus at ratio=1", () => {
    const sx = 0.4;
    const sy = 1;
    const radius = 0.5;
    const k = Primitives.kite({ sx, sy, ratio: 1, radius, innerSegments: 1 });
    const r = Primitives.rhombus({
      sx,
      sy,
      radius,
      innerSegments: 1,
    });

    for (let i = 0; i < k.positions.length; i++) {
      assert.ok(Math.abs(k.positions[i] - r.positions[i]) < 1e-6);
    }
  });

  it("evenly subdivides each edge (edgeSegments), matching the linear midpoint", () => {
    const sx = 0.4;
    const sy = 1;
    const ratio = 0.3;
    const radius = 0.5;
    const g = Primitives.kite({
      sx,
      sy,
      ratio,
      radius,
      edgeSegments: 2,
      innerSegments: 1,
    });
    const ring = outerRing(g, 2);

    const top = [0, sy * radius];
    const left = [-sx * radius, 0];
    const bottom = [0, -sy * ratio * radius];
    const right = [sx * radius, 0];

    assertClose(ring[0], top);
    assertClose(ring[1], midpoint(top, left));
    assertClose(ring[2], left);
    assertClose(ring[3], midpoint(left, bottom));
    assertClose(ring[4], bottom);
    assertClose(ring[5], midpoint(bottom, right));
    assertClose(ring[6], right);
    assertClose(ring[7], midpoint(right, top));
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.kite()), 0);
  });

  it("is watertight with no seams or cracks across sx/sy/ratio/theta/edgeSegments variations", () => {
    for (const options of [
      {},
      { ratio: 0.1 },
      { ratio: 0.9 },
      { theta: Math.PI },
      { thetaOffset: 0.5 },
      { innerSegments: 1 },
      { edgeSegments: 3 },
      { edgeSegments: 3, ratio: 0.1 },
    ]) {
      const result = analyze(Primitives.kite(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
    }
  });
});

describe("lozenge", () => {
  it("defaults to a rhombus elongated along sy (sy = sx * 2)", () => {
    const sx = 0.6;
    const l = Primitives.lozenge({ sx, innerSegments: 1 });
    const r = Primitives.rhombus({ sx, sy: sx * 2, innerSegments: 1 });

    assert.deepEqual(l.positions, r.positions);
  });

  it("otherwise delegates entirely to rhombus with the same options", () => {
    const options = {
      sx: 0.5,
      sy: 0.5,
      radius: 0.4,
      edgeSegments: 2,
      innerSegments: 1,
    };
    assert.deepEqual(Primitives.lozenge(options), Primitives.rhombus(options));
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.lozenge()), 0);
  });
});
