# primitive-geometry

[![npm version](https://img.shields.io/npm/v/primitive-geometry)](https://www.npmjs.com/package/primitive-geometry)
[![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)](https://www.npmjs.com/package/primitive-geometry)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/primitive-geometry)](https://bundlephobia.com/package/primitive-geometry)
[![dependencies](https://img.shields.io/librariesio/release/npm/primitive-geometry)](https://github.com/dmnsgn/primitive-geometry/blob/main/package.json)
[![types](https://img.shields.io/npm/types/primitive-geometry)](https://github.com/microsoft/TypeScript)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673.svg)](https://conventionalcommits.org)
[![styled with prettier](https://img.shields.io/badge/styled_with-Prettier-f8bc45.svg?logo=prettier)](https://github.com/prettier/prettier)
[![linted with eslint](https://img.shields.io/badge/linted_with-ES_Lint-4B32C3.svg?logo=eslint)](https://github.com/eslint/eslint)
[![license](https://img.shields.io/github/license/dmnsgn/primitive-geometry)](https://github.com/dmnsgn/primitive-geometry/blob/main/LICENSE.md)

Geometries for 3D rendering: planes, grids, solids, polyhedra and outline paths, as triangle meshes with normals and UVs, or as polygon and polyline complexes. Perfect if you want to supercharge your dependency folder... with 20KB of geometries.

[![paypal](https://img.shields.io/badge/donate-paypal-informational?logo=paypal)](https://paypal.me/dmnsgn)
[![coinbase](https://img.shields.io/badge/donate-coinbase-informational?logo=coinbase)](https://commerce.coinbase.com/checkout/56cbdf28-e323-48d8-9c98-7019e72c97f3)
[![twitter](https://img.shields.io/twitter/follow/dmnsgn?style=social)](https://twitter.com/dmnsgn)

[![primitive-geometry screenshot](https://raw.githubusercontent.com/dmnsgn/primitive-geometry/main/screenshot.gif)](https://dmnsgn.github.io/primitive-geometry/)

## Installation

```bash
npm install primitive-geometry
```

## Features

- **71 geometries**: planes and grids, quadrilaterals and arcs, solids of revolution, prisms, platonic and stellated polyhedra, geodesic spheres - plus 21 outline paths and 10 polyhedra polygon variants.
- **Common API**: options object in, complex out: a `SimplicialComplex` (triangles with normals and uvs), a `PolygonalComplex` (grids and `*Polygons`) or a `PolylineComplex` (`*Path`). Parameters are named the same everywhere (`sx/sy/sz`, `nx/ny/nz`, `radius`, `segments`, `theta`/`phi`).
- **Unit-sized defaults**: every geometry fits in the origin-centered unit cube. Polyhedra and geodesic spheres share a 0.5 circumradius (tips for star polyhedra), like `sphere`, so they read at a common scale (the tetrahedron centers its bounding box rather than its centroid); cuboids and planes fill the cube.
- **TypedArray out**: `Float32Array` for positions, normals and uvs, cells narrowed to `Uint8Array|Uint16Array|Uint32Array` by vertex count (or pinned with `setTypedArrayType`).
- **Welded, crack-free meshes**: vertices shared between patches are bit-identical, not merely close. Every geometry is checked for cracks, non-manifold edges, degenerate cells, winding and uv continuity across [101 configurations](test/seams.test.js).
- **Partial shapes**: `theta`/`phi` sweeps with optional caps, hollow variants, and `vDistribution` to choose how rows spread along a revolution's meridian.
- **17 UV mappings**, swappable per compatible geometry: see the [comparison images](examples/elliptical-mapping/elliptical-mapping.md) and the [demo](https://dmnsgn.github.io/primitive-geometry/?id=elliptical-mapping).
- **Zero dependency, tree-shakeable**: ~1.7KB min+gzip for a single geometry, ~21KB for all of them.

## Usage

See the [example](https://dmnsgn.github.io/primitive-geometry/) and its [source](examples/index.js).

```js
import * as Primitives from "primitive-geometry";

const { mappings, utils } = Primitives;

const geometry = Primitives.quad({ scale: 1 });
console.log(geometry);
// {
//   positions: Float32Array [x, y, z, x, y, z,  ...],
//   normals: Float32Array [x, y, z, x, y, z, ...]
//   uvs: Float32Array [u, v, u, v, ...],
//   cells: Uint8/16/32/Array [a, b, c, a, b, c, ...],
// }

// Every geometry below, with its options set to their defaults. Grids
// return an n-gon complex: positions and cells only, no normals or uvs. Most
// plane geometries also have a `*Path` outline variant, and the polyhedra a
// `*Polygons` n-gon seed variant: see the API below.

// Plane
const quadGrid = Primitives.quadGrid({
  sx: 1,
  sy: 1,
  nx: 10,
  ny: 10,
});
const triangularGrid = Primitives.triangularGrid({
  sx: 1,
  nx: 10,
  ny: 10,
  inscribed: true,
});
const hexagonalGrid = Primitives.hexagonalGrid({
  sx: 1,
  nx: 10,
  ny: 10,
  inscribed: true,
});

const triangle = Primitives.triangle({
  sx: 1,
  sy: 1,
  apexOffset: 0,
  radius: 0.5,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.rectangular,
});
const rightTriangle = Primitives.rightTriangle({
  sx: 1,
  sy: 1,
  radius: 0.5,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.rectangular,
});

const quad = Primitives.quad({
  scale: 1,
});
const plane = Primitives.plane({
  sx: 1,
  sy: 1,
  nx: 1,
  ny: 1,
  direction: "z",
});
const roundedRectangle = Primitives.roundedRectangle({
  sx: 1,
  sy: 1,
  radius: 0.25,
  roundSegments: 8,
  nx: 1,
  ny: 1,
  roundedCorners: ["top-left", "top-right", "bottom-right", "bottom-left"],
});
const stadium = Primitives.stadium({
  sx: 1,
  sy: 0.5,
  nx: 1,
  ny: 1,
  roundSegments: 8,
});

const kite = Primitives.kite({
  sx: 1,
  sy: 1,
  ratio: 0.5,
  radius: 0.5,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: Math.PI / 2,
  mergeCentroid: true,
  mapping: mappings.concentric,
});
const rhombus = Primitives.rhombus({
  sx: 1,
  sy: 1,
  radius: 0.5,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: Math.PI / 2,
  mergeCentroid: true,
  mapping: mappings.concentric,
});
const lozenge = Primitives.lozenge({
  sx: 0.5,
  sy: 1,
  radius: 0.5,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: Math.PI / 2,
  mergeCentroid: true,
  mapping: mappings.concentric,
});
const trapezoid = Primitives.trapezoid({
  sx: 1,
  sy: 1,
  topRatio: 0.5,
  topOffset: 0,
  radius: 0.5,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.rectangular,
});
const parallelogram = Primitives.parallelogram({
  sx: 0.5,
  sy: 1,
  shear: 0.3,
  radius: 0.5,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.rectangular,
});

const arbelos = Primitives.arbelos({
  radius: 0.5,
  innerRadius: 0.125,
  segments: 32,
  innerSegments: 16,
  mapping: mappings.rectangular,
});
const lens = Primitives.lens({
  radius: 0.5,
  radius2: 0.5,
  distance: 0.5,
  segments: 32,
  innerSegments: 16,
  mapping: mappings.rectangular,
});
const lune = Primitives.lune({
  radius: 0.5,
  innerRadius: 0.5,
  distance: 0.25,
  segments: 32,
  innerSegments: 16,
  mapping: mappings.rectangular,
});
const salinon = Primitives.salinon({
  radius: 0.5,
  innerRadius: 0.125,
  segments: 32,
  innerSegments: 16,
  mapping: mappings.rectangular,
});
const triquetra = Primitives.triquetra({
  radius: 0.5,
  segments: 32,
  innerSegments: 16,
  mapping: mappings.rectangular,
});
const yinYang = Primitives.yinYang({
  radius: 0.5,
  dotRadius: 0.5 / 6,
  part: "yin-yang",
  segments: 32,
  holeSegments: 16,
  innerSegments: 16,
  mapping: mappings.rectangular,
});

const ellipse = Primitives.ellipse({
  sx: 1,
  sy: 0.5,
  radius: 0.5,
  segments: 32,
  innerSegments: 16,
  theta: Math.PI * 2,
  thetaOffset: 0,
  innerRadius: 0,
  mergeCentroid: true,
  mapping: mappings.elliptical,
});
const disc = Primitives.disc({
  radius: 0.5,
  segments: 32,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.concentric,
});
const superellipse = Primitives.superellipse({
  sx: 1,
  sy: 0.5,
  radius: 0.5,
  segments: 32,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.lamé,
  m: 2,
  n: 2,
});
const squircle = Primitives.squircle({
  sx: 1,
  sy: 1,
  radius: 0.5,
  segments: 128,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.fgSquircular,
  squareness: 0.95,
});
const astroid = Primitives.astroid({
  radius: 0.5,
  segments: 32,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.lamé,
});
const annulus = Primitives.annulus({
  sx: 1,
  sy: 1,
  radius: 0.5,
  segments: 32,
  innerSegments: 16,
  theta: Math.PI * 2,
  thetaOffset: 0,
  innerRadius: 0.25,
  mapping: mappings.concentric,
});

const polygon = Primitives.polygon({
  sides: 6,
  sx: 1,
  sy: 1,
  radius: 0.5,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.concentric,
});
const reuleaux = Primitives.reuleaux({
  sides: 3,
  radius: 0.5,
  segments: 32,
  innerSegments: 16,
  innerRadius: 0,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.concentric,
});
const star = Primitives.star({
  points: 5,
  density: 2,
  radius: 0.5,
  notchRadius: 0.5 * utils.computeStarRatio(5, 2),
  innerRadius: 0,
  circularHole: false,
  edgeSegments: 1,
  innerSegments: 16,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.concentric,
});
const cross = Primitives.cross({
  radius: 0.5,
  armWidth: 0.5 / 3,
  edgeSegments: 1,
  innerSegments: 16,
  innerRadius: 0,
  mergeCentroid: true,
  mapping: mappings.rectangular,
});

// Solid
const cube = Primitives.cube({
  sx: 1,
  sy: 1,
  sz: 1,
  nx: 1,
  ny: 1,
  nz: 1,
});
const hollowCube = Primitives.hollowCube({
  sx: 1,
  sy: 1,
  sz: 1,
  thickness: 0.2,
});
const roundedCube = Primitives.roundedCube({
  sx: 1,
  sy: 1,
  sz: 1,
  radius: 0.25,
  roundSegments: 8,
  nx: 1,
  ny: 1,
  nz: 1,
  roundDirection: "all",
});

const sphere = Primitives.sphere({
  radius: 0.5,
  nx: 32,
  ny: 16,
  theta: Math.PI,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
});
const hollowSphere = Primitives.hollowSphere({
  radius: 0.5,
  innerRadius: 0.25,
  nx: 32,
  ny: 16,
  capSegments: 1,
  theta: Math.PI / 2,
  thetaOffset: Math.PI / 4,
  phi: Math.PI * 2,
  phiOffset: 0,
});
const ellipsoid = Primitives.ellipsoid({
  radius: 0.5,
  nx: 32,
  ny: 16,
  sx: 1,
  sy: 0.5,
  sz: 0.5,
  theta: Math.PI,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
  vDistribution: utils.linear,
});
const superellipsoid = Primitives.superellipsoid({
  radius: 0.5,
  nx: 32,
  ny: 16,
  sx: 1,
  sy: 0.5,
  sz: 0.5,
  n1: 3,
  n2: 3,
  theta: Math.PI,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
  vDistribution: utils.linear,
});
const astroidalEllipsoid = Primitives.astroidalEllipsoid({
  radius: 0.5,
  nx: 32,
  ny: 16,
  sx: 1,
  sy: 0.5,
  sz: 0.5,
  theta: Math.PI,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
});
const superegg = Primitives.superegg({
  radius: 0.5,
  sy: 5 / 6,
  nx: 32,
  ny: 16,
  n: 2.5,
  theta: Math.PI,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
  vDistribution: utils.linear,
});

const cylinder = Primitives.cylinder({
  height: 1,
  radiusBase: 0.25,
  radiusApex: 0.25,
  nx: 16,
  ny: 1,
  capBase: true,
  capApex: true,
  capBaseSegments: 1,
  capApexSegments: 1,
  phi: Math.PI * 2,
  phiOffset: 0,
  capMapping: mappings.rectangular,
  sxBase: 1,
  szBase: 1,
  sxApex: 1,
  szApex: 1,
});
const hollowCylinder = Primitives.hollowCylinder({
  height: 1,
  radius: 0.5,
  innerRadius: 0.25,
  nx: 32,
  ny: 1,
  capSegments: 1,
  capApex: true,
  capBase: true,
  phi: Math.PI * 2,
  phiOffset: 0,
});
const roundedCylinder = Primitives.roundedCylinder({
  height: 1,
  radius: 0.25,
  roundRadius: 0.075,
  nx: 16,
  ny: 1,
  roundSegments: 8,
  capSegments: 1,
  phi: Math.PI * 2,
  phiOffset: 0,
});

const cone = Primitives.cone({
  height: 1,
  radius: 0.25,
  nx: 16,
  ny: 1,
  capSegments: 1,
  capBase: true,
  phi: Math.PI * 2,
  phiOffset: 0,
  capMapping: mappings.rectangular,
  sx: 1,
  sz: 1,
});
const bicone = Primitives.bicone({
  height: 1,
  radius: 0.5,
  nx: 16,
  ny: 1,
  phi: Math.PI * 2,
  phiOffset: 0,
  sx: 1,
  sz: 1,
});
const sphericon = Primitives.sphericon({
  radius: 0.5,
  nx: 16,
  ny: 1,
});
const doubleCone = Primitives.doubleCone({
  height: 1,
  radius: 0.5,
  nx: 16,
  ny: 1,
  capBase: true,
  capApex: true,
  capBaseSegments: 1,
  capApexSegments: 1,
  phi: Math.PI * 2,
  phiOffset: 0,
  capMapping: mappings.rectangular,
  sx: 1,
  sz: 1,
});
const capsule = Primitives.capsule({
  height: 0.5,
  radius: 0.25,
  nx: 16,
  ny: 1,
  roundSegments: 16,
  phi: Math.PI * 2,
  phiOffset: 0,
});

const torus = Primitives.torus({
  radius: 0.4,
  segments: 64,
  minorRadius: 0.1,
  minorSegments: 32,
  theta: Math.PI * 2,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
  capStart: true,
  capEnd: true,
  capStartSegments: 1,
  capEndSegments: 1,
  capMapping: mappings.rectangular,
  sx: 1,
  sy: 1,
  minorSx: 1,
  minorSy: 1,
});
const apple = Primitives.apple({
  radius: 0.5,
  height: 0.5,
  nx: 32,
  ny: 16,
  phi: Math.PI * 2,
  phiOffset: 0,
});
const lemon = Primitives.lemon({
  radius: 0.3,
  height: 1,
  nx: 32,
  ny: 16,
  phi: Math.PI * 2,
  phiOffset: 0,
});
const sphericalRing = Primitives.sphericalRing({
  radius: 0.5,
  innerRadius: 0.25,
  nx: 32,
  ny: 16,
  holeSegments: 1,
  phi: Math.PI * 2,
  phiOffset: 0,
});

const prism = Primitives.prism({
  radius: 0.25,
  height: 1,
  sides: 6,
  phiOffset: 0,
  capMapping: mappings.rectangular,
});
const antiprism = Primitives.antiprism({
  radius: 0.25,
  height: 1,
  sides: 6,
  phiOffset: 0,
  capMapping: mappings.rectangular,
});

const paraboloid = Primitives.paraboloid({
  height: 1,
  radius: 0.5,
  nx: 32,
  ny: 16,
  capSegments: 1,
  capBase: true,
  phi: Math.PI * 2,
  phiOffset: 0,
  capMapping: mappings.rectangular,
  vDistribution: utils.linear,
});
const hyperboloid = Primitives.hyperboloid({
  height: 1,
  radius: 0.25,
  endRadius: 0.5,
  nx: 32,
  ny: 16,
  capSegments: 1,
  capApex: true,
  capBase: true,
  phi: Math.PI * 2,
  phiOffset: 0,
  capMapping: mappings.rectangular,
  vDistribution: utils.linear,
});
const barrel = Primitives.barrel({
  height: 1,
  radius: 0.5,
  endRadius: 0.35,
  nx: 32,
  ny: 16,
  capSegments: 1,
  capApex: true,
  capBase: true,
  phi: Math.PI * 2,
  phiOffset: 0,
  capMapping: mappings.rectangular,
  vDistribution: utils.linear,
});
const funnel = Primitives.funnel({
  height: 1,
  radiusBase: 0.1,
  radiusApex: 0.5,
  nx: 32,
  ny: 16,
  capBase: true,
  capApex: true,
  capBaseSegments: 1,
  capApexSegments: 1,
  phi: Math.PI * 2,
  phiOffset: 0,
  capMapping: mappings.rectangular,
  vDistribution: utils.linear,
});

const tetrahedron = Primitives.tetrahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});
const hexahedron = Primitives.hexahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});
const octahedron = Primitives.octahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});
const dodecahedron = Primitives.dodecahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});
const icosahedron = Primitives.icosahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});

const greatDodecahedron = Primitives.greatDodecahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});
const greatIcosahedron = Primitives.greatIcosahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});
const smallStellatedDodecahedron = Primitives.smallStellatedDodecahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});
const greatStellatedDodecahedron = Primitives.greatStellatedDodecahedron({
  radius: 0.5,
  subdivisions: 0,
  mapping: mappings.rectangular,
});

const tetrasphere = Primitives.tetrasphere({
  radius: 0.5,
  subdivisions: 2,
  projection: "gnomonic",
  mapping: mappings.spherical,
});
const hexasphere = Primitives.hexasphere({
  radius: 0.5,
  subdivisions: 2,
  projection: "gnomonic",
  mapping: mappings.spherical,
});
const octasphere = Primitives.octasphere({
  radius: 0.5,
  subdivisions: 2,
  projection: "gnomonic",
  mapping: mappings.spherical,
});
const dodecasphere = Primitives.dodecasphere({
  radius: 0.5,
  subdivisions: 2,
  projection: "gnomonic",
  mapping: mappings.spherical,
});
const icosphere = Primitives.icosphere({
  radius: 0.5,
  subdivisions: 2,
  projection: "gnomonic",
  mapping: mappings.spherical,
});
```

## API

<!-- api-start -->

## Modules

<dl>
<dt><a href="#module_primitiveGeometry">primitiveGeometry</a></dt>
<dd><p>Re-export all geometries, UV mappings functions and utils.</p>
</dd>
<dt><a href="#module_mappings">mappings</a></dt>
<dd></dd>
<dt><a href="#module_utils">utils</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#TypedArrayLike">TypedArrayLike</a> : <code>Array.&lt;number&gt;</code> | <code>Uint8Array</code> | <code>Uint16Array</code> | <code>Uint32Array</code></dt>
<dd></dd>
<dt><a href="#PositiveInteger">PositiveInteger</a> : <code>number</code></dt>
<dd><p>Integer &gt;= 1.</p>
</dd>
<dt><a href="#NonNegativeInteger">NonNegativeInteger</a> : <code>number</code></dt>
<dd><p>Integer &gt;= 0.</p>
</dd>
<dt><a href="#Angle">Angle</a> : <code>number</code></dt>
<dd><p>In radians.</p>
</dd>
<dt><a href="#PolarAngle">PolarAngle</a> : <code>number</code></dt>
<dd><p>In radians, from the pole, within [0, π].</p>
</dd>
<dt><a href="#SimplicialComplex">SimplicialComplex</a> : <code>object</code></dt>
<dd><p>Triangle cells over shared positions.</p>
</dd>
<dt><a href="#PolygonalComplex">PolygonalComplex</a> : <code>object</code></dt>
<dd><p>Polygon cells over shared positions: each
  cell is a closed n-gon (implicitly wraps its last index back to its first -
  never repeat the first index at the end).</p>
</dd>
<dt><a href="#PolylineComplex">PolylineComplex</a> : <code>object</code></dt>
<dd><p>Polyline cells over shared positions: each
  cell is an open polyline (no implicit closing edge between its last and
  first index); repeat the first index at the end of a cell to close that
  loop explicitly.</p>
</dd>
</dl>

<a name="module_primitiveGeometry"></a>

## primitiveGeometry

Re-export all geometries, UV mappings functions and utils.

- [primitiveGeometry](#module_primitiveGeometry)
  - _static_
    - [.cross([options])](#module_primitiveGeometry.cross) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.crossPath([options])](#module_primitiveGeometry.crossPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.polygon([options])](#module_primitiveGeometry.polygon) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.polygonPath([options])](#module_primitiveGeometry.polygonPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.reuleaux([options])](#module_primitiveGeometry.reuleaux) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.reuleauxPath([options])](#module_primitiveGeometry.reuleauxPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.star([options])](#module_primitiveGeometry.star) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.starPath([options])](#module_primitiveGeometry.starPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.arbelos([options])](#module_primitiveGeometry.arbelos) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.lens([options])](#module_primitiveGeometry.lens) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.lune([options])](#module_primitiveGeometry.lune) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.salinon([options])](#module_primitiveGeometry.salinon) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.triquetra([options])](#module_primitiveGeometry.triquetra) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.yinYang([options])](#module_primitiveGeometry.yinYang) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.annulus([options])](#module_primitiveGeometry.annulus) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.annulusPath([options])](#module_primitiveGeometry.annulusPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.astroid([options])](#module_primitiveGeometry.astroid) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.astroidPath([options])](#module_primitiveGeometry.astroidPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.disc([options])](#module_primitiveGeometry.disc) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.circlePath([options])](#module_primitiveGeometry.circlePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.ellipse([options])](#module_primitiveGeometry.ellipse) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.ellipsePath([options])](#module_primitiveGeometry.ellipsePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.squircle([options])](#module_primitiveGeometry.squircle) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.squirclePath([options])](#module_primitiveGeometry.squirclePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.superellipse([options])](#module_primitiveGeometry.superellipse) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.superellipsePath([options])](#module_primitiveGeometry.superellipsePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.hexagonalGrid([options])](#module_primitiveGeometry.hexagonalGrid) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.quadGrid([options])](#module_primitiveGeometry.quadGrid) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.triangularGrid([options])](#module_primitiveGeometry.triangularGrid) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.kite([options])](#module_primitiveGeometry.kite) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.kitePath([options])](#module_primitiveGeometry.kitePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.lozenge([options])](#module_primitiveGeometry.lozenge) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.lozengePath([options])](#module_primitiveGeometry.lozengePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.parallelogram([options])](#module_primitiveGeometry.parallelogram) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.parallelogramPath([options])](#module_primitiveGeometry.parallelogramPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.plane([options])](#module_primitiveGeometry.plane) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.rectanglePath([options])](#module_primitiveGeometry.rectanglePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.quad([options])](#module_primitiveGeometry.quad) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.squarePath([options])](#module_primitiveGeometry.squarePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.rhombus([options])](#module_primitiveGeometry.rhombus) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.rhombusPath([options])](#module_primitiveGeometry.rhombusPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.roundedRectangle([options])](#module_primitiveGeometry.roundedRectangle) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.roundedRectanglePath([options])](#module_primitiveGeometry.roundedRectanglePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.stadium([options])](#module_primitiveGeometry.stadium) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.stadiumPath([options])](#module_primitiveGeometry.stadiumPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.trapezoid([options])](#module_primitiveGeometry.trapezoid) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.trapezoidPath([options])](#module_primitiveGeometry.trapezoidPath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.rightTriangle([options])](#module_primitiveGeometry.rightTriangle) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.rightTrianglePath([options])](#module_primitiveGeometry.rightTrianglePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.triangle([options])](#module_primitiveGeometry.triangle) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.trianglePath([options])](#module_primitiveGeometry.trianglePath) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)
    - [.cubePolygons([options])](#module_primitiveGeometry.cubePolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.cube([options])](#module_primitiveGeometry.cube) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.hollowCube([options])](#module_primitiveGeometry.hollowCube) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.roundedCube([options])](#module_primitiveGeometry.roundedCube) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.antiprism([options])](#module_primitiveGeometry.antiprism) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.prism([options])](#module_primitiveGeometry.prism) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.apple([options])](#module_primitiveGeometry.apple) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.astroidalEllipsoid([options])](#module_primitiveGeometry.astroidalEllipsoid) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.barrel([options])](#module_primitiveGeometry.barrel) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.bicone([options])](#module_primitiveGeometry.bicone) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.capsule([options])](#module_primitiveGeometry.capsule) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.cone([options])](#module_primitiveGeometry.cone) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.cylinder([options])](#module_primitiveGeometry.cylinder) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.doubleCone([options])](#module_primitiveGeometry.doubleCone) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.ellipsoid([options])](#module_primitiveGeometry.ellipsoid) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.funnel([options])](#module_primitiveGeometry.funnel) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.hollowCylinder([options])](#module_primitiveGeometry.hollowCylinder) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.hollowSphere([options])](#module_primitiveGeometry.hollowSphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.hyperboloid([options])](#module_primitiveGeometry.hyperboloid) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.lemon([options])](#module_primitiveGeometry.lemon) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.paraboloid([options])](#module_primitiveGeometry.paraboloid) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.roundedCylinder([options])](#module_primitiveGeometry.roundedCylinder) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.sphere([options])](#module_primitiveGeometry.sphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.sphericalRing([options])](#module_primitiveGeometry.sphericalRing) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.sphericon([options])](#module_primitiveGeometry.sphericon) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.superegg([options])](#module_primitiveGeometry.superegg) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.superellipsoid([options])](#module_primitiveGeometry.superellipsoid) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.torus([options])](#module_primitiveGeometry.torus) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.dodecasphere([options])](#module_primitiveGeometry.dodecasphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.hexasphere([options])](#module_primitiveGeometry.hexasphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.icosphere([options])](#module_primitiveGeometry.icosphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.octasphere([options])](#module_primitiveGeometry.octasphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.tetrasphere([options])](#module_primitiveGeometry.tetrasphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.dodecahedronPolygons([options])](#module_primitiveGeometry.dodecahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.dodecahedron([options])](#module_primitiveGeometry.dodecahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.greatDodecahedronPolygons([options])](#module_primitiveGeometry.greatDodecahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.greatDodecahedron([options])](#module_primitiveGeometry.greatDodecahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.greatIcosahedronPolygons([options])](#module_primitiveGeometry.greatIcosahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.greatIcosahedron([options])](#module_primitiveGeometry.greatIcosahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.greatStellatedDodecahedronPolygons([options])](#module_primitiveGeometry.greatStellatedDodecahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.greatStellatedDodecahedron([options])](#module_primitiveGeometry.greatStellatedDodecahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.hexahedronPolygons([options])](#module_primitiveGeometry.hexahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.hexahedron([options])](#module_primitiveGeometry.hexahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.icosahedronPolygons([options])](#module_primitiveGeometry.icosahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.icosahedron([options])](#module_primitiveGeometry.icosahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.octahedronPolygons([options])](#module_primitiveGeometry.octahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.octahedron([options])](#module_primitiveGeometry.octahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.smallStellatedDodecahedronPolygons([options])](#module_primitiveGeometry.smallStellatedDodecahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.smallStellatedDodecahedron([options])](#module_primitiveGeometry.smallStellatedDodecahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.tetrahedronPolygons([options])](#module_primitiveGeometry.tetrahedronPolygons) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)
    - [.tetrahedron([options])](#module_primitiveGeometry.tetrahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
  - _inner_
    - [~CrossOptions](#module_primitiveGeometry..CrossOptions) : <code>object</code>
    - [~CrossPathOptions](#module_primitiveGeometry..CrossPathOptions) : <code>object</code>
    - [~PolygonOptions](#module_primitiveGeometry..PolygonOptions) : <code>object</code>
    - [~PolygonPathOptions](#module_primitiveGeometry..PolygonPathOptions) : <code>object</code>
    - [~ReuleauxOptions](#module_primitiveGeometry..ReuleauxOptions) : <code>object</code>
    - [~ReuleauxPathOptions](#module_primitiveGeometry..ReuleauxPathOptions) : <code>object</code>
    - [~StarOptions](#module_primitiveGeometry..StarOptions) : <code>object</code>
    - [~StarPathOptions](#module_primitiveGeometry..StarPathOptions) : <code>object</code>
    - [~ArbelosOptions](#module_primitiveGeometry..ArbelosOptions) : <code>object</code>
    - [~LensOptions](#module_primitiveGeometry..LensOptions) : <code>object</code>
    - [~LuneOptions](#module_primitiveGeometry..LuneOptions) : <code>object</code>
    - [~SalinonOptions](#module_primitiveGeometry..SalinonOptions) : <code>object</code>
    - [~TriquetraOptions](#module_primitiveGeometry..TriquetraOptions) : <code>object</code>
    - [~YinYangOptions](#module_primitiveGeometry..YinYangOptions) : <code>object</code>
    - [~AnnulusOptions](#module_primitiveGeometry..AnnulusOptions) : <code>object</code>
    - [~AnnulusPathOptions](#module_primitiveGeometry..AnnulusPathOptions) : <code>object</code>
    - [~AstroidOptions](#module_primitiveGeometry..AstroidOptions) : <code>object</code>
    - [~AstroidPathOptions](#module_primitiveGeometry..AstroidPathOptions) : <code>object</code>
    - [~DiscOptions](#module_primitiveGeometry..DiscOptions) : <code>object</code>
    - [~CirclePathOptions](#module_primitiveGeometry..CirclePathOptions) : <code>object</code>
    - [~EllipseOptions](#module_primitiveGeometry..EllipseOptions) : <code>object</code>
    - [~EllipseEquationFn](#module_primitiveGeometry..EllipseEquationFn) ⇒ <code>[x, y]</code>
    - [~EllipsePathOptions](#module_primitiveGeometry..EllipsePathOptions) : <code>object</code>
    - [~SquircleOptions](#module_primitiveGeometry..SquircleOptions) : <code>object</code>
    - [~SquirclePathOptions](#module_primitiveGeometry..SquirclePathOptions) : <code>object</code>
    - [~SuperellipseOptions](#module_primitiveGeometry..SuperellipseOptions) : <code>object</code>
    - [~SuperellipsePathOptions](#module_primitiveGeometry..SuperellipsePathOptions) : <code>object</code>
    - [~HexagonalGridOptions](#module_primitiveGeometry..HexagonalGridOptions) : <code>object</code>
    - [~QuadGridOptions](#module_primitiveGeometry..QuadGridOptions) : <code>object</code>
    - [~TriangularGridOptions](#module_primitiveGeometry..TriangularGridOptions) : <code>object</code>
    - [~KiteOptions](#module_primitiveGeometry..KiteOptions) : <code>object</code>
    - [~KitePathOptions](#module_primitiveGeometry..KitePathOptions) : <code>object</code>
    - [~LozengeOptions](#module_primitiveGeometry..LozengeOptions) : <code>object</code>
    - [~LozengePathOptions](#module_primitiveGeometry..LozengePathOptions) : <code>object</code>
    - [~ParallelogramOptions](#module_primitiveGeometry..ParallelogramOptions) : <code>object</code>
    - [~ParallelogramPathOptions](#module_primitiveGeometry..ParallelogramPathOptions) : <code>object</code>
    - [~PlaneOptions](#module_primitiveGeometry..PlaneOptions) : <code>object</code>
    - [~PlaneDirection](#module_primitiveGeometry..PlaneDirection) : <code>&quot;x&quot;</code> \| <code>&quot;-x&quot;</code> \| <code>&quot;y&quot;</code> \| <code>&quot;-y&quot;</code> \| <code>&quot;z&quot;</code> \| <code>&quot;-z&quot;</code>
    - [~RectanglePathOptions](#module_primitiveGeometry..RectanglePathOptions) : <code>object</code>
    - [~QuadOptions](#module_primitiveGeometry..QuadOptions) : <code>object</code>
    - [~SquarePathOptions](#module_primitiveGeometry..SquarePathOptions) : <code>object</code>
    - [~RhombusOptions](#module_primitiveGeometry..RhombusOptions) : <code>object</code>
    - [~RhombusPathOptions](#module_primitiveGeometry..RhombusPathOptions) : <code>object</code>
    - [~RoundedRectangleCorner](#module_primitiveGeometry..RoundedRectangleCorner) : <code>&quot;top-left&quot;</code> \| <code>&quot;top-right&quot;</code> \| <code>&quot;bottom-right&quot;</code> \| <code>&quot;bottom-left&quot;</code>
    - [~RoundedRectangleOptions](#module_primitiveGeometry..RoundedRectangleOptions) : <code>object</code>
    - [~RoundedRectanglePathOptions](#module_primitiveGeometry..RoundedRectanglePathOptions) : <code>object</code>
    - [~StadiumOptions](#module_primitiveGeometry..StadiumOptions) : <code>object</code>
    - [~StadiumPathOptions](#module_primitiveGeometry..StadiumPathOptions) : <code>object</code>
    - [~TrapezoidOptions](#module_primitiveGeometry..TrapezoidOptions) : <code>object</code>
    - [~TrapezoidPathOptions](#module_primitiveGeometry..TrapezoidPathOptions) : <code>object</code>
    - [~RightTriangleOptions](#module_primitiveGeometry..RightTriangleOptions) : <code>object</code>
    - [~RightTrianglePathOptions](#module_primitiveGeometry..RightTrianglePathOptions) : <code>object</code>
    - [~TriangleOptions](#module_primitiveGeometry..TriangleOptions) : <code>object</code>
    - [~TrianglePathOptions](#module_primitiveGeometry..TrianglePathOptions) : <code>object</code>
    - [~CubePolygonsOptions](#module_primitiveGeometry..CubePolygonsOptions) : <code>object</code>
    - [~CubeOptions](#module_primitiveGeometry..CubeOptions) : <code>object</code>
    - [~HollowCubeOptions](#module_primitiveGeometry..HollowCubeOptions) : <code>object</code>
    - [~RoundedCubeDirection](#module_primitiveGeometry..RoundedCubeDirection) : <code>&quot;all&quot;</code> \| <code>&quot;x&quot;</code> \| <code>&quot;y&quot;</code> \| <code>&quot;z&quot;</code>
    - [~RoundedCubeOptions](#module_primitiveGeometry..RoundedCubeOptions) : <code>object</code>
    - [~AntiprismOptions](#module_primitiveGeometry..AntiprismOptions) : <code>object</code>
    - [~PrismOptions](#module_primitiveGeometry..PrismOptions) : <code>object</code>
    - [~AppleOptions](#module_primitiveGeometry..AppleOptions) : <code>object</code>
    - [~AstroidalEllipsoidOptions](#module_primitiveGeometry..AstroidalEllipsoidOptions) : <code>object</code>
    - [~BarrelOptions](#module_primitiveGeometry..BarrelOptions) : <code>object</code>
    - [~BiconeOptions](#module_primitiveGeometry..BiconeOptions) : <code>object</code>
    - [~CapsuleOptions](#module_primitiveGeometry..CapsuleOptions) : <code>object</code>
    - [~ConeOptions](#module_primitiveGeometry..ConeOptions) : <code>object</code>
    - [~CylinderOptions](#module_primitiveGeometry..CylinderOptions) : <code>object</code>
    - [~DoubleConeOptions](#module_primitiveGeometry..DoubleConeOptions) : <code>object</code>
    - [~EllipsoidOptions](#module_primitiveGeometry..EllipsoidOptions) : <code>object</code>
    - [~FunnelOptions](#module_primitiveGeometry..FunnelOptions) : <code>object</code>
    - [~HollowCylinderOptions](#module_primitiveGeometry..HollowCylinderOptions) : <code>object</code>
    - [~HollowSphereOptions](#module_primitiveGeometry..HollowSphereOptions) : <code>object</code>
    - [~HyperboloidOptions](#module_primitiveGeometry..HyperboloidOptions) : <code>object</code>
    - [~LemonOptions](#module_primitiveGeometry..LemonOptions) : <code>object</code>
    - [~ParaboloidOptions](#module_primitiveGeometry..ParaboloidOptions) : <code>object</code>
    - [~RoundedCylinderOptions](#module_primitiveGeometry..RoundedCylinderOptions) : <code>object</code>
    - [~SphereOptions](#module_primitiveGeometry..SphereOptions) : <code>object</code>
    - [~SphericalRingOptions](#module_primitiveGeometry..SphericalRingOptions) : <code>object</code>
    - [~SphericonOptions](#module_primitiveGeometry..SphericonOptions) : <code>object</code>
    - [~SupereggOptions](#module_primitiveGeometry..SupereggOptions) : <code>object</code>
    - [~SuperellipsoidOptions](#module_primitiveGeometry..SuperellipsoidOptions) : <code>object</code>
    - [~TorusOptions](#module_primitiveGeometry..TorusOptions) : <code>object</code>
    - [~DodecasphereOptions](#module_primitiveGeometry..DodecasphereOptions) : <code>object</code>
    - [~HexasphereOptions](#module_primitiveGeometry..HexasphereOptions) : <code>object</code>
    - [~IcosphereOptions](#module_primitiveGeometry..IcosphereOptions) : <code>object</code>
    - [~OctasphereOptions](#module_primitiveGeometry..OctasphereOptions) : <code>object</code>
    - [~TetrasphereOptions](#module_primitiveGeometry..TetrasphereOptions) : <code>object</code>
    - [~DodecahedronPolygonsOptions](#module_primitiveGeometry..DodecahedronPolygonsOptions) : <code>object</code>
    - [~DodecahedronOptions](#module_primitiveGeometry..DodecahedronOptions) : <code>object</code>
    - [~GreatDodecahedronPolygonsOptions](#module_primitiveGeometry..GreatDodecahedronPolygonsOptions) : <code>object</code>
    - [~GreatDodecahedronOptions](#module_primitiveGeometry..GreatDodecahedronOptions) : <code>object</code>
    - [~GreatIcosahedronPolygonsOptions](#module_primitiveGeometry..GreatIcosahedronPolygonsOptions) : <code>object</code>
    - [~GreatIcosahedronOptions](#module_primitiveGeometry..GreatIcosahedronOptions) : <code>object</code>
    - [~GreatStellatedDodecahedronPolygonsOptions](#module_primitiveGeometry..GreatStellatedDodecahedronPolygonsOptions) : <code>object</code>
    - [~GreatStellatedDodecahedronOptions](#module_primitiveGeometry..GreatStellatedDodecahedronOptions) : <code>object</code>
    - [~HexahedronPolygonsOptions](#module_primitiveGeometry..HexahedronPolygonsOptions) : <code>object</code>
    - [~HexahedronOptions](#module_primitiveGeometry..HexahedronOptions) : <code>object</code>
    - [~IcosahedronPolygonsOptions](#module_primitiveGeometry..IcosahedronPolygonsOptions) : <code>object</code>
    - [~IcosahedronOptions](#module_primitiveGeometry..IcosahedronOptions) : <code>object</code>
    - [~OctahedronPolygonsOptions](#module_primitiveGeometry..OctahedronPolygonsOptions) : <code>object</code>
    - [~OctahedronOptions](#module_primitiveGeometry..OctahedronOptions) : <code>object</code>
    - [~SmallStellatedDodecahedronPolygonsOptions](#module_primitiveGeometry..SmallStellatedDodecahedronPolygonsOptions) : <code>object</code>
    - [~SmallStellatedDodecahedronOptions](#module_primitiveGeometry..SmallStellatedDodecahedronOptions) : <code>object</code>
    - [~TetrahedronPolygonsOptions](#module_primitiveGeometry..TetrahedronPolygonsOptions) : <code>object</code>
    - [~TetrahedronOptions](#module_primitiveGeometry..TetrahedronOptions) : <code>object</code>

<a name="module_primitiveGeometry.cross"></a>

### primitiveGeometry.cross([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A Greek cross: 4 equal arms around a square center.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Greek Cross](https://mathworld.wolfram.com/GreekCross.html)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>CrossOptions</code>](#module_primitiveGeometry..CrossOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.crossPath"></a>

### primitiveGeometry.crossPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `cross`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>CrossPathOptions</code>](#module_primitiveGeometry..CrossPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.polygon"></a>

### primitiveGeometry.polygon([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A regular polygon, stretched when sx != sy.

Special cases: rhombus (sides = 4).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>PolygonOptions</code>](#module_primitiveGeometry..PolygonOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.polygonPath"></a>

### primitiveGeometry.polygonPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `polygon`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>PolygonPathOptions</code>](#module_primitiveGeometry..PolygonPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.reuleaux"></a>

### primitiveGeometry.reuleaux([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A Reuleaux polygon: a constant-width curve built from `sides` circular arcs,
each centered on the opposite vertex. Defaults to a Reuleaux triangle.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Parametric equations for regular and Reuleaux polygons](https://tpfto.wordpress.com/2011/09/15/parametric-equations-for-regular-and-reuleaux-polygons/)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>ReuleauxOptions</code>](#module_primitiveGeometry..ReuleauxOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.reuleauxPath"></a>

### primitiveGeometry.reuleauxPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `reuleaux`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>ReuleauxPathOptions</code>](#module_primitiveGeometry..ReuleauxPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.star"></a>

### primitiveGeometry.star([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A regular {points/density} star polygon: the default is a pentagram.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Star Polygon](https://mathworld.wolfram.com/StarPolygon.html)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>StarOptions</code>](#module_primitiveGeometry..StarOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.starPath"></a>

### primitiveGeometry.starPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `star`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>StarPathOptions</code>](#module_primitiveGeometry..StarPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.arbelos"></a>

### primitiveGeometry.arbelos([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

An arbelos: a semicircle minus 2 tangent semicircles on its diameter.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Arbelos](https://mathworld.wolfram.com/Arbelos.html)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>ArbelosOptions</code>](#module_primitiveGeometry..ArbelosOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lens"></a>

### primitiveGeometry.lens([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A lens: the overlap of 2 circles. Defaults to a vesica piscis.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**

- [Wolfram MathWorld – Lens](https://mathworld.wolfram.com/Lens.html)
- [Wolfram MathWorld – Vesica Piscis](https://mathworld.wolfram.com/VesicaPiscis.html)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>LensOptions</code>](#module_primitiveGeometry..LensOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lune"></a>

### primitiveGeometry.lune([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A lune: a big circle minus an offset small one.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Lune](https://mathworld.wolfram.com/Lune.html)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>LuneOptions</code>](#module_primitiveGeometry..LuneOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.salinon"></a>

### primitiveGeometry.salinon([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Archimedes' salinon: a shape bounded by 4 semicircles.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Salinon](https://mathworld.wolfram.com/Salinon.html)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SalinonOptions</code>](#module_primitiveGeometry..SalinonOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.triquetra"></a>

### primitiveGeometry.triquetra([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A triquetra: 3 interlaced lenses centered on an equilateral triangle.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Triquetra](https://mathworld.wolfram.com/Triquetra.html)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TriquetraOptions</code>](#module_primitiveGeometry..TriquetraOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.yinYang"></a>

### primitiveGeometry.yinYang([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A yin-yang (taijitu): a circle split by an S-curve, each half holed at the
other's bulge.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Yin-Yang](https://mathworld.wolfram.com/Yin-Yang.html)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>YinYangOptions</code>](#module_primitiveGeometry..YinYangOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.annulus"></a>

### primitiveGeometry.annulus([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

An annulus (ring): the region between two concentric circles.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>AnnulusOptions</code>](#module_primitiveGeometry..AnnulusOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.annulusPath"></a>

### primitiveGeometry.annulusPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `annulus`: 2 path cells, outer loop first.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>AnnulusPathOptions</code>](#module_primitiveGeometry..AnnulusPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.astroid"></a>

### primitiveGeometry.astroid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A 4-cusped hypocycloid: `superellipse` with m = n = 2/3.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Astroid](https://mathworld.wolfram.com/Astroid.html)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>AstroidOptions</code>](#module_primitiveGeometry..AstroidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.astroidPath"></a>

### primitiveGeometry.astroidPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `astroid`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>AstroidPathOptions</code>](#module_primitiveGeometry..AstroidPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.disc"></a>

### primitiveGeometry.disc([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A disc: `ellipse` with sx = sy = 1.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>DiscOptions</code>](#module_primitiveGeometry..DiscOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.circlePath"></a>

### primitiveGeometry.circlePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `disc`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>CirclePathOptions</code>](#module_primitiveGeometry..CirclePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.ellipse"></a>

### primitiveGeometry.ellipse([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

An ellipse (or circle when `sx = sy`).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>EllipseOptions</code>](#module_primitiveGeometry..EllipseOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.ellipsePath"></a>

### primitiveGeometry.ellipsePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `ellipse`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>EllipsePathOptions</code>](#module_primitiveGeometry..EllipsePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.squircle"></a>

### primitiveGeometry.squircle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A Fernández-Guasti squircle.

Special cases: circle (squareness → 0), square (squareness = 1).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Squircular Calculations – Chamberlain Fong](https://arxiv.org/vc/arxiv/papers/1604/1604.02174v1.pdf)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SquircleOptions</code>](#module_primitiveGeometry..SquircleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.squirclePath"></a>

### primitiveGeometry.squirclePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `squircle`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SquirclePathOptions</code>](#module_primitiveGeometry..SquirclePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.superellipse"></a>

### primitiveGeometry.superellipse([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A superellipse (Lamé curve).

Special cases: squircle (m = 4), rectellipse (m = 4, sx != sy), astroid (m =
2/3), diamond (m = 1), Piet Hein's superellipse (m = 5/2).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**

- [Wolfram MathWorld – Superellipse](https://mathworld.wolfram.com/Superellipse.html)
- [Wikipedia – Superellipse](https://en.wikipedia.org/wiki/Superellipse)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SuperellipseOptions</code>](#module_primitiveGeometry..SuperellipseOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.superellipsePath"></a>

### primitiveGeometry.superellipsePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `superellipse`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                       | Default         |
| --------- | ------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SuperellipsePathOptions</code>](#module_primitiveGeometry..SuperellipsePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hexagonalGrid"></a>

### primitiveGeometry.hexagonalGrid([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

A grid of regular hexagons.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>HexagonalGridOptions</code>](#module_primitiveGeometry..HexagonalGridOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.quadGrid"></a>

### primitiveGeometry.quadGrid([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

A grid of quads.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>QuadGridOptions</code>](#module_primitiveGeometry..QuadGridOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.triangularGrid"></a>

### primitiveGeometry.triangularGrid([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

An isometric grid of equilateral triangles.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                   | Default         |
| --------- | -------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TriangularGridOptions</code>](#module_primitiveGeometry..TriangularGridOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.kite"></a>

### primitiveGeometry.kite([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A kite: a rhombus with its bottom vertex pulled toward the center.

Special cases: rhombus (ratio = 1).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>KiteOptions</code>](#module_primitiveGeometry..KiteOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.kitePath"></a>

### primitiveGeometry.kitePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `kite`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>KitePathOptions</code>](#module_primitiveGeometry..KitePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lozenge"></a>

### primitiveGeometry.lozenge([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A lozenge: `rhombus` with sy = sx * 2.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>LozengeOptions</code>](#module_primitiveGeometry..LozengeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lozengePath"></a>

### primitiveGeometry.lozengePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `lozenge`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>LozengePathOptions</code>](#module_primitiveGeometry..LozengePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.parallelogram"></a>

### primitiveGeometry.parallelogram([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A parallelogram: `trapezoid` with `topRatio = 1`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>ParallelogramOptions</code>](#module_primitiveGeometry..ParallelogramOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.parallelogramPath"></a>

### primitiveGeometry.parallelogramPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `parallelogram`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                         | Default         |
| --------- | -------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>ParallelogramPathOptions</code>](#module_primitiveGeometry..ParallelogramPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.plane"></a>

### primitiveGeometry.plane([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A flat rectangular grid, facing `direction`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>PlaneOptions</code>](#module_primitiveGeometry..PlaneOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rectanglePath"></a>

### primitiveGeometry.rectanglePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `plane`, facing z.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>RectanglePathOptions</code>](#module_primitiveGeometry..RectanglePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.quad"></a>

### primitiveGeometry.quad([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A square, filled with 2 triangles.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>QuadOptions</code>](#module_primitiveGeometry..QuadOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.squarePath"></a>

### primitiveGeometry.squarePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `quad`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SquarePathOptions</code>](#module_primitiveGeometry..SquarePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rhombus"></a>

### primitiveGeometry.rhombus([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A rhombus: `polygon` with 4 sides, sx/sy scaling its diagonals.

Special cases: square rotated 45° (sx = sy).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>RhombusOptions</code>](#module_primitiveGeometry..RhombusOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rhombusPath"></a>

### primitiveGeometry.rhombusPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `rhombus`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>RhombusPathOptions</code>](#module_primitiveGeometry..RhombusPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.roundedRectangle"></a>

### primitiveGeometry.roundedRectangle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A rectangle with rounded corners.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                       | Default         |
| --------- | ------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>RoundedRectangleOptions</code>](#module_primitiveGeometry..RoundedRectangleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.roundedRectanglePath"></a>

### primitiveGeometry.roundedRectanglePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `roundedRectangle`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                               | Default         |
| --------- | -------------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>RoundedRectanglePathOptions</code>](#module_primitiveGeometry..RoundedRectanglePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.stadium"></a>

### primitiveGeometry.stadium([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A stadium (discorectangle): `roundedRectangle` with `radius` fixed to half
the shorter side.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>StadiumOptions</code>](#module_primitiveGeometry..StadiumOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.stadiumPath"></a>

### primitiveGeometry.stadiumPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `stadium`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>StadiumPathOptions</code>](#module_primitiveGeometry..StadiumPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.trapezoid"></a>

### primitiveGeometry.trapezoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A trapezoid with horizontal edges, swept CCW from the bottom-left corner.

Special cases: isosceles (topOffset = 0), parallelogram (topRatio = 1),
triangle (topRatio = 0).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Trapezoid](https://mathworld.wolfram.com/Trapezoid.html)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TrapezoidOptions</code>](#module_primitiveGeometry..TrapezoidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.trapezoidPath"></a>

### primitiveGeometry.trapezoidPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `trapezoid`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>TrapezoidPathOptions</code>](#module_primitiveGeometry..TrapezoidPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rightTriangle"></a>

### primitiveGeometry.rightTriangle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A right triangle: `triangle` with `apexOffset = -sx`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>RightTriangleOptions</code>](#module_primitiveGeometry..RightTriangleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rightTrianglePath"></a>

### primitiveGeometry.rightTrianglePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `rightTriangle`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                         | Default         |
| --------- | -------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>RightTrianglePathOptions</code>](#module_primitiveGeometry..RightTrianglePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.triangle"></a>

### primitiveGeometry.triangle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A triangle with a horizontal base, swept CCW from the bottom-left corner.

Special cases: isosceles (apexOffset = 0), right (apexOffset = ±sx), scalene
otherwise.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Triangle](https://mathworld.wolfram.com/Triangle.html)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TriangleOptions</code>](#module_primitiveGeometry..TriangleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.trianglePath"></a>

### primitiveGeometry.trianglePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `triangle`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TrianglePathOptions</code>](#module_primitiveGeometry..TrianglePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.cubePolygons"></a>

### primitiveGeometry.cubePolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Cuboid faces: 8 positions and 6 quads, ordered +x, -x, +y, -y, +z, -z.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>CubePolygonsOptions</code>](#module_primitiveGeometry..CubePolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.cube"></a>

### primitiveGeometry.cube([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A cuboid (rectangular box).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>CubeOptions</code>](#module_primitiveGeometry..CubeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hollowCube"></a>

### primitiveGeometry.hollowCube([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A cube with a square hole through each face, like a Menger sponge cell.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>HollowCubeOptions</code>](#module_primitiveGeometry..HollowCubeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.roundedCube"></a>

### primitiveGeometry.roundedCube([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A cuboid with rounded edges and corners.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>RoundedCubeOptions</code>](#module_primitiveGeometry..RoundedCubeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.antiprism"></a>

### primitiveGeometry.antiprism([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

An antiprism: a `prism` with its top rotated half a sector, joined by a band
of triangles.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>AntiprismOptions</code>](#module_primitiveGeometry..AntiprismOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.prism"></a>

### primitiveGeometry.prism([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A right prism: a regular polygon extruded with flat-shaded sides.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>PrismOptions</code>](#module_primitiveGeometry..PrismOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.apple"></a>

### primitiveGeometry.apple([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

An apple surface: the outer lobe of a spindle torus, dimpled at the poles.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Apple Surface](https://mathworld.wolfram.com/AppleSurface.html)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>AppleOptions</code>](#module_primitiveGeometry..AppleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.astroidalEllipsoid"></a>

### primitiveGeometry.astroidalEllipsoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

An astroidal ellipsoid: `superellipsoid` with n1 = n2 = 2/3, pinched to 6
cusps.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Astroidal Ellipsoid](https://mathworld.wolfram.com/AstroidalEllipsoid.html)

| Param     | Type                                                                                           | Default         |
| --------- | ---------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>AstroidalEllipsoidOptions</code>](#module_primitiveGeometry..AstroidalEllipsoidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.barrel"></a>

### primitiveGeometry.barrel([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A barrel: a cylinder bulging at the equator.

Special cases: cylinder (endRadius = radius), pinched (endRadius > radius).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                   | Default         |
| --------- | ---------------------------------------------------------------------- | --------------- |
| [options] | [<code>BarrelOptions</code>](#module_primitiveGeometry..BarrelOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.bicone"></a>

### primitiveGeometry.bicone([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Two cones joined base to base.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                   | Default         |
| --------- | ---------------------------------------------------------------------- | --------------- |
| [options] | [<code>BiconeOptions</code>](#module_primitiveGeometry..BiconeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.capsule"></a>

### primitiveGeometry.capsule([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A capsule: a cylinder capped with 2 hemispheres.

Special cases: open tube (roundSegments = 0).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>CapsuleOptions</code>](#module_primitiveGeometry..CapsuleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.cone"></a>

### primitiveGeometry.cone([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A right circular cone.

Special cases: open cone (capBase = false), elliptical cone (sx != sz).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>ConeOptions</code>](#module_primitiveGeometry..ConeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.cylinder"></a>

### primitiveGeometry.cylinder([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A right circular cylinder.

Special cases: tube (no caps), frustum (radiusApex != radiusBase), cone
(radiusApex = 0), elliptical cylinder (sxBase != szBase, sxApex != szApex).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>CylinderOptions</code>](#module_primitiveGeometry..CylinderOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.doubleCone"></a>

### primitiveGeometry.doubleCone([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Two cones joined apex to apex.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>DoubleConeOptions</code>](#module_primitiveGeometry..DoubleConeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.ellipsoid"></a>

### primitiveGeometry.ellipsoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

An ellipsoid, oblate by default.

Special cases: sphere (sx = sy = sz), prolate spheroid (sy > sx = sz).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>EllipsoidOptions</code>](#module_primitiveGeometry..EllipsoidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.funnel"></a>

### primitiveGeometry.funnel([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A funnel: a logarithmic profile from spout to mouth.

Special cases: cylinder (radiusApex = radiusBase).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Funnel](https://mathworld.wolfram.com/Funnel.html)

| Param     | Type                                                                   | Default         |
| --------- | ---------------------------------------------------------------------- | --------------- |
| [options] | [<code>FunnelOptions</code>](#module_primitiveGeometry..FunnelOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hollowCylinder"></a>

### primitiveGeometry.hollowCylinder([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A cylinder with a concentric bore. A `phi < TAU` cut is left open.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                   | Default         |
| --------- | -------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>HollowCylinderOptions</code>](#module_primitiveGeometry..HollowCylinderOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hollowSphere"></a>

### primitiveGeometry.hollowSphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A spherical shell. Defaults to a band, exposing the cavity.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>HollowSphereOptions</code>](#module_primitiveGeometry..HollowSphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hyperboloid"></a>

### primitiveGeometry.hyperboloid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A hyperboloid of one sheet.

Special cases: cylinder (endRadius = radius).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – One-Sheeted Hyperboloid](https://mathworld.wolfram.com/One-SheetedHyperboloid.html)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>HyperboloidOptions</code>](#module_primitiveGeometry..HyperboloidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lemon"></a>

### primitiveGeometry.lemon([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A lemon: a minor circular arc revolved about its chord, `apple`'s complement.

Special cases: sphere (height = radius * 2).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wikipedia – Lemon (geometry)](<https://en.wikipedia.org/wiki/Lemon_(geometry)>)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>LemonOptions</code>](#module_primitiveGeometry..LemonOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.paraboloid"></a>

### primitiveGeometry.paraboloid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A circular paraboloid, apex up.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Paraboloid](https://mathworld.wolfram.com/Paraboloid.html)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>ParaboloidOptions</code>](#module_primitiveGeometry..ParaboloidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.roundedCylinder"></a>

### primitiveGeometry.roundedCylinder([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A cylinder with filleted rims.

Special cases: cylinder (roundRadius = 0), capsule (roundRadius = radius).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                     | Default         |
| --------- | ---------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>RoundedCylinderOptions</code>](#module_primitiveGeometry..RoundedCylinderOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.sphere"></a>

### primitiveGeometry.sphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A sphere: `ellipsoid` with sx = sy = 1.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                   | Default         |
| --------- | ---------------------------------------------------------------------- | --------------- |
| [options] | [<code>SphereOptions</code>](#module_primitiveGeometry..SphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.sphericalRing"></a>

### primitiveGeometry.sphericalRing([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A spherical ring (napkin ring): a sphere with a cylindrical bore.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Spherical Ring](https://mathworld.wolfram.com/SphericalRing.html)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SphericalRingOptions</code>](#module_primitiveGeometry..SphericalRingOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.sphericon"></a>

### primitiveGeometry.sphericon([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A sphericon: a bicone split through its apexes, one half turned 90°.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Sphericon](https://mathworld.wolfram.com/Sphericon.html)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SphericonOptions</code>](#module_primitiveGeometry..SphericonOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.superegg"></a>

### primitiveGeometry.superegg([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Piet Hein's superegg: a superellipsoid of revolution.

Special cases: spheroid (n = 2).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**

- [Wolfram MathWorld – Superegg](https://mathworld.wolfram.com/Superegg.html)
- [Wikipedia – Superegg](https://en.wikipedia.org/wiki/Superegg)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SupereggOptions</code>](#module_primitiveGeometry..SupereggOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.superellipsoid"></a>

### primitiveGeometry.superellipsoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A superellipsoid: n > 2 rounds toward a box, n < 2 pinches.

Special cases: ellipsoid (n1 = n2 = 2), octahedron (n1 = n2 = 1), astroidal
ellipsoid (n1 = n2 = 2/3), superegg-like (n2 = 2, sx = sz).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**

- [Wolfram MathWorld – Superellipsoid](https://mathworld.wolfram.com/Superellipsoid.html)
- [Wikipedia – Superellipsoid](https://en.wikipedia.org/wiki/Superellipsoid)

| Param     | Type                                                                                   | Default         |
| --------- | -------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SuperellipsoidOptions</code>](#module_primitiveGeometry..SuperellipsoidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.torus"></a>

### primitiveGeometry.torus([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A ring torus.

Special cases: open torus (phi < TAU), elliptical torus (sx != sy),
elliptical tube (minorSx != minorSy).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>TorusOptions</code>](#module_primitiveGeometry..TorusOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.dodecasphere"></a>

### primitiveGeometry.dodecasphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere from a subdivided dodecahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>DodecasphereOptions</code>](#module_primitiveGeometry..DodecasphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hexasphere"></a>

### primitiveGeometry.hexasphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere from a subdivided cube.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>HexasphereOptions</code>](#module_primitiveGeometry..HexasphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.icosphere"></a>

### primitiveGeometry.icosphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere from a subdivided icosahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>IcosphereOptions</code>](#module_primitiveGeometry..IcosphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.octasphere"></a>

### primitiveGeometry.octasphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere from a subdivided octahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>OctasphereOptions</code>](#module_primitiveGeometry..OctasphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.tetrasphere"></a>

### primitiveGeometry.tetrasphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere from a subdivided tetrahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TetrasphereOptions</code>](#module_primitiveGeometry..TetrasphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.dodecahedronPolygons"></a>

### primitiveGeometry.dodecahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Regular dodecahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                               | Default         |
| --------- | -------------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>DodecahedronPolygonsOptions</code>](#module_primitiveGeometry..DodecahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.dodecahedron"></a>

### primitiveGeometry.dodecahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Regular dodecahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>DodecahedronOptions</code>](#module_primitiveGeometry..DodecahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.greatDodecahedronPolygons"></a>

### primitiveGeometry.greatDodecahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Great dodecahedron faces: on the icosahedron's vertices, one pentagon per
vertex's 5 neighbors.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                         | Default         |
| --------- | ------------------------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>GreatDodecahedronPolygonsOptions</code>](#module_primitiveGeometry..GreatDodecahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.greatDodecahedron"></a>

### primitiveGeometry.greatDodecahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Great dodecahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                         | Default         |
| --------- | -------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>GreatDodecahedronOptions</code>](#module_primitiveGeometry..GreatDodecahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.greatIcosahedronPolygons"></a>

### primitiveGeometry.greatIcosahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Great icosahedron faces: on the icosahedron's vertices, each triangle joining
second-nearest neighbors.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                       | Default         |
| --------- | ---------------------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>GreatIcosahedronPolygonsOptions</code>](#module_primitiveGeometry..GreatIcosahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.greatIcosahedron"></a>

### primitiveGeometry.greatIcosahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Great icosahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                       | Default         |
| --------- | ------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>GreatIcosahedronOptions</code>](#module_primitiveGeometry..GreatIcosahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.greatStellatedDodecahedronPolygons"></a>

### primitiveGeometry.greatStellatedDodecahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Great stellated dodecahedron faces: the dodecahedron's outermost stellation.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>GreatStellatedDodecahedronPolygonsOptions</code>](#module_primitiveGeometry..GreatStellatedDodecahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.greatStellatedDodecahedron"></a>

### primitiveGeometry.greatStellatedDodecahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Great stellated dodecahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                           | Default         |
| --------- | -------------------------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>GreatStellatedDodecahedronOptions</code>](#module_primitiveGeometry..GreatStellatedDodecahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hexahedronPolygons"></a>

### primitiveGeometry.hexahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Regular hexahedron (cube) faces, ordered +x, -x, +y, -y, +z, -z.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                           | Default         |
| --------- | ---------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>HexahedronPolygonsOptions</code>](#module_primitiveGeometry..HexahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hexahedron"></a>

### primitiveGeometry.hexahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Regular hexahedron (cube).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>HexahedronOptions</code>](#module_primitiveGeometry..HexahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.icosahedronPolygons"></a>

### primitiveGeometry.icosahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Regular icosahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                             | Default         |
| --------- | ------------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>IcosahedronPolygonsOptions</code>](#module_primitiveGeometry..IcosahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.icosahedron"></a>

### primitiveGeometry.icosahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Regular icosahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>IcosahedronOptions</code>](#module_primitiveGeometry..IcosahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.octahedronPolygons"></a>

### primitiveGeometry.octahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Regular octahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                           | Default         |
| --------- | ---------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>OctahedronPolygonsOptions</code>](#module_primitiveGeometry..OctahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.octahedron"></a>

### primitiveGeometry.octahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Regular octahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>OctahedronOptions</code>](#module_primitiveGeometry..OctahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.smallStellatedDodecahedronPolygons"></a>

### primitiveGeometry.smallStellatedDodecahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Small stellated dodecahedron faces: the great dodecahedron's, as pentagrams.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SmallStellatedDodecahedronPolygonsOptions</code>](#module_primitiveGeometry..SmallStellatedDodecahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.smallStellatedDodecahedron"></a>

### primitiveGeometry.smallStellatedDodecahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Small stellated dodecahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                           | Default         |
| --------- | -------------------------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SmallStellatedDodecahedronOptions</code>](#module_primitiveGeometry..SmallStellatedDodecahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.tetrahedronPolygons"></a>

### primitiveGeometry.tetrahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Regular tetrahedron, apex-up, bounding box centered at the origin.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                             | Default         |
| --------- | ------------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>TetrahedronPolygonsOptions</code>](#module_primitiveGeometry..TetrahedronPolygonsOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.tetrahedron"></a>

### primitiveGeometry.tetrahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Regular tetrahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TetrahedronOptions</code>](#module_primitiveGeometry..TetrahedronOptions) | <code>{}</code> |

<a name="module_primitiveGeometry..CrossOptions"></a>

### primitiveGeometry~CrossOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          | Distance from the center to each arm's tip.                                                  |
| [armWidth]      | <code>number</code>                              | <code>radius/3</code>                                     | Half-width of each arm. The default makes 5 equal squares.                                   |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            | Hole radius, traced as a scaled cross. `0` fills to the center.                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code>                         |                                                                                              |

<a name="module_primitiveGeometry..CrossPathOptions"></a>

### primitiveGeometry~CrossPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default               |
| -------------- | ------------------------------------------------ | --------------------- |
| [radius]       | <code>number</code>                              | <code>0.5</code>      |
| [armWidth]     | <code>number</code>                              | <code>radius/3</code> |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>        |
| [closed]       | <code>boolean</code>                             | <code>false</code>    |

<a name="module_primitiveGeometry..PolygonOptions"></a>

### primitiveGeometry~PolygonOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sides]         | [<code>PositiveInteger</code>](#PositiveInteger) | <code>6</code>                                            |                                                                                              |
| [sx]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [sy]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.concentric</code>                          |                                                                                              |

<a name="module_primitiveGeometry..PolygonPathOptions"></a>

### primitiveGeometry~PolygonPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default            |
| -------------- | ------------------------------------------------ | ------------------ |
| [sides]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>6</code>     |
| [sx]           | <code>number</code>                              | <code>1</code>     |
| [sy]           | <code>number</code>                              | <code>1</code>     |
| [radius]       | <code>number</code>                              | <code>0.5</code>   |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>     |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]       | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..ReuleauxOptions"></a>

### primitiveGeometry~ReuleauxOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sides]         | [<code>PositiveInteger</code>](#PositiveInteger) | <code>3</code>                                            |                                                                                              |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                                           |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.concentric</code>                          |                                                                                              |

<a name="module_primitiveGeometry..ReuleauxPathOptions"></a>

### primitiveGeometry~ReuleauxPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default            |
| ------------- | ------------------------------------------------ | ------------------ |
| [sides]       | [<code>PositiveInteger</code>](#PositiveInteger) | <code>3</code>     |
| [radius]      | <code>number</code>                              | <code>0.5</code>   |
| [segments]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>    |
| [theta]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]      | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..StarOptions"></a>

### primitiveGeometry~StarOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [points]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>5</code>                                            |                                                                                              |
| [density]       | [<code>PositiveInteger</code>](#PositiveInteger) | <code>2</code>                                            | Schläfli skip factor: `< points / 2`, coprime with `points` for a non-compound star.         |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [notchRadius]   | <code>number</code>                              | <code>radius*computeStarRatio(points,density)</code>      | Radius of the concave vertices between tips.                                                 |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            | Hole radius. `0` fills to the center.                                                        |
| [circularHole]  | <code>boolean</code>                             | <code>false</code>                                        | Trace the hole as a circle instead of a scaled star.                                         |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.concentric</code>                          |                                                                                              |

<a name="module_primitiveGeometry..StarPathOptions"></a>

### primitiveGeometry~StarPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default                                              |
| -------------- | ------------------------------------------------ | ---------------------------------------------------- |
| [points]       | [<code>PositiveInteger</code>](#PositiveInteger) | <code>5</code>                                       |
| [density]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>2</code>                                       |
| [radius]       | <code>number</code>                              | <code>0.5</code>                                     |
| [notchRadius]  | <code>number</code>                              | <code>radius*computeStarRatio(points,density)</code> |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                       |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                     |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>0</code>                                       |
| [closed]       | <code>boolean</code>                             | <code>false</code>                                   |

<a name="module_primitiveGeometry..ArbelosOptions"></a>

### primitiveGeometry~ArbelosOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                           | Description                                                 |
| --------------- | ------------------------------------------------ | --------------------------------- | ----------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>                  | Outer semicircle radius.                                    |
| [innerRadius]   | <code>number</code>                              | <code>radius*0.25</code>          | Left inner semicircle radius. The right one fills the rest. |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   | Columns, left to right.                                     |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   | Rows between the bottom and top boundaries.                 |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code> | Use `uRatio`/`vRatio` to follow the arcs.                   |

<a name="module_primitiveGeometry..LensOptions"></a>

### primitiveGeometry~LensOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                           | Description                                 |
| --------------- | ------------------------------------------------ | --------------------------------- | ------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>                  | First circle radius.                        |
| [radius2]       | <code>number</code>                              | <code>radius</code>               | Second circle radius.                       |
| [distance]      | <code>number</code>                              | <code>radius</code>               | Distance between centers.                   |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   | Columns, left to right.                     |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   | Rows between the bottom and top boundaries. |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code> | Use `uRatio`/`vRatio` to follow the arcs.   |

<a name="module_primitiveGeometry..LuneOptions"></a>

### primitiveGeometry~LuneOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                           | Description                                                                            |
| --------------- | ------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>                  | Big circle radius.                                                                     |
| [innerRadius]   | <code>number</code>                              | <code>radius</code>               | Small circle radius.                                                                   |
| [distance]      | <code>number</code>                              | <code>radius*0.5</code>           | Small circle center offset along +x. `distance + innerRadius > radius` for a crescent. |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   | Columns, left to right.                                                                |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   | Rows between each half's boundaries.                                                   |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code> | Use `uRatio`/`vRatio` to follow the arcs.                                              |

<a name="module_primitiveGeometry..SalinonOptions"></a>

### primitiveGeometry~SalinonOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                           | Description                                 |
| --------------- | ------------------------------------------------ | --------------------------------- | ------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>                  | Bottom semicircle radius.                   |
| [innerRadius]   | <code>number</code>                              | <code>radius*0.25</code>          | Top central semicircle radius.              |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   | Columns, left to right.                     |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   | Rows between the bottom and top boundaries. |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code> | Use `uRatio`/`vRatio` to follow the arcs.   |

<a name="module_primitiveGeometry..TriquetraOptions"></a>

### primitiveGeometry~TriquetraOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                           | Description                                                |
| --------------- | ------------------------------------------------ | --------------------------------- | ---------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>                  | Radius of each circle, and distance between their centers. |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   | Angular columns per piece.                                 |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   | Rows between the two boundaries.                           |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code> | Use `uRatio`/`vRatio` to follow the arcs.                  |

<a name="module_primitiveGeometry..YinYangOptions"></a>

### primitiveGeometry~YinYangOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                                                                               | Default                           | Description                               |
| --------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------- |
| [radius]        | <code>number</code>                                                                                | <code>0.5</code>                  | Radius of the enclosing circle.           |
| [dotRadius]     | <code>number</code>                                                                                | <code>radius/6</code>             | Dot hole radius. `0` omits it.            |
| [part]          | <code>&quot;yin&quot;</code> \| <code>&quot;yang&quot;</code> \| <code>&quot;yin-yang&quot;</code> | <code>&quot;yin-yang&quot;</code> | One half, or both merged in one mesh.     |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger)                                                   | <code>32</code>                   | Rows along the outer circle and S-curve.  |
| [holeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger)                                                   | <code>16</code>                   | Rows along a dot hole.                    |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger)                                                   | <code>16</code>                   | Columns on each side of a dot hole.       |
| [mapping]       | <code>MappingFn</code>                                                                             | <code>mappings.rectangular</code> | Use `uRatio`/`vRatio` to follow the arcs. |

<a name="module_primitiveGeometry..AnnulusOptions"></a>

### primitiveGeometry~AnnulusOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                          | Description                                                                                  |
| --------------- | ------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                   |                                                                                              |
| [sy]            | <code>number</code>                              | <code>1</code>                   |                                                                                              |
| [radius]        | <code>number</code>                              | <code>0.5</code>                 |                                                                                              |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                  |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                  |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                 |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                   |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>radius * 0.5</code>        |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.concentric</code> |                                                                                              |

<a name="module_primitiveGeometry..AnnulusPathOptions"></a>

### primitiveGeometry~AnnulusPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default                   |
| ------------- | ------------------------------------------------ | ------------------------- |
| [sx]          | <code>number</code>                              | <code>1</code>            |
| [sy]          | <code>number</code>                              | <code>1</code>            |
| [radius]      | <code>number</code>                              | <code>0.5</code>          |
| [segments]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>           |
| [theta]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>          |
| [thetaOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>            |
| [innerRadius] | <code>number</code>                              | <code>radius * 0.5</code> |
| [closed]      | <code>boolean</code>                             | <code>false</code>        |

<a name="module_primitiveGeometry..AstroidOptions"></a>

### primitiveGeometry~AstroidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                                           |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.lamé</code>                                |                                                                                              |

<a name="module_primitiveGeometry..AstroidPathOptions"></a>

### primitiveGeometry~AstroidPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default            |
| ------------- | ------------------------------------------------ | ------------------ |
| [radius]      | <code>number</code>                              | <code>0.5</code>   |
| [segments]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>    |
| [theta]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]      | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..DiscOptions"></a>

### primitiveGeometry~DiscOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                                           |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.concentric</code>                          |                                                                                              |

<a name="module_primitiveGeometry..CirclePathOptions"></a>

### primitiveGeometry~CirclePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default            |
| ------------- | ------------------------------------------------ | ------------------ |
| [radius]      | <code>number</code>                              | <code>0.5</code>   |
| [segments]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>    |
| [theta]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]      | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..EllipseOptions"></a>

### primitiveGeometry~EllipseOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [sy]            | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                                           |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            | Hole radius. `0` fills to the center.                                                        |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.elliptical</code>                          |                                                                                              |
| [equation]      | <code>EllipseEquationFn</code>                   |                                                           | Sample to [x, y] position. Defaults to the ellipse's arc.                                    |

<a name="module_primitiveGeometry..EllipseEquationFn"></a>

### primitiveGeometry~EllipseEquationFn ⇒ <code>[x, y]</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param           | Type                | Description                                |
| --------------- | ------------------- | ------------------------------------------ |
| sample          | <code>object</code> |                                            |
| sample.rx       | <code>number</code> | Scaled ring radius along x                 |
| sample.ry       | <code>number</code> | Scaled ring radius along y                 |
| sample.cosTheta | <code>number</code> |                                            |
| sample.sinTheta | <code>number</code> |                                            |
| sample.s        | <code>number</code> | Radius ratio (0..1, innerRadius to radius) |
| sample.t        | <code>number</code> | Angle                                      |

<a name="module_primitiveGeometry..EllipsePathOptions"></a>

### primitiveGeometry~EllipsePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default            |
| ------------- | ------------------------------------------------ | ------------------ |
| [sx]          | <code>number</code>                              | <code>1</code>     |
| [sy]          | <code>number</code>                              | <code>0.5</code>   |
| [radius]      | <code>number</code>                              | <code>0.5</code>   |
| [segments]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>    |
| [theta]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]      | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..SquircleOptions"></a>

### primitiveGeometry~SquircleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [sy]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>128</code>                                          |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.fgSquircular</code>                        |                                                                                              |
| [squareness]    | <code>number</code>                              | <code>0.95</code>                                         | In (0, 1]                                                                                    |

<a name="module_primitiveGeometry..SquirclePathOptions"></a>

### primitiveGeometry~SquirclePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default            |
| ------------- | ------------------------------------------------ | ------------------ |
| [sx]          | <code>number</code>                              | <code>1</code>     |
| [sy]          | <code>number</code>                              | <code>1</code>     |
| [radius]      | <code>number</code>                              | <code>0.5</code>   |
| [segments]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>128</code>   |
| [theta]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [squareness]  | <code>number</code>                              | <code>0.95</code>  |
| [closed]      | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..SuperellipseOptions"></a>

### primitiveGeometry~SuperellipseOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [sy]            | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [segments]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                                           |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.lamé</code>                                |                                                                                              |
| [m]             | <code>number</code>                              | <code>2</code>                                            |                                                                                              |
| [n]             | <code>number</code>                              | <code>m</code>                                            |                                                                                              |

<a name="module_primitiveGeometry..SuperellipsePathOptions"></a>

### primitiveGeometry~SuperellipsePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default            |
| ------------- | ------------------------------------------------ | ------------------ |
| [sx]          | <code>number</code>                              | <code>1</code>     |
| [sy]          | <code>number</code>                              | <code>0.5</code>   |
| [radius]      | <code>number</code>                              | <code>0.5</code>   |
| [segments]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>    |
| [theta]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [m]           | <code>number</code>                              | <code>2</code>     |
| [n]           | <code>number</code>                              | <code>m</code>     |
| [closed]      | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..HexagonalGridOptions"></a>

### primitiveGeometry~HexagonalGridOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                                             | Default           |
| ----------- | ------------------------------------------------ | ----------------- |
| [sx]        | <code>number</code>                              | <code>1</code>    |
| [nx]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>10</code>   |
| [ny]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>10</code>   |
| [inscribed] | <code>boolean</code>                             | <code>true</code> |

<a name="module_primitiveGeometry..QuadGridOptions"></a>

### primitiveGeometry~QuadGridOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name | Type                                             | Default         |
| ---- | ------------------------------------------------ | --------------- |
| [sx] | <code>number</code>                              | <code>1</code>  |
| [sy] | <code>number</code>                              | <code>sx</code> |
| [nx] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>10</code> |
| [ny] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>nx</code> |

<a name="module_primitiveGeometry..TriangularGridOptions"></a>

### primitiveGeometry~TriangularGridOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                                             | Default           |
| ----------- | ------------------------------------------------ | ----------------- |
| [sx]        | <code>number</code>                              | <code>1</code>    |
| [nx]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>10</code>   |
| [ny]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>10</code>   |
| [inscribed] | <code>boolean</code>                             | <code>true</code> |

<a name="module_primitiveGeometry..KiteOptions"></a>

### primitiveGeometry~KiteOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [sy]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [ratio]         | <code>number</code>                              | <code>0.5</code>                                          | Bottom vertex distance from the center, as a fraction of the top's.                          |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>HALF_PI</code>                                      |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.concentric</code>                          |                                                                                              |

<a name="module_primitiveGeometry..KitePathOptions"></a>

### primitiveGeometry~KitePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default              |
| -------------- | ------------------------------------------------ | -------------------- |
| [sx]           | <code>number</code>                              | <code>1</code>       |
| [sy]           | <code>number</code>                              | <code>1</code>       |
| [ratio]        | <code>number</code>                              | <code>0.5</code>     |
| [radius]       | <code>number</code>                              | <code>0.5</code>     |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>       |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>     |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>HALF_PI</code> |
| [closed]       | <code>boolean</code>                             | <code>false</code>   |

<a name="module_primitiveGeometry..LozengeOptions"></a>

### primitiveGeometry~LozengeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [sy]            | <code>number</code>                              | <code>sx*2</code>                                         |                                                                                              |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>HALF_PI</code>                                      |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.concentric</code>                          |                                                                                              |

<a name="module_primitiveGeometry..LozengePathOptions"></a>

### primitiveGeometry~LozengePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default              |
| -------------- | ------------------------------------------------ | -------------------- |
| [sx]           | <code>number</code>                              | <code>0.5</code>     |
| [sy]           | <code>number</code>                              | <code>sx*2</code>    |
| [radius]       | <code>number</code>                              | <code>0.5</code>     |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>       |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>     |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>HALF_PI</code> |
| [closed]       | <code>boolean</code>                             | <code>false</code>   |

<a name="module_primitiveGeometry..ParallelogramOptions"></a>

### primitiveGeometry~ParallelogramOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [sy]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [shear]         | <code>number</code>                              | <code>0.3</code>                                          | Horizontal shift of the top edge.                                                            |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code>                         |                                                                                              |

<a name="module_primitiveGeometry..ParallelogramPathOptions"></a>

### primitiveGeometry~ParallelogramPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default            |
| -------------- | ------------------------------------------------ | ------------------ |
| [sx]           | <code>number</code>                              | <code>0.5</code>   |
| [sy]           | <code>number</code>                              | <code>1</code>     |
| [shear]        | <code>number</code>                              | <code>0.3</code>   |
| [radius]       | <code>number</code>                              | <code>0.5</code>   |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>     |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]       | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..PlaneOptions"></a>

### primitiveGeometry~PlaneOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                                                                     | Default                    |
| ----------- | ------------------------------------------------------------------------ | -------------------------- |
| [sx]        | <code>number</code>                                                      | <code>1</code>             |
| [sy]        | <code>number</code>                                                      | <code>sx</code>            |
| [nx]        | [<code>PositiveInteger</code>](#PositiveInteger)                         | <code>1</code>             |
| [ny]        | [<code>PositiveInteger</code>](#PositiveInteger)                         | <code>nx</code>            |
| [direction] | [<code>PlaneDirection</code>](#module_primitiveGeometry..PlaneDirection) | <code>&quot;z&quot;</code> |

<a name="module_primitiveGeometry..PlaneDirection"></a>

### primitiveGeometry~PlaneDirection : <code>&quot;x&quot;</code> \| <code>&quot;-x&quot;</code> \| <code>&quot;y&quot;</code> \| <code>&quot;-y&quot;</code> \| <code>&quot;z&quot;</code> \| <code>&quot;-z&quot;</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
<a name="module_primitiveGeometry..RectanglePathOptions"></a>

### primitiveGeometry~RectanglePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name | Type                                             | Default          | Description                         |
| ---- | ------------------------------------------------ | ---------------- | ----------------------------------- |
| [sx] | <code>number</code>                              | <code>1</code>   |                                     |
| [sy] | <code>number</code>                              | <code>0.5</code> |                                     |
| [nx] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>   | Segments along the bottom/top edges |
| [ny] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>nx</code>  | Segments along the left/right edges |

<a name="module_primitiveGeometry..QuadOptions"></a>

### primitiveGeometry~QuadOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name    | Type                | Default        | Description  |
| ------- | ------------------- | -------------- | ------------ |
| [scale] | <code>number</code> | <code>1</code> | Side length. |

<a name="module_primitiveGeometry..SquarePathOptions"></a>

### primitiveGeometry~SquarePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name    | Type                                             | Default         | Description                         |
| ------- | ------------------------------------------------ | --------------- | ----------------------------------- |
| [scale] | <code>number</code>                              | <code>1</code>  | Side length.                        |
| [nx]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>  | Segments along the bottom/top edges |
| [ny]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>nx</code> | Segments along the left/right edges |

<a name="module_primitiveGeometry..RhombusOptions"></a>

### primitiveGeometry~RhombusOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [sy]            | <code>number</code>                              | <code>1</code>                                            |                                                                                              |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>HALF_PI</code>                                      |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.concentric</code>                          |                                                                                              |

<a name="module_primitiveGeometry..RhombusPathOptions"></a>

### primitiveGeometry~RhombusPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default              |
| -------------- | ------------------------------------------------ | -------------------- |
| [sx]           | <code>number</code>                              | <code>1</code>       |
| [sy]           | <code>number</code>                              | <code>1</code>       |
| [radius]       | <code>number</code>                              | <code>0.5</code>     |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>       |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>     |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>HALF_PI</code> |
| [closed]       | <code>boolean</code>                             | <code>false</code>   |

<a name="module_primitiveGeometry..RoundedRectangleCorner"></a>

### primitiveGeometry~RoundedRectangleCorner : <code>&quot;top-left&quot;</code> \| <code>&quot;top-right&quot;</code> \| <code>&quot;bottom-right&quot;</code> \| <code>&quot;bottom-left&quot;</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
<a name="module_primitiveGeometry..RoundedRectangleOptions"></a>

### primitiveGeometry~RoundedRectangleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name             | Type                                                                                                   | Default                                                                                                       | Description                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [sx]             | <code>number</code>                                                                                    | <code>1</code>                                                                                                |                                                  |
| [sy]             | <code>number</code>                                                                                    | <code>sx</code>                                                                                               |                                                  |
| [radius]         | <code>number</code>                                                                                    | <code>sx * 0.25</code>                                                                                        |                                                  |
| [roundSegments]  | [<code>PositiveInteger</code>](#PositiveInteger)                                                       | <code>8</code>                                                                                                |                                                  |
| [nx]             | [<code>PositiveInteger</code>](#PositiveInteger)                                                       | <code>1</code>                                                                                                | Segments along the straight top/bottom sections. |
| [ny]             | [<code>PositiveInteger</code>](#PositiveInteger)                                                       | <code>nx</code>                                                                                               | Segments along the straight left/right sections. |
| [roundedCorners] | [<code>Array.&lt;RoundedRectangleCorner&gt;</code>](#module_primitiveGeometry..RoundedRectangleCorner) | <code>[&quot;top-left&quot;, &quot;top-right&quot;, &quot;bottom-right&quot;, &quot;bottom-left&quot;]</code> |                                                  |

<a name="module_primitiveGeometry..RoundedRectanglePathOptions"></a>

### primitiveGeometry~RoundedRectanglePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name             | Type                                                                                                   | Default                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [sx]             | <code>number</code>                                                                                    | <code>1</code>                                                                                                |
| [sy]             | <code>number</code>                                                                                    | <code>sx</code>                                                                                               |
| [radius]         | <code>number</code>                                                                                    | <code>sx * 0.25</code>                                                                                        |
| [roundSegments]  | [<code>PositiveInteger</code>](#PositiveInteger)                                                       | <code>8</code>                                                                                                |
| [nx]             | [<code>PositiveInteger</code>](#PositiveInteger)                                                       | <code>1</code>                                                                                                |
| [ny]             | [<code>PositiveInteger</code>](#PositiveInteger)                                                       | <code>nx</code>                                                                                               |
| [roundedCorners] | [<code>Array.&lt;RoundedRectangleCorner&gt;</code>](#module_primitiveGeometry..RoundedRectangleCorner) | <code>[&quot;top-left&quot;, &quot;top-right&quot;, &quot;bottom-right&quot;, &quot;bottom-left&quot;]</code> |
| [closed]         | <code>boolean</code>                                                                                   | <code>false</code>                                                                                            |

<a name="module_primitiveGeometry..StadiumOptions"></a>

### primitiveGeometry~StadiumOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default          |
| --------------- | ------------------------------------------------ | ---------------- |
| [sx]            | <code>number</code>                              | <code>1</code>   |
| [sy]            | <code>number</code>                              | <code>0.5</code> |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>   |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>nx</code>  |
| [roundSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>8</code>   |

<a name="module_primitiveGeometry..StadiumPathOptions"></a>

### primitiveGeometry~StadiumPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default            |
| --------------- | ------------------------------------------------ | ------------------ |
| [sx]            | <code>number</code>                              | <code>1</code>     |
| [sy]            | <code>number</code>                              | <code>0.5</code>   |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>nx</code>    |
| [roundSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>8</code>     |
| [closed]        | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..TrapezoidOptions"></a>

### primitiveGeometry~TrapezoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                                            | Bottom edge half-width.                                                                      |
| [sy]            | <code>number</code>                              | <code>1</code>                                            | Half-height.                                                                                 |
| [topRatio]      | <code>number</code>                              | <code>0.5</code>                                          | Top edge half-width, as a fraction of `sx`.                                                  |
| [topOffset]     | <code>number</code>                              | <code>0</code>                                            | Horizontal shift of the top edge.                                                            |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          | Negative values aren't supported.                                                            |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code>                         |                                                                                              |

<a name="module_primitiveGeometry..TrapezoidPathOptions"></a>

### primitiveGeometry~TrapezoidPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default            |
| -------------- | ------------------------------------------------ | ------------------ |
| [sx]           | <code>number</code>                              | <code>1</code>     |
| [sy]           | <code>number</code>                              | <code>1</code>     |
| [topRatio]     | <code>number</code>                              | <code>0.5</code>   |
| [topOffset]    | <code>number</code>                              | <code>0</code>     |
| [radius]       | <code>number</code>                              | <code>0.5</code>   |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>     |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]       | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..RightTriangleOptions"></a>

### primitiveGeometry~RightTriangleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                                            | Horizontal leg half-length.                                                                  |
| [sy]            | <code>number</code>                              | <code>1</code>                                            | Vertical leg half-length.                                                                    |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          |                                                                                              |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code>                         |                                                                                              |

<a name="module_primitiveGeometry..RightTrianglePathOptions"></a>

### primitiveGeometry~RightTrianglePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default            |
| -------------- | ------------------------------------------------ | ------------------ |
| [sx]           | <code>number</code>                              | <code>1</code>     |
| [sy]           | <code>number</code>                              | <code>1</code>     |
| [radius]       | <code>number</code>                              | <code>0.5</code>   |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>     |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]       | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..TriangleOptions"></a>

### primitiveGeometry~TriangleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                                                   | Description                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>                              | <code>1</code>                                            | Base half-width.                                                                             |
| [sy]            | <code>number</code>                              | <code>1</code>                                            | Half-height.                                                                                 |
| [apexOffset]    | <code>number</code>                              | <code>0</code>                                            | Horizontal apex shift.                                                                       |
| [radius]        | <code>number</code>                              | <code>0.5</code>                                          |                                                                                              |
| [edgeSegments]  | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                                            |                                                                                              |
| [innerSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                                           |                                                                                              |
| [innerRadius]   | <code>number</code>                              | <code>0</code>                                            |                                                                                              |
| [theta]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                                          | Negative values aren't supported.                                                            |
| [thetaOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                                            |                                                                                              |
| [mergeCentroid] | <code>boolean</code>                             | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                              |
| [mergeSeam]     | <code>boolean</code>                             | <code>true</code>                                         | `false` splits the full turn's wrap edge for mappings wrapping there (eg. `mappings.polar`). |
| [mapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code>                         |                                                                                              |

<a name="module_primitiveGeometry..TrianglePathOptions"></a>

### primitiveGeometry~TrianglePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default            |
| -------------- | ------------------------------------------------ | ------------------ |
| [sx]           | <code>number</code>                              | <code>1</code>     |
| [sy]           | <code>number</code>                              | <code>1</code>     |
| [apexOffset]   | <code>number</code>                              | <code>0</code>     |
| [radius]       | <code>number</code>                              | <code>0.5</code>   |
| [edgeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>     |
| [theta]        | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |
| [thetaOffset]  | [<code>Angle</code>](#Angle)                     | <code>0</code>     |
| [closed]       | <code>boolean</code>                             | <code>false</code> |

<a name="module_primitiveGeometry..CubePolygonsOptions"></a>

### primitiveGeometry~CubePolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name | Type                | Default         |
| ---- | ------------------- | --------------- |
| [sx] | <code>number</code> | <code>1</code>  |
| [sy] | <code>number</code> | <code>sx</code> |
| [sz] | <code>number</code> | <code>sx</code> |

<a name="module_primitiveGeometry..CubeOptions"></a>

### primitiveGeometry~CubeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name | Type                                             | Default         |
| ---- | ------------------------------------------------ | --------------- |
| [sx] | <code>number</code>                              | <code>1</code>  |
| [sy] | <code>number</code>                              | <code>sx</code> |
| [sz] | <code>number</code>                              | <code>sx</code> |
| [nx] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>  |
| [ny] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>nx</code> |
| [nz] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>nx</code> |

<a name="module_primitiveGeometry..HollowCubeOptions"></a>

### primitiveGeometry~HollowCubeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                | Default             | Description                                     |
| ----------- | ------------------- | ------------------- | ----------------------------------------------- |
| [sx]        | <code>number</code> | <code>1</code>      |                                                 |
| [sy]        | <code>number</code> | <code>sx</code>     |                                                 |
| [sz]        | <code>number</code> | <code>sx</code>     |                                                 |
| [thickness] | <code>number</code> | <code>sx*0.2</code> | Beam size, below half the smallest of sx/sy/sz. |

<a name="module_primitiveGeometry..RoundedCubeDirection"></a>

### primitiveGeometry~RoundedCubeDirection : <code>&quot;all&quot;</code> \| <code>&quot;x&quot;</code> \| <code>&quot;y&quot;</code> \| <code>&quot;z&quot;</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
<a name="module_primitiveGeometry..RoundedCubeOptions"></a>

### primitiveGeometry~RoundedCubeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name             | Type                                                                                 | Default                      | Description                             |
| ---------------- | ------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------- |
| [sx]             | <code>number</code>                                                                  | <code>1</code>               |                                         |
| [sy]             | <code>number</code>                                                                  | <code>sx</code>              |                                         |
| [sz]             | <code>number</code>                                                                  | <code>sx</code>              |                                         |
| [radius]         | <code>number</code>                                                                  | <code>sx * 0.25</code>       |                                         |
| [roundSegments]  | [<code>PositiveInteger</code>](#PositiveInteger)                                     | <code>8</code>               |                                         |
| [nx]             | [<code>PositiveInteger</code>](#PositiveInteger)                                     | <code>1</code>               | Segments along the straight x sections. |
| [ny]             | [<code>PositiveInteger</code>](#PositiveInteger)                                     | <code>nx</code>              | Segments along the straight y sections. |
| [nz]             | [<code>PositiveInteger</code>](#PositiveInteger)                                     | <code>nx</code>              | Segments along the straight z sections. |
| [roundDirection] | [<code>RoundedCubeDirection</code>](#module_primitiveGeometry..RoundedCubeDirection) | <code>&quot;all&quot;</code> |                                         |

<a name="module_primitiveGeometry..AntiprismOptions"></a>

### primitiveGeometry~AntiprismOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name         | Type                                             | Default                           | Description                                                                            |
| ------------ | ------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------- |
| [radius]     | <code>number</code>                              | <code>0.25</code>                 |                                                                                        |
| [height]     | <code>number</code>                              | <code>1</code>                    |                                                                                        |
| [sides]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>6</code>                    |                                                                                        |
| [phiOffset]  | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                        |
| [capMapping] | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                        |
| [mergeSeam]  | <code>boolean</code>                             | <code>false</code>                | `true` shares the caps' wrap column and center vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..PrismOptions"></a>

### primitiveGeometry~PrismOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name         | Type                                             | Default                           | Description                                                                            |
| ------------ | ------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------- |
| [radius]     | <code>number</code>                              | <code>0.25</code>                 |                                                                                        |
| [height]     | <code>number</code>                              | <code>1</code>                    |                                                                                        |
| [sides]      | [<code>PositiveInteger</code>](#PositiveInteger) | <code>6</code>                    |                                                                                        |
| [phiOffset]  | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                        |
| [capMapping] | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                        |
| [mergeSeam]  | <code>boolean</code>                             | <code>false</code>                | `true` shares the caps' wrap column and center vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..AppleOptions"></a>

### primitiveGeometry~AppleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                                             | Default             | Description                                                                                         |
| ----------- | ------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------- |
| [radius]    | <code>number</code>                              | <code>0.5</code>    | Equatorial radius.                                                                                  |
| [height]    | <code>number</code>                              | <code>radius</code> | Height between the dimples, clamped to (0, radius * 2].                                             |
| [nx]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>     |                                                                                                     |
| [ny]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>     |                                                                                                     |
| [phi]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>    |                                                                                                     |
| [phiOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>      |                                                                                                     |
| [mergeSeam] | <code>boolean</code>                             | <code>false</code>  | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..AstroidalEllipsoidOptions"></a>

### primitiveGeometry~AstroidalEllipsoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default              | Description                                                                                         |
| ------------- | ------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------- |
| [radius]      | <code>number</code>                              | <code>0.5</code>     |                                                                                                     |
| [nx]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>      |                                                                                                     |
| [ny]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>      |                                                                                                     |
| [sx]          | <code>number</code>                              | <code>1</code>       |                                                                                                     |
| [sy]          | <code>number</code>                              | <code>0.5</code>     |                                                                                                     |
| [sz]          | <code>number</code>                              | <code>sy</code>      |                                                                                                     |
| [theta]       | [<code>PolarAngle</code>](#PolarAngle)           | <code>Math.PI</code> | Meridian sweep length, clamped so poles stay at its ends.                                           |
| [thetaOffset] | [<code>PolarAngle</code>](#PolarAngle)           | <code>0</code>       | Meridian sweep start from the north pole, clamped to [0, π].                                        |
| [phi]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>     |                                                                                                     |
| [phiOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>       |                                                                                                     |
| [mergeSeam]   | <code>boolean</code>                             | <code>false</code>   | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..BarrelOptions"></a>

### primitiveGeometry~BarrelOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                           | Description                                                                                         |
| --------------- | ------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| [height]        | <code>number</code>                              | <code>1</code>                    |                                                                                                     |
| [radius]        | <code>number</code>                              | <code>0.5</code>                  | Belly radius.                                                                                       |
| [endRadius]     | <code>number</code>                              | <code>radius*0.7</code>           | Rim radius.                                                                                         |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   |                                                                                                     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   |                                                                                                     |
| [capSegments]   | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capApex]       | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capBase]       | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [phi]           | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [phiOffset]     | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [capMapping]    | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                                     |
| [vDistribution] | <code>DistributionFn</code>                      | <code>utils.linear</code>         |                                                                                                     |
| [mergeSeam]     | <code>boolean</code>                             | <code>false</code>                | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..BiconeOptions"></a>

### primitiveGeometry~BiconeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                                             | Default            | Description                                                                                         |
| ----------- | ------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------- |
| [height]    | <code>number</code>                              | <code>1</code>     |                                                                                                     |
| [radius]    | <code>number</code>                              | <code>0.5</code>   |                                                                                                     |
| [nx]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>    |                                                                                                     |
| [ny]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>     | Meridian segments per cone.                                                                         |
| [phi]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |                                                                                                     |
| [phiOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>     |                                                                                                     |
| [sx]        | <code>number</code>                              | <code>1</code>     | Equator x scale.                                                                                    |
| [sz]        | <code>number</code>                              | <code>1</code>     | Equator z scale.                                                                                    |
| [mergeSeam] | <code>boolean</code>                             | <code>false</code> | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..CapsuleOptions"></a>

### primitiveGeometry~CapsuleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                                   | Default            | Description                                                                                         |
| --------------- | ------------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------- |
| [height]        | <code>number</code>                                    | <code>0.5</code>   |                                                                                                     |
| [radius]        | <code>number</code>                                    | <code>0.25</code>  |                                                                                                     |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger)       | <code>16</code>    |                                                                                                     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger)       | <code>1</code>     |                                                                                                     |
| [roundSegments] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>16</code>    |                                                                                                     |
| [phi]           | [<code>Angle</code>](#Angle)                           | <code>TAU</code>   |                                                                                                     |
| [phiOffset]     | [<code>Angle</code>](#Angle)                           | <code>0</code>     |                                                                                                     |
| [mergeSeam]     | <code>boolean</code>                                   | <code>false</code> | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..ConeOptions"></a>

### primitiveGeometry~ConeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default                           | Description                                                                                         |
| ------------- | ------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| [height]      | <code>number</code>                              | <code>1</code>                    |                                                                                                     |
| [radius]      | <code>number</code>                              | <code>0.25</code>                 |                                                                                                     |
| [nx]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   |                                                                                                     |
| [ny]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capBase]     | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [phi]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [phiOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [capMapping]  | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                                     |
| [sx]          | <code>number</code>                              | <code>1</code>                    | Base ring x scale.                                                                                  |
| [sz]          | <code>number</code>                              | <code>1</code>                    | Base ring z scale.                                                                                  |
| [mergeSeam]   | <code>boolean</code>                             | <code>false</code>                | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..CylinderOptions"></a>

### primitiveGeometry~CylinderOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name              | Type                                             | Default                           | Description                                                                                         |
| ----------------- | ------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| [height]          | <code>number</code>                              | <code>1</code>                    |                                                                                                     |
| [radiusBase]      | <code>number</code>                              | <code>0.25</code>                 |                                                                                                     |
| [radiusApex]      | <code>number</code>                              | <code>0.25</code>                 |                                                                                                     |
| [nx]              | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   |                                                                                                     |
| [ny]              | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capBase]         | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capApex]         | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capBaseSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capApexSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [phi]             | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [phiOffset]       | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [capMapping]      | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                                     |
| [sxBase]          | <code>number</code>                              | <code>1</code>                    | Base ring x scale.                                                                                  |
| [szBase]          | <code>number</code>                              | <code>1</code>                    | Base ring z scale.                                                                                  |
| [sxApex]          | <code>number</code>                              | <code>1</code>                    | Apex ring x scale.                                                                                  |
| [szApex]          | <code>number</code>                              | <code>1</code>                    | Apex ring z scale.                                                                                  |
| [mergeSeam]       | <code>boolean</code>                             | <code>false</code>                | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..DoubleConeOptions"></a>

### primitiveGeometry~DoubleConeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name              | Type                                             | Default                           | Description                                                                                         |
| ----------------- | ------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| [height]          | <code>number</code>                              | <code>1</code>                    |                                                                                                     |
| [radius]          | <code>number</code>                              | <code>0.5</code>                  |                                                                                                     |
| [nx]              | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   |                                                                                                     |
| [ny]              | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    | Meridian segments per cone.                                                                         |
| [capBase]         | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capApex]         | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capBaseSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capApexSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [phi]             | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [phiOffset]       | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [capMapping]      | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                                     |
| [sx]              | <code>number</code>                              | <code>1</code>                    | End ring x scale.                                                                                   |
| [sz]              | <code>number</code>                              | <code>1</code>                    | End ring z scale.                                                                                   |
| [mergeSeam]       | <code>boolean</code>                             | <code>false</code>                | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..EllipsoidOptions"></a>

### primitiveGeometry~EllipsoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                   | Description                                                                                         |
| --------------- | ------------------------------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>          |                                                                                                     |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>           |                                                                                                     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>           |                                                                                                     |
| [sx]            | <code>number</code>                              | <code>1</code>            |                                                                                                     |
| [sy]            | <code>number</code>                              | <code>0.5</code>          |                                                                                                     |
| [sz]            | <code>number</code>                              | <code>sy</code>           |                                                                                                     |
| [theta]         | [<code>PolarAngle</code>](#PolarAngle)           | <code>Math.PI</code>      | Meridian sweep length, clamped so poles stay at its ends.                                           |
| [thetaOffset]   | [<code>PolarAngle</code>](#PolarAngle)           | <code>0</code>            | Meridian sweep start from the north pole, clamped to [0, π].                                        |
| [phi]           | [<code>Angle</code>](#Angle)                     | <code>TAU</code>          |                                                                                                     |
| [phiOffset]     | [<code>Angle</code>](#Angle)                     | <code>0</code>            |                                                                                                     |
| [vDistribution] | <code>DistributionFn</code>                      | <code>utils.linear</code> |                                                                                                     |
| [mergeSeam]     | <code>boolean</code>                             | <code>false</code>        | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..FunnelOptions"></a>

### primitiveGeometry~FunnelOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name              | Type                                             | Default                           | Description                                                                                         |
| ----------------- | ------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| [height]          | <code>number</code>                              | <code>1</code>                    |                                                                                                     |
| [radiusBase]      | <code>number</code>                              | <code>0.1</code>                  | Spout radius.                                                                                       |
| [radiusApex]      | <code>number</code>                              | <code>0.5</code>                  | Mouth radius.                                                                                       |
| [nx]              | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   |                                                                                                     |
| [ny]              | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   |                                                                                                     |
| [capBase]         | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capApex]         | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capBaseSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capApexSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [phi]             | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [phiOffset]       | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [capMapping]      | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                                     |
| [vDistribution]   | <code>DistributionFn</code>                      | <code>utils.linear</code>         |                                                                                                     |
| [mergeSeam]       | <code>boolean</code>                             | <code>false</code>                | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..HollowCylinderOptions"></a>

### primitiveGeometry~HollowCylinderOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default                 | Description                                                                                         |
| ------------- | ------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------- |
| [height]      | <code>number</code>                              | <code>1</code>          |                                                                                                     |
| [radius]      | <code>number</code>                              | <code>0.5</code>        |                                                                                                     |
| [innerRadius] | <code>number</code>                              | <code>radius*0.5</code> | Bore radius.                                                                                        |
| [nx]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>         |                                                                                                     |
| [ny]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>          |                                                                                                     |
| [capSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>          | Radial segments per cap.                                                                            |
| [capApex]     | <code>boolean</code>                             | <code>true</code>       |                                                                                                     |
| [capBase]     | <code>boolean</code>                             | <code>true</code>       |                                                                                                     |
| [phi]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>        |                                                                                                     |
| [phiOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>          |                                                                                                     |
| [mergeSeam]   | <code>boolean</code>                             | <code>false</code>      | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..HollowSphereOptions"></a>

### primitiveGeometry~HollowSphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default                  | Description                                                                                         |
| ------------- | ------------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------- |
| [radius]      | <code>number</code>                              | <code>0.5</code>         |                                                                                                     |
| [innerRadius] | <code>number</code>                              | <code>radius*0.5</code>  |                                                                                                     |
| [nx]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>          |                                                                                                     |
| [ny]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>          |                                                                                                     |
| [capSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>           | Radial segments per cut cap.                                                                        |
| [theta]       | [<code>PolarAngle</code>](#PolarAngle)           | <code>Math.PI / 2</code> | Meridian sweep length, clamped like `ellipsoid`'s.                                                  |
| [thetaOffset] | [<code>PolarAngle</code>](#PolarAngle)           | <code>Math.PI / 4</code> | Meridian sweep start, clamped like `ellipsoid`'s.                                                   |
| [phi]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>         |                                                                                                     |
| [phiOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>           |                                                                                                     |
| [mergeSeam]   | <code>boolean</code>                             | <code>false</code>       | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..HyperboloidOptions"></a>

### primitiveGeometry~HyperboloidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                           | Description                                                                                         |
| --------------- | ------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| [height]        | <code>number</code>                              | <code>1</code>                    |                                                                                                     |
| [radius]        | <code>number</code>                              | <code>0.25</code>                 | Waist radius.                                                                                       |
| [endRadius]     | <code>number</code>                              | <code>radius*2</code>             | Rim radius.                                                                                         |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   |                                                                                                     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   |                                                                                                     |
| [capSegments]   | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capApex]       | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capBase]       | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [phi]           | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [phiOffset]     | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [capMapping]    | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                                     |
| [vDistribution] | <code>DistributionFn</code>                      | <code>utils.linear</code>         |                                                                                                     |
| [mergeSeam]     | <code>boolean</code>                             | <code>false</code>                | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..LemonOptions"></a>

### primitiveGeometry~LemonOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                                             | Default            | Description                                                                                         |
| ----------- | ------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------- |
| [radius]    | <code>number</code>                              | <code>0.3</code>   | Equatorial radius.                                                                                  |
| [height]    | <code>number</code>                              | <code>1</code>     | Height between the tips, raised to at least radius * 2.                                             |
| [nx]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>    |                                                                                                     |
| [ny]        | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>    |                                                                                                     |
| [phi]       | [<code>Angle</code>](#Angle)                     | <code>TAU</code>   |                                                                                                     |
| [phiOffset] | [<code>Angle</code>](#Angle)                     | <code>0</code>     |                                                                                                     |
| [mergeSeam] | <code>boolean</code>                             | <code>false</code> | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..ParaboloidOptions"></a>

### primitiveGeometry~ParaboloidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                           | Description                                                                                         |
| --------------- | ------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| [height]        | <code>number</code>                              | <code>1</code>                    |                                                                                                     |
| [radius]        | <code>number</code>                              | <code>0.5</code>                  | Rim radius.                                                                                         |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   |                                                                                                     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>                   |                                                                                                     |
| [capSegments]   | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capBase]       | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [phi]           | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [phiOffset]     | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [capMapping]    | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                                     |
| [vDistribution] | <code>DistributionFn</code>                      | <code>utils.linear</code>         |                                                                                                     |
| [mergeSeam]     | <code>boolean</code>                             | <code>false</code>                | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..RoundedCylinderOptions"></a>

### primitiveGeometry~RoundedCylinderOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                 | Description                                                                                         |
| --------------- | ------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------- |
| [height]        | <code>number</code>                              | <code>1</code>          |                                                                                                     |
| [radius]        | <code>number</code>                              | <code>0.25</code>       |                                                                                                     |
| [roundRadius]   | <code>number</code>                              | <code>radius*0.3</code> | Rim fillet radius, clamped to [0, min(radius, height / 2)].                                         |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>         |                                                                                                     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>          | Straight side segments.                                                                             |
| [roundSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>8</code>          | Fillet segments per end.                                                                            |
| [capSegments]   | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>          | Flat cap segments per end.                                                                          |
| [phi]           | [<code>Angle</code>](#Angle)                     | <code>TAU</code>        |                                                                                                     |
| [phiOffset]     | [<code>Angle</code>](#Angle)                     | <code>0</code>          |                                                                                                     |
| [mergeSeam]     | <code>boolean</code>                             | <code>false</code>      | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..SphereOptions"></a>

### primitiveGeometry~SphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                                             | Default              | Description                                                                                         |
| ------------- | ------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------- |
| [radius]      | <code>number</code>                              | <code>0.5</code>     |                                                                                                     |
| [nx]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>      |                                                                                                     |
| [ny]          | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>      |                                                                                                     |
| [theta]       | [<code>PolarAngle</code>](#PolarAngle)           | <code>Math.PI</code> |                                                                                                     |
| [thetaOffset] | [<code>PolarAngle</code>](#PolarAngle)           | <code>0</code>       |                                                                                                     |
| [phi]         | [<code>Angle</code>](#Angle)                     | <code>TAU</code>     |                                                                                                     |
| [phiOffset]   | [<code>Angle</code>](#Angle)                     | <code>0</code>       |                                                                                                     |
| [mergeSeam]   | <code>boolean</code>                             | <code>false</code>   | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..SphericalRingOptions"></a>

### primitiveGeometry~SphericalRingOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                             | Default                 | Description                                                                                         |
| -------------- | ------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------- |
| [radius]       | <code>number</code>                              | <code>0.5</code>        | Sphere radius.                                                                                      |
| [innerRadius]  | <code>number</code>                              | <code>radius*0.5</code> | Bore radius, clamped to [0, radius].                                                                |
| [nx]           | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>         |                                                                                                     |
| [ny]           | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>         | Outer band meridian segments.                                                                       |
| [holeSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>          | Bore wall segments.                                                                                 |
| [phi]          | [<code>Angle</code>](#Angle)                     | <code>TAU</code>        |                                                                                                     |
| [phiOffset]    | [<code>Angle</code>](#Angle)                     | <code>0</code>          |                                                                                                     |
| [mergeSeam]    | <code>boolean</code>                             | <code>false</code>      | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..SphericonOptions"></a>

### primitiveGeometry~SphericonOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                                             | Default          | Description                          |
| -------- | ------------------------------------------------ | ---------------- | ------------------------------------ |
| [radius] | <code>number</code>                              | <code>0.5</code> |                                      |
| [nx]     | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>  | Segments per quarter-cone half-turn. |
| [ny]     | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>   | Meridian segments per quarter-cone.  |

<a name="module_primitiveGeometry..SupereggOptions"></a>

### primitiveGeometry~SupereggOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                   | Description                                                                                         |
| --------------- | ------------------------------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>          | Equatorial radius                                                                                   |
| [sy]            | <code>number</code>                              | <code>5/6</code>          | Vertical (polar) scale                                                                              |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>           |                                                                                                     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>           |                                                                                                     |
| [n]             | <code>number</code>                              | <code>2.5</code>          | Roundness exponent.                                                                                 |
| [theta]         | [<code>PolarAngle</code>](#PolarAngle)           | <code>Math.PI</code>      | Meridian sweep length, clamped so poles stay at its ends.                                           |
| [thetaOffset]   | [<code>PolarAngle</code>](#PolarAngle)           | <code>0</code>            | Meridian sweep start from the north pole, clamped to [0, π].                                        |
| [phi]           | [<code>Angle</code>](#Angle)                     | <code>TAU</code>          |                                                                                                     |
| [phiOffset]     | [<code>Angle</code>](#Angle)                     | <code>0</code>            |                                                                                                     |
| [vDistribution] | <code>DistributionFn</code>                      | <code>utils.linear</code> |                                                                                                     |
| [mergeSeam]     | <code>boolean</code>                             | <code>false</code>        | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..SuperellipsoidOptions"></a>

### primitiveGeometry~SuperellipsoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                             | Default                   | Description                                                                                         |
| --------------- | ------------------------------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>                              | <code>0.5</code>          |                                                                                                     |
| [nx]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>           |                                                                                                     |
| [ny]            | [<code>PositiveInteger</code>](#PositiveInteger) | <code>16</code>           |                                                                                                     |
| [sx]            | <code>number</code>                              | <code>1</code>            |                                                                                                     |
| [sy]            | <code>number</code>                              | <code>0.5</code>          |                                                                                                     |
| [sz]            | <code>number</code>                              | <code>sy</code>           |                                                                                                     |
| [n1]            | <code>number</code>                              | <code>3</code>            | Meridian roundness exponent.                                                                        |
| [n2]            | <code>number</code>                              | <code>n1</code>           | Cross-section roundness exponent.                                                                   |
| [theta]         | [<code>PolarAngle</code>](#PolarAngle)           | <code>Math.PI</code>      | Meridian sweep length, clamped so poles stay at its ends.                                           |
| [thetaOffset]   | [<code>PolarAngle</code>](#PolarAngle)           | <code>0</code>            | Meridian sweep start from the north pole, clamped to [0, π].                                        |
| [phi]           | [<code>Angle</code>](#Angle)                     | <code>TAU</code>          |                                                                                                     |
| [phiOffset]     | [<code>Angle</code>](#Angle)                     | <code>0</code>            |                                                                                                     |
| [vDistribution] | <code>DistributionFn</code>                      | <code>utils.linear</code> |                                                                                                     |
| [mergeSeam]     | <code>boolean</code>                             | <code>false</code>        | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..TorusOptions"></a>

### primitiveGeometry~TorusOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name               | Type                                             | Default                           | Description                                                                                         |
| ------------------ | ------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| [radius]           | <code>number</code>                              | <code>0.4</code>                  |                                                                                                     |
| [segments]         | [<code>PositiveInteger</code>](#PositiveInteger) | <code>64</code>                   |                                                                                                     |
| [minorRadius]      | <code>number</code>                              | <code>0.1</code>                  |                                                                                                     |
| [minorSegments]    | [<code>PositiveInteger</code>](#PositiveInteger) | <code>32</code>                   |                                                                                                     |
| [theta]            | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [thetaOffset]      | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [phi]              | [<code>Angle</code>](#Angle)                     | <code>TAU</code>                  |                                                                                                     |
| [phiOffset]        | [<code>Angle</code>](#Angle)                     | <code>0</code>                    |                                                                                                     |
| [capStart]         | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capEnd]           | <code>boolean</code>                             | <code>true</code>                 |                                                                                                     |
| [capStartSegments] | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capEndSegments]   | [<code>PositiveInteger</code>](#PositiveInteger) | <code>1</code>                    |                                                                                                     |
| [capMapping]       | <code>MappingFn</code>                           | <code>mappings.rectangular</code> |                                                                                                     |
| [sx]               | <code>number</code>                              | <code>1</code>                    | Footprint x scale.                                                                                  |
| [sy]               | <code>number</code>                              | <code>1</code>                    | Footprint y scale.                                                                                  |
| [minorSx]          | <code>number</code>                              | <code>1</code>                    | Tube radial scale.                                                                                  |
| [minorSy]          | <code>number</code>                              | <code>1</code>                    | Tube z scale.                                                                                       |
| [mergeSeam]        | <code>boolean</code>                             | <code>false</code>                | `true` shares the full turn's wrap column and smooth poles' vertices, wrapping uvs back to 0 there. |

<a name="module_primitiveGeometry..DodecasphereOptions"></a>

### primitiveGeometry~DodecasphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger)                  | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..HexasphereOptions"></a>

### primitiveGeometry~HexasphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger)                  | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..IcosphereOptions"></a>

### primitiveGeometry~IcosphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger)                  | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..OctasphereOptions"></a>

### primitiveGeometry~OctasphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger)                  | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..TetrasphereOptions"></a>

### primitiveGeometry~TetrasphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger)                  | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..DodecahedronPolygonsOptions"></a>

### primitiveGeometry~DodecahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description   |
| -------- | ------------------- | ---------------- | ------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Circumradius. |

<a name="module_primitiveGeometry..DodecahedronOptions"></a>

### primitiveGeometry~DodecahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_primitiveGeometry..GreatDodecahedronPolygonsOptions"></a>

### primitiveGeometry~GreatDodecahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description   |
| -------- | ------------------- | ---------------- | ------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Circumradius. |

<a name="module_primitiveGeometry..GreatDodecahedronOptions"></a>

### primitiveGeometry~GreatDodecahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_primitiveGeometry..GreatIcosahedronPolygonsOptions"></a>

### primitiveGeometry~GreatIcosahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description   |
| -------- | ------------------- | ---------------- | ------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Circumradius. |

<a name="module_primitiveGeometry..GreatIcosahedronOptions"></a>

### primitiveGeometry~GreatIcosahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_primitiveGeometry..GreatStellatedDodecahedronPolygonsOptions"></a>

### primitiveGeometry~GreatStellatedDodecahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description   |
| -------- | ------------------- | ---------------- | ------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Circumradius. |

<a name="module_primitiveGeometry..GreatStellatedDodecahedronOptions"></a>

### primitiveGeometry~GreatStellatedDodecahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_primitiveGeometry..HexahedronPolygonsOptions"></a>

### primitiveGeometry~HexahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description   |
| -------- | ------------------- | ---------------- | ------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Circumradius. |

<a name="module_primitiveGeometry..HexahedronOptions"></a>

### primitiveGeometry~HexahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_primitiveGeometry..IcosahedronPolygonsOptions"></a>

### primitiveGeometry~IcosahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description   |
| -------- | ------------------- | ---------------- | ------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Circumradius. |

<a name="module_primitiveGeometry..IcosahedronOptions"></a>

### primitiveGeometry~IcosahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_primitiveGeometry..OctahedronPolygonsOptions"></a>

### primitiveGeometry~OctahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description   |
| -------- | ------------------- | ---------------- | ------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Circumradius. |

<a name="module_primitiveGeometry..OctahedronOptions"></a>

### primitiveGeometry~OctahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_primitiveGeometry..SmallStellatedDodecahedronPolygonsOptions"></a>

### primitiveGeometry~SmallStellatedDodecahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description   |
| -------- | ------------------- | ---------------- | ------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Circumradius. |

<a name="module_primitiveGeometry..SmallStellatedDodecahedronOptions"></a>

### primitiveGeometry~SmallStellatedDodecahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_primitiveGeometry..TetrahedronPolygonsOptions"></a>

### primitiveGeometry~TetrahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                 | Default           | Description                                                                                  |
| -------- | -------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| [radius] | <code>number</code>  | <code>0.5</code>  | Circumradius.                                                                                |
| [center] | <code>boolean</code> | <code>true</code> | Center the bounding box. `false` centers the centroid, keeping vertices on the circumsphere. |

<a name="module_primitiveGeometry..TetrahedronOptions"></a>

### primitiveGeometry~TetrahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                   | Default                           | Description   |
| -------------- | ------------------------------------------------------ | --------------------------------- | ------------- |
| [radius]       | <code>number</code>                                    | <code>0.5</code>                  | Circumradius. |
| [subdivisions] | [<code>NonNegativeInteger</code>](#NonNegativeInteger) | <code>0</code>                    |               |
| [mapping]      | <code>MappingFn</code>                                 | <code>mappings.rectangular</code> |               |

<a name="module_mappings"></a>

## mappings

- [mappings](#module_mappings)
  - _static_
    - [.rectangular()](#module_mappings.rectangular) : <code>MappingsFn</code>
    - [.circumferential()](#module_mappings.circumferential) : <code>MappingsFn</code>
    - [.polar()](#module_mappings.polar) : <code>MappingsFn</code>
    - [.spherical()](#module_mappings.spherical) : <code>MappingsFn</code>
    - [.radial()](#module_mappings.radial) : <code>MappingsFn</code>
    - [.concentric()](#module_mappings.concentric) : <code>MappingsFn</code>
    - [.lamé()](#module_mappings.lamé) : <code>MappingsFn</code>
    - [.elliptical()](#module_mappings.elliptical) : <code>MappingsFn</code>
    - [.fgSquircular()](#module_mappings.fgSquircular) : <code>MappingsFn</code>
    - [.twoSquircular()](#module_mappings.twoSquircular) : <code>MappingsFn</code>
    - [.threeSquircular()](#module_mappings.threeSquircular) : <code>MappingsFn</code>
    - [.cornerificTapered2()](#module_mappings.cornerificTapered2) : <code>MappingsFn</code>
    - [.tapered4()](#module_mappings.tapered4) : <code>MappingsFn</code>
    - [.nonAxial2Pinch()](#module_mappings.nonAxial2Pinch) : <code>MappingsFn</code>
    - [.nonAxialHalfPinch()](#module_mappings.nonAxialHalfPinch) : <code>MappingsFn</code>
    - [.squelched()](#module_mappings.squelched) : <code>MappingsFn</code>
    - [.squelchedVertical()](#module_mappings.squelchedVertical) : <code>MappingsFn</code>
    - [.squelchedHorizontal()](#module_mappings.squelchedHorizontal) : <code>MappingsFn</code>
  - _inner_
    - [~MappingFn](#module_mappings..MappingFn) : <code>function</code>

<a name="module_mappings.rectangular"></a>

### mappings.rectangular() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.circumferential"></a>

### mappings.circumferential() : <code>MappingsFn</code>

Solid caps only: centered, undistorted and at the same scale as the body's u
around the rim.

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.polar"></a>

### mappings.polar() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.spherical"></a>

### mappings.spherical() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.radial"></a>

### mappings.radial() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.concentric"></a>

### mappings.concentric() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.lamé"></a>

### mappings.lamé() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.elliptical"></a>

### mappings.elliptical() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.fgSquircular"></a>

### mappings.fgSquircular() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.twoSquircular"></a>

### mappings.twoSquircular() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.threeSquircular"></a>

### mappings.threeSquircular() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.cornerificTapered2"></a>

### mappings.cornerificTapered2() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.tapered4"></a>

### mappings.tapered4() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.nonAxial2Pinch"></a>

### mappings.nonAxial2Pinch() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.nonAxialHalfPinch"></a>

### mappings.nonAxialHalfPinch() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.squelched"></a>

### mappings.squelched() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.squelchedVertical"></a>

### mappings.squelchedVertical() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings.squelchedHorizontal"></a>

### mappings.squelchedHorizontal() : <code>MappingsFn</code>

**Kind**: static method of [<code>mappings</code>](#module_mappings)
<a name="module_mappings..MappingFn"></a>

### mappings~MappingFn : <code>function</code>

**Kind**: inner typedef of [<code>mappings</code>](#module_mappings)

| Param                        | Type                      | Description                     |
| ---------------------------- | ------------------------- | ------------------------------- |
| mappingOptions               | <code>object</code>       |                                 |
| [mappingOptions.uvs]         | <code>Float32Array</code> |                                 |
| [mappingOptions.index]       | <code>number</code>       |                                 |
| [mappingOptions.x]           | <code>number</code>       |                                 |
| [mappingOptions.y]           | <code>number</code>       |                                 |
| [mappingOptions.radius]      | <code>number</code>       |                                 |
| [mappingOptions.nx]          | <code>number</code>       |                                 |
| [mappingOptions.ny]          | <code>number</code>       |                                 |
| [mappingOptions.nz]          | <code>number</code>       |                                 |
| [mappingOptions.sx]          | <code>number</code>       |                                 |
| [mappingOptions.sy]          | <code>number</code>       |                                 |
| [mappingOptions.t]           | <code>number</code>       |                                 |
| [mappingOptions.radiusRatio] | <code>number</code>       |                                 |
| [mappingOptions.thetaRatio]  | <code>number</code>       |                                 |
| [mappingOptions.perimeter]   | <code>number</code>       | Cap rim length, solid caps only |

<a name="module_utils"></a>

## utils

- [utils](#module_utils)
  - _static_
    - [.TAU](#module_utils.TAU) : <code>number</code>
    - [.HALF_PI](#module_utils.HALF_PI) : <code>number</code>
    - [.SQRT2](#module_utils.SQRT2) : <code>number</code>
    - [.SQRT3](#module_utils.SQRT3) : <code>number</code>
    - [.SQRT6](#module_utils.SQRT6) : <code>number</code>
    - [.PHI](#module_utils.PHI) : <code>number</code>
    - [.getCellsTypedArray](#module_utils.getCellsTypedArray) ⇒ <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>
    - [.fullscreenTriangle()](#module_utils.fullscreenTriangle) ⇒ <code>Object</code>
    - [.setTypedArrayType(type)](#module_utils.setTypedArrayType)
    - [.triangulateFaces(cells, numVertices)](#module_utils.triangulateFaces) ⇒ <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>
    - [.concatGeometries(geometries)](#module_utils.concatGeometries) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.invert(geometry)](#module_utils.invert) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
    - [.linear()](#module_utils.linear) : <code>DistributionFn</code>
    - [.chebyshev()](#module_utils.chebyshev) : <code>DistributionFn</code>
    - [.smoothstep()](#module_utils.smoothstep) : <code>DistributionFn</code>
    - [.power([exponent])](#module_utils.power) ⇒ <code>function</code>
    - [.splitSeam(geometry, [options])](#module_utils.splitSeam) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)
  - _inner_
    - [~DistributionFn](#module_utils..DistributionFn) ⇒ <code>number</code>

<a name="module_utils.TAU"></a>

### utils.TAU : <code>number</code>

Two times PI.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.HALF_PI"></a>

### utils.HALF\_PI : <code>number</code>

Half of PI.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.SQRT2"></a>

### utils.SQRT2 : <code>number</code>

Square root of 2.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.SQRT3"></a>

### utils.SQRT3 : <code>number</code>

Square root of 3.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.SQRT6"></a>

### utils.SQRT6 : <code>number</code>

Square root of 6.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.PHI"></a>

### utils.PHI : <code>number</code>

Golden ratio: (1 + √5) / 2.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.getCellsTypedArray"></a>

### utils.getCellsTypedArray ⇒ <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>

Select the smallest cells typed array fitting `size`.

**Kind**: static constant of [<code>utils</code>](#module_utils)
**See**: [MDN TypedArray objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects)

| Param | Type                | Description            |
| ----- | ------------------- | ---------------------- |
| size  | <code>number</code> | The max value expected |

<a name="module_utils.fullscreenTriangle"></a>

### utils.fullscreenTriangle() ⇒ <code>Object</code>

A single triangle covering clip space, for fullscreen passes. xy positions
only.

**Kind**: static method of [<code>utils</code>](#module_utils)
<a name="module_utils.setTypedArrayType"></a>

### utils.setTypedArrayType(type)

Enforce a typed array constructor for cells.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param | Type                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>Class.&lt;Uint8Array&gt;</code> \| <code>Class.&lt;Uint16Array&gt;</code> \| <code>Class.&lt;Uint32Array&gt;</code> |

<a name="module_utils.triangulateFaces"></a>

### utils.triangulateFaces(cells, numVertices) ⇒ <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>

Fan-triangulate convex, planar polygon cells.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param       | Type                                                         | Description                |
| ----------- | ------------------------------------------------------------ | -------------------------- |
| cells       | [<code>Array.&lt;TypedArrayLike&gt;</code>](#TypedArrayLike) |                            |
| numVertices | <code>number</code>                                          | Picks the typed array size |

<a name="module_utils.concatGeometries"></a>

### utils.concatGeometries(geometries) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Concatenate geometries, without welding coincident positions.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param      | Type                                                               |
| ---------- | ------------------------------------------------------------------ |
| geometries | [<code>Array.&lt;SimplicialComplex&gt;</code>](#SimplicialComplex) |

<a name="module_utils.invert"></a>

### utils.invert(geometry) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Flip a geometry inside out: negated normals, reversed winding.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param    | Type                                                 |
| -------- | ---------------------------------------------------- |
| geometry | [<code>SimplicialComplex</code>](#SimplicialComplex) |

<a name="module_utils.linear"></a>

### utils.linear() : <code>DistributionFn</code>

Uniform spacing, the default `vDistribution`.

`vDistribution` remaps rows along meridians not swept at constant speed:
`ellipsoid`, `superellipsoid`, `superegg`, `paraboloid`, `barrel`, `funnel`
and `hyperboloid`.

**Kind**: static method of [<code>utils</code>](#module_utils)
<a name="module_utils.chebyshev"></a>

### utils.chebyshev() : <code>DistributionFn</code>

Chebyshev spacing: clusters rows toward both ends, eg. a prolate
`ellipsoid`'s poles.

**Kind**: static method of [<code>utils</code>](#module_utils)
<a name="module_utils.smoothstep"></a>

### utils.smoothstep() : <code>DistributionFn</code>

Smoothstep spacing: clusters rows toward both ends, like `chebyshev`.

**Kind**: static method of [<code>utils</code>](#module_utils)
<a name="module_utils.power"></a>

### utils.power([exponent]) ⇒ <code>function</code>

Power spacing: clusters rows toward t = 1. `2` evens out `paraboloid`'s apex.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param      | Type                | Default        |
| ---------- | ------------------- | -------------- |
| [exponent] | <code>number</code> | <code>2</code> |

<a name="module_utils.splitSeam"></a>

### utils.splitSeam(geometry, [options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Split vertices along a periodic uv seam (eg. `polar`'s v or `spherical`'s u
wrapping from 1 back to 0) so each triangle interpolates a continuous range.

Can't fix a triangle spanning half the wrap or more on its own (eg. a
3-segment disc): only splitting the triangle would.

**Kind**: static method of [<code>utils</code>](#module_utils)
**Returns**: [<code>SimplicialComplex</code>](#SimplicialComplex) - A new geometry, or the
input one when no seam is found.

| Param               | Type                                                 | Default         | Description                                                                                                                                                    |
| ------------------- | ---------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| geometry            | [<code>SimplicialComplex</code>](#SimplicialComplex) |                 |                                                                                                                                                                |
| [options]           | <code>object</code>                                  | <code>{}</code> |                                                                                                                                                                |
| [options.component] | <code>number</code>                                  | <code>0</code>  | The uv component wrapping at 0/1: `0` for u, `1` for v.                                                                                                        |
| [options.isPole]    | <code>function</code>                                |                 | Vertices with no value of their own in that component (eg. a sphere's poles, a fan's centroid): duplicated per triangle, midway between the two other corners. |

<a name="module_utils..DistributionFn"></a>

### utils~DistributionFn ⇒ <code>number</code>

**Kind**: inner typedef of [<code>utils</code>](#module_utils)

| Param | Type                |
| ----- | ------------------- |
| t     | <code>number</code> |

<a name="TypedArrayLike"></a>

## TypedArrayLike : <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>

**Kind**: global typedef
<a name="PositiveInteger"></a>

## PositiveInteger : <code>number</code>

Integer >= 1.

**Kind**: global typedef
<a name="NonNegativeInteger"></a>

## NonNegativeInteger : <code>number</code>

Integer >= 0.

**Kind**: global typedef
<a name="Angle"></a>

## Angle : <code>number</code>

In radians.

**Kind**: global typedef
<a name="PolarAngle"></a>

## PolarAngle : <code>number</code>

In radians, from the pole, within [0, π].

**Kind**: global typedef
<a name="SimplicialComplex"></a>

## SimplicialComplex : <code>object</code>

Triangle cells over shared positions.

**Kind**: global typedef
**Properties**

| Name      | Type                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| positions | <code>Float32Array</code>                                                       |
| normals   | <code>Float32Array</code>                                                       |
| uvs       | <code>Float32Array</code>                                                       |
| cells     | <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code> |

<a name="PolygonalComplex"></a>

## PolygonalComplex : <code>object</code>

Polygon cells over shared positions: each
cell is a closed n-gon (implicitly wraps its last index back to its first -
never repeat the first index at the end).

**Kind**: global typedef
**Properties**

| Name      | Type                                                         |
| --------- | ------------------------------------------------------------ |
| positions | <code>Float32Array</code>                                    |
| [normals] | <code>Float32Array</code>                                    |
| [uvs]     | <code>Float32Array</code>                                    |
| cells     | [<code>Array.&lt;TypedArrayLike&gt;</code>](#TypedArrayLike) |

<a name="PolylineComplex"></a>

## PolylineComplex : <code>object</code>

Polyline cells over shared positions: each
cell is an open polyline (no implicit closing edge between its last and
first index); repeat the first index at the end of a cell to close that
loop explicitly.

**Kind**: global typedef
**Properties**

| Name      | Type                                                         |
| --------- | ------------------------------------------------------------ |
| positions | <code>Float32Array</code>                                    |
| cells     | [<code>Array.&lt;TypedArrayLike&gt;</code>](#TypedArrayLike) |

<!-- api-end -->

## License

See original packages used in v1:

- [primitive-quad](https://npmjs.com/package/primitive-quad)
- [primitive-plane](https://npmjs.com/package/primitive-plane)
- [primitive-cube](https://npmjs.com/package/primitive-cube)
- [primitive-rounded-cube](https://npmjs.com/package/primitive-rounded-cube)
- [primitive-capsule](https://npmjs.com/package/primitive-capsule)
- [primitive-sphere](https://npmjs.com/package/primitive-sphere)
- [primitive-icosphere](https://npmjs.com/package/primitive-icosphere)
- [primitive-ellipsoid](https://npmjs.com/package/primitive-ellipsoid)
- [primitive-torus](https://npmjs.com/package/primitive-torus)
- [primitive-cylinder](https://npmjs.com/package/primitive-cylinder)
- [primitive-box](https://npmjs.com/package/primitive-box)
- [primitive-circle](https://npmjs.com/package/primitive-circle)

v3: geometry generators consolidation and expansion

v2 differences with v1:

- [x] use 3D positions for circle
- [x] base disc on ellispse and add inner segments
- [x] fix cylinder orientation and uvs
- [x] fix icosphere uvs (based on: https://github.com/mourner/icomesh)
- [x] fix quad normal to +z
- [x] fix subdivision for rounded geometries (rounded-cube and capsule)
- [x] uniformise api and internal names
- [x] use options object
- [x] remove gl-matrix/pex-math and icosphere dependencies
- [x] use only trigonometric operation, no matrix transformation
- [x] base sphere on ellispsoid
- [x] add cone based on cylinder
- [x] use flat typed arrays
- [x] defaults produce geometries contained in a unit bbox
- [x] add jsdoc, prettier, eslint via [snowdev](https://github.com/dmnsgn/snowdev/)

MIT. See [license file](https://github.com/dmnsgn/primitive-geometry/blob/main/LICENSE.md).
