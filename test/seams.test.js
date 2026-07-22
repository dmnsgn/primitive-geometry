import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze } from "./helpers.js";

// Every geometry and the configurations that exercised seam defects:
// odd segment counts (1/n not exact in floating point), theta/phi offsets,
// mismatched subdivisions, non-uniform sizes.
// Expected overrides:
// - degenerate: collapsed rings kept on purpose (explicit mergeCentroid opt-out)
// - unused: collapsed rings have one more duplicate (the wrap column) than fan
//   triangles, kept for uniform grid indexing
const cases = [
  ["plane", () => Primitives.plane()],
  ["quad", () => Primitives.quad()],

  ["ellipse", () => Primitives.ellipse()],
  ["ellipse segments=15", () => Primitives.ellipse({ segments: 15 })],
  ["ellipse theta=PI", () => Primitives.ellipse({ theta: Math.PI })],
  ["ellipse thetaOffset=0.5", () => Primitives.ellipse({ thetaOffset: 0.5 })],
  [
    "ellipse mergeCentroid=false",
    () => Primitives.ellipse({ mergeCentroid: false }),
    // Center ring collapsed at innerRadius = 0 but kept unmerged on purpose
    { degenerate: 32 },
  ],
  ["disc", () => Primitives.disc()],
  ["superellipse", () => Primitives.superellipse()],
  ["squircle", () => Primitives.squircle()],
  ["annulus", () => Primitives.annulus()],
  ["annulus segments=15", () => Primitives.annulus({ segments: 15 })],
  ["reuleux", () => Primitives.reuleux()],
  ["star", () => Primitives.star()],
  ["star points=7 density=3", () => Primitives.star({ points: 7, density: 3 })],
  ["star thetaOffset=0.5", () => Primitives.star({ thetaOffset: 0.5 })],
  ["star innerRadius=0.1 (self-similar hole)", () => Primitives.star({ innerRadius: 0.1 })],
  [
    "star innerRadius=0.1 circularHole",
    () => Primitives.star({ innerRadius: 0.1, circularHole: true }),
  ],

  ["roundedRectangle", () => Primitives.roundedRectangle()],
  [
    "roundedRectangle mismatched subdivisions",
    () =>
      Primitives.roundedRectangle({
        roundSegments: 4,
        edgeSegments: 3,
        nx: 2,
        ny: 5,
      }),
  ],
  ["stadium", () => Primitives.stadium()],
  ["stadium sx=sy", () => Primitives.stadium({ sy: 1 })],

  ["cube", () => Primitives.cube()],
  ["roundedCube", () => Primitives.roundedCube()],
  [
    "roundedCube mismatched subdivisions",
    () => Primitives.roundedCube({ roundSegments: 3, edgeSegments: 2, nx: 3 }),
  ],
  [
    "roundedCube non-uniform",
    () => Primitives.roundedCube({ sy: 0.6, sz: 0.4, radius: 0.1 }),
  ],
  ["roundedCube radius=half", () => Primitives.roundedCube({ radius: 0.5 })],

  ["sphere", () => Primitives.sphere(), { unused: 2 }],
  ["sphere nx=15", () => Primitives.sphere({ nx: 15 }), { unused: 2 }],
  // theta > PI double-covers the surface: coincident sheets are not seams,
  // see revolution.test.js for the mid-sweep pole coverage
  ["ellipsoid", () => Primitives.ellipsoid(), { unused: 2 }],
  [
    "ellipsoid thetaOffset=0.3",
    () => Primitives.ellipsoid({ thetaOffset: 0.3 }),
  ],
  ["icosphere", () => Primitives.icosphere()],

  ["cylinder", () => Primitives.cylinder(), { unused: 2 }],
  ["cylinder nx=15", () => Primitives.cylinder({ nx: 15 }), { unused: 2 }],
  ["cone", () => Primitives.cone(), { unused: 2 }],
  ["capsule", () => Primitives.capsule(), { unused: 2 }],
  ["capsule nx=15", () => Primitives.capsule({ nx: 15 }), { unused: 2 }],
  ["capsule roundSegments=0", () => Primitives.capsule({ roundSegments: 0 })],
  ["torus", () => Primitives.torus()],
  [
    "torus segments=15",
    () => Primitives.torus({ segments: 15, minorSegments: 15 }),
  ],

  ["tetrahedron", () => Primitives.tetrahedron()],
  ["octahedron", () => Primitives.octahedron()],
  ["dodecahedron", () => Primitives.dodecahedron()],
  [
    "icosahedron subdivisions=0",
    () => Primitives.icosahedron({ subdivisions: 0 }),
  ],
  ["icosahedron subdivided", () => Primitives.icosahedron()],

  ["greatDodecahedron", () => Primitives.greatDodecahedron()],
  ["greatIcosahedron", () => Primitives.greatIcosahedron()],
  // Pentagram faces can't be fan-triangulated, so each is decomposed into 8
  // triangles around new tip/inner vertices, welded across faces where they
  // coincide (see src/polyhedra/regular/pentagram.js)
  ["smallStellatedDodecahedron", () => Primitives.smallStellatedDodecahedron()],
  ["greatStellatedDodecahedron", () => Primitives.greatStellatedDodecahedron()],

  // tetrasphere/octasphere have a seed vertex exactly on a pole; the uv
  // seam zipper duplicates every triangle's corner there with a
  // locally-correct longitude, orphaning the original shared vertex
  ["tetrasphere", () => Primitives.tetrasphere(), { unused: 2 }],
  ["cubesphere", () => Primitives.cubesphere()],
  ["octasphere", () => Primitives.octasphere(), { unused: 2 }],
  ["dodecasphere", () => Primitives.dodecasphere()],
];

describe("seams", () => {
  for (const [name, create, expected = {}] of cases) {
    it(name, () => {
      const result = analyze(create());

      assert.equal(result.nan, 0, "NaN positions");
      assert.equal(result.outOfBounds, 0, "out of bounds cell indices");
      assert.equal(result.nonManifold, 0, "non-manifold edges");
      assert.equal(
        result.cracks,
        0,
        "coincident seam vertices must be bit-identical",
      );
      assert.equal(
        result.degenerate,
        expected.degenerate ?? 0,
        "degenerate triangles",
      );
      assert.equal(result.unused, expected.unused ?? 0, "unused vertices");
    });
  }
});
