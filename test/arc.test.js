import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze, flippedTriangles2D } from "./helpers.js";

function bbox({ positions }) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    maxX = Math.max(maxX, positions[i]);
    minY = Math.min(minY, positions[i + 1]);
    maxY = Math.max(maxY, positions[i + 1]);
  }
  return { minX, maxX, minY, maxY };
}

const EPS = 1e-3;
const close = (a, b, eps = EPS) => Math.abs(a - b) < eps;

describe("salinon", () => {
  it("is watertight with no seams, cracks, or non-manifold edges", () => {
    for (const options of [
      {},
      { radius: 0.5, innerRadius: 0.1 },
      { radius: 0.5, innerRadius: 0.4 },
      { segments: 64, innerSegments: 4 },
    ]) {
      const result = analyze(Primitives.salinon(options));
      assert.equal(result.degenerate, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
    }
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.salinon()), 0);
  });

  it("bounds the outer semicircle below and the central bump's peak above", () => {
    const radius = 0.5;
    const innerRadius = 0.25;
    const { minX, maxX, minY, maxY } = bbox(
      Primitives.salinon({ radius, innerRadius }),
    );
    assert.ok(close(minX, -radius));
    assert.ok(close(maxX, radius));
    assert.ok(close(minY, -radius));
    assert.ok(close(maxY, innerRadius));
  });

  it("matches Archimedes' area theorem: pi/4 * (radius + innerRadius) ** 2", () => {
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

    for (const [radius, innerRadius] of [
      [0.5, 0.25],
      [0.5, 0.1],
      [0.5, 0.4],
      [1, 0.3],
    ]) {
      const g = Primitives.salinon({
        radius,
        innerRadius,
        segments: 256,
        innerSegments: 64,
      });
      const expected = (Math.PI / 4) * (radius + innerRadius) ** 2;
      assert.ok(
        close(area(g), expected, expected * 5e-3),
        `radius=${radius} innerRadius=${innerRadius}: got ${area(g)}, expected ${expected}`,
      );
    }
  });
});

describe("lens", () => {
  it("is watertight with no seams, cracks, or non-manifold edges", () => {
    for (const options of [
      {},
      { radius: 0.5, radius2: 0.3, distance: 0.4 },
      { radius: 0.3, radius2: 0.5, distance: 0.35 },
    ]) {
      const result = analyze(Primitives.lens(options));
      assert.equal(result.degenerate, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
    }
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.lens()), 0);
  });

  it("matches the closed-form symmetric-lens width/height", () => {
    const radius = 0.5;
    const distance = 0.5;
    const { minX, maxX, minY, maxY } = bbox(
      Primitives.lens({ radius, distance }),
    );
    assert.ok(close(minX, -distance / 2));
    assert.ok(close(maxX, distance / 2));
    const height = Math.sqrt(4 * radius * radius - distance * distance) / 2;
    assert.ok(close(maxY, height));
    assert.ok(close(minY, -height));
  });
});

describe("lune", () => {
  it("is watertight with no seams, cracks, or non-manifold edges (beyond the intentional y=0 seam)", () => {
    for (const options of [
      {},
      { radius: 0.5, innerRadius: 0.3, distance: 0.35 },
      { radius: 0.5, innerRadius: 0.45, distance: 0.3 },
    ]) {
      const result = analyze(Primitives.lune(options));
      assert.equal(result.degenerate, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
    }
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.lune()), 0);
  });

  it("spans from the big circle's far tip to the two arcs' crossing point", () => {
    const radius = 0.5;
    const innerRadius = 0.3;
    const distance = 0.35;
    const uMax =
      (radius * radius - innerRadius * innerRadius + distance * distance) /
      (2 * distance);

    const { minX, maxX } = bbox(
      Primitives.lune({ radius, innerRadius, distance }),
    );
    assert.ok(close(minX, -radius));
    assert.ok(close(maxX, uMax, 1e-2));
  });

  it("matches the analytic area (big disk minus the two circles' lens), no gap at the near-boundary's kink", () => {
    function meshArea({ positions, cells }) {
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
    // MathWorld's asymmetric-lens (intersection) area formula
    function lensArea(R, r, d) {
      return (
        r * r * Math.acos((d * d + r * r - R * R) / (2 * d * r)) +
        R * R * Math.acos((d * d + R * R - r * r) / (2 * d * R)) -
        0.5 *
          Math.sqrt(
            (-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R),
          )
      );
    }

    for (const [radius, innerRadius, distance] of [
      [0.5, 0.5, 0.25],
      [0.5, 0.3, 0.35],
      [0.5, 0.45, 0.3],
      [0.5, 0.1, 0.45],
    ]) {
      const g = Primitives.lune({
        radius,
        innerRadius,
        distance,
        segments: 128,
        innerSegments: 32,
      });
      const expected =
        Math.PI * radius * radius - lensArea(radius, innerRadius, distance);
      assert.ok(
        close(meshArea(g), expected, expected * 1e-3),
        `radius=${radius} innerRadius=${innerRadius} distance=${distance}: got ${meshArea(g)}, expected ${expected}`,
      );
    }
  });
});

