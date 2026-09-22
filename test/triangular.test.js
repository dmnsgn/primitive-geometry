import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze, flippedTriangles2D } from "./helpers.js";

// mergeCentroid + a single ring: outer boundary is the last edgeSegments * 3
// vertices, in vertex-index order matching the angular sample order
// (thetaOffset default 0): bottom-left, ..., bottom-right, ..., apex, ...
const outerRing = (g, edgeSegments = 1) => {
  const cols = edgeSegments * 3;
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

describe("triangle", () => {
  it("places vertices at bottom-left/bottom-right/apex, apex shifted by apexOffset", () => {
    const sx = 0.6;
    const sy = 0.4;
    const apexOffset = 0.2;
    const radius = 0.5;
    const g = Primitives.triangle({
      sx,
      sy,
      apexOffset,
      radius,
      innerSegments: 1,
    });
    const [bottomLeft, bottomRight, apex] = outerRing(g);

    assertClose(bottomLeft, [-sx * radius, -sy * radius]);
    assertClose(bottomRight, [sx * radius, -sy * radius]);
    assertClose(apex, [apexOffset * radius, sy * radius]);
  });

  it("is isosceles when apexOffset=0", () => {
    const sx = 0.6;
    const sy = 0.4;
    const radius = 0.5;
    const g = Primitives.triangle({ sx, sy, radius, innerSegments: 1 });
    const [bottomLeft, bottomRight, apex] = outerRing(g);

    assert.ok(Math.abs(apex[0]) < 1e-6);
    assertClose(bottomLeft, [-sx * radius, -sy * radius]);
    assertClose(bottomRight, [sx * radius, -sy * radius]);
  });

  it("evenly subdivides each edge (edgeSegments), matching the linear midpoint", () => {
    const sx = 0.6;
    const sy = 0.4;
    const apexOffset = 0.2;
    const radius = 0.5;
    const g = Primitives.triangle({
      sx,
      sy,
      apexOffset,
      radius,
      edgeSegments: 2,
      innerSegments: 1,
    });
    const ring = outerRing(g, 2);

    const bottomLeft = [-sx * radius, -sy * radius];
    const bottomRight = [sx * radius, -sy * radius];
    const apex = [apexOffset * radius, sy * radius];

    assertClose(ring[0], bottomLeft);
    assertClose(ring[1], midpoint(bottomLeft, bottomRight));
    assertClose(ring[2], bottomRight);
    assertClose(ring[3], midpoint(bottomRight, apex));
    assertClose(ring[4], apex);
    assertClose(ring[5], midpoint(apex, bottomLeft));
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.triangle()), 0);
  });

  it("fans from the outline's own vertex average (not world origin) so ring spacing stays even once apexOffset shifts it", () => {
    const radius = 0.5;
    const sy = 1;
    // Vertex average of bottomLeft/bottomRight/apex: unlike trapezoid's 4
    // corners (2 at each y), the base's 2 corners don't balance the single
    // apex corner, so even the isosceles case centers below y = 0, at -sy/3.
    const isosceles = Primitives.triangle({ sy, radius, innerSegments: 1 });
    assertClose(
      [isosceles.positions[0], isosceles.positions[1]],
      [0, (-radius * sy) / 3],
    );

    const sx = 0.5;
    const apexOffset = 0.6;
    const skewed = Primitives.triangle({
      sx,
      sy,
      apexOffset,
      radius,
      innerSegments: 1,
    });
    // The base pair averages to 0 regardless of apexOffset, so the centroid
    // sits at 1/3 of apexOffset horizontally, same -sy/3 vertically.
    assertClose(
      [skewed.positions[0], skewed.positions[1]],
      [(radius * apexOffset) / 3, (-radius * sy) / 3],
    );
  });

  it("is watertight with no seams or cracks across sx/sy/apexOffset/theta/edgeSegments variations", () => {
    for (const options of [
      {},
      { sx: 0.3, sy: 0.6 },
      { apexOffset: 0.2 },
      { apexOffset: -0.6 },
      { theta: Math.PI },
      { thetaOffset: 0.5 },
      { innerSegments: 1 },
      { edgeSegments: 3 },
      { edgeSegments: 3, apexOffset: 0.1 },
      { innerRadius: 0.1 },
      { innerRadius: 0.2, apexOffset: 0.3 },
    ]) {
      const result = analyze(Primitives.triangle(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
    }
  });

  it("innerRadius drills a self-similar hole even once apexOffset recenters the fan", () => {
    const radius = 0.5;
    const ratio = 0.4;
    const apexOffset = 0.6;
    const g = Primitives.triangle({
      radius,
      apexOffset,
      innerRadius: radius * ratio,
      innerSegments: 1,
    });
    const inner = Array.from({ length: 3 }, (_, i) => [
      g.positions[i * 3],
      g.positions[i * 3 + 1],
    ]);
    const outer = outerRing(g);
    const [cx, cy] = outer
      .reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0])
      .map((sum) => sum / 3);

    for (let i = 0; i < 3; i++) {
      assertClose(inner[i], [
        cx + ratio * (outer[i][0] - cx),
        cy + ratio * (outer[i][1] - cy),
      ]);
    }
  });
});

describe("rightTriangle", () => {
  it("delegates to triangle with apexOffset = -sx", () => {
    const options = {
      sx: 0.6,
      sy: 0.4,
      innerSegments: 1,
      innerRadius: 0.1,
    };
    const r = Primitives.rightTriangle(options);
    const t = Primitives.triangle({ ...options, apexOffset: -options.sx });
    assert.deepEqual(r.positions, t.positions);
  });

  it("places the right angle at the bottom-left corner", () => {
    const sx = 0.6;
    const sy = 0.4;
    const radius = 0.5;
    const g = Primitives.rightTriangle({ sx, sy, radius, innerSegments: 1 });
    const [bottomLeft, bottomRight, apex] = outerRing(g);

    const legA = [
      bottomRight[0] - bottomLeft[0],
      bottomRight[1] - bottomLeft[1],
    ];
    const legB = [apex[0] - bottomLeft[0], apex[1] - bottomLeft[1]];
    assert.ok(Math.abs(legA[0] * legB[0] + legA[1] * legB[1]) < 1e-6);
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.rightTriangle()), 0);
  });
});
