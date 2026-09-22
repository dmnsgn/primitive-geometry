import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { polar, rectangular } from "../src/mappings.js";
import {
  analyze,
  flippedNormalTriangles,
  inwardTriangles,
  uvsOutOfRange,
} from "./helpers.js";

const TAU = Math.PI * 2;

describe("cylinder", () => {
  it("welds the wrap column exactly, including inexact 1/nx", () => {
    for (const nx of [16, 15]) {
      const result = analyze(Primitives.cylinder({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("fans cap centers with a single triangle per quad", () => {
    const nx = 16;
    const ny = 1;
    const capSegments = 3;
    const g = Primitives.cylinder({ nx, ny, capSegments });

    // Sides + two caps, minus one fan per cap innermost ring
    assert.equal(
      g.cells.length / 3,
      nx * ny * 2 + 2 * (nx * capSegments * 2 - nx),
    );
    assert.equal(analyze(g).degenerate, 0);
  });

  it("faces outward", () => {
    assert.equal(inwardTriangles(Primitives.cylinder()), 0);
  });
});

describe("roundedCylinder", () => {
  it("welds the wrap column and both poles, including inexact 1/nx", () => {
    for (const nx of [16, 15]) {
      const result = analyze(Primitives.roundedCylinder({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
      assert.equal(result.unused, 2, `nx=${nx}`);
    }
  });

  it("faces outward, correctly wound across the fillet/flat-cap/side range", () => {
    for (const g of [
      Primitives.roundedCylinder(),
      Primitives.roundedCylinder({ roundRadius: 0 }), // plain flat-capped cylinder
      Primitives.roundedCylinder({
        roundRadius: 0.25,
        radius: 0.25,
        height: 0.5,
      }), // capsule limit
      Primitives.roundedCylinder({ roundRadius: 10 }), // clamped
      Primitives.roundedCylinder({ ny: 4, roundSegments: 3, capSegments: 2 }),
      Primitives.roundedCylinder({ phi: Math.PI }),
    ]) {
      const result = analyze(g);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(flippedNormalTriangles(g), 0);
    }
  });

  it("matches the closed-form flat radius and rim height", () => {
    const radius = 0.3;
    const roundRadius = 0.1;
    const height = 1;
    const g = Primitives.roundedCylinder({ radius, roundRadius, height });

    const { positions } = g;
    let minY = Infinity;
    let maxY = -Infinity;
    let maxR = -Infinity;
    for (let i = 0; i < positions.length / 3; i++) {
      const y = positions[i * 3 + 1];
      const r = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      maxR = Math.max(maxR, r);
    }
    assert.ok(Math.abs(minY + height / 2) < 1e-6);
    assert.ok(Math.abs(maxY - height / 2) < 1e-6);
    assert.ok(Math.abs(maxR - radius) < 1e-6);
  });

  it("roundRadius = 0 has no fillet rows (plain flat-capped cylinder topology)", () => {
    const nx = 16;
    const ny = 1;
    const capSegments = 1;
    const g = Primitives.roundedCylinder({
      nx,
      ny,
      capSegments,
      roundRadius: 0,
    });

    // Same shape as a capBase/capApex cylinder: 2 flat-cap fans + straight side
    const nyTotal = 2 * capSegments + ny;
    assert.equal(g.cells.length / 3, nyTotal * nx * 2 - 2 * nx);
  });

  it("roundRadius = radius = height / 2 matches capsule's own bounding shape", () => {
    const radius = 0.25;
    const nx = 32;
    const roundSegments = 32;
    const rounded = Primitives.roundedCylinder({
      radius,
      height: radius * 2,
      roundRadius: radius,
      nx,
      roundSegments,
    });
    const capsule = Primitives.capsule({
      radius,
      height: 0,
      nx,
      roundSegments,
      ny: 1,
    });

    const bbox = (g) => {
      const { positions } = g;
      let minY = Infinity;
      let maxY = -Infinity;
      let maxR = -Infinity;
      for (let i = 0; i < positions.length / 3; i++) {
        minY = Math.min(minY, positions[i * 3 + 1]);
        maxY = Math.max(maxY, positions[i * 3 + 1]);
        maxR = Math.max(
          maxR,
          Math.hypot(positions[i * 3], positions[i * 3 + 2]),
        );
      }
      return { minY, maxY, maxR };
    };

    const a = bbox(rounded);
    const b = bbox(capsule);
    assert.ok(Math.abs(a.minY - b.minY) < 1e-6);
    assert.ok(Math.abs(a.maxY - b.maxY) < 1e-6);
    assert.ok(Math.abs(a.maxR - b.maxR) < 1e-6);
  });
});

describe("hyperboloid", () => {
  it("welds the wrap column exactly, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.hyperboloid({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("pinches to the waist radius at y = 0, flares to radiusTop at both rims", () => {
    const radius = 0.25;
    const radiusTop = 0.5;
    const g = Primitives.hyperboloid({
      radius,
      radiusTop,
      capApex: false,
      capBase: false,
    });

    const { positions } = g;
    let minR = Infinity;
    let maxR = -Infinity;
    for (let i = 0; i < positions.length / 3; i++) {
      const r = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
    }
    assert.ok(Math.abs(minR - radius) < 1e-6);
    assert.ok(Math.abs(maxR - radiusTop) < 1e-6);
  });

  it("radiusTop = radius degenerates to a plain cylinder", () => {
    const g = Primitives.hyperboloid({ radiusTop: 0.25, radius: 0.25 });
    const { positions } = g;
    for (let i = 0; i < positions.length / 3; i++) {
      const r = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
      assert.ok(r < 1e-6 || Math.abs(r - 0.25) < 1e-6);
    }
  });

  it("faces outward, correctly wound with and without caps", () => {
    for (const g of [
      Primitives.hyperboloid(),
      Primitives.hyperboloid({ capApex: false, capBase: false }),
      Primitives.hyperboloid({ radiusTop: 0.1, radius: 0.25, capSegments: 3 }),
    ]) {
      assert.equal(flippedNormalTriangles(g), 0);
    }
  });
});

describe("cone", () => {
  it("fans the apex without merging its per-column normals and uvs", () => {
    const nx = 16;
    const ny = 1;
    const g = Primitives.cone({ nx, ny });

    // Side quads emit a single triangle at the apex row; base cap fans too
    assert.equal(g.cells.length / 3, nx * ny * 2 - nx + nx);

    const { normals, uvs, positions } = g;
    // Apex duplicates: same position, distinct normals and uvs per column
    const apex = [];
    for (let i = 0; i < positions.length / 3; i++) {
      if (positions[i * 3 + 1] === 0.5 && positions[i * 3] === 0) apex.push(i);
    }
    assert.ok(apex.length > 1, "apex duplicates are kept");
    const [a, b] = apex;
    assert.notEqual(normals[a * 3], normals[b * 3]);
    assert.notEqual(uvs[a * 2], uvs[b * 2]);

    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.cracks, 0);
    assert.equal(inwardTriangles(g), 0);
  });
});

describe("paraboloid", () => {
  it("welds the wrap column exactly, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.paraboloid({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("apex has one shared normal across columns, unlike cone's per-column ones", () => {
    const nx = 16;
    const ny = 1;
    const g = Primitives.paraboloid({ nx, ny });

    const { normals, positions } = g;
    const apex = [];
    for (let i = 0; i < positions.length / 3; i++) {
      if (positions[i * 3 + 1] === 0.5 && positions[i * 3] === 0) apex.push(i);
    }
    assert.ok(apex.length > 1, "apex duplicates are kept");
    for (const i of apex) {
      // +0 vs -0 (r * cosPhi at r = 0, sign of cosPhi varies per column) is
      // the same normal direction, so compare with tolerance, not ===
      assert.ok(Math.abs(normals[i * 3] - normals[apex[0] * 3]) < 1e-9);
      assert.ok(Math.abs(normals[i * 3 + 1] - normals[apex[0] * 3 + 1]) < 1e-9);
      assert.ok(Math.abs(normals[i * 3 + 2] - normals[apex[0] * 3 + 2]) < 1e-9);
    }

    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.cracks, 0);
  });

  it("radius grows as sqrt of depth from the apex", () => {
    const height = 1;
    const radius = 0.5;
    const g = Primitives.paraboloid({ height, radius, capBase: false });

    const { positions } = g;
    for (let i = 0; i < positions.length / 3; i++) {
      const y = positions[i * 3 + 1];
      const r = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
      const depth = height / 2 - y;
      const expectedR = radius * Math.sqrt(depth / height);
      assert.ok(Math.abs(r - expectedR) < 1e-6);
    }
  });

  it("faces outward, correctly wound with and without the cap", () => {
    for (const g of [
      Primitives.paraboloid(),
      Primitives.paraboloid({ capBase: false }),
      Primitives.paraboloid({ capSegments: 3, phi: Math.PI, capBase: true }),
    ]) {
      assert.equal(flippedNormalTriangles(g), 0);
    }
  });
});

describe("bicone", () => {
  it("welds the wrap column exactly, including inexact 1/nx", () => {
    for (const nx of [16, 15]) {
      const result = analyze(Primitives.bicone({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("fans both apexes with a single triangle per quad", () => {
    const nx = 16;
    const ny = 1;
    const g = Primitives.bicone({ nx, ny });

    // Two independent cone halves, each nx*ny quads fanned to nx triangles
    assert.equal(g.cells.length / 3, 2 * (nx * ny * 2 - nx));
    assert.equal(analyze(g).degenerate, 0);
  });

  it("faces outward, correctly wound on both halves", () => {
    const g = Primitives.bicone();
    assert.equal(flippedNormalTriangles(g), 0);
    assert.equal(inwardTriangles(g), 0);
  });
});

describe("doubleCone", () => {
  it("welds the wrap column exactly, including inexact 1/nx", () => {
    for (const nx of [16, 15]) {
      const result = analyze(Primitives.doubleCone({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("fans the waist with a single triangle per quad", () => {
    const nx = 16;
    const ny = 1;
    const g = Primitives.doubleCone({ nx, ny, capBase: false, capApex: false });

    assert.equal(g.cells.length / 3, 2 * (nx * ny * 2 - nx));
    assert.equal(analyze(g).degenerate, 0);
  });

  it("caps independently via capBase/capApex", () => {
    const both = Primitives.doubleCone();
    const baseOnly = Primitives.doubleCone({ capApex: false });
    const neither = Primitives.doubleCone({ capBase: false, capApex: false });

    assert.ok(neither.cells.length < baseOnly.cells.length);
    assert.ok(baseOnly.cells.length < both.cells.length);
  });

  it("faces outward, correctly wound with and without caps", () => {
    for (const g of [
      Primitives.doubleCone(),
      Primitives.doubleCone({ capBase: false, capApex: false }),
      Primitives.doubleCone({ sx: 2, sz: 0.5, capSegments: 3 }),
    ]) {
      assert.equal(flippedNormalTriangles(g), 0);
    }
  });
});

describe("capsule", () => {
  it("welds the wrap column and both poles", () => {
    for (const nx of [16, 15]) {
      const result = analyze(Primitives.capsule({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("fans pole rings with a single triangle per quad", () => {
    const nx = 16;
    const ny = 1;
    const roundSegments = 16;
    const g = Primitives.capsule({ nx, ny, roundSegments });

    const nyTotal = roundSegments * 2 + ny;
    assert.equal(g.cells.length / 3, nyTotal * nx * 2 - 2 * nx);
  });

  it("keeps a full grid without caps (roundSegments = 0)", () => {
    const nx = 16;
    const ny = 1;
    const g = Primitives.capsule({ nx, ny, roundSegments: 0 });

    assert.equal(g.cells.length / 3, ny * nx * 2);
    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.unused, 0);
  });
});

describe("sphericalRing", () => {
  it("welds the wrap column and both rim seams, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.sphericalRing({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
      assert.equal(result.unused, 0, `nx=${nx}`);
    }
  });

  it("faces outward on the sphere band and inward into the bore", () => {
    const g = Primitives.sphericalRing({ innerRadius: 0.3 });
    assert.equal(flippedNormalTriangles(g), 0);
  });

  it("allocates cells exactly: outer band quads + inner wall quads", () => {
    const nx = 16;
    const ny = 8;
    const holeSegments = 3;
    const g = Primitives.sphericalRing({ nx, ny, holeSegments });

    assert.equal(g.cells.length / 3, nx * ny * 2 + nx * holeSegments * 2);
  });

  it("matches the closed-form rim height and radii", () => {
    const radius = 0.5;
    const innerRadius = 0.3;
    const g = Primitives.sphericalRing({ radius, innerRadius });

    const halfHeight = Math.sqrt(radius ** 2 - innerRadius ** 2);
    const { positions } = g;
    let minY = Infinity;
    let maxY = -Infinity;
    let minR = Infinity;
    let maxR = -Infinity;
    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      const r = Math.hypot(x, z);
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
    }

    assert.ok(Math.abs(minY + halfHeight) < 1e-6);
    assert.ok(Math.abs(maxY - halfHeight) < 1e-6);
    assert.ok(Math.abs(minR - innerRadius) < 1e-6);
    assert.ok(Math.abs(maxR - radius) < 1e-6);
  });
});

describe("ellipsoid", () => {
  it("welds the wrap column and poles, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.sphere({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("fans pole rows with a single triangle per quad", () => {
    const nx = 32;
    const ny = 16;
    // Default theta = PI: poles at both ends
    const g = Primitives.ellipsoid({ nx, ny });
    assert.equal(g.cells.length / 3, ny * nx * 2 - 2 * nx);
  });

  // computeRevolutionGeometry only supports a pole at v = 0/1, so theta and
  // thetaOffset are silently clamped to keep thetaOffset + theta within
  // [0, PI] - a mid-sweep pole (crossing the axis strictly between v = 0
  // and v = 1) can never occur, regardless of the raw options passed in.
  it("clamps theta/thetaOffset so a mid-sweep pole can never occur", () => {
    const nx = 32;
    const ny = 16;

    // theta = TAU clamps down to PI (thetaOffset = 0): identical to the
    // plain default sweep, not a double-covered mid-sweep-pole shape.
    const clamped = Primitives.ellipsoid({ nx, ny, theta: TAU });
    const plain = Primitives.ellipsoid({ nx, ny });
    assert.deepEqual(clamped, plain);

    // thetaOffset = 0.3 (default theta = PI) would sweep [0.3, PI + 0.3],
    // crossing the axis mid-sweep at t = PI - theta clamps down to PI - 0.3
    // instead, so the sweep stops exactly at that pole (v = 1) rather than
    // crossing it: a single end pole, same shape as "fans a single pole".
    const g = Primitives.ellipsoid({ nx, ny, thetaOffset: 0.3 });
    assert.equal(g.cells.length / 3, ny * nx * 2 - nx);
    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.cracks, 0);
    assert.equal(flippedNormalTriangles(g), 0);
  });

  it("fans a single pole (theta = PI / 2)", () => {
    const nx = 32;
    const ny = 16;
    const g = Primitives.ellipsoid({ nx, ny, theta: Math.PI / 2 });
    assert.equal(g.cells.length / 3, ny * nx * 2 - nx);
  });

  it("faces outward", () => {
    assert.equal(inwardTriangles(Primitives.sphere()), 0);
  });
});

describe("superellipsoid", () => {
  it("welds the wrap column and poles, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.superellipsoid({ nx, n1: 3, n2: 3 }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("n1 = n2 = 2 matches ellipsoid (the general Barr formula's plain-ellipsoid case)", () => {
    const options = { nx: 24, ny: 12, rx: 1.3, ry: 0.6, rz: 0.9, radius: 0.7 };
    const a = Primitives.ellipsoid(options);
    const b = Primitives.superellipsoid({ ...options, n1: 2, n2: 2 });
    // Not bit-exact: superellipsoid snaps near-zero cos/sin residuals to
    // exact 0 (needed for n < 1's negative complementary exponent), which
    // ellipsoid.js doesn't do - differences stay at float noise level (~1e-7)
    const maxDiff = (a, b) =>
      Array.from(a).reduce((m, v, i) => Math.max(m, Math.abs(v - b[i])), 0);
    assert.ok(maxDiff(a.positions, b.positions) < 1e-6);
    assert.ok(maxDiff(a.normals, b.normals) < 1e-6);
    assert.deepEqual(Array.from(a.cells), Array.from(b.cells));
  });

  // n1/n2 straddling 1 exercises the complementary-exponent (2 - e) normal
  // term going through 0 and negative - regression coverage for the
  // near-zero-but-not-bit-exact cosTheta/cosPhi/sinPhi snapping, without
  // which this range produced huge, wrongly-signed normals at the exact
  // quarter-turn grid columns (see superellipsoid.js's `snapToZero` helper)
  it("faces outward and winds correctly across a range of roundness exponents", () => {
    // n1 (or n2) < 1 pinches that axis into an astroid-like cusp, packing
    // vertices arbitrarily densely near the pole/equator at fixed nx/ny -
    // analyze()'s fixed crack-detection epsilon then false-flags nearby
    // distinct vertices as an unwelded seam (confirmed: crack count scales
    // with resolution, unlike a real weld failure), so that combination is
    // excluded here rather than asserted against.
    for (const [n1, n2] of [
      [2, 2],
      [4, 4],
      [1.5, 1.5],
      [1, 4],
      [4, 1],
      [1, 1],
    ]) {
      const g = Primitives.superellipsoid({ n1, n2 });
      const result = analyze(g);
      const label = `n1=${n1} n2=${n2}`;
      assert.equal(result.cracks, 0, label);
      assert.equal(result.degenerate, 0, label);
      assert.equal(flippedNormalTriangles(g), 0, label);
    }
  });
});

describe("superegg", () => {
  it("welds the wrap column and poles, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.superegg({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("has a genuinely circular (not superelliptical) cross-section at every ring", () => {
    const nx = 16;
    const ny = 12;
    const g = Primitives.superegg({ nx, ny, n: 3 });
    const { positions } = g;
    const cols = nx + 1;

    for (let row = 1; row < ny; row++) {
      let radiusSq;
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const r2 = x * x + z * z;
        radiusSq ??= r2;
        assert.ok(
          Math.abs(r2 - radiusSq) < 1e-6,
          `row ${row} col ${col}: x²+z² should be constant around the ring`,
        );
      }
    }
  });

  it("faces outward, correctly wound across roundness exponents", () => {
    for (const n of [1, 2, 2.5, 4]) {
      const g = Primitives.superegg({ n });
      assert.equal(flippedNormalTriangles(g), 0, `n=${n}`);
      assert.equal(inwardTriangles(g), 0, `n=${n}`);
    }
  });
});

describe("barrel", () => {
  it("welds the wrap column exactly, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.barrel({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("bulges to the belly radius at y = 0, tapers to endRadius at both rims", () => {
    const radius = 0.5;
    const endRadius = 0.3;
    const g = Primitives.barrel({
      radius,
      endRadius,
      capApex: false,
      capBase: false,
    });

    const { positions } = g;
    let minR = Infinity;
    let maxR = -Infinity;
    for (let i = 0; i < positions.length / 3; i++) {
      const r = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
    }
    assert.ok(Math.abs(minR - endRadius) < 1e-6);
    assert.ok(Math.abs(maxR - radius) < 1e-6);
  });

  it("endRadius = radius degenerates to a plain cylinder", () => {
    const g = Primitives.barrel({ endRadius: 0.5, radius: 0.5 });
    const { positions } = g;
    for (let i = 0; i < positions.length / 3; i++) {
      const r = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
      assert.ok(r < 1e-6 || Math.abs(r - 0.5) < 1e-6);
    }
  });

  it("faces outward, correctly wound with and without caps", () => {
    for (const g of [
      Primitives.barrel(),
      Primitives.barrel({ capApex: false, capBase: false }),
      Primitives.barrel({ endRadius: 0.6, radius: 0.5, capSegments: 3 }), // pinches inward
    ]) {
      assert.equal(flippedNormalTriangles(g), 0);
    }
  });
});

describe("apple", () => {
  it("welds the wrap column and both poles, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.apple({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("has a genuine concave dimple at each pole (surface dips past the pole's own y before curving out)", () => {
    const radius = 0.5;
    const height = 0.75;
    const g = Primitives.apple({ radius, height, nx: 8, ny: 16 });

    const { positions } = g;
    const cols = 9;
    const poleY = -height / 2;
    // Row 1 (just off the bottom pole) should dip below the pole's own y,
    // not rise smoothly away from it like a sphere/ellipsoid pole would
    const row1Y = positions[cols * 3 + 1];
    assert.ok(row1Y < poleY);
  });

  it("reaches its true max radius/extent at the equator (y = 0), matching radius", () => {
    const radius = 0.5;
    const g = Primitives.apple({ radius, height: 0.75 });

    const { positions } = g;
    let maxR = -Infinity;
    let maxRIndex = -1;
    for (let i = 0; i < positions.length / 3; i++) {
      const r = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
      if (r > maxR) {
        maxR = r;
        maxRIndex = i;
      }
    }
    assert.ok(Math.abs(maxR - radius) < 1e-6);
    assert.ok(Math.abs(positions[maxRIndex * 3 + 1]) < 1e-6, "at y = 0");
  });

  it("faces outward, correctly wound across a range of dimple depths", () => {
    for (const height of [0.1, 0.5, 0.75, 0.99]) {
      const g = Primitives.apple({ height });
      assert.equal(flippedNormalTriangles(g), 0, `height=${height}`);
    }
  });
});

describe("lemon", () => {
  it("welds the wrap column and both poles, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.lemon({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("has a plain convex taper at each pole (y strictly monotonic, no apple-style dip)", () => {
    const g = Primitives.lemon({ radius: 0.5, height: 1.5, nx: 8, ny: 16 });
    const { positions } = g;
    const cols = 9;
    const rows = positions.length / 3 / cols;

    let prevY = -Infinity;
    for (let row = 0; row < rows; row++) {
      const y = positions[row * cols * 3 + 1];
      assert.ok(y >= prevY - 1e-9, `row ${row}: y should not decrease`);
      prevY = y;
    }
  });

  it("reaches its max radius at the equator (y = 0), matching radius", () => {
    const radius = 0.5;
    const g = Primitives.lemon({ radius, height: 1.5 });

    const { positions } = g;
    let maxR = -Infinity;
    let maxRIndex = -1;
    for (let i = 0; i < positions.length / 3; i++) {
      const r = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
      if (r > maxR) {
        maxR = r;
        maxRIndex = i;
      }
    }
    assert.ok(Math.abs(maxR - radius) < 1e-6);
    assert.ok(Math.abs(positions[maxRIndex * 3 + 1]) < 1e-6, "at y = 0");
  });

  it("height = radius*2 degenerates to a plain sphere", () => {
    const radius = 0.4;
    const a = Primitives.lemon({ radius, height: radius * 2 });
    const b = Primitives.sphere({ radius });
    // +0 vs -0 (r * cosPhi/sinPhi at a pole, sign of cosPhi/sinPhi varies
    // per column) is the same position, so compare with tolerance, not ===
    assert.equal(a.positions.length, b.positions.length);
    for (let i = 0; i < a.positions.length; i++) {
      assert.ok(Math.abs(a.positions[i] - b.positions[i]) < 1e-9);
    }
  });

  it("faces outward, correctly wound across a range of aspect ratios", () => {
    for (const height of [1, 1.5, 3, 10]) {
      const g = Primitives.lemon({ height });
      assert.equal(flippedNormalTriangles(g), 0, `height=${height}`);
    }
  });
});

describe("torus", () => {
  it("welds both wrap seams, including inexact 1/segments", () => {
    for (const segments of [64, 15]) {
      const result = analyze(
        Primitives.torus({ segments, minorSegments: segments }),
      );
      assert.equal(result.cracks, 0, `segments=${segments}`);
      assert.equal(result.degenerate, 0, `segments=${segments}`);
    }
  });

  it("welds with phi/theta offsets", () => {
    const result = analyze(
      Primitives.torus({ phiOffset: 0.4, thetaOffset: 1.1 }),
    );
    assert.equal(result.cracks, 0);
  });

  it("caps point truly outward, not just self-consistently with their own winding", () => {
    // flippedNormalTriangles only catches winding disagreeing with its own
    // vertex normal - a normal that's coherently backward (mesh "inside out"
    // but still internally consistent) slips through that check. Here we
    // pin the normal against independent geometric ground truth: at
    // phiOffset = 0 the capStart plane is exactly Y = 0, and the swept body
    // for phi in (0, PI/2] lies entirely at Y >= 0, so the true outward
    // capStart normal must have Y < 0 (and symmetrically for capEnd/X).
    const segments = 8;
    const minorSegments = 8;
    const m = minorSegments + 1;
    const mainSize = m * (segments + 1);
    const outerRimAtTheta0 = mainSize + 1;

    const start = Primitives.torus({
      segments,
      minorSegments,
      phi: Math.PI / 2,
      capStart: true,
      capEnd: false,
      capSegments: 1,
    });
    assert.ok(
      start.positions
        .slice(0, mainSize * 3)
        .every((_, i) => i % 3 !== 1 || start.positions[i] >= -1e-6),
      "sanity: body should lie entirely at Y >= 0",
    );
    assert.ok(start.normals[outerRimAtTheta0 * 3 + 1] < 0);

    const end = Primitives.torus({
      segments,
      minorSegments,
      phi: Math.PI / 2,
      capStart: false,
      capEnd: true,
      capSegments: 1,
    });
    assert.ok(
      end.positions
        .slice(0, mainSize * 3)
        .every((_, i) => i % 3 !== 0 || end.positions[i] <= 1e-6),
      "sanity: body should lie entirely at X <= 0",
    );
    assert.ok(end.normals[outerRimAtTheta0 * 3] > 0);
  });

  it("fans cap centers with a single triangle per quad", () => {
    const segments = 16;
    const minorSegments = 8;
    const capSegments = 3;
    const g = Primitives.torus({
      segments,
      minorSegments,
      phi: Math.PI,
      capSegments,
    });

    // Body + two caps, minus one fan per cap innermost ring
    assert.equal(
      g.cells.length / 3,
      minorSegments * segments * 2 +
        2 * (minorSegments * capSegments * 2 - minorSegments),
    );
    assert.equal(analyze(g).degenerate, 0);
  });

  it("skips caps on a full phi revolution", () => {
    const g = Primitives.torus({ segments: 16, minorSegments: 8 });
    // capStart/capEnd default to true but there is no seam to close
    assert.equal(g.cells.length / 3, 8 * 16 * 2);
  });

  it("caps independently via capStart/capEnd", () => {
    const segments = 16;
    const minorSegments = 8;
    const both = Primitives.torus({ segments, minorSegments, phi: Math.PI });
    const startOnly = Primitives.torus({
      segments,
      minorSegments,
      phi: Math.PI,
      capEnd: false,
    });
    const neither = Primitives.torus({
      segments,
      minorSegments,
      phi: Math.PI,
      capStart: false,
      capEnd: false,
    });

    const bodyTris = minorSegments * segments * 2;
    const capTris = minorSegments * 1 * 2 - minorSegments;
    assert.equal(neither.cells.length / 3, bodyTris);
    assert.equal(startOnly.cells.length / 3, bodyTris + capTris);
    assert.equal(both.cells.length / 3, bodyTris + 2 * capTris);
  });

  it("winds triangles to match their vertex normals", () => {
    // inwardTriangles assumes convexity around the origin, which a torus
    // isn't (the inner equator legitimately faces the donut hole). Instead,
    // check that each triangle's geometric winding agrees with the flat
    // normal baked into its cap vertices.
    const g = Primitives.torus({
      segments: 16,
      minorSegments: 8,
      phi: Math.PI,
      capSegments: 2,
    });
    assert.equal(flippedNormalTriangles(g), 0);
  });
});

describe("phiOffset", () => {
  const nx = 16;
  const ny = 1;
  // Body uv is a plain index fraction (u, v), unaffected by phiOffset. Only
  // cylinder/cone additionally have caps whose default rectangular mapping
  // projects the cap's actual (rotated) x/z onto a square, so cap uvs -
  // unlike the body's - legitimately shift with phiOffset; bodyUvLength
  // limits the uv-invariance check to the body prefix for those two.
  const cases = [
    [
      "cylinder",
      (phiOffset) => Primitives.cylinder({ nx, ny, phiOffset }),
      (nx + 1) * (ny + 1) * 2,
    ],
    [
      "cone",
      (phiOffset) => Primitives.cone({ nx, ny, phiOffset }),
      (nx + 1) * (ny + 1) * 2,
    ],
    ["capsule", (phiOffset) => Primitives.capsule({ nx, ny, phiOffset })],
    ["bicone", (phiOffset) => Primitives.bicone({ nx, ny, phiOffset })],
    [
      "ellipsoid",
      (phiOffset) => Primitives.ellipsoid({ nx: 16, ny: 8, phiOffset }),
    ],
    ["sphere", (phiOffset) => Primitives.sphere({ nx: 16, ny: 8, phiOffset })],
  ];

  for (const [name, create, bodyUvLength] of cases) {
    it(`${name}: rotates positions/normals without affecting body uvs or topology, stays watertight and correctly wound`, () => {
      const plain = create(0);
      const offset = create(0.7);

      const plainUvs = Array.from(plain.uvs);
      const offsetUvs = Array.from(offset.uvs);
      assert.deepEqual(
        plainUvs.slice(0, bodyUvLength),
        offsetUvs.slice(0, bodyUvLength),
      );
      assert.equal(uvsOutOfRange(offset), 0, name);

      assert.deepEqual(Array.from(plain.cells), Array.from(offset.cells));
      assert.notDeepEqual(
        Array.from(plain.positions),
        Array.from(offset.positions),
      );

      const result = analyze(offset);
      assert.equal(result.cracks, 0, name);
      assert.equal(result.degenerate, 0, name);
      assert.equal(inwardTriangles(offset), 0, name);
    });
  }

  it("cylinder/capsule: wrap column stays bit-exactly welded regardless of phiOffset", () => {
    for (const create of [
      (phiOffset) => Primitives.cylinder({ nx: 15, phiOffset }),
      (phiOffset) => Primitives.capsule({ nx: 15, phiOffset }),
    ]) {
      const result = analyze(create(1.3));
      assert.equal(result.cracks, 0);
    }
  });

  // doubleCone concatenates two independently-capped halves, so its body and
  // cap uvs aren't a clean contiguous prefix like cylinder/cone's - just
  // check it rotates and stays valid rather than slicing out the body uvs
  it("doubleCone: rotates positions/normals, stays watertight and correctly wound", () => {
    const plain = Primitives.doubleCone({ nx, ny });
    const offset = Primitives.doubleCone({ nx, ny, phiOffset: 0.7 });

    assert.deepEqual(Array.from(plain.cells), Array.from(offset.cells));
    assert.notDeepEqual(
      Array.from(plain.positions),
      Array.from(offset.positions),
    );

    const result = analyze(offset);
    assert.equal(result.cracks, 0);
    assert.equal(result.degenerate, 0);
    assert.equal(flippedNormalTriangles(offset), 0);
  });
});

describe("capMapping", () => {
  const cases = [
    [
      "cylinder",
      (capMapping) =>
        Primitives.cylinder({ nx: 8, capSegments: 2, capMapping }),
    ],
    [
      "cone",
      (capMapping) => Primitives.cone({ nx: 8, capSegments: 2, capMapping }),
    ],
    [
      "doubleCone",
      (capMapping) =>
        Primitives.doubleCone({ nx: 8, capSegments: 2, capMapping }),
    ],
    [
      "torus",
      (capMapping) =>
        Primitives.torus({
          segments: 8,
          minorSegments: 6,
          phi: Math.PI,
          capSegments: 2,
          capMapping,
        }),
    ],
  ];

  for (const [name, create] of cases) {
    it(`${name}: reshapes cap uvs without affecting topology`, () => {
      const withDefault = create(rectangular);
      const withPolar = create(polar);

      assert.notDeepEqual(
        Array.from(withPolar.uvs),
        Array.from(withDefault.uvs),
      );
      assert.deepEqual(
        Array.from(withPolar.positions),
        Array.from(withDefault.positions),
      );
      assert.deepEqual(
        Array.from(withPolar.cells),
        Array.from(withDefault.cells),
      );

      const result = analyze(withPolar);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
    });
  }

  it("defaults to mappings.rectangular, matching the pre-option cap uv formula", () => {
    const withDefault = Primitives.cylinder({ nx: 8, capSegments: 2 });
    const withExplicitDefault = Primitives.cylinder({
      nx: 8,
      capSegments: 2,
      capMapping: rectangular,
    });
    assert.deepEqual(
      Array.from(withDefault.uvs),
      Array.from(withExplicitDefault.uvs),
    );
  });
});

describe("vDistribution", () => {
  const { linear, chebyshev, smoothstep, power } = Primitives.utils;

  it("linear is the identity", () => {
    for (const t of [0, 0.25, 0.5, 0.73, 1]) {
      assert.equal(linear(t), t);
    }
  });

  it("chebyshev preserves both endpoints and the midpoint", () => {
    assert.equal(chebyshev(0), 0);
    assert.equal(chebyshev(1), 1);
    assert.ok(Math.abs(chebyshev(0.5) - 0.5) < 1e-9);
  });

  it("chebyshev is point-symmetric about (0.5, 0.5)", () => {
    for (const t of [0.1, 0.25, 0.37, 0.5]) {
      assert.ok(Math.abs(chebyshev(1 - t) - (1 - chebyshev(t))) < 1e-9);
    }
  });

  it("chebyshev clusters samples toward both ends, sparser through the middle", () => {
    const n = 8;
    // Consecutive-sample gaps for a fixed dt=1/n: smallest at the ends,
    // largest in the middle - the classic Chebyshev-node distribution.
    const gap = (i) => chebyshev((i + 1) / n) - chebyshev(i / n);
    const firstGap = gap(0);
    const middleGap = gap(n / 2 - 1);
    const lastGap = gap(n - 1);
    assert.ok(firstGap < middleGap);
    assert.ok(lastGap < middleGap);
    assert.ok(Math.abs(firstGap - lastGap) < 1e-9);
  });

  it("smoothstep preserves both endpoints and the midpoint", () => {
    assert.equal(smoothstep(0), 0);
    assert.equal(smoothstep(1), 1);
    assert.ok(Math.abs(smoothstep(0.5) - 0.5) < 1e-9);
  });

  it("smoothstep is point-symmetric about (0.5, 0.5), same shape as chebyshev", () => {
    for (const t of [0.1, 0.25, 0.37, 0.5]) {
      assert.ok(Math.abs(smoothstep(1 - t) - (1 - smoothstep(t))) < 1e-9);
    }
  });

  it("smoothstep clusters samples toward both ends, sparser through the middle", () => {
    const n = 8;
    const gap = (i) => smoothstep((i + 1) / n) - smoothstep(i / n);
    const firstGap = gap(0);
    const middleGap = gap(n / 2 - 1);
    const lastGap = gap(n - 1);
    assert.ok(firstGap < middleGap);
    assert.ok(lastGap < middleGap);
    assert.ok(Math.abs(firstGap - lastGap) < 1e-9);
  });

  it("power(1) is the identity, matching linear", () => {
    for (const t of [0, 0.25, 0.5, 0.73, 1]) {
      assert.ok(Math.abs(power(1)(t) - t) < 1e-9);
    }
  });

  it("power(2) exactly cancels a sqrt radius law (1 - (1 - t)^2)", () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      assert.ok(Math.abs(power(2)(t) - (1 - (1 - t) ** 2)) < 1e-9);
    }
  });

  it("power clusters samples toward t = 1 only, unlike chebyshev/smoothstep's symmetric clustering", () => {
    const n = 8;
    const p = power(3);
    const gap = (i) => p((i + 1) / n) - p(i / n);
    // t = 1 (clustered) gets a narrower-than-linear gap; t = 0 (untouched)
    // gets a wider-than-linear one - asymmetric, unlike chebyshev/smoothstep
    // which narrow both ends.
    assert.ok(gap(n - 1) < 1 / n);
    assert.ok(gap(0) > 1 / n);
  });

  const cases = [
    [
      "paraboloid",
      (vDistribution) => Primitives.paraboloid({ nx: 8, ny: 8, vDistribution }),
    ],
    [
      "ellipsoid",
      (vDistribution) => Primitives.ellipsoid({ nx: 8, ny: 8, vDistribution }),
    ],
    [
      "barrel",
      (vDistribution) => Primitives.barrel({ nx: 8, ny: 8, vDistribution }),
    ],
    [
      "apple",
      (vDistribution) => Primitives.apple({ nx: 8, ny: 8, vDistribution }),
    ],
  ];

  const nonLinearDistributions = [
    ["chebyshev", chebyshev],
    ["smoothstep", smoothstep],
    ["power(2)", power(2)],
  ];

  for (const [shapeName, create] of cases) {
    for (const [distributionName, distribution] of nonLinearDistributions) {
      it(`${shapeName} + ${distributionName}: reshapes row spacing (positions) without affecting the default uvs or topology`, () => {
        const withLinear = create(linear);
        const withDistribution = create(distribution);
        const label = `${shapeName} + ${distributionName}`;

        assert.notDeepEqual(
          Array.from(withDistribution.positions),
          Array.from(withLinear.positions),
          label,
        );
        assert.deepEqual(
          Array.from(withDistribution.uvs),
          Array.from(withLinear.uvs),
          label,
        );
        assert.deepEqual(
          Array.from(withDistribution.cells),
          Array.from(withLinear.cells),
          label,
        );

        const result = analyze(withDistribution);
        assert.equal(result.cracks, 0, label);
        assert.equal(result.degenerate, 0, label);
        assert.equal(flippedNormalTriangles(withDistribution), 0, label);
      });
    }
  }

  it("defaults to utils.linear, matching the pre-option row spacing", () => {
    const withDefault = Primitives.paraboloid({ nx: 8, ny: 8 });
    const withExplicitDefault = Primitives.paraboloid({
      nx: 8,
      ny: 8,
      vDistribution: linear,
    });
    assert.deepEqual(
      Array.from(withDefault.positions),
      Array.from(withExplicitDefault.positions),
    );
  });

  it("paraboloid: chebyshev pulls rows toward the apex, where a linear sweep under-resolves it (radius ~ sqrt(1 - v))", () => {
    const ny = 8;
    const linearG = Primitives.paraboloid({ nx: 4, ny, capBase: false });
    const chebyshevG = Primitives.paraboloid({
      nx: 4,
      ny,
      capBase: false,
      vDistribution: chebyshev,
    });

    const cols = 5;
    const yAt = (g, row) => g.positions[row * cols * 3 + 1];

    // The last row gap before the apex (row ny-1 -> ny) is the widest under
    // a plain linear sweep, since dr/dv blows up as v -> 1 - chebyshev
    // should narrow it by pulling that row closer to the apex.
    const linearLastGap = yAt(linearG, ny) - yAt(linearG, ny - 1);
    const chebyshevLastGap = yAt(chebyshevG, ny) - yAt(chebyshevG, ny - 1);
    assert.ok(chebyshevLastGap < linearLastGap);
  });

  it("paraboloid: power(2) gives exactly uniform radius spacing, unlike chebyshev's partial (both-ends) fix", () => {
    const radius = 0.5;
    const g = Primitives.paraboloid({
      nx: 4,
      ny: 8,
      radius,
      capBase: false,
      vDistribution: power(2),
    });

    const cols = 5;
    const rAt = (row) =>
      Math.hypot(g.positions[row * cols * 3], g.positions[row * cols * 3 + 2]);

    let prevGap;
    for (let row = 1; row <= 8; row++) {
      const gap = rAt(row - 1) - rAt(row);
      if (prevGap !== undefined) {
        assert.ok(Math.abs(gap - prevGap) < 1e-5, `row ${row}`);
      }
      prevGap = gap;
    }
  });
});

describe("elliptical revolution solids", () => {
  describe("cylinder/cone", () => {
    it("sx = sz = 1 is a no-op (matches the pre-ellipse output)", () => {
      const plain = Primitives.cylinder({ nx: 16, ny: 3 });
      const explicit = Primitives.cylinder({
        nx: 16,
        ny: 3,
        sx: 1,
        sz: 1,
        sxApex: 1,
        szApex: 1,
      });
      assert.deepEqual(Array.from(plain.normals), Array.from(explicit.normals));
      assert.deepEqual(
        Array.from(plain.positions),
        Array.from(explicit.positions),
      );
    });

    it("elliptical cylinder: watertight and correctly wound", () => {
      const g = Primitives.cylinder({ nx: 32, ny: 4, sx: 2, sz: 0.5 });
      const result = analyze(g);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(flippedNormalTriangles(g), 0);
    });

    it("elliptical frustum: independent per-end ellipse stays watertight and correctly wound", () => {
      const g = Primitives.cylinder({
        nx: 32,
        ny: 6,
        radiusApex: 0.15,
        sx: 1,
        sz: 1,
        sxApex: 3,
        szApex: 0.2,
      });
      const result = analyze(g);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(flippedNormalTriangles(g), 0);
    });

    it("elliptical cone: apex keeps non-degenerate per-column normals, correctly wound", () => {
      const g = Primitives.cone({ nx: 16, ny: 4, sx: 2, sz: 0.5 });
      const result = analyze(g);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(flippedNormalTriangles(g), 0);
    });

    it("elliptical + partial phi + caps: still watertight and correctly wound", () => {
      const g = Primitives.cylinder({
        nx: 32,
        ny: 4,
        sx: 2,
        sz: 0.5,
        phi: Math.PI,
        capSegments: 2,
      });
      const result = analyze(g);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(flippedNormalTriangles(g), 0);
    });

    it("cone forwards sx/sz to cylinder (no apex-side ellipse params)", () => {
      const plain = Primitives.cone({ nx: 16 });
      const elliptical = Primitives.cone({ nx: 16, sx: 2, sz: 0.5 });
      assert.notDeepEqual(
        Array.from(elliptical.positions),
        Array.from(plain.positions),
      );
    });
  });

  describe("torus", () => {
    it("sx = sy = minorSx = minorSy = 1 is a no-op (matches the pre-ellipse output)", () => {
      const plain = Primitives.torus({ segments: 16, minorSegments: 8 });
      const explicit = Primitives.torus({
        segments: 16,
        minorSegments: 8,
        sx: 1,
        sy: 1,
        minorSx: 1,
        minorSy: 1,
      });
      assert.deepEqual(Array.from(plain.normals), Array.from(explicit.normals));
      assert.deepEqual(
        Array.from(plain.positions),
        Array.from(explicit.positions),
      );
    });

    it("elliptical footprint: watertight and correctly wound", () => {
      const g = Primitives.torus({
        segments: 32,
        minorSegments: 16,
        sx: 2,
        sy: 0.5,
      });
      const result = analyze(g);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(flippedNormalTriangles(g), 0);
    });

    it("elliptical tube cross-section (either axis independently): watertight and correctly wound", () => {
      for (const [minorSx, minorSy] of [
        [0.2, 1], // radial-only squash
        [1, 0.2], // z-only squash
        [3, 1], // radial-only elongation
        [0.4, 2.5], // both axes, asymmetric
      ]) {
        const g = Primitives.torus({
          segments: 32,
          minorSegments: 16,
          minorSx,
          minorSy,
        });
        const result = analyze(g);
        const label = `minorSx=${minorSx} minorSy=${minorSy}`;
        assert.equal(result.cracks, 0, label);
        assert.equal(result.degenerate, 0, label);
        assert.equal(flippedNormalTriangles(g), 0, label);
      }
    });

    it("combined footprint + tube + partial phi + caps: still watertight and correctly wound", () => {
      const g = Primitives.torus({
        segments: 32,
        minorSegments: 16,
        sx: 2,
        sy: 0.5,
        minorSx: 0.4,
        minorSy: 2.5,
        phi: Math.PI,
        capSegments: 2,
      });
      const result = analyze(g);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(flippedNormalTriangles(g), 0);
    });
  });
});
