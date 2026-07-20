import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import {
  analyze,
  cornerDiagonalSlopes,
  flippedTriangles2D,
  inwardTriangles,
  uniquePositionCount,
  uvMismatches,
  uvsOutOfRange,
} from "./helpers.js";

describe("roundedRectangle", () => {
  it("is a single welded grid", () => {
    const roundSegments = 8;
    const nx = 1;
    const ny = 1;
    const g = Primitives.roundedRectangle({ roundSegments, nx, ny });

    const cols = 2 * roundSegments + nx;
    const rows = 2 * roundSegments + ny;
    const vertexCount = (cols + 1) * (rows + 1);

    assert.equal(g.positions.length / 3, vertexCount);
    // Fully welded: no duplicated positions at all
    assert.equal(uniquePositionCount(g), vertexCount);
    assert.equal(g.cells.length, cols * rows * 6);

    const result = analyze(g);
    assert.equal(result.seams, 0);
    assert.equal(result.cracks, 0);
    // Outline only
    assert.equal(result.boundaries, 2 * (cols + rows));
  });

  it("has no T-junctions with mismatched subdivisions", () => {
    const roundSegments = 4;
    const nx = 2;
    const ny = 5;
    const g = Primitives.roundedRectangle({ roundSegments, nx, ny });

    const cols = 2 * roundSegments + nx;
    const rows = 2 * roundSegments + ny;
    const result = analyze(g);
    assert.equal(result.seams, 0);
    assert.equal(result.cracks, 0);
    assert.equal(result.boundaries, 2 * (cols + rows));
  });

  it("uses radial diagonals in the corners", () => {
    const g = Primitives.roundedRectangle();
    const slopes = cornerDiagonalSlopes(g, 0.25, 0.25);

    assert.deepEqual(slopes["-x-y"], new Set([1]));
    assert.deepEqual(slopes["+x+y"], new Set([1]));
    assert.deepEqual(slopes["+x-y"], new Set([-1]));
    assert.deepEqual(slopes["-x+y"], new Set([-1]));
  });

  it("faces +z with consistent winding", () => {
    assert.equal(flippedTriangles2D(Primitives.roundedRectangle()), 0);
    assert.equal(
      flippedTriangles2D(Primitives.roundedRectangle({ nx: 3, ny: 2 })),
      0,
    );
  });

  it("has continuous uvs within [0, 1]", () => {
    const g = Primitives.roundedRectangle();
    assert.equal(uvsOutOfRange(g), 0);
    assert.equal(uvMismatches(g), 0);
  });

  it("defaults nx/ny to edgeSegments for backwards compatibility", () => {
    const a = Primitives.roundedRectangle({ edgeSegments: 4 });
    const b = Primitives.roundedRectangle({ nx: 4, ny: 4 });
    assert.deepEqual(a.positions, b.positions);
    assert.deepEqual(a.cells, b.cells);
  });
});

describe("stadium", () => {
  it("collapses zero-length straight sections without degenerate cells", () => {
    const roundSegments = 8;
    // sy < sx: widthY = 0, the vertical straight section collapses
    const g = Primitives.stadium({ roundSegments });

    const cols = 2 * roundSegments + 1;
    const rows = 2 * roundSegments;
    assert.equal(g.positions.length / 3, (cols + 1) * (rows + 1));

    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.seams, 0);
    assert.equal(result.cracks, 0);
  });

  it("collapses both sections into a circle when sx = sy", () => {
    const roundSegments = 8;
    const g = Primitives.stadium({ sy: 1, roundSegments });

    const cols = 2 * roundSegments;
    assert.equal(g.positions.length / 3, (cols + 1) * (cols + 1));
    assert.equal(analyze(g).degenerate, 0);
  });
});

describe("roundedCube", () => {
  it("welds each face, seams only at face borders", () => {
    const g = Primitives.roundedCube();
    const result = analyze(g);

    // Closed surface: no boundaries, no cracks; the seams are the duplicated
    // face borders required by the per-face uv atlas
    assert.equal(result.boundaries, 0);
    assert.equal(result.cracks, 0);
    assert.equal(result.degenerate, 0);
    assert.ok(result.seams > 0);
    assert.ok(uniquePositionCount(g) < g.positions.length / 3);
  });

  it("is watertight with mismatched subdivisions and non-uniform sizes", () => {
    for (const options of [
      { roundSegments: 3, edgeSegments: 2, nx: 3 },
      { sy: 0.6, sz: 0.4, radius: 0.1 },
      { nx: 2, ny: 3, nz: 4 },
    ]) {
      const result = analyze(Primitives.roundedCube(options));
      assert.equal(result.boundaries, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
      assert.equal(result.degenerate, 0, JSON.stringify(options));
    }
  });

  it("faces outward with uvs in [0, 1]", () => {
    const g = Primitives.roundedCube();
    assert.equal(inwardTriangles(g), 0);
    assert.equal(uvsOutOfRange(g), 0);
  });

  it("collapses zero-size sections at radius = half size", () => {
    for (const options of [{ radius: 0.5 }, { sy: 0.5 }]) {
      const result = analyze(Primitives.roundedCube(options));
      assert.equal(result.degenerate, 0, JSON.stringify(options));
      assert.equal(result.cracks, 0, JSON.stringify(options));
    }
  });
});
