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
      assertClose(ring[i], [
        radius * Math.cos(angle),
        radius * Math.sin(angle),
      ]);
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
      { innerRadius: 0.1 },
      { innerRadius: 0.2, sides: 5, edgeSegments: 3 },
    ]) {
      const result = analyze(Primitives.polygon(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
    }
  });

  it("innerRadius drills a self-similar hole (scaled copy of the outer outline)", () => {
    const sides = 6;
    const radius = 0.5;
    const ratio = 0.4;
    const g = Primitives.polygon({
      sides,
      radius,
      innerRadius: radius * ratio,
      innerSegments: 1,
    });

    // mergeCentroid defaults to false once innerRadius is set: a single ring
    // is exactly the inner loop (sides verts) followed by the outer loop.
    const inner = Array.from({ length: sides }, (_, i) => [
      g.positions[i * 3],
      g.positions[i * 3 + 1],
    ]);
    const outer = Array.from({ length: sides }, (_, i) => [
      g.positions[(i + sides) * 3],
      g.positions[(i + sides) * 3 + 1],
    ]);

    for (let i = 0; i < sides; i++) {
      assertClose(inner[i], [outer[i][0] * ratio, outer[i][1] * ratio]);
    }
  });
});

describe("cross", () => {
  it("is watertight with no seams or cracks across armWidth/edgeSegments/innerSegments variations", () => {
    for (const options of [
      {},
      { armWidth: 0.1 },
      { armWidth: 0.4 },
      { edgeSegments: 3 },
      { innerSegments: 1 },
      { innerSegments: 4 },
      { edgeSegments: 4, innerSegments: 8 },
      { innerRadius: 0.1 },
      { innerRadius: 0.2, edgeSegments: 3 },
    ]) {
      const result = analyze(Primitives.cross(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
      assert.equal(result.degenerate, 0, JSON.stringify(options));
    }
  });

  it("innerRadius drills a self-similar hole (scaled copy of the outer outline)", () => {
    const radius = 0.5;
    const ratio = 0.4;
    const g = Primitives.cross({
      radius,
      innerRadius: radius * ratio,
      edgeSegments: 1,
      innerSegments: 1,
    });

    // With mergeCentroid=false and a single ring, the mesh is exactly the
    // inner loop (12 verts) followed by the outer loop (12 verts).
    const inner = Array.from({ length: 12 }, (_, i) => [
      g.positions[i * 3],
      g.positions[i * 3 + 1],
    ]);
    const outer = Array.from({ length: 12 }, (_, i) => [
      g.positions[(i + 12) * 3],
      g.positions[(i + 12) * 3 + 1],
    ]);

    for (let i = 0; i < 12; i++) {
      assertClose(inner[i], [outer[i][0] * ratio, outer[i][1] * ratio]);
    }
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.cross()), 0);
  });

  it("defaults armWidth to radius/3, the 5-equal-squares Greek cross", () => {
    const radius = 0.5;
    const g = Primitives.cross({ radius });

    function bbox({ positions }) {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (let i = 0; i < positions.length; i += 3) {
        minX = Math.min(minX, positions[i]);
        maxX = Math.max(maxX, positions[i]);
        minY = Math.min(minY, positions[i + 1]);
        maxY = Math.max(maxY, positions[i + 1]);
      }
      return { minX, maxX, minY, maxY };
    }

    const { minX, maxX, minY, maxY } = bbox(g);
    assertClose([minX, maxX, minY, maxY], [-radius, radius, -radius, radius]);

    // Area of a Greek cross (5 equal squares of side 2*armWidth): 5 * (2w)^2
    function area({ positions, cells }) {
      let a = 0;
      for (let i = 0; i < cells.length; i += 3) {
        const [p, q, r] = [cells[i], cells[i + 1], cells[i + 2]];
        const ax = positions[p * 3];
        const ay = positions[p * 3 + 1];
        const bx = positions[q * 3];
        const by = positions[q * 3 + 1];
        const cx = positions[r * 3];
        const cy = positions[r * 3 + 1];
        a += (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
      }
      return Math.abs(a) / 2;
    }

    const armWidth = radius / 3;
    const expected = 5 * (2 * armWidth) ** 2;
    assert.ok(Math.abs(area(g) - expected) < 1e-6);
  });

  it("area is exact regardless of segments/innerSegments (straight edges, no curvature to approximate)", () => {
    function area({ positions, cells }) {
      let a = 0;
      for (let i = 0; i < cells.length; i += 3) {
        const [p, q, r] = [cells[i], cells[i + 1], cells[i + 2]];
        const ax = positions[p * 3];
        const ay = positions[p * 3 + 1];
        const bx = positions[q * 3];
        const by = positions[q * 3 + 1];
        const cx = positions[r * 3];
        const cy = positions[r * 3 + 1];
        a += (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
      }
      return Math.abs(a) / 2;
    }

    const radius = 0.5;
    const armWidth = radius / 3;
    const expected = 5 * (2 * armWidth) ** 2;

    for (const options of [
      { segments: 1, innerSegments: 1 },
      { segments: 3, innerSegments: 1 },
      { segments: 1, innerSegments: 5 },
      { edgeSegments: 4, innerSegments: 8 },
    ]) {
      const g = Primitives.cross({ radius, ...options });
      assert.ok(
        Math.abs(area(g) - expected) < 1e-5,
        `${JSON.stringify(options)}: got ${area(g)}, expected ${expected}`,
      );
    }
  });
});

describe("reuleaux", () => {
  const vertexAngles = (g, cols) => {
    const n = g.positions.length / 3;
    const angles = [];
    for (let i = 0; i < cols; i++) {
      const index = n - cols + i;
      const x = g.positions[index * 3];
      const y = g.positions[index * 3 + 1];
      if (Math.abs(Math.hypot(x, y) - 1) < 1e-4) {
        angles.push(Math.atan2(y, x));
      }
    }
    return angles;
  };

  it("thetaOffset rotates the whole shape (vertices shift by thetaOffset, not just reindex)", () => {
    const segments = 12;
    const thetaOffset = Math.PI / 2;
    const g0 = Primitives.reuleaux({
      radius: 1,
      segments,
      innerSegments: 1,
      mergeCentroid: false,
    });
    const gOffset = Primitives.reuleaux({
      radius: 1,
      segments,
      innerSegments: 1,
      mergeCentroid: false,
      thetaOffset,
    });

    const wrap = (a) =>
      ((a % Primitives.utils.TAU) + Primitives.utils.TAU) %
      Primitives.utils.TAU;
    const before = vertexAngles(g0, segments)
      .map(wrap)
      .sort((a, b) => a - b);
    const after = vertexAngles(gOffset, segments)
      .map(wrap)
      .sort((a, b) => a - b);

    assert.equal(before.length, 3);
    assert.equal(after.length, 3);
    for (let i = 0; i < 3; i++) {
      assert.ok(
        Math.abs(wrap(after[i] - before[i]) - thetaOffset) < 1e-6,
        `vertex ${i}: expected a ${thetaOffset} rotation`,
      );
    }
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.reuleaux()), 0);
  });

  it("is watertight with no seams or cracks across sides/theta/thetaOffset variations", () => {
    for (const options of [
      {},
      { sides: 4 },
      { sides: 5 },
      { theta: Math.PI },
      { thetaOffset: 0.5 },
      { innerSegments: 1 },
      { segments: 8 },
    ]) {
      const result = analyze(Primitives.reuleaux(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
    }
  });
});
