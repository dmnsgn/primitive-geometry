import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { polar, rectangular } from "../src/mappings.js";
import { analyze, flippedNormalTriangles, inwardTriangles } from "./helpers.js";

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

    const ringsTotal = roundSegments * 2 + ny + 1;
    assert.equal(
      g.cells.length / 3,
      (ringsTotal - 1) * (nx - 1) * 2 - 2 * (nx - 1),
    );
  });

  it("keeps a full grid without caps (roundSegments = 0)", () => {
    const nx = 16;
    const ny = 1;
    const g = Primitives.capsule({ nx, ny, roundSegments: 0 });

    assert.equal(g.cells.length / 3, (ny + 1 - 1) * (nx - 1) * 2);
    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.unused, 0);
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

  it("fans a mid-sweep pole (theta = TAU)", () => {
    const nx = 32;
    const ny = 16;
    const g = Primitives.ellipsoid({ nx, ny, theta: TAU });

    // Poles at both ends (1 fan each) and in the middle (2 fans)
    assert.equal(g.cells.length / 3, ny * nx * 2 - 4 * nx);
    assert.equal(analyze(g).degenerate, 0);
  });

  it("keeps the full grid when no row lands on a pole", () => {
    const nx = 32;
    const ny = 16;
    const g = Primitives.ellipsoid({ nx, ny, thetaOffset: 0.3 });

    assert.equal(g.cells.length / 3, ny * nx * 2);
    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.unused, 0);
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

describe("capMapping", () => {
  const cases = [
    ["cylinder", (capMapping) => Primitives.cylinder({ nx: 8, capSegments: 2, capMapping })],
    ["cone", (capMapping) => Primitives.cone({ nx: 8, capSegments: 2, capMapping })],
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
