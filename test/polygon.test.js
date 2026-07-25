import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze, flippedTriangles2D } from "./helpers.js";

// mergeCentroid + a single ring: outer boundary is the last edgeSegments *
// sides vertices, in vertex-index order matching the angular sample order.
const outerRing = (g, sides, edgeSegments = 1) => {
  const cols = edgeSegments * sides;
  const n = g.positions.length / 3;
  return Array.from({ length: cols }, (_, i) => {
    const index = n - cols + i;
    return [g.positions[index * 3], g.positions[index * 3 + 1]];
  });
};

const assertClose = (actual, expected, epsilon = 1e-6) => {
  assert.equal(actual.length, expected.length);
  for (let i = 0; i < actual.length; i++) {
    assert.ok(
      Math.abs(actual[i] - expected[i]) < epsilon,
      `index ${i}: expected ${expected[i]}, got ${actual[i]}`,
    );
  }
};

const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

describe("polygon", () => {
  it("places sides corners evenly spaced around the circle, straight edges between them", () => {
    const sides = 6;
    const radius = 0.5;
    const g = Primitives.polygon({ sides, radius, innerSegments: 1 });
    const ring = outerRing(g, sides);

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      assertClose(ring[i], [radius * Math.cos(angle), radius * Math.sin(angle)]);
    }
  });

  it("sx/sy independently scale the two axes", () => {
    const sides = 6;
    const sx = 0.7;
    const sy = 0.3;
    const radius = 0.5;
    const g = Primitives.polygon({ sides, sx, sy, radius, innerSegments: 1 });
    const ring = outerRing(g, sides);

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      assertClose(ring[i], [
        sx * radius * Math.cos(angle),
        sy * radius * Math.sin(angle),
      ]);
    }
  });

  it("matches rhombus at sides=4 (rhombus is a thin wrapper over this case)", () => {
    const options = { sx: 0.7, sy: 0.3, radius: 0.4, innerSegments: 1 };
    const p = Primitives.polygon({
      sides: 4,
      thetaOffset: Primitives.utils.HALF_PI,
      ...options,
    });
    const r = Primitives.rhombus(options);

    assert.deepEqual(p.positions, r.positions);
  });

  it("evenly subdivides each edge (edgeSegments), matching the linear midpoint", () => {
    const sides = 6;
    const radius = 0.5;
    const g = Primitives.polygon({
      sides,
      radius,
      edgeSegments: 2,
      innerSegments: 1,
    });
    const ring = outerRing(g, sides, 2);

    const corners = Array.from({ length: sides }, (_, i) => {
      const angle = (i / sides) * Math.PI * 2;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    });

    for (let i = 0; i < sides; i++) {
      assertClose(ring[i * 2], corners[i]);
      assertClose(
        ring[i * 2 + 1],
        midpoint(corners[i], corners[(i + 1) % sides]),
      );
    }
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.polygon()), 0);
  });

  it("is watertight with no seams or cracks across sides/theta/edgeSegments variations", () => {
    for (const options of [
      {},
      { sides: 3 },
      { sides: 5, sx: 0.3, sy: 1 },
      { theta: Math.PI },
      { thetaOffset: 0.5 },
      { innerSegments: 1 },
      { edgeSegments: 3 },
      { sides: 5, edgeSegments: 3 },
    ]) {
      const result = analyze(Primitives.polygon(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
    }
  });
});
