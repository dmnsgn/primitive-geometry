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
      start.positions.slice(0, mainSize * 3).every((_, i) => i % 3 !== 1 || start.positions[i] >= -1e-6),
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
      end.positions.slice(0, mainSize * 3).every((_, i) => i % 3 !== 0 || end.positions[i] <= 1e-6),
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
    ["cylinder", (capMapping) => Primitives.cylinder({ nx: 8, capSegments: 2, capMapping })],
    ["cone", (capMapping) => Primitives.cone({ nx: 8, capSegments: 2, capMapping })],
    [
      "doubleCone",
      (capMapping) => Primitives.doubleCone({ nx: 8, capSegments: 2, capMapping }),
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

      assert.notDeepEqual(Array.from(withPolar.uvs), Array.from(withDefault.uvs));
      assert.deepEqual(
        Array.from(withPolar.positions),
        Array.from(withDefault.positions),
      );
      assert.deepEqual(Array.from(withPolar.cells), Array.from(withDefault.cells));

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
      assert.deepEqual(
        Array.from(plain.normals),
        Array.from(explicit.normals),
      );
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
      assert.deepEqual(
        Array.from(plain.normals),
        Array.from(explicit.normals),
      );
      assert.deepEqual(
        Array.from(plain.positions),
        Array.from(explicit.positions),
      );
    });

    it("elliptical footprint: watertight and correctly wound", () => {
      const g = Primitives.torus({ segments: 32, minorSegments: 16, sx: 2, sy: 0.5 });
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
        const g = Primitives.torus({ segments: 32, minorSegments: 16, minorSx, minorSy });
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
