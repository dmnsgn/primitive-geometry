import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze } from "./helpers.js";

const TAU = Math.PI * 2;

describe("ellipse", () => {
  it("welds the wrap column for a full revolution", () => {
    const segments = 32;
    const innerSegments = 16;
    const g = Primitives.ellipse({ segments, innerSegments });

    // Centroid + innerSegments rings of exactly `segments` columns
    assert.equal(g.positions.length / 3, 1 + innerSegments * segments);

    const result = analyze(g);
    // Only the outer rim is a boundary, the wrap edge is shared
    assert.equal(result.boundaries, segments);
    assert.equal(result.seams, 0);
    assert.equal(result.cracks, 0);
  });

  it("keeps segments + 1 columns for open arcs", () => {
    const segments = 32;
    const innerSegments = 16;
    const g = Primitives.ellipse({ segments, innerSegments, theta: Math.PI });

    assert.equal(g.positions.length / 3, 1 + innerSegments * (segments + 1));

    const result = analyze(g);
    // Outer rim + the two straight radial edges
    assert.equal(result.boundaries, segments + 2 * innerSegments);
    assert.equal(result.seams, 0);
  });

  it("keeps the correct number of sectors when closed", () => {
    const segments = 15;
    const innerSegments = 16;
    const g = Primitives.ellipse({ segments, innerSegments });

    const result = analyze(g);
    assert.equal(result.boundaries, segments);
    assert.equal(
      result.triangleCount,
      segments + (innerSegments - 1) * segments * 2,
    );
  });

  it("closes for any theta multiple of TAU regardless of thetaOffset", () => {
    for (const options of [
      { thetaOffset: 0.5 },
      { thetaOffset: 1.2, theta: TAU },
    ]) {
      const result = analyze(Primitives.ellipse(options));
      assert.equal(result.seams, 0);
      assert.equal(result.cracks, 0);
      assert.equal(result.boundaries, 32);
    }
  });

  it("allocates cells exactly", () => {
    const segments = 32;
    const innerSegments = 16;

    const merged = Primitives.ellipse({ segments, innerSegments });
    assert.equal(
      merged.cells.length,
      segments * 3 + (innerSegments - 1) * segments * 6,
    );

    const unmerged = Primitives.ellipse({
      segments,
      innerSegments,
      mergeCentroid: false,
    });
    assert.equal(unmerged.cells.length, innerSegments * segments * 6);
    assert.equal(unmerged.positions.length / 3, (innerSegments + 1) * segments);
  });

  it("welds derived geometries (annulus)", () => {
    const segments = 32;
    const result = analyze(Primitives.annulus({ segments }));
    // Outer and inner rims only
    assert.equal(result.boundaries, 2 * segments);
    assert.equal(result.seams, 0);
    assert.equal(result.cracks, 0);
    assert.equal(result.degenerate, 0);
  });

  it("welds derived geometries with equation singularities (squircle, reuleaux)", () => {
    for (const g of [Primitives.squircle(), Primitives.reuleaux()]) {
      const result = analyze(g);
      assert.equal(result.seams, 0);
      assert.equal(result.cracks, 0);
    }
  });
});

describe("innerRadius on ellipse-derived and polar curves", () => {
  const radius = 0.5;
  const ratio = 0.4;
  const segments = 12;

  for (const name of ["disc", "superellipse", "squircle", "astroid", "reuleaux"]) {
    it(`${name}: drills a self-similar hole with an open rim`, () => {
      const g = Primitives[name]({
        radius,
        segments,
        innerRadius: radius * ratio,
        innerSegments: 1,
      });

      // mergeCentroid defaults to false once innerRadius is set: a single ring
      // is exactly the inner loop followed by the outer loop.
      assert.equal(g.positions.length / 3, segments * 2);
      for (let i = 0; i < segments; i++) {
        for (const axis of [0, 1]) {
          const inner = g.positions[i * 3 + axis];
          const outer = g.positions[(i + segments) * 3 + axis];
          assert.ok(
            Math.abs(inner - outer * ratio) < 1e-6,
            `vertex ${i}: inner ${inner}, expected ${outer * ratio}`,
          );
        }
      }

      const result = analyze(g);
      assert.equal(result.boundaries, segments * 2);
      assert.equal(result.degenerate, 0);
      assert.equal(result.unused, 0);
    });
  }
});
