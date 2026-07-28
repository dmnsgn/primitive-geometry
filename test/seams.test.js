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
// - epsilon: shapes with a genuine cusp (zero derivative) at the pole pinch
//   the ring right after it to a tiny, non-uniform radius - two mirrored
//   columns can land within the default 1e-4 proximity net despite being
//   legitimately distinct (not a wrap-seam pair), so the net needs tightening
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
  ["astroid", () => Primitives.astroid()],
  ["astroid segments=15", () => Primitives.astroid({ segments: 15 })],
  ["annulus", () => Primitives.annulus()],
  ["annulus segments=15", () => Primitives.annulus({ segments: 15 })],
  ["reuleaux", () => Primitives.reuleaux()],
  ["star", () => Primitives.star()],
  ["star points=7 density=3", () => Primitives.star({ points: 7, density: 3 })],
  ["star thetaOffset=0.5", () => Primitives.star({ thetaOffset: 0.5 })],
  ["star innerRadius=0.1 (self-similar hole)", () => Primitives.star({ innerRadius: 0.1 })],
  [
    "star innerRadius=0.1 circularHole",
    () => Primitives.star({ innerRadius: 0.1, circularHole: true }),
  ],

  ["salinon", () => Primitives.salinon()],
  ["salinon innerRadius=0.4", () => Primitives.salinon({ innerRadius: 0.4 })],
  ["arbelos", () => Primitives.arbelos()],
  ["arbelos innerRadius=0.4", () => Primitives.arbelos({ innerRadius: 0.4 })],
  ["lens", () => Primitives.lens()],
  ["lens asymmetric", () => Primitives.lens({ radius2: 0.3, distance: 0.4 })],
  // Two independent sweeps split at y = 0; crack-free, not necessarily welded.
  ["lune", () => Primitives.lune()],
  ["lune innerRadius=0.45", () => Primitives.lune({ innerRadius: 0.45 })],
  // Each band splits into 5 sub-sweeps around both dots' row ranges;
  // collapsed columns at shared boundaries orphan a few vertices.
  // "yin-yang" reuses this build twice, doubling the count.
  ["yinYang", () => Primitives.yinYang(), { unused: 132 }],
  ["yinYang part=yang", () => Primitives.yinYang({ part: "yang" }), { unused: 66 }],
  ["yinYang part=yin", () => Primitives.yinYang({ part: "yin" }), { unused: 66 }],
  ["yinYang dotRadius=0", () => Primitives.yinYang({ dotRadius: 0 }), { unused: 32 }],

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

  ["polygon", () => Primitives.polygon()],
  ["polygon sides=5 edgeSegments=3", () => Primitives.polygon({ sides: 5, edgeSegments: 3 })],
  ["rhombus", () => Primitives.rhombus()],
  ["rhombus thetaOffset=0.5", () => Primitives.rhombus({ thetaOffset: 0.5 })],
  ["rhombus edgeSegments=3", () => Primitives.rhombus({ edgeSegments: 3 })],
  ["kite", () => Primitives.kite()],
  ["kite ratio=0.9", () => Primitives.kite({ ratio: 0.9 })],
  ["kite edgeSegments=3", () => Primitives.kite({ edgeSegments: 3 })],
  ["lozenge", () => Primitives.lozenge()],
  ["lozenge edgeSegments=3", () => Primitives.lozenge({ edgeSegments: 3 })],
  ["cross", () => Primitives.cross()],
  ["cross armWidth=radius/2", () => Primitives.cross({ armWidth: 0.25 })],
  ["cross segments=3", () => Primitives.cross({ segments: 3 })],
  [
    "cross segments=3 innerSegments=4",
    () => Primitives.cross({ segments: 3, innerSegments: 4 }),
  ],
  ["cross innerRadius=0.1", () => Primitives.cross({ innerRadius: 0.1 })],

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
  ["ellipsoid", () => Primitives.ellipsoid(), { unused: 2 }],
  [
    "ellipsoid thetaOffset=0.3",
    () => Primitives.ellipsoid({ thetaOffset: 0.3 }),
    { unused: 1 },
  ],
  [
    "superellipsoid",
    () => Primitives.superellipsoid(),
    { unused: 2 },
  ],
  [
    "superellipsoid n1=n2=4 (pinched/star)",
    () => Primitives.superellipsoid({ n1: 4, n2: 4 }),
    { unused: 2 },
  ],
  [
    "superellipsoid n1=1,n2=4 (meridian ridge)",
    () => Primitives.superellipsoid({ n1: 1, n2: 4 }),
    { unused: 2 },
  ],
  [
    "astroidalEllipsoid",
    () => Primitives.astroidalEllipsoid(),
    { unused: 2, epsilon: 1e-5 },
  ],
  [
    "superegg",
    () => Primitives.superegg(),
    { unused: 2 },
  ],
  [
    "superegg n=4",
    () => Primitives.superegg({ n: 4 }),
    { unused: 2 },
  ],
  ["barrel", () => Primitives.barrel(), { unused: 2 }],
  ["barrel nx=15", () => Primitives.barrel({ nx: 15 }), { unused: 2 }],
  [
    "barrel no caps",
    () => Primitives.barrel({ capApex: false, capBase: false }),
  ],
  ["apple", () => Primitives.apple(), { unused: 2 }],
  ["apple nx=15", () => Primitives.apple({ nx: 15 }), { unused: 2 }],
  [
    "apple shallow dimple",
    () => Primitives.apple({ height: 0.1 }),
    { unused: 2 },
  ],
  [
    "apple deep dimple (near height=2*radius limit)",
    () => Primitives.apple({ height: 0.99 }),
    { unused: 2 },
  ],
  ["lemon", () => Primitives.lemon(), { unused: 2 }],
  ["lemon nx=15", () => Primitives.lemon({ nx: 15 }), { unused: 2 }],
  [
    "lemon near-sphere limit (height=2*radius)",
    () => Primitives.lemon({ height: 1 }),
    { unused: 2 },
  ],
  [
    "lemon very slender",
    () => Primitives.lemon({ height: 10 }),
    { unused: 2 },
  ],
  ["icosphere", () => Primitives.icosphere()],

  ["cylinder", () => Primitives.cylinder(), { unused: 2 }],
  ["cylinder nx=15", () => Primitives.cylinder({ nx: 15 }), { unused: 2 }],
  [
    "cylinder elliptical (sx/sz, independent per end)",
    () =>
      Primitives.cylinder({
        radiusApex: 0.15,
        sx: 2,
        sz: 0.5,
        sxApex: 0.3,
        szApex: 3,
      }),
    { unused: 2 },
  ],
  ["roundedCylinder", () => Primitives.roundedCylinder(), { unused: 2 }],
  [
    "roundedCylinder nx=15",
    () => Primitives.roundedCylinder({ nx: 15 }),
    { unused: 2 },
  ],
  [
    "roundedCylinder roundRadius=0 (plain cylinder)",
    () => Primitives.roundedCylinder({ roundRadius: 0 }),
    { unused: 2 },
  ],
  [
    "roundedCylinder capsule limit (roundRadius=radius=height/2)",
    () =>
      Primitives.roundedCylinder({
        radius: 0.25,
        height: 0.5,
        roundRadius: 0.25,
      }),
    { unused: 2 },
  ],
  ["cone", () => Primitives.cone(), { unused: 2 }],
  [
    "cone elliptical",
    () => Primitives.cone({ sx: 2, sz: 0.5 }),
    { unused: 2 },
  ],
  ["hyperboloid", () => Primitives.hyperboloid(), { unused: 2 }],
  [
    "hyperboloid nx=15",
    () => Primitives.hyperboloid({ nx: 15 }),
    { unused: 2 },
  ],
  [
    "hyperboloid no caps",
    () => Primitives.hyperboloid({ capApex: false, capBase: false }),
  ],
  ["paraboloid", () => Primitives.paraboloid(), { unused: 2 }],
  [
    "paraboloid nx=15",
    () => Primitives.paraboloid({ nx: 15 }),
    { unused: 2 },
  ],
  [
    "paraboloid no cap",
    () => Primitives.paraboloid({ capBase: false }),
    { unused: 1 },
  ],
  ["funnel", () => Primitives.funnel(), { unused: 2 }],
  ["funnel nx=15", () => Primitives.funnel({ nx: 15 }), { unused: 2 }],
  [
    "funnel no caps",
    () => Primitives.funnel({ capApex: false, capBase: false }),
  ],
  ["bicone", () => Primitives.bicone(), { unused: 2 }],
  ["bicone nx=15", () => Primitives.bicone({ nx: 15 }), { unused: 2 }],
  [
    "bicone elliptical",
    () => Primitives.bicone({ sx: 2, sz: 0.5 }),
    { unused: 2 },
  ],
  ["doubleCone", () => Primitives.doubleCone(), { unused: 4 }],
  [
    "doubleCone nx=15",
    () => Primitives.doubleCone({ nx: 15 }),
    { unused: 4 },
  ],
  [
    "doubleCone elliptical",
    () => Primitives.doubleCone({ sx: 2, sz: 0.5 }),
    { unused: 4 },
  ],
  [
    "doubleCone no caps",
    () => Primitives.doubleCone({ capBase: false, capApex: false }),
    { unused: 2 },
  ],
  ["capsule", () => Primitives.capsule(), { unused: 2 }],
  ["capsule nx=15", () => Primitives.capsule({ nx: 15 }), { unused: 2 }],
  ["capsule roundSegments=0", () => Primitives.capsule({ roundSegments: 0 })],
  ["sphericalRing", () => Primitives.sphericalRing()],
  ["sphericalRing nx=15", () => Primitives.sphericalRing({ nx: 15 })],
  [
    "sphericalRing thin bore",
    () => Primitives.sphericalRing({ innerRadius: 0.05 }),
  ],
  [
    "sphericalRing wide bore",
    () => Primitives.sphericalRing({ innerRadius: 0.45 }),
  ],
  ["torus", () => Primitives.torus()],
  [
    "torus segments=15",
    () => Primitives.torus({ segments: 15, minorSegments: 15 }),
  ],
  [
    "torus phi=PI (capped)",
    () => Primitives.torus({ phi: Math.PI }),
    { unused: 2 },
  ],
  [
    "torus phi=PI capSegments=3",
    () => Primitives.torus({ phi: Math.PI, capSegments: 3 }),
    { unused: 2 },
  ],
  [
    "torus elliptical (footprint + tube + partial phi, capped)",
    () =>
      Primitives.torus({
        sx: 2,
        sy: 0.5,
        minorSx: 0.4,
        minorSy: 2.5,
        phi: Math.PI,
        capSegments: 2,
      }),
    { unused: 2 },
  ],

  ["tetrahedron", () => Primitives.tetrahedron()],
  ["hexahedron", () => Primitives.hexahedron()],
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
  // coincide (see src/solid/polyhedra/regular/pentagram.js)
  ["smallStellatedDodecahedron", () => Primitives.smallStellatedDodecahedron()],
  ["greatStellatedDodecahedron", () => Primitives.greatStellatedDodecahedron()],

  // tetrasphere/octasphere have a seed vertex exactly on a pole; the uv
  // seam zipper duplicates every triangle's corner there with a
  // locally-correct longitude, orphaning the original shared vertex
  ["tetrasphere", () => Primitives.tetrasphere(), { unused: 2 }],
  ["hexasphere", () => Primitives.hexasphere()],
  ["octasphere", () => Primitives.octasphere(), { unused: 2 }],
  ["dodecasphere", () => Primitives.dodecasphere()],
];

describe("seams", () => {
  for (const [name, create, expected = {}] of cases) {
    it(name, () => {
      const result = analyze(create(), expected.epsilon);

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
