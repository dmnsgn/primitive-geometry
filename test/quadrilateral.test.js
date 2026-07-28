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

describe("trapezoid", () => {
  it("places vertices at bottom-left/bottom-right/top-right/top-left, top narrowed by topRatio and shifted by topOffset", () => {
    const sx = 0.6;
    const sy = 0.4;
    const topRatio = 0.5;
    const topOffset = 0.2;
    const radius = 0.5;
    const g = Primitives.trapezoid({
      sx,
      sy,
      topRatio,
      topOffset,
      radius,
      innerSegments: 1,
    });
    const [bottomLeft, bottomRight, topRight, topLeft] = outerRing(g);

    assertClose(bottomLeft, [-sx * radius, -sy * radius]);
    assertClose(bottomRight, [sx * radius, -sy * radius]);
    assertClose(topRight, [(topOffset + sx * topRatio) * radius, sy * radius]);
    assertClose(topLeft, [(topOffset - sx * topRatio) * radius, sy * radius]);
  });

  it("is a rectangle when topRatio=1 and topOffset=0", () => {
    const sx = 0.6;
    const sy = 0.4;
    const radius = 0.5;
    const g = Primitives.trapezoid({
      sx,
      sy,
      topRatio: 1,
      topOffset: 0,
      radius,
      innerSegments: 1,
    });
    const [bottomLeft, bottomRight, topRight, topLeft] = outerRing(g);

    assertClose(bottomLeft, [-sx * radius, -sy * radius]);
    assertClose(bottomRight, [sx * radius, -sy * radius]);
    assertClose(topRight, [sx * radius, sy * radius]);
    assertClose(topLeft, [-sx * radius, sy * radius]);
  });

  it("collapses the top edge to a point when topRatio=0", () => {
    const sx = 0.6;
    const sy = 0.4;
    const topOffset = 0.1;
    const radius = 0.5;
    const g = Primitives.trapezoid({
      sx,
      sy,
      topRatio: 0,
      topOffset,
      radius,
      innerSegments: 1,
    });
    const [, , topRight, topLeft] = outerRing(g);

    assertClose(topRight, [topOffset * radius, sy * radius]);
    assertClose(topLeft, [topOffset * radius, sy * radius]);
  });

  it("evenly subdivides each edge (edgeSegments), matching the linear midpoint", () => {
    const sx = 0.6;
    const sy = 0.4;
    const topRatio = 0.5;
    const topOffset = 0.2;
    const radius = 0.5;
    const g = Primitives.trapezoid({
      sx,
      sy,
      topRatio,
      topOffset,
      radius,
      edgeSegments: 2,
      innerSegments: 1,
    });
    const ring = outerRing(g, 2);

    const bottomLeft = [-sx * radius, -sy * radius];
    const bottomRight = [sx * radius, -sy * radius];
    const topRight = [(topOffset + sx * topRatio) * radius, sy * radius];
    const topLeft = [(topOffset - sx * topRatio) * radius, sy * radius];

    assertClose(ring[0], bottomLeft);
    assertClose(ring[1], midpoint(bottomLeft, bottomRight));
    assertClose(ring[2], bottomRight);
    assertClose(ring[3], midpoint(bottomRight, topRight));
    assertClose(ring[4], topRight);
    assertClose(ring[5], midpoint(topRight, topLeft));
    assertClose(ring[6], topLeft);
    assertClose(ring[7], midpoint(topLeft, bottomLeft));
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.trapezoid()), 0);
  });

  it("fans from the outline's own vertex average (not world origin) so ring spacing stays even once topOffset shifts it", () => {
    const radius = 0.5;
    const isosceles = Primitives.trapezoid({ radius, innerSegments: 1 });
    // topOffset=0: bottom/top corners already average to (0, 0), matching
    // the unshifted behaviour.
    assertClose([isosceles.positions[0], isosceles.positions[1]], [0, 0]);

    const sx = 0.5;
    const topRatio = 0.5;
    const topOffset = 0.6;
    const skewed = Primitives.trapezoid({
      sx,
      topRatio,
      topOffset,
      radius,
      innerSegments: 1,
    });
    // Vertex average of bottomLeft/bottomRight/topRight/topLeft: the bottom
    // pair always averages to 0, the top pair to topOffset, so the apex
    // sits at half of topOffset regardless of topRatio.
    assertClose(
      [skewed.positions[0], skewed.positions[1]],
      [(radius * topOffset) / 2, 0],
    );
  });

  it("is watertight with no seams or cracks across sx/sy/topRatio/topOffset/theta/edgeSegments variations", () => {
    for (const options of [
      {},
      { sx: 0.3, sy: 0.6 },
      { topRatio: 0.1 },
      { topRatio: 0.9 },
      { topOffset: 0.2 },
      { topOffset: 0.8 },
      { theta: Math.PI },
      { thetaOffset: 0.5 },
      { innerSegments: 1 },
      { edgeSegments: 3 },
      { edgeSegments: 3, topRatio: 0.1, topOffset: 0.1 },
    ]) {
      const result = analyze(Primitives.trapezoid(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
    }
  });
});

describe("parallelogram", () => {
  it("delegates to trapezoid with topRatio=1 and topOffset=shear", () => {
    const options = { sx: 0.6, sy: 0.4, shear: 0.25, innerSegments: 1 };
    const p = Primitives.parallelogram(options);
    const t = Primitives.trapezoid({
      sx: options.sx,
      sy: options.sy,
      topRatio: 1,
      topOffset: options.shear,
      innerSegments: options.innerSegments,
    });
    assert.deepEqual(p.positions, t.positions);
  });

  it("is a rectangle when shear=0", () => {
    const sx = 0.6;
    const sy = 0.4;
    const radius = 0.5;
    const g = Primitives.parallelogram({
      sx,
      sy,
      shear: 0,
      radius,
      innerSegments: 1,
    });
    const [bottomLeft, bottomRight, topRight, topLeft] = outerRing(g);

    assertClose(bottomLeft, [-sx * radius, -sy * radius]);
    assertClose(bottomRight, [sx * radius, -sy * radius]);
    assertClose(topRight, [sx * radius, sy * radius]);
    assertClose(topLeft, [-sx * radius, sy * radius]);
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.parallelogram()), 0);
  });
});