describe("yinYang", () => {
  it("is watertight with no cracks or non-manifold edges", () => {
    for (const options of [
      { part: "yang" },
      { part: "yin" },
      { part: "yin-yang" },
      { dotRadius: 0 },
      { dotRadius: 0.2 },
      { dotRadius: 0.01 },
      { holeSegments: 4 },
      { holeSegments: 64 },
      { radius: 1, dotRadius: 0.05, holeSegments: 40 },
    ]) {
      const result = analyze(Primitives.yinYang(options));
      assert.equal(result.degenerate, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
    }
  });

  it("holeSegments resolves the dot hole independently of segments (the outer boundary)", () => {
    const radius = 0.5;
    const dotRadius = radius / 6;
    const coarse = Primitives.yinYang({
      radius,
      dotRadius,
      part: "yang",
      segments: 8,
      holeSegments: 4,
    });
    const fine = Primitives.yinYang({
      radius,
      dotRadius,
      part: "yang",
      segments: 8,
      holeSegments: 64,
    });
    // Same outer resolution, far more vertices once the dot alone is denser
    assert.ok(fine.positions.length > coarse.positions.length * 3);

    // Dot hole boundary points should trace a true circle of radius
    // dotRadius centered at (0, -radius/2), not a low-poly facet.
    const dotCenterY = -radius / 2;
    const { positions, cells } = fine;
    const vertexCount = positions.length / 3;
    const positionKey = (index) =>
      [0, 1, 2]
        .map((i) => Math.round(positions[index * 3 + i] / 1e-4))
        .join(",");

    const edgeCounts = new Map();
    for (let i = 0; i < cells.length; i += 3) {
      for (let j = 0; j < 3; j++) {
        const a = cells[i + j];
        const b = cells[i + ((j + 1) % 3)];
        if (a === b) continue;
        const key = a < b ? a * vertexCount + b : b * vertexCount + a;
        edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
      }
    }
    const groups = new Map();
    for (const [key, count] of edgeCounts) {
      if (count !== 1) continue;
      const a = Math.floor(key / vertexCount);
      const b = key % vertexCount;
      const ka = positionKey(a);
      const kb = positionKey(b);
      const groupKey = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(a);
    }

    let maxError = 0;
    let dotBoundaryPoints = 0;
    for (const [, [a]] of [...groups].filter(([, edges]) => edges.length === 1)) {
      const ax = positions[a * 3];
      const ay = positions[a * 3 + 1];
      const distFromDotCenter = Math.hypot(ax, ay - dotCenterY);
      if (distFromDotCenter < dotRadius * 1.5) {
        dotBoundaryPoints++;
        maxError = Math.max(maxError, Math.abs(distFromDotCenter - dotRadius));
      }
    }
    assert.ok(dotBoundaryPoints > 0);
    assert.ok(maxError < dotRadius * 0.01, `max radial error ${maxError}`);
  });

  it("yin and yang sample their shared S-curve boundary at identical y-values, for any holeSegments/dotRadius", () => {
    for (const options of [
      {},
      { holeSegments: 4 },
      { holeSegments: 40 },
      { dotRadius: 0.01 },
      { dotRadius: 0.2 },
      { radius: 1, dotRadius: 0.3, segments: 12, holeSegments: 6 },
    ]) {
      const yang = Primitives.yinYang({ ...options, part: "yang" });
      const yin = Primitives.yinYang({ ...options, part: "yin" });

      const ySamples = (g) => {
        const set = new Set();
        for (let i = 0; i < g.positions.length; i += 3) {
          set.add(g.positions[i + 1]);
        }
        return set;
      };
      const yangYs = ySamples(yang);
      const yinYs = ySamples(yin);
      assert.equal(yangYs.size, yinYs.size, JSON.stringify(options));
      for (const y of yangYs) {
        assert.ok(yinYs.has(y), `y=${y} missing from yin, ${JSON.stringify(options)}`);
      }
    }
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.yinYang({ part: "yang" })), 0);
    assert.equal(flippedTriangles2D(Primitives.yinYang({ part: "yin" })), 0);
    assert.equal(
      flippedTriangles2D(Primitives.yinYang({ part: "yin-yang" })),
      0,
    );
  });

  it("spans the full circle vertically, and only its own fat lobe's side horizontally", () => {
    const radius = 0.5;
    const yang = bbox(Primitives.yinYang({ radius, part: "yang" }));
    assert.ok(close(yang.minY, -radius));
    assert.ok(close(yang.maxY, radius));
    assert.ok(close(yang.minX, -radius / 2));
    assert.ok(close(yang.maxX, radius));

    const yin = bbox(Primitives.yinYang({ radius, part: "yin" }));
    assert.ok(close(yin.minX, -radius));
    assert.ok(close(yin.maxX, radius / 2));
  });

  it("dotRadius: 0 omits the hole (no extra interior boundary loop)", () => {
    const withDot = analyze(Primitives.yinYang({ dotRadius: 0.1 }));
    const withoutDot = analyze(Primitives.yinYang({ dotRadius: 0 }));
    assert.ok(withDot.boundaries > withoutDot.boundaries);
  });

  it("defaults to part: 'yin-yang', reusing each half's own build to fill the full circle", () => {
    const radius = 0.5;
    const whole = Primitives.yinYang({ radius });
    const yang = Primitives.yinYang({ radius, part: "yang" });
    const yin = Primitives.yinYang({ radius, part: "yin" });

    assert.equal(whole.positions.length, yang.positions.length + yin.positions.length);
    assert.equal(whole.cells.length, yang.cells.length + yin.cells.length);

    const { minX, maxX, minY, maxY } = bbox(whole);
    assert.ok(close(minX, -radius));
    assert.ok(close(maxX, radius));
    assert.ok(close(minY, -radius));
    assert.ok(close(maxY, radius));

    // Both dot holes present: 2 more boundary loops than a holeless disk's 1
    const result = analyze(whole);
    const withoutDots = analyze(Primitives.yinYang({ radius, dotRadius: 0 }));
    assert.ok(result.boundaries > withoutDots.boundaries);
  });
});
