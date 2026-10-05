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

  for (const name of [
    "disc",
    "superellipse",
    "squircle",
    "astroid",
    "reuleaux",
  ]) {
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

describe("mergeSeam", () => {
  const segments = 16;
  const innerSegments = 4;
  const options = {
    segments,
    innerSegments,
    mapping: Primitives.mappings.polar,
  };

  const wrappingTriangles = ({ uvs, cells }) => {
    let count = 0;
    for (let i = 0; i < cells.length; i += 3) {
      const v = [0, 1, 2].map((k) => uvs[cells[i + k] * 2 + 1]);
      if (Math.max(...v) - Math.min(...v) > 0.5) count++;
    }
    return count;
  };

  it("keeps the wrap edge welded by default", () => {
    const g = Primitives.disc({ ...options, mergeCentroid: false });
    assert.ok(wrappingTriangles(g) > 0);
  });

  it("splits the wrap edge so no triangle wraps", () => {
    const welded = Primitives.disc({ ...options, mergeCentroid: false });
    const g = Primitives.disc({
      ...options,
      mergeCentroid: false,
      mergeSeam: false,
    });

    assert.equal(wrappingTriangles(g), 0);
    // One duplicate per ring on the wrap column
    assert.equal(
      g.positions.length / 3,
      welded.positions.length / 3 + innerSegments + 1,
    );
    assert.equal(g.cells.length, welded.cells.length);

    const result = analyze(g);
    assert.equal(result.cracks, 0);
    assert.equal(result.boundaries, analyze(welded).boundaries);
  });

  it("splits a merged centroid per wedge", () => {
    const g = Primitives.disc({ ...options, mergeSeam: false });
    assert.equal(wrappingTriangles(g), 0);

    // The fan's centroid sits in each triangle's third slot
    const { uvs, cells } = g;
    for (let i = 0; i < segments * 3; i += 3) {
      const [a, b, centroid] = [0, 1, 2].map((k) => cells[i + k]);
      assert.equal(uvs[centroid * 2], 0);
      assert.ok(
        Math.abs(
          uvs[centroid * 2 + 1] - (uvs[a * 2 + 1] + uvs[b * 2 + 1]) / 2,
        ) < 1e-6,
      );
    }
    assert.equal(analyze(g).cracks, 0);
  });

  it("duplicates the wrap column with matching uvs for continuous mappings", () => {
    const welded = Primitives.disc({ segments, innerSegments });
    const g = Primitives.disc({ segments, innerSegments, mergeSeam: false });
    assert.equal(
      g.positions.length / 3,
      welded.positions.length / 3 + innerSegments,
    );

    const cols = segments + 1;
    for (let j = 0; j < innerSegments; j++) {
      const first = 1 + j * cols;
      const last = first + segments;
      for (const k of [0, 1]) {
        assert.equal(g.positions[last * 3 + k], g.positions[first * 3 + k]);
        assert.ok(Math.abs(g.uvs[last * 2 + k] - g.uvs[first * 2 + k]) < 1e-6);
      }
    }
    assert.equal(analyze(g).cracks, 0);
  });
});
