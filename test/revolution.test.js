import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { polar, rectangular } from "../src/mappings.js";
import { analyze, inwardTriangles } from "./helpers.js";

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
    const { positions, normals, cells } = Primitives.torus({
      segments: 16,
      minorSegments: 8,
      phi: Math.PI,
      capSegments: 2,
    });

    let flipped = 0;
    for (let i = 0; i < cells.length; i += 3) {
      const [a, b, c] = [cells[i], cells[i + 1], cells[i + 2]];
      const ux = positions[b * 3] - positions[a * 3];
      const uy = positions[b * 3 + 1] - positions[a * 3 + 1];
      const uz = positions[b * 3 + 2] - positions[a * 3 + 2];
      const vx = positions[c * 3] - positions[a * 3];
      const vy = positions[c * 3 + 1] - positions[a * 3 + 1];
      const vz = positions[c * 3 + 2] - positions[a * 3 + 2];
      const faceNormal = [
        uy * vz - uz * vy,
        uz * vx - ux * vz,
        ux * vy - uy * vx,
      ];
      const vertexNormal = [normals[a * 3], normals[a * 3 + 1], normals[a * 3 + 2]];
      const dot =
        faceNormal[0] * vertexNormal[0] +
        faceNormal[1] * vertexNormal[1] +
        faceNormal[2] * vertexNormal[2];
      if (dot < 0) flipped++;
    }
    assert.equal(flipped, 0);
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
