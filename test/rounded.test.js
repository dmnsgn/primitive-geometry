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

  describe("roundedCorners", () => {
    // The sharp flat-square outer corner sits at exactly (±sx/2, ±sy/2);
    // a rounded corner's outermost vertex moves off that exact point.
    const isSharp = (g, signX, signY, sx = 1, sy = 1) => {
      const x = (signX * sx) / 2;
      const y = (signY * sy) / 2;
      for (let i = 0; i < g.positions.length; i += 3) {
        if (
          Math.abs(g.positions[i] - x) < 1e-4 &&
          Math.abs(g.positions[i + 1] - y) < 1e-4
        ) {
          return true;
        }
      }
      return false;
    };

    it("defaults to all 4 corners rounded, matching no option passed", () => {
      const a = Primitives.roundedRectangle();
      const b = Primitives.roundedRectangle({
        roundedCorners: [
          "top-left",
          "top-right",
          "bottom-right",
          "bottom-left",
        ],
      });
      assert.deepEqual(a.positions, b.positions);
      assert.deepEqual(a.cells, b.cells);
    });

    it("rounds only the requested corner, leaving the other 3 sharp", () => {
      const corners = {
        "top-left": [-1, 1],
        "top-right": [1, 1],
        "bottom-right": [1, -1],
        "bottom-left": [-1, -1],
      };
      for (const only of Object.keys(corners)) {
        const g = Primitives.roundedRectangle({ roundedCorners: [only] });
        for (const [name, [signX, signY]] of Object.entries(corners)) {
          assert.equal(
            isSharp(g, signX, signY),
            name !== only,
            `${only}: ${name} should be ${name === only ? "rounded" : "sharp"}`,
          );
        }
        assert.equal(flippedTriangles2D(g), 0);
        assert.equal(analyze(g).degenerate, 0);
      }
    });

    it("an empty selection is a fully sharp rectangle", () => {
      const g = Primitives.roundedRectangle({ roundedCorners: [] });
      for (const [signX, signY] of [
        [-1, 1],
        [1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        assert.ok(isSharp(g, signX, signY));
      }
      assert.equal(flippedTriangles2D(g), 0);
      const result = analyze(g);
      assert.equal(result.degenerate, 0);
      assert.equal(result.cracks, 0);
    });
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

  describe("roundDirection", () => {
    it('defaults to "all", matching no option passed', () => {
      const a = Primitives.roundedCube();
      const b = Primitives.roundedCube({ roundDirection: "all" });
      assert.deepEqual(a.positions, b.positions);
      assert.deepEqual(a.normals, b.normals);
    });

    it("is watertight for every direction, at radii other than the default", () => {
      // A face rounded by computePlane's own 2D corners and a neighboring
      // face rounded by the 3D blend below both recompute their shared
      // boundary fresh in double precision (no Float32Array round-trip), so
      // this sweeps radii other than the coincidentally-safe default to
      // guard against that regressing.
      for (const radius of [0.1, 0.2, 0.22, 0.3, 0.4]) {
        for (const roundDirection of ["all", "x", "y", "z"]) {
          const options = { radius, roundDirection };
          const g = Primitives.roundedCube(options);
          const result = analyze(g);
          assert.equal(result.boundaries, 0, JSON.stringify(options));
          assert.equal(result.cracks, 0, JSON.stringify(options));
          assert.equal(result.degenerate, 0, JSON.stringify(options));
          assert.equal(inwardTriangles(g), 0, JSON.stringify(options));
        }
      }
    });

    it("with a direction picked, that axis's own two faces stay flat and the other 4 edges are true quarter-circles", () => {
      const radius = 0.2;
      const g = Primitives.roundedCube({ radius, roundDirection: "z" });

      // z/-z caps stay at their flat, unmodified height
      const capZs = new Set();
      for (let i = 0; i < g.positions.length; i += 3) {
        capZs.add(g.positions[i + 2]);
      }
      assert.ok(capZs.has(0.5) && capZs.has(-0.5));

      // Every corner-region cap vertex is a filled-area point of the cap's
      // own 2D rounded-rectangle corner, so its distance from (rx, ry) only
      // has to stay within radius (never overshoot); the outermost boundary
      // ring must actually reach all the way out to radius.
      const rx = 0.3;
      const ry = 0.3;
      let maxDist = 0;
      let checked = 0;
      for (let i = 0; i < g.positions.length; i += 3) {
        const x = g.positions[i];
        const y = g.positions[i + 1];
        const z = g.positions[i + 2];
        if (Math.abs(z) < 0.499) continue; // only the flat caps
        if (Math.abs(x) <= rx || Math.abs(y) <= ry) continue; // not a corner
        const dist = Math.hypot(Math.abs(x) - rx, Math.abs(y) - ry);
        assert.ok(
          dist <= radius + 1e-5,
          `corner vertex (${x},${y},${z}) overshoots radius ${radius}, got ${dist}`,
        );
        maxDist = Math.max(maxDist, dist);
        checked++;
      }
      assert.ok(
        checked > 0,
        "expected at least one rounded-corner cap vertex to check",
      );
      assert.ok(
        Math.abs(maxDist - radius) < 1e-5,
        `expected the outermost corner ring to reach radius ${radius}, got ${maxDist}`,
      );
    });
  });
});
