import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze, flippedTriangles2D } from "./helpers.js";

describe("star", () => {
  it("alternates points outer tips and points inner notches", () => {
    const points = 5;
    const g = Primitives.star({ points, innerSegments: 1 });
    const ratio = Primitives.utils.computeStarRatio(points, 2);

    // mergeCentroid + a single ring: outer boundary is the last `points * 2`
    // vertices, in vertex-index order matching the angular sample order.
    const segments = points * 2;
    const n = g.positions.length / 3;
    for (let i = 0; i < segments; i++) {
      const index = n - segments + i;
      const radius = Math.hypot(
        g.positions[index * 3],
        g.positions[index * 3 + 1],
      );
      const expected = i % 2 === 0 ? 0.5 : 0.5 * ratio;
      assert.ok(
        Math.abs(radius - expected) < 1e-6,
        `vertex ${i}: expected radius ${expected}, got ${radius}`,
      );
    }
  });

  it("matches the pentagram's inner/outer ratio at points=5, density=2 (the default)", () => {
    const PHI = (1 + Math.sqrt(5)) / 2;
    assert.ok(
      Math.abs(Primitives.utils.computeStarRatio(5, 2) - 1 / PHI ** 2) < 1e-12,
    );
  });

  it("is watertight with no seams or cracks across points/density/theta variations", () => {
    for (const options of [
      {},
      { points: 3, density: 1 },
      { points: 7, density: 3 },
      { points: 6, innerSegments: 1 },
      { theta: Math.PI },
      { thetaOffset: 0.5 },
    ]) {
      const result = analyze(Primitives.star(options));
      assert.equal(result.seams, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.nonManifold, 0, JSON.stringify(options));
    }
  });

  it("winds every triangle CCW, facing +z", () => {
    assert.equal(flippedTriangles2D(Primitives.star()), 0);
  });

  it("allocates cells exactly, matching ellipse's formula with segments = points * 2", () => {
    const points = 5;
    const innerSegments = 4;
    const g = Primitives.star({ points, innerSegments });
    const segments = points * 2;

    assert.equal(
      g.cells.length,
      segments * 3 + (innerSegments - 1) * segments * 6,
    );
  });

  describe("innerRadius (hole)", () => {
    it("defaults to no hole, filling to the center", () => {
      const g = Primitives.star();
      const result = analyze(g);
      // A single boundary (the outer star outline), no inner rim.
      assert.equal(result.boundaries, 10);
      assert.equal(result.seams, 0);
      assert.equal(result.cracks, 0);
    });

    it("drills a hole with two boundaries (outer + inner rim) when set", () => {
      const points = 5;
      const g = Primitives.star({ points, innerRadius: 0.1 });
      const result = analyze(g);
      assert.equal(result.boundaries, points * 4);
      assert.equal(result.seams, 0);
      assert.equal(result.cracks, 0);
      assert.equal(result.nonManifold, 0);
      // No merged centroid vertex once a hole is requested (auto mergeCentroid=false)
      assert.equal(result.unused, 0);
    });

    it("self-similar hole (default): inner rim alternates tip/notch like the outer star", () => {
      const points = 5;
      const innerRadius = 0.1;
      const g = Primitives.star({
        points,
        innerRadius,
        innerSegments: 1,
      });
      const ratio = Primitives.utils.computeStarRatio(points, 2);

      // First `points * 2` vertices are the innermost (hole) ring.
      const segments = points * 2;
      for (let i = 0; i < segments; i++) {
        const radius = Math.hypot(g.positions[i * 3], g.positions[i * 3 + 1]);
        const expected = i % 2 === 0 ? innerRadius : innerRadius * ratio;
        assert.ok(
          Math.abs(radius - expected) < 1e-6,
          `hole vertex ${i}: expected radius ${expected}, got ${radius}`,
        );
      }
    });

    it("circularHole: inner rim is a plain circle regardless of tip/notch", () => {
      const points = 5;
      const innerRadius = 0.1;
      const g = Primitives.star({
        points,
        innerRadius,
        circularHole: true,
        innerSegments: 1,
      });

      const segments = points * 2;
      for (let i = 0; i < segments; i++) {
        const radius = Math.hypot(g.positions[i * 3], g.positions[i * 3 + 1]);
        assert.ok(
          Math.abs(radius - innerRadius) < 1e-6,
          `hole vertex ${i}: expected radius ${innerRadius}, got ${radius}`,
        );
      }
    });
  });
});
