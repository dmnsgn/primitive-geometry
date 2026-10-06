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
<dt><a href="#SimplicialComplex">SimplicialComplex</a> : <code>object</code></dt>
<dd><p>Geometry definition.</p>
</dd>
<dt><a href="#PolygonalComplex">PolygonalComplex</a> : <code>object</code></dt>
<dd><p>Geometry polygon definition: each
  cell is a closed n-gon face (implicitly wraps its last index back to its
  first - never repeat the first index at the end).</p>
</dd>
<dt><a href="#PolylineComplex">PolylineComplex</a> : <code>object</code></dt>
<dd><p>Geometry path definition: each cell
  is an open polyline (no implicit closing edge between its last and first
  index); repeat the first index at the end of a cell to close that loop
  explicitly.</p>
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

Greek cross: a plus-sign shaped non-regular dodecagon - 4 equal arms
extending from a square center, filled with a fan from the center.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Greek Cross](https://mathworld.wolfram.com/GreekCross.html)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>CrossOptions</code>](#module_primitiveGeometry..CrossOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.crossPath"></a>

### primitiveGeometry.crossPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `cross`: the same 12-corner outline, walked directly instead
of fanned from the center.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>CrossPathOptions</code>](#module_primitiveGeometry..CrossPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.polygon"></a>

### primitiveGeometry.polygon([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A regular polygon: sides corners evenly spaced around a circle, connected by
straight edges rather than ellipse's elliptical arc (rhombus is this shape's
sides=4 case). sx/sy independently scale the two axes; equal values keep it
regular, different values stretch it into an ellipse-inscribed polygon.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>PolygonOptions</code>](#module_primitiveGeometry..PolygonOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.polygonPath"></a>

### primitiveGeometry.polygonPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `polygon`: sides corners evenly spaced around a circle,
connected by straight edges (rhombus is this shape's sides=4 case).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Returns**: [<code>PolylineComplex</code>](#PolylineComplex) - `edgeSegments *
  sides` positions (`+ 1` for a partial `theta`) and a single path cell of
that many indices (`+ 1`, repeating index `0`, when `closed`)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>PolygonPathOptions</code>](#module_primitiveGeometry..PolygonPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.reuleaux"></a>

### primitiveGeometry.reuleaux([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A Reuleaux polygon: a constant-width curve built from `sides` circular arcs,
each centered on the opposite vertex.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Parametric equations for regular and Reuleaux polygons](https://tpfto.wordpress.com/2011/09/15/parametric-equations-for-regular-and-reuleaux-polygons/)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>ReuleauxOptions</code>](#module_primitiveGeometry..ReuleauxOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.reuleauxPath"></a>

### primitiveGeometry.reuleauxPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `reuleaux`: same parametric boundary, sampled directly with
no radial fill.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>ReuleauxPathOptions</code>](#module_primitiveGeometry..ReuleauxPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.star"></a>

### primitiveGeometry.star([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Regular {points/density} star polygon: `points` outer tips alternating with
`points` inner notches. `notchRadius` defaults to the tips' own
`{points/density}` ratio, so e.g. the default `star()` traces a regular
pentagram.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Star Polygon](https://mathworld.wolfram.com/StarPolygon.html)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>StarOptions</code>](#module_primitiveGeometry..StarOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.starPath"></a>

### primitiveGeometry.starPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `star`: `points` outer tips alternating with `points` inner
notches, connected by straight edges.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Returns**: [<code>PolylineComplex</code>](#PolylineComplex) - `edgeSegments *
  points * 2` positions (`+ 1` for a partial `theta`) and a single path cell
of that many indices (`+ 1`, repeating index `0`, when `closed`)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>StarPathOptions</code>](#module_primitiveGeometry..StarPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.arbelos"></a>

### primitiveGeometry.arbelos([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Arbelos ("shoemaker's knife"): the region inside a big semicircle and outside
2 smaller ones sharing its baseline, tangent where their diameters meet.
Area: `pi * innerRadius * (radius - innerRadius)`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Arbelos](https://mathworld.wolfram.com/Arbelos.html)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>ArbelosOptions</code>](#module_primitiveGeometry..ArbelosOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lens"></a>

### primitiveGeometry.lens([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Lens: the convex region where two circles overlap, centered on the x axis and
offset symmetrically by `distance`. Defaults to a Vesica Piscis.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**

- [Wolfram MathWorld – Lens](https://mathworld.wolfram.com/Lens.html)
- [Wolfram MathWorld – Vesica Piscis](https://mathworld.wolfram.com/VesicaPiscis.html)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>LensOptions</code>](#module_primitiveGeometry..LensOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lune"></a>

### primitiveGeometry.lune([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Lune: a crescent, the region inside the big circle and outside the offset
small one.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Lune](https://mathworld.wolfram.com/Lune.html)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>LuneOptions</code>](#module_primitiveGeometry..LuneOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.salinon"></a>

### primitiveGeometry.salinon([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Archimedes' salinon: a "salt cellar" bounded by four semicircles - one
full-width on the bottom, a smaller one opposite it on top, and two "ear"
semicircles filling the remaining top thirds. Area: `pi/4 * (radius +
innerRadius) ** 2` (Archimedes' theorem).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Salinon](https://mathworld.wolfram.com/Salinon.html)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SalinonOptions</code>](#module_primitiveGeometry..SalinonOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.triquetra"></a>

### primitiveGeometry.triquetra([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Triquetra: three mutually intersecting vesica piscis lenses, centered at the
vertices of an equilateral triangle of side `radius`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Triquetra](https://mathworld.wolfram.com/Triquetra.html)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TriquetraOptions</code>](#module_primitiveGeometry..TriquetraOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.yinYang"></a>

### primitiveGeometry.yinYang([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Yin-Yang (taijitu): a circle divided by an S-shaped seam of two opposing
semicircles, each side holed by a dot at the other's bulge.

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

Outline dual of `annulus`: unlike every other path in this module, an
annulus's boundary is 2 disjoint loops, not one - 2 path cells (outer loop
first, inner second).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>AnnulusPathOptions</code>](#module_primitiveGeometry..AnnulusPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.astroid"></a>

### primitiveGeometry.astroid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Hypocycloid with 4 cusps: a superellipse special case (m = n = 2/3).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Astroid](https://mathworld.wolfram.com/Astroid.html)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>AstroidOptions</code>](#module_primitiveGeometry..AstroidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.astroidPath"></a>

### primitiveGeometry.astroidPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `astroid`: `superellipsePath` with `m = n = 2 / 3`.

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

Outline dual of `disc`: `ellipsePath` with sx = sy = 1.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Returns**: [<code>PolylineComplex</code>](#PolylineComplex) - `segments`
positions (`+ 1` for a partial `theta`) and a single path cell of that many
indices (`+ 1`, repeating index `0`, when `closed`)

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

Outline dual of `ellipse`: sx/sy independently scale the two axes, same as
`circlePath` with sx = sy = 1.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Returns**: [<code>PolylineComplex</code>](#PolylineComplex) - `segments`
positions (`+ 1` for a partial `theta`) and a single path cell of that many
indices (`+ 1`, repeating index `0`, when `closed`)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>EllipsePathOptions</code>](#module_primitiveGeometry..EllipsePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.squircle"></a>

### primitiveGeometry.squircle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Fernández-Guasti squircle

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Squircular Calculations – Chamberlain Fong](https://arxiv.org/vc/arxiv/papers/1604/1604.02174v1.pdf)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SquircleOptions</code>](#module_primitiveGeometry..SquircleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.squirclePath"></a>

### primitiveGeometry.squirclePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `squircle`: the same Fernández-Guasti curve, sampled directly
with no radial fill.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SquirclePathOptions</code>](#module_primitiveGeometry..SquirclePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.superellipse"></a>

### primitiveGeometry.superellipse([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Lamé curve See elliptical-mapping example for a few special cases

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**

- [Wolfram MathWorld – Superellipse](https://mathworld.wolfram.com/Superellipse.html)
- [Wikipedia – Superellipse](https://en.wikipedia.org/wiki/Superellipse)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SuperellipseOptions</code>](#module_primitiveGeometry..SuperellipseOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.superellipsePath"></a>

### primitiveGeometry.superellipsePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `superellipse`: the same Lamé curve, sampled directly with no
radial fill.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                       | Default         |
| --------- | ------------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SuperellipsePathOptions</code>](#module_primitiveGeometry..SuperellipsePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hexagonalGrid"></a>

### primitiveGeometry.hexagonalGrid([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Hexagonal grid tiling regular hexagons

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>HexagonalGridOptions</code>](#module_primitiveGeometry..HexagonalGridOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.quadGrid"></a>

### primitiveGeometry.quadGrid([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Regular grid

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>QuadGridOptions</code>](#module_primitiveGeometry..QuadGridOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.triangularGrid"></a>

### primitiveGeometry.triangularGrid([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Isometric grid tiling equilateral triangles

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                   | Default         |
| --------- | -------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TriangularGridOptions</code>](#module_primitiveGeometry..TriangularGridOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.kite"></a>

### primitiveGeometry.kite([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A kite: a rhombus with its bottom vertex pulled toward the center (by ratio)
while the top, left and right vertices stay put.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>KiteOptions</code>](#module_primitiveGeometry..KiteOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.kitePath"></a>

### primitiveGeometry.kitePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `kite`: same shape, `ratio` pulling the bottom vertex toward
the center.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>KitePathOptions</code>](#module_primitiveGeometry..KitePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lozenge"></a>

### primitiveGeometry.lozenge([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A rhombus elongated along its vertical diagonal by default (sy = sx * 2), the
classic narrow diamond look.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>LozengeOptions</code>](#module_primitiveGeometry..LozengeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lozengePath"></a>

### primitiveGeometry.lozengePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `lozenge`: `rhombusPath` elongated along its vertical
diagonal by default (sy = sx * 2).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>LozengePathOptions</code>](#module_primitiveGeometry..LozengePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.parallelogram"></a>

### primitiveGeometry.parallelogram([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A parallelogram: `trapezoid` with `topRatio` fixed to `1` (top and bottom
edges the same width) and shifted sideways by `shear`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>ParallelogramOptions</code>](#module_primitiveGeometry..ParallelogramOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.parallelogramPath"></a>

### primitiveGeometry.parallelogramPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `parallelogram`: `trapezoidPath` with `topRatio` fixed to
`1`, shifted sideways by `shear`.

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

Outline dual of `plane`: just its `z`-facing boundary loop, walked directly
(bottom-left → bottom-right → top-right → top-left) rather than extracted
from the full grid.

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

Outline dual of `quad`: `rectanglePath` with `sx = sy = scale`, same as
`quad` itself is built from it.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SquarePathOptions</code>](#module_primitiveGeometry..SquarePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rhombus"></a>

### primitiveGeometry.rhombus([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A rhombus: a diamond with vertices at top/right/bottom/left, sx and sy
independently scaling the horizontal and vertical diagonals. Equal sx/sy
gives a square rotated 45°.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>RhombusOptions</code>](#module_primitiveGeometry..RhombusOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rhombusPath"></a>

### primitiveGeometry.rhombusPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `rhombus`: `polygonPath` with sides fixed to `4`.

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

Outline dual of `roundedRectangle`: same radius/segment/roundedCorners
conventions, walked directly (bottom-left → bottom-right → top-right →
top-left). A rounded corner contributes `roundSegments` samples along its
quarter-circle arc; a sharp one contributes its single corner point. Produces
identical output to `rectanglePath` when `radius` is `0`.

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

Outline dual of `stadium`: `roundedRectanglePath` with `radius` fixed to half
the shorter side, collapsing that axis's straight section to 0 (two
semicircular caps joined by straight edges).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>StadiumPathOptions</code>](#module_primitiveGeometry..StadiumPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.trapezoid"></a>

### primitiveGeometry.trapezoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A trapezoid: a quad with horizontal top/bottom edges, the top narrowed to
`topRatio` of the bottom's width and optionally shifted by `topOffset`. The
default `thetaOffset=0` starts at the bottom-left corner and sweeps CCW
through bottom-right, top-right, top-left.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Trapezoid](https://mathworld.wolfram.com/Trapezoid.html)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TrapezoidOptions</code>](#module_primitiveGeometry..TrapezoidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.trapezoidPath"></a>

### primitiveGeometry.trapezoidPath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `trapezoid`: the same 4 corners, walked directly instead of
fanned.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>TrapezoidPathOptions</code>](#module_primitiveGeometry..TrapezoidPathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rightTriangle"></a>

### primitiveGeometry.rightTriangle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A right triangle: `triangle` with its apex pulled directly above the
bottom-left corner (`apexOffset = -sx`), landing the right angle there.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>RightTriangleOptions</code>](#module_primitiveGeometry..RightTriangleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.rightTrianglePath"></a>

### primitiveGeometry.rightTrianglePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `rightTriangle`: `trianglePath` with `apexOffset` fixed to
`-sx`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                         | Default         |
| --------- | -------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>RightTrianglePathOptions</code>](#module_primitiveGeometry..RightTrianglePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.triangle"></a>

### primitiveGeometry.triangle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A triangle: a horizontal base with the apex placed anywhere above it via
`apexOffset`. `thetaOffset=0` starts at the bottom-left corner and sweeps CCW
through bottom-right, apex.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Triangle](https://mathworld.wolfram.com/Triangle.html)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TriangleOptions</code>](#module_primitiveGeometry..TriangleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.trianglePath"></a>

### primitiveGeometry.trianglePath([options]) ⇒ [<code>PolylineComplex</code>](#PolylineComplex)

Outline dual of `triangle`: the same 3 corners, walked directly instead of
fanned.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TrianglePathOptions</code>](#module_primitiveGeometry..TrianglePathOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.cubePolygons"></a>

### primitiveGeometry.cubePolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Cuboid faces: 8 positions and 6 quad faces (indices into positions). Cells
order: +x, -x, +y, -y, +z, -z.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
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

A cube with a square hole through the center of each face, like a single cell
of a Menger sponge: the 8 corners stay solid (t x t x t blocks) and the 12
edges become beams of the same cross-section running between them.

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

Antiprism: like `prism`, but the top sides-gon is rotated by half a sector
relative to the bottom one, so the two rings connect through a zigzag band of
2 * sides flat triangles (each with its own hard-edged normal) instead of
prism's sides flat rectangles. The 2 end caps are otherwise identical to
prism's own, just with the top one rotated to match its own ring.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>AntiprismOptions</code>](#module_primitiveGeometry..AntiprismOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.prism"></a>

### primitiveGeometry.prism([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Right prism: a regular sides-gon extruded into sides flat rectangular side
faces, each with its own hard-edged normal - unlike `cylinder`'s smooth
per-vertex normal, which just makes a large-nx cylinder look faceted rather
than actually being one.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>PrismOptions</code>](#module_primitiveGeometry..PrismOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.apple"></a>

### primitiveGeometry.apple([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

MathWorld's Apple Surface: "more than half of a circular arc rotated about an
axis passing through the [arc's] endpoints" - the outer lobe of a spindle
torus. Poles are true cusps (dimples), not smooth tangent points like a
sphere's - each pole's normal varies per column, same as `cone`'s apex.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Apple Surface](https://mathworld.wolfram.com/AppleSurface.html)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>AppleOptions</code>](#module_primitiveGeometry..AppleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.astroidalEllipsoid"></a>

### primitiveGeometry.astroidalEllipsoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A superellipsoid special case (n1 = n2 = 2/3): the surface

|x/a|^(2/3) + |y/b|^(2/3) + |z/c|^(2/3) = 1, pinched to 6 cusps along

The axes.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Astroidal Ellipsoid](https://mathworld.wolfram.com/AstroidalEllipsoid.html)

| Param     | Type                                                                                           | Default         |
| --------- | ---------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>AstroidalEllipsoidOptions</code>](#module_primitiveGeometry..AstroidalEllipsoidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.barrel"></a>

### primitiveGeometry.barrel([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Barrel/cask: a cylinder that bulges outward at the equator and tapers back to
a narrower flat rim at both ends. Unlike `superegg` (which also bulges but
tapers all the way to a point at each pole), both ends here stay flat, open
rings, cappable like `cylinder`'s.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                   | Default         |
| --------- | ---------------------------------------------------------------------- | --------------- |
| [options] | [<code>BarrelOptions</code>](#module_primitiveGeometry..BarrelOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.bicone"></a>

### primitiveGeometry.bicone([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Two right circular cones joined base-to-base at the equator (a bipyramid of
revolution/spinning-top shape) - both ends come to a point, so unlike
`cylinder`/`doubleCone` there are no cap options.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                   | Default         |
| --------- | ---------------------------------------------------------------------- | --------------- |
| [options] | [<code>BiconeOptions</code>](#module_primitiveGeometry..BiconeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.capsule"></a>

### primitiveGeometry.capsule([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A cylindrical body capped with two hemispheres (a "pill" shape).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                     | Default         |
| --------- | ------------------------------------------------------------------------ | --------------- |
| [options] | [<code>CapsuleOptions</code>](#module_primitiveGeometry..CapsuleOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.cone"></a>

### primitiveGeometry.cone([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Right circular cone by default. Other shapes fall out of the same parameters:
an open cone/funnel (capBase false) and an elliptical cone (sx != sz).
There's no apex-side ellipse - the apex is always a single point, so any apex
scale would be a no-op.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                               | Default         |
| --------- | ------------------------------------------------------------------ | --------------- |
| [options] | [<code>ConeOptions</code>](#module_primitiveGeometry..ConeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.cylinder"></a>

### primitiveGeometry.cylinder([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Right circular cylinder by default. Other shapes fall out of the same
parameters: a tube (capBase/capApex false, any radii), a frustum/cone
(radiusApex != radius, 0 for a true cone apex), and an elliptical cylinder or
frustum (sx != sz, optionally different per end via sxApex/szApex).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>CylinderOptions</code>](#module_primitiveGeometry..CylinderOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.doubleCone"></a>

### primitiveGeometry.doubleCone([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Two right circular cones joined apex-to-apex at the waist (an hourglass of
revolution) - the wide top/bottom ends are flat, so unlike `bicone` it takes
the same capBase/capApex/capSegments/capMapping options as `cylinder`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>DoubleConeOptions</code>](#module_primitiveGeometry..DoubleConeOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.ellipsoid"></a>

### primitiveGeometry.ellipsoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Default to an oblate spheroid.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>EllipsoidOptions</code>](#module_primitiveGeometry..EllipsoidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.funnel"></a>

### primitiveGeometry.funnel([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Revolution of y = a·ln(r) (equivalently r = radius·e^(k·(y+height/2)), an
exponential - not linear (`cone`) or hyperbolic (`hyperboloid`) - radius law)
between a narrow spout and a wide mouth. Both ends stay flat, open rings,
cappable exactly like `hyperboloid`'s.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Funnel](https://mathworld.wolfram.com/Funnel.html)

| Param     | Type                                                                   | Default         |
| --------- | ---------------------------------------------------------------------- | --------------- |
| [options] | [<code>FunnelOptions</code>](#module_primitiveGeometry..FunnelOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hollowCylinder"></a>

### primitiveGeometry.hollowCylinder([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A cylinder with a concentric cylindrical bore through it - a washer/pipe
extruded to a given height. Doesn't close the `phi < TAU` wedge cut (no wall
between the outer/inner walls or the 2 caps there) - same limitation as a
plain `cylinder({ phi: <TAU })`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                   | Default         |
| --------- | -------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>HollowCylinderOptions</code>](#module_primitiveGeometry..HollowCylinderOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hollowSphere"></a>

### primitiveGeometry.hollowSphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A sphere with a smaller, concentric sphere hollowed out of it: a shell of
uniform wall thickness. Defaults to a quarter band (theta/thetaOffset) rather
than a full sphere, since a closed hollow sphere looks identical to a plain
`sphere` from outside - the partial default exposes the cavity and cut caps
immediately.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>HollowSphereOptions</code>](#module_primitiveGeometry..HollowSphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hyperboloid"></a>

### primitiveGeometry.hyperboloid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Hyperboloid of one sheet (revolution of x² + z² = radius² + k·y², a
pinched-waist, flared-both-ends shape - cooling towers, gear/skew-roller
profiles). Both ends are flat rings, not points, cappable like `cylinder`'s
frustum.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – One-Sheeted Hyperboloid](https://mathworld.wolfram.com/One-SheetedHyperboloid.html)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>HyperboloidOptions</code>](#module_primitiveGeometry..HyperboloidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.lemon"></a>

### primitiveGeometry.lemon([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Lemon (geometry): "a circular arc of angle less than half of a full circle"
rotated about the chord through its own endpoints - `apple`'s exact
complementary half. Unlike apple, the meridian is plain y-monotonic: no
dimple, just a smooth convex taper to a point (still a cusp, not a tangent
point, at each pole).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wikipedia – Lemon (geometry)](<https://en.wikipedia.org/wiki/Lemon_(geometry)>)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>LemonOptions</code>](#module_primitiveGeometry..LemonOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.paraboloid"></a>

### primitiveGeometry.paraboloid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Circular paraboloid (revolution of x² + z² = k·(apexY - y), the classic
satellite-dish/reflector shape) - apex up, rim down, same orientation as
`cone`, and like `cone` only the rim end takes a cap option. Unlike a cone's
apex, the surface here is smooth at the apex (no crease), with a single
well-defined normal there.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Paraboloid](https://mathworld.wolfram.com/Paraboloid.html)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>ParaboloidOptions</code>](#module_primitiveGeometry..ParaboloidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.roundedCylinder"></a>

### primitiveGeometry.roundedCylinder([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A cylinder with its top/bottom rim edges filleted instead of sharp - a flat
cap blended into the straight side by a quarter-circle fillet, both ends
symmetric. `roundRadius = 0` gives a plain flat-capped `cylinder`;
`roundRadius = radius = height / 2` pinches the flat cap away entirely,
becoming `capsule`'s hemisphere.

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

A sphere with a cylindrical hole drilled through its center - MathWorld's
Spherical Ring, aka a napkin ring. Unlike what "ring" might suggest, there's
no flat annulus at either end: at the rim (height `sqrt(radius² -
innerRadius²)`), the sphere's and bore's surfaces meet directly, so the
meridian cross-section is a single closed loop - topologically a torus with a
lens-shaped minor curve instead of a circular one.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Spherical Ring](https://mathworld.wolfram.com/SphericalRing.html)

| Param     | Type                                                                                 | Default         |
| --------- | ------------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>SphericalRingOptions</code>](#module_primitiveGeometry..SphericalRingOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.sphericon"></a>

### primitiveGeometry.sphericon([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A right-circular bicone with a 90° apex angle, split along the plane through
both apexes and reattached with one half rotated 90° - the classic
4-quarter-cone rolling solid. No flat faces: a single continuous developable
surface that rolls by wobbling in a straight line.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**: [Wolfram MathWorld – Sphericon](https://mathworld.wolfram.com/Sphericon.html)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SphericonOptions</code>](#module_primitiveGeometry..SphericonOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.superegg"></a>

### primitiveGeometry.superegg([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Piet Hein's superegg: a superellipsoid special case (n2 = 2, sx = sz) with a
circular cross-section at every height, ie. an actual surface of revolution -
unlike the general superellipsoid, whose cross-sections are themselves
superelliptical.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**

- [Wolfram MathWorld – Superegg](https://mathworld.wolfram.com/Superegg.html)
- [Wikipedia – Superegg](https://en.wikipedia.org/wiki/Superegg)

| Param     | Type                                                                       | Default         |
| --------- | -------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SupereggOptions</code>](#module_primitiveGeometry..SupereggOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.superellipsoid"></a>

### primitiveGeometry.superellipsoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Superquadric ellipsoid (Barr 1981): generalizes ellipsoid by raising its
meridian (n1) and cross-section (n2) sin/cos terms to signed powers - n = 2
is a plain ellipsoid, n < 2 rounds toward a box, n > 2 (the default, n1 = n2
= 3) pinches toward a star/octahedron. See superegg for the n2 = 2 (circular
cross-section) special case.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**See**

- [Wolfram MathWorld – Superellipsoid](https://mathworld.wolfram.com/Superellipsoid.html)
- [Wikipedia – Superellipsoid](https://en.wikipedia.org/wiki/Superellipsoid)

| Param     | Type                                                                                   | Default         |
| --------- | -------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SuperellipsoidOptions</code>](#module_primitiveGeometry..SuperellipsoidOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.torus"></a>

### primitiveGeometry.torus([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Ring torus by default. Other shapes fall out of the same parameters: a
partial/open torus (phi < TAU, optionally capped via capStart/capEnd), an
elliptical torus (sx != sy, an oval/racetrack footprint), and a tube with an
elliptical cross-section (minorSx != minorSy, like a flattened or
spindle-shaped bagel).

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                 | Default         |
| --------- | -------------------------------------------------------------------- | --------------- |
| [options] | [<code>TorusOptions</code>](#module_primitiveGeometry..TorusOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.dodecasphere"></a>

### primitiveGeometry.dodecasphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere built by radially projecting and welding a subdivided
dodecahedron

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                               | Default         |
| --------- | ---------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>DodecasphereOptions</code>](#module_primitiveGeometry..DodecasphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.hexasphere"></a>

### primitiveGeometry.hexasphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere built by radially projecting and welding a subdivided
hexahedron (cube) - an alternative to icosphere's topology, with
cubemap-friendly UVs.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>HexasphereOptions</code>](#module_primitiveGeometry..HexasphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.icosphere"></a>

### primitiveGeometry.icosphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere built by radially projecting and welding a subdivided
icosahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                         | Default         |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| [options] | [<code>IcosphereOptions</code>](#module_primitiveGeometry..IcosphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.octasphere"></a>

### primitiveGeometry.octasphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere built by radially projecting and welding a subdivided
octahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                           | Default         |
| --------- | ------------------------------------------------------------------------------ | --------------- |
| [options] | [<code>OctasphereOptions</code>](#module_primitiveGeometry..OctasphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.tetrasphere"></a>

### primitiveGeometry.tetrasphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

A geodesic sphere built by radially projecting and welding a subdivided
tetrahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                             | Default         |
| --------- | -------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TetrasphereOptions</code>](#module_primitiveGeometry..TetrasphereOptions) | <code>{}</code> |

<a name="module_primitiveGeometry.dodecahedronPolygons"></a>

### primitiveGeometry.dodecahedronPolygons([options]) ⇒ [<code>PolygonalComplex</code>](#PolygonalComplex)

Regular dodecahedron.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                         | Default         |
| --------- | -------------------------------------------------------------------------------------------- | --------------- |
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

Great dodecahedron, sharing the icosahedron's 12 vertices; each of its 12
pentagonal faces is the convex pentagon formed by one vertex's 5 neighbors,
deeply interpenetrating the other 11 faces.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                   | Default         |
| --------- | ------------------------------------------------------------------------------------------------------ | --------------- |
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

Great icosahedron, sharing the icosahedron's 12 vertices; each of its 20
triangular faces connects a vertex to two of its "second-shell" neighbors
(rather than its 5 immediate ones), deeply interpenetrating the rest.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                 | Default         |
| --------- | ---------------------------------------------------------------------------------------------------- | --------------- |
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

Great stellated dodecahedron: the 3rd (outermost) stellation of the
dodecahedron. Each face's 5 edges, extended within its own plane, first cross
at a "depth 1" ring (exactly the icosahedron's vertex positions - small
stellated dodecahedron's own tips) before crossing a second, further ring at
"depth 2" - the true tips here, a plain radial scale of the dodecahedron's
own vertices by `phi^3`.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                                     | Default         |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | --------------- |
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

Regular hexahedron (cube) faces: 8 corners, cells order +x, -x, +y, -y, +z,
-z - `cubePolygons`'s own layout, since a regular hexahedron is exactly a cube
whose half-extent (`radius`) is the same on all 3 axes.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                     | Default         |
| --------- | ---------------------------------------------------------------------------------------- | --------------- |
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

| Param     | Type                                                                                       | Default         |
| --------- | ------------------------------------------------------------------------------------------ | --------------- |
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

| Param     | Type                                                                                     | Default         |
| --------- | ---------------------------------------------------------------------------------------- | --------------- |
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

Small stellated dodecahedron: the same 12 vertices and pentagon groupings as
the great dodecahedron, with each face's 5 corners connected as a pentagram
(skip-one star) instead of a convex pentagon.

**Kind**: static method of [<code>primitiveGeometry</code>](#module_primitiveGeometry)

| Param     | Type                                                                                                                     | Default         |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | --------------- |
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

| Param     | Type                                                                                       | Default         |
| --------- | ------------------------------------------------------------------------------------------ | --------------- |
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

| Name            | Type                   | Default                                                   | Description                                                                                                                                                                                 |
| --------------- | ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          | Distance from the center to each arm's tip.                                                                                                                                                 |
| [armWidth]      | <code>number</code>    | <code>radius/3</code>                                     | Half-width of each arm. Defaults to a third of `radius`, the classic Greek cross made of 5 equal squares.                                                                                   |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |                                                                                                                                                                                             |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           | Row count between the center and the outline at each column.                                                                                                                                |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            | Like `star`'s: a hole radius the fill stops at instead of reaching the center, traced as a smaller, self- similar copy of the outer cross. `0` (default): no hole, fill reaches the center. |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                                                                                                                             |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code>                         | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap.                                                                                                                      |

<a name="module_primitiveGeometry..CrossPathOptions"></a>

### primitiveGeometry~CrossPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default               |
| -------------- | -------------------- | --------------------- |
| [radius]       | <code>number</code>  | <code>0.5</code>      |
| [armWidth]     | <code>number</code>  | <code>radius/3</code> |
| [edgeSegments] | <code>number</code>  | <code>1</code>        |
| [closed]       | <code>boolean</code> | <code>false</code>    |

<a name="module_primitiveGeometry..PolygonOptions"></a>

### primitiveGeometry~PolygonOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   |
| --------------- | ---------------------- | --------------------------------------------------------- |
| [sides]         | <code>number</code>    | <code>6</code>                                            |
| [sx]            | <code>number</code>    | <code>1</code>                                            |
| [sy]            | <code>number</code>    | <code>1</code>                                            |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |
| [mapping]       | <code>MappingFn</code> | <code>mappings.concentric</code>                          |

<a name="module_primitiveGeometry..PolygonPathOptions"></a>

### primitiveGeometry~PolygonPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default            |
| -------------- | -------------------- | ------------------ |
| [sides]        | <code>number</code>  | <code>6</code>     |
| [sx]           | <code>number</code>  | <code>1</code>     |
| [sy]           | <code>number</code>  | <code>1</code>     |
| [radius]       | <code>number</code>  | <code>0.5</code>   |
| [edgeSegments] | <code>number</code>  | <code>1</code>     |
| [theta]        | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset]  | <code>number</code>  | <code>0</code>     |
| [closed]       | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..ReuleauxOptions"></a>

### primitiveGeometry~ReuleauxOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   |
| --------------- | ---------------------- | --------------------------------------------------------- |
| [sides]         | <code>number</code>    | <code>3</code>                                            |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |
| [segments]      | <code>number</code>    | <code>32</code>                                           |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |
| [mapping]       | <code>MappingFn</code> | <code>mappings.concentric</code>                          |

<a name="module_primitiveGeometry..ReuleauxPathOptions"></a>

### primitiveGeometry~ReuleauxPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                 | Default            |
| ------------- | -------------------- | ------------------ |
| [sides]       | <code>number</code>  | <code>3</code>     |
| [radius]      | <code>number</code>  | <code>0.5</code>   |
| [segments]    | <code>number</code>  | <code>32</code>    |
| [theta]       | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset] | <code>number</code>  | <code>0</code>     |
| [closed]      | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..StarOptions"></a>

### primitiveGeometry~StarOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   | Description                                                                                                                                                            |
| --------------- | ---------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [points]        | <code>number</code>    | <code>5</code>                                            |                                                                                                                                                                        |
| [density]       | <code>number</code>    | <code>2</code>                                            | Schläfli "skip" factor: must be `< points / 2` (and coprime with `points` for a genuine, non-compound star polygon) or the auto-computed `notchRadius` degenerates.    |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |                                                                                                                                                                        |
| [notchRadius]   | <code>number</code>    | <code>radius*computeStarRatio(points,density)</code>      | Radius of the points/tips' flanking concave vertices, ie. how deep the star's notches cut in.                                                                          |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            | Like `annulus`'s: a hole radius the fill stops at instead of reaching the center. `0` (default): no hole, fill reaches the center (subject to `mergeCentroid`).        |
| [circularHole]  | <code>boolean</code>   | <code>false</code>                                        | Only relevant when `innerRadius` is non-zero: `false` (default) traces the hole as a smaller, self-similar copy of the outer star; `true` traces it as a plain circle. |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |                                                                                                                                                                        |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |                                                                                                                                                                        |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |                                                                                                                                                                        |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |                                                                                                                                                                        |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                                                                                                        |
| [mapping]       | <code>MappingFn</code> | <code>mappings.concentric</code>                          |                                                                                                                                                                        |

<a name="module_primitiveGeometry..StarPathOptions"></a>

### primitiveGeometry~StarPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default                                              |
| -------------- | -------------------- | ---------------------------------------------------- |
| [points]       | <code>number</code>  | <code>5</code>                                       |
| [density]      | <code>number</code>  | <code>2</code>                                       |
| [radius]       | <code>number</code>  | <code>0.5</code>                                     |
| [notchRadius]  | <code>number</code>  | <code>radius*computeStarRatio(points,density)</code> |
| [edgeSegments] | <code>number</code>  | <code>1</code>                                       |
| [theta]        | <code>number</code>  | <code>TAU</code>                                     |
| [thetaOffset]  | <code>number</code>  | <code>0</code>                                       |
| [closed]       | <code>boolean</code> | <code>false</code>                                   |

<a name="module_primitiveGeometry..ArbelosOptions"></a>

### primitiveGeometry~ArbelosOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                           | Description                                                                                                                                                                                                                                                                          |
| --------------- | ---------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [radius]        | <code>number</code>    | <code>0.5</code>                  | Outer (enclosing) semicircle's radius: half the total baseline width.                                                                                                                                                                                                                |
| [innerRadius]   | <code>number</code>    | <code>radius*0.25</code>          | Radius of the left of the 2 inner semicircles, both bulging the _same_ way as the enclosing one (up, above the baseline) and tangent to each other where they meet it: `innerRadius` and `radius - innerRadius` apart from the enclosing semicircle's left/right ends, respectively. |
| [segments]      | <code>number</code>    | <code>32</code>                   | Column count, swept left to right.                                                                                                                                                                                                                                                   |
| [innerSegments] | <code>number</code>    | <code>16</code>                   | Row count between the bottom and top boundary at each column.                                                                                                                                                                                                                        |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code> | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a function using `uRatio`/`vRatio` (the swept parametrization) to follow the arcs instead.                                                                                                               |

<a name="module_primitiveGeometry..LensOptions"></a>

### primitiveGeometry~LensOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                           | Description                                                                                                                                                            |
| --------------- | ---------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>    | <code>0.5</code>                  | Radius of the first circle, centered at `-distance / 2`.                                                                                                               |
| [radius2]       | <code>number</code>    | <code>radius</code>               | Radius of the second circle, centered at `distance / 2`. Equal to `radius` (a symmetric lens) by default.                                                              |
| [distance]      | <code>number</code>    | <code>radius</code>               | Distance between the two circles' centers.                                                                                                                             |
| [segments]      | <code>number</code>    | <code>32</code>                   | Column count, swept left to right.                                                                                                                                     |
| [innerSegments] | <code>number</code>    | <code>16</code>                   | Row count between the bottom and top boundary at each column.                                                                                                          |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code> | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a function using `uRatio`/`vRatio` (the swept parametrization) to follow the arcs instead. |

<a name="module_primitiveGeometry..LuneOptions"></a>

### primitiveGeometry~LuneOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                           | Description                                                                                                                                                                                                                                                                            |
| --------------- | ---------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>    | <code>0.5</code>                  | Radius of the big circle (`b` in MathWorld's notation), centered at the origin.                                                                                                                                                                                                        |
| [innerRadius]   | <code>number</code>    | <code>radius</code>               | Radius of the small circle (`a`), whose disk is subtracted from the big one. Must be `< radius`.                                                                                                                                                                                       |
| [distance]      | <code>number</code>    | <code>radius*0.5</code>           | Offset of the small circle's center from the origin, along +x (`c`). For a proper crescent (both arcs contributing to the boundary) `distance + innerRadius` must exceed `radius`, ie. the small circle actually pokes through the big one's edge rather than sitting fully inside it. |
| [segments]      | <code>number</code>    | <code>32</code>                   | Column count, swept left to right.                                                                                                                                                                                                                                                     |
| [innerSegments] | <code>number</code>    | <code>16</code>                   | Row count between the two halves' near/far boundary at each column.                                                                                                                                                                                                                    |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code> | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a function using `uRatio`/`vRatio` (the swept parametrization) to follow the arcs instead.                                                                                                                 |

<a name="module_primitiveGeometry..SalinonOptions"></a>

### primitiveGeometry~SalinonOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                           | Description                                                                                                                                                                                                                                                                                                                                      |
| --------------- | ---------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [radius]        | <code>number</code>    | <code>0.5</code>                  | Outer (enclosing) radius: half the total width, and the radius of the semicircle forming the bottom boundary.                                                                                                                                                                                                                                    |
| [innerRadius]   | <code>number</code>    | <code>radius*0.25</code>          | Radius of the central semicircle, bulging _opposite_ the enclosing one (up, above the baseline) over the middle third. The two flanking "ear" semicircles bulge the _same_ way as the enclosing one (down, a shallower dip below the baseline) over the outer two thirds, sized to meet it at the baseline: `(radius -   innerRadius) / 2` each. |
| [segments]      | <code>number</code>    | <code>32</code>                   | Column count, swept left to right.                                                                                                                                                                                                                                                                                                               |
| [innerSegments] | <code>number</code>    | <code>16</code>                   | Row count between the bottom and top boundary at each column.                                                                                                                                                                                                                                                                                    |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code> | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a function using `uRatio`/`vRatio` (the swept parametrization) to follow the arcs instead.                                                                                                                                                                           |

<a name="module_primitiveGeometry..TriquetraOptions"></a>

### primitiveGeometry~TriquetraOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                           | Description                                                                                                                                                            |
| --------------- | ---------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>    | <code>0.5</code>                  | Radius of each of the 3 circles, and the side length of the equilateral triangle formed by their centers - a canonical Triquetra has no separate spacing parameter.    |
| [segments]      | <code>number</code>    | <code>32</code>                   | Column count, swept angularly per wedge, for both the core and the petals.                                                                                             |
| [innerSegments] | <code>number</code>    | <code>16</code>                   | Row count between the two boundaries at each column.                                                                                                                   |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code> | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a function using `uRatio`/`vRatio` (the swept parametrization) to follow the arcs instead. |

<a name="module_primitiveGeometry..YinYangOptions"></a>

### primitiveGeometry~YinYangOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                                                                                               | Default                           | Description                                                                                                                                                                                                                                                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>                                                                                | <code>0.5</code>                  | Radius of the enclosing circle.                                                                                                                                                                                                                                                                                                                                              |
| [dotRadius]     | <code>number</code>                                                                                | <code>radius/6</code>             | Radius of the hole cut at each returned half's own dot position. `0` omits the hole(s).                                                                                                                                                                                                                                                                                      |
| [part]          | <code>&quot;yin&quot;</code> \| <code>&quot;yang&quot;</code> \| <code>&quot;yin-yang&quot;</code> | <code>&quot;yin-yang&quot;</code> | `"yin"`/`"yang"` return one S-curve-divided half (bounded by half the outer circle and the S-curve), with its dot hole centered at the other half's bulge (`(0,   -radius/2)` for yang, `(0, radius/2)` for yin). `"yin-yang"` merges both into one mesh; without per-face material/color the S-curve seam is then invisible (indistinguishable from a disc with two holes). |
| [segments]      | <code>number</code>                                                                                | <code>32</code>                   | Row count for the outer circle/S-curve boundary, swept bottom to top.                                                                                                                                                                                                                                                                                                        |
| [holeSegments]  | <code>number</code>                                                                                | <code>16</code>                   | Row count for a dot hole's own boundary, independent of the outer boundary's `segments`.                                                                                                                                                                                                                                                                                     |
| [innerSegments] | <code>number</code>                                                                                | <code>16</code>                   | Column count spanning each side of a dot hole (or the whole half, where the hole doesn't reach) at each row.                                                                                                                                                                                                                                                                 |
| [mapping]       | <code>MappingFn</code>                                                                             | <code>mappings.rectangular</code> | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a function using `uRatio`/`vRatio` (the swept parametrization) to follow the arcs instead.                                                                                                                                                                                                       |

<a name="module_primitiveGeometry..AnnulusOptions"></a>

### primitiveGeometry~AnnulusOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                          |
| --------------- | ---------------------- | -------------------------------- |
| [sx]            | <code>number</code>    | <code>1</code>                   |
| [sy]            | <code>number</code>    | <code>1</code>                   |
| [radius]        | <code>number</code>    | <code>0.5</code>                 |
| [segments]      | <code>number</code>    | <code>32</code>                  |
| [innerSegments] | <code>number</code>    | <code>16</code>                  |
| [theta]         | <code>number</code>    | <code>TAU</code>                 |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                   |
| [innerRadius]   | <code>number</code>    | <code>radius * 0.5</code>        |
| [mapping]       | <code>MappingFn</code> | <code>mappings.concentric</code> |

<a name="module_primitiveGeometry..AnnulusPathOptions"></a>

### primitiveGeometry~AnnulusPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                 | Default                   |
| ------------- | -------------------- | ------------------------- |
| [sx]          | <code>number</code>  | <code>1</code>            |
| [sy]          | <code>number</code>  | <code>1</code>            |
| [radius]      | <code>number</code>  | <code>0.5</code>          |
| [segments]    | <code>number</code>  | <code>32</code>           |
| [theta]       | <code>number</code>  | <code>TAU</code>          |
| [thetaOffset] | <code>number</code>  | <code>0</code>            |
| [innerRadius] | <code>number</code>  | <code>radius * 0.5</code> |
| [closed]      | <code>boolean</code> | <code>false</code>        |

<a name="module_primitiveGeometry..AstroidOptions"></a>

### primitiveGeometry~AstroidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   |
| --------------- | ---------------------- | --------------------------------------------------------- |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |
| [segments]      | <code>number</code>    | <code>32</code>                                           |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |
| [mapping]       | <code>MappingFn</code> | <code>mappings.lamé</code>                                |

<a name="module_primitiveGeometry..AstroidPathOptions"></a>

### primitiveGeometry~AstroidPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                 | Default            |
| ------------- | -------------------- | ------------------ |
| [radius]      | <code>number</code>  | <code>0.5</code>   |
| [segments]    | <code>number</code>  | <code>32</code>    |
| [theta]       | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset] | <code>number</code>  | <code>0</code>     |
| [closed]      | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..DiscOptions"></a>

### primitiveGeometry~DiscOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   |
| --------------- | ---------------------- | --------------------------------------------------------- |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |
| [segments]      | <code>number</code>    | <code>32</code>                                           |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |
| [mapping]       | <code>MappingFn</code> | <code>mappings.concentric</code>                          |

<a name="module_primitiveGeometry..CirclePathOptions"></a>

### primitiveGeometry~CirclePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                 | Default            |
| ------------- | -------------------- | ------------------ |
| [radius]      | <code>number</code>  | <code>0.5</code>   |
| [segments]    | <code>number</code>  | <code>32</code>    |
| [theta]       | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset] | <code>number</code>  | <code>0</code>     |
| [closed]      | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..EllipseOptions"></a>

### primitiveGeometry~EllipseOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                           | Default                                                   | Description                                                                                                                                                     |
| --------------- | ------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>            | <code>1</code>                                            |                                                                                                                                                                 |
| [sy]            | <code>number</code>            | <code>0.5</code>                                          |                                                                                                                                                                 |
| [radius]        | <code>number</code>            | <code>0.5</code>                                          |                                                                                                                                                                 |
| [segments]      | <code>number</code>            | <code>32</code>                                           |                                                                                                                                                                 |
| [innerSegments] | <code>number</code>            | <code>16</code>                                           |                                                                                                                                                                 |
| [theta]         | <code>number</code>            | <code>TAU</code>                                          |                                                                                                                                                                 |
| [thetaOffset]   | <code>number</code>            | <code>0</code>                                            |                                                                                                                                                                 |
| [innerRadius]   | <code>number</code>            | <code>0</code>                                            | Like `annulus`'s: a hole radius the fill stops at instead of reaching the center. `0` (default): no hole, fill reaches the center (subject to `mergeCentroid`). |
| [mergeCentroid] | <code>boolean</code>           | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                                                                                                 |
| [mapping]       | <code>MappingFn</code>         | <code>mappings.elliptical</code>                          |                                                                                                                                                                 |
| [equation]      | <code>EllipseEquationFn</code> |                                                           | Maps each (rx, ry, cosTheta, sinTheta) sample to its [x, y] position, defaulting to an ellipse's arc.                                                           |

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

| Name          | Type                 | Default            |
| ------------- | -------------------- | ------------------ |
| [sx]          | <code>number</code>  | <code>1</code>     |
| [sy]          | <code>number</code>  | <code>0.5</code>   |
| [radius]      | <code>number</code>  | <code>0.5</code>   |
| [segments]    | <code>number</code>  | <code>32</code>    |
| [theta]       | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset] | <code>number</code>  | <code>0</code>     |
| [closed]      | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..SquircleOptions"></a>

### primitiveGeometry~SquircleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   | Description             |
| --------------- | ---------------------- | --------------------------------------------------------- | ----------------------- |
| [sx]            | <code>number</code>    | <code>1</code>                                            |                         |
| [sy]            | <code>number</code>    | <code>1</code>                                            |                         |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |                         |
| [segments]      | <code>number</code>    | <code>128</code>                                          |                         |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |                         |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |                         |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |                         |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |                         |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                         |
| [mapping]       | <code>MappingFn</code> | <code>mappings.fgSquircular</code>                        |                         |
| [squareness]    | <code>number</code>    | <code>0.95</code>                                         | Squareness (0 < s <= 1) |

<a name="module_primitiveGeometry..SquirclePathOptions"></a>

### primitiveGeometry~SquirclePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                 | Default            |
| ------------- | -------------------- | ------------------ |
| [sx]          | <code>number</code>  | <code>1</code>     |
| [sy]          | <code>number</code>  | <code>1</code>     |
| [radius]      | <code>number</code>  | <code>0.5</code>   |
| [segments]    | <code>number</code>  | <code>128</code>   |
| [theta]       | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset] | <code>number</code>  | <code>0</code>     |
| [squareness]  | <code>number</code>  | <code>0.95</code>  |
| [closed]      | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..SuperellipseOptions"></a>

### primitiveGeometry~SuperellipseOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   |
| --------------- | ---------------------- | --------------------------------------------------------- |
| [sx]            | <code>number</code>    | <code>1</code>                                            |
| [sy]            | <code>number</code>    | <code>0.5</code>                                          |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |
| [segments]      | <code>number</code>    | <code>32</code>                                           |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |
| [mapping]       | <code>MappingFn</code> | <code>mappings.lamé</code>                                |
| [m]             | <code>number</code>    | <code>2</code>                                            |
| [n]             | <code>number</code>    | <code>m</code>                                            |

<a name="module_primitiveGeometry..SuperellipsePathOptions"></a>

### primitiveGeometry~SuperellipsePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                 | Default            |
| ------------- | -------------------- | ------------------ |
| [sx]          | <code>number</code>  | <code>1</code>     |
| [sy]          | <code>number</code>  | <code>0.5</code>   |
| [radius]      | <code>number</code>  | <code>0.5</code>   |
| [segments]    | <code>number</code>  | <code>32</code>    |
| [theta]       | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset] | <code>number</code>  | <code>0</code>     |
| [m]           | <code>number</code>  | <code>2</code>     |
| [n]           | <code>number</code>  | <code>m</code>     |
| [closed]      | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..HexagonalGridOptions"></a>

### primitiveGeometry~HexagonalGridOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                 | Default           |
| ----------- | -------------------- | ----------------- |
| [sx]        | <code>number</code>  | <code>1</code>    |
| [nx]        | <code>number</code>  | <code>10</code>   |
| [ny]        | <code>number</code>  | <code>10</code>   |
| [inscribed] | <code>boolean</code> | <code>true</code> |

<a name="module_primitiveGeometry..QuadGridOptions"></a>

### primitiveGeometry~QuadGridOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name | Type                | Default         |
| ---- | ------------------- | --------------- |
| [sx] | <code>number</code> | <code>1</code>  |
| [sy] | <code>number</code> | <code>sx</code> |
| [nx] | <code>number</code> | <code>10</code> |
| [ny] | <code>number</code> | <code>nx</code> |

<a name="module_primitiveGeometry..TriangularGridOptions"></a>

### primitiveGeometry~TriangularGridOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                 | Default           |
| ----------- | -------------------- | ----------------- |
| [sx]        | <code>number</code>  | <code>1</code>    |
| [nx]        | <code>number</code>  | <code>10</code>   |
| [ny]        | <code>number</code>  | <code>10</code>   |
| [inscribed] | <code>boolean</code> | <code>true</code> |

<a name="module_primitiveGeometry..KiteOptions"></a>

### primitiveGeometry~KiteOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   | Description                                                                                                                                       |
| --------------- | ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>    | <code>1</code>                                            |                                                                                                                                                   |
| [sy]            | <code>number</code>    | <code>1</code>                                            |                                                                                                                                                   |
| [ratio]         | <code>number</code>    | <code>0.5</code>                                          | Bottom vertex distance from center, as a fraction of the top vertex's (sy). `ratio=1` is a rhombus, `ratio=0` collapses the bottom to the center. |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |                                                                                                                                                   |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |                                                                                                                                                   |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |                                                                                                                                                   |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |                                                                                                                                                   |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |                                                                                                                                                   |
| [thetaOffset]   | <code>number</code>    | <code>HALF_PI</code>                                      |                                                                                                                                                   |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                                                                                   |
| [mapping]       | <code>MappingFn</code> | <code>mappings.concentric</code>                          |                                                                                                                                                   |

<a name="module_primitiveGeometry..KitePathOptions"></a>

### primitiveGeometry~KitePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default              |
| -------------- | -------------------- | -------------------- |
| [sx]           | <code>number</code>  | <code>1</code>       |
| [sy]           | <code>number</code>  | <code>1</code>       |
| [ratio]        | <code>number</code>  | <code>0.5</code>     |
| [radius]       | <code>number</code>  | <code>0.5</code>     |
| [edgeSegments] | <code>number</code>  | <code>1</code>       |
| [theta]        | <code>number</code>  | <code>TAU</code>     |
| [thetaOffset]  | <code>number</code>  | <code>HALF_PI</code> |
| [closed]       | <code>boolean</code> | <code>false</code>   |

<a name="module_primitiveGeometry..LozengeOptions"></a>

### primitiveGeometry~LozengeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   |
| --------------- | ---------------------- | --------------------------------------------------------- |
| [sx]            | <code>number</code>    | <code>0.5</code>                                          |
| [sy]            | <code>number</code>    | <code>sx*2</code>                                         |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |
| [thetaOffset]   | <code>number</code>    | <code>HALF_PI</code>                                      |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |
| [mapping]       | <code>MappingFn</code> | <code>mappings.concentric</code>                          |

<a name="module_primitiveGeometry..LozengePathOptions"></a>

### primitiveGeometry~LozengePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default              |
| -------------- | -------------------- | -------------------- |
| [sx]           | <code>number</code>  | <code>0.5</code>     |
| [sy]           | <code>number</code>  | <code>sx*2</code>    |
| [radius]       | <code>number</code>  | <code>0.5</code>     |
| [edgeSegments] | <code>number</code>  | <code>1</code>       |
| [theta]        | <code>number</code>  | <code>TAU</code>     |
| [thetaOffset]  | <code>number</code>  | <code>HALF_PI</code> |
| [closed]       | <code>boolean</code> | <code>false</code>   |

<a name="module_primitiveGeometry..ParallelogramOptions"></a>

### primitiveGeometry~ParallelogramOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   | Description                                                                          |
| --------------- | ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [sx]            | <code>number</code>    | <code>0.5</code>                                          | Narrower than `trapezoid`'s default so the sheared top edge still fits the unit box. |
| [sy]            | <code>number</code>    | <code>1</code>                                            |                                                                                      |
| [shear]         | <code>number</code>    | <code>0.3</code>                                          | Horizontal shift of the top edge's center, in the same units as `sx`.                |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |                                                                                      |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |                                                                                      |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |                                                                                      |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |                                                                                      |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |                                                                                      |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |                                                                                      |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                      |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code>                         |                                                                                      |

<a name="module_primitiveGeometry..ParallelogramPathOptions"></a>

### primitiveGeometry~ParallelogramPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default            |
| -------------- | -------------------- | ------------------ |
| [sx]           | <code>number</code>  | <code>0.5</code>   |
| [sy]           | <code>number</code>  | <code>1</code>     |
| [shear]        | <code>number</code>  | <code>0.3</code>   |
| [radius]       | <code>number</code>  | <code>0.5</code>   |
| [edgeSegments] | <code>number</code>  | <code>1</code>     |
| [theta]        | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset]  | <code>number</code>  | <code>0</code>     |
| [closed]       | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..PlaneOptions"></a>

### primitiveGeometry~PlaneOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                                                                     | Default                    |
| ----------- | ------------------------------------------------------------------------ | -------------------------- |
| [sx]        | <code>number</code>                                                      | <code>1</code>             |
| [sy]        | <code>number</code>                                                      | <code>sx</code>            |
| [nx]        | <code>number</code>                                                      | <code>1</code>             |
| [ny]        | <code>number</code>                                                      | <code>nx</code>            |
| [direction] | [<code>PlaneDirection</code>](#module_primitiveGeometry..PlaneDirection) | <code>&quot;z&quot;</code> |

<a name="module_primitiveGeometry..PlaneDirection"></a>

### primitiveGeometry~PlaneDirection : <code>&quot;x&quot;</code> \| <code>&quot;-x&quot;</code> \| <code>&quot;y&quot;</code> \| <code>&quot;-y&quot;</code> \| <code>&quot;z&quot;</code> \| <code>&quot;-z&quot;</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
<a name="module_primitiveGeometry..RectanglePathOptions"></a>

### primitiveGeometry~RectanglePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name | Type                | Default          | Description                         |
| ---- | ------------------- | ---------------- | ----------------------------------- |
| [sx] | <code>number</code> | <code>1</code>   |                                     |
| [sy] | <code>number</code> | <code>0.5</code> |                                     |
| [nx] | <code>number</code> | <code>1</code>   | Segments along the bottom/top edges |
| [ny] | <code>number</code> | <code>nx</code>  | Segments along the left/right edges |

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

| Name    | Type                | Default         | Description                         |
| ------- | ------------------- | --------------- | ----------------------------------- |
| [scale] | <code>number</code> | <code>1</code>  | Side length.                        |
| [nx]    | <code>number</code> | <code>1</code>  | Segments along the bottom/top edges |
| [ny]    | <code>number</code> | <code>nx</code> | Segments along the left/right edges |

<a name="module_primitiveGeometry..RhombusOptions"></a>

### primitiveGeometry~RhombusOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   |
| --------------- | ---------------------- | --------------------------------------------------------- |
| [sx]            | <code>number</code>    | <code>1</code>                                            |
| [sy]            | <code>number</code>    | <code>1</code>                                            |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |
| [thetaOffset]   | <code>number</code>    | <code>HALF_PI</code>                                      |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |
| [mapping]       | <code>MappingFn</code> | <code>mappings.concentric</code>                          |

<a name="module_primitiveGeometry..RhombusPathOptions"></a>

### primitiveGeometry~RhombusPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default              |
| -------------- | -------------------- | -------------------- |
| [sx]           | <code>number</code>  | <code>1</code>       |
| [sy]           | <code>number</code>  | <code>1</code>       |
| [radius]       | <code>number</code>  | <code>0.5</code>     |
| [edgeSegments] | <code>number</code>  | <code>1</code>       |
| [theta]        | <code>number</code>  | <code>TAU</code>     |
| [thetaOffset]  | <code>number</code>  | <code>HALF_PI</code> |
| [closed]       | <code>boolean</code> | <code>false</code>   |

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
| [roundSegments]  | <code>number</code>                                                                                    | <code>8</code>                                                                                                |                                                  |
| [nx]             | <code>number</code>                                                                                    | <code>1</code>                                                                                                | Segments along the straight top/bottom sections. |
| [ny]             | <code>number</code>                                                                                    | <code>nx</code>                                                                                               | Segments along the straight left/right sections. |
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
| [roundSegments]  | <code>number</code>                                                                                    | <code>8</code>                                                                                                |
| [nx]             | <code>number</code>                                                                                    | <code>1</code>                                                                                                |
| [ny]             | <code>number</code>                                                                                    | <code>nx</code>                                                                                               |
| [roundedCorners] | [<code>Array.&lt;RoundedRectangleCorner&gt;</code>](#module_primitiveGeometry..RoundedRectangleCorner) | <code>[&quot;top-left&quot;, &quot;top-right&quot;, &quot;bottom-right&quot;, &quot;bottom-left&quot;]</code> |
| [closed]         | <code>boolean</code>                                                                                   | <code>false</code>                                                                                            |

<a name="module_primitiveGeometry..StadiumOptions"></a>

### primitiveGeometry~StadiumOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                | Default          |
| --------------- | ------------------- | ---------------- |
| [sx]            | <code>number</code> | <code>1</code>   |
| [sy]            | <code>number</code> | <code>0.5</code> |
| [nx]            | <code>number</code> | <code>1</code>   |
| [ny]            | <code>number</code> | <code>nx</code>  |
| [roundSegments] | <code>number</code> | <code>8</code>   |

<a name="module_primitiveGeometry..StadiumPathOptions"></a>

### primitiveGeometry~StadiumPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                 | Default            |
| --------------- | -------------------- | ------------------ |
| [sx]            | <code>number</code>  | <code>1</code>     |
| [sy]            | <code>number</code>  | <code>0.5</code>   |
| [nx]            | <code>number</code>  | <code>1</code>     |
| [ny]            | <code>number</code>  | <code>nx</code>    |
| [roundSegments] | <code>number</code>  | <code>8</code>     |
| [closed]        | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..TrapezoidOptions"></a>

### primitiveGeometry~TrapezoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   | Description                                                                                                                                                                                       |
| --------------- | ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>    | <code>1</code>                                            | Bottom edge half-width.                                                                                                                                                                           |
| [sy]            | <code>number</code>    | <code>1</code>                                            | Half-height: the bottom/top edges sit at `y =   -sy`/`y = sy`.                                                                                                                                    |
| [topRatio]      | <code>number</code>    | <code>0.5</code>                                          | Top edge half-width, as a fraction of `sx`. `1` matches the bottom edge's width (a parallelogram once `topOffset` shifts it off-center); `0` collapses the top edge to a point (a triangle).      |
| [topOffset]     | <code>number</code>    | <code>0</code>                                            | Horizontal shift of the top edge's center, in the same units as `sx`. `0` (default) keeps both legs symmetric (an isosceles trapezoid); a non-zero shift skews it into a right/scalene trapezoid. |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |                                                                                                                                                                                                   |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |                                                                                                                                                                                                   |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |                                                                                                                                                                                                   |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |                                                                                                                                                                                                   |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          | Negative values aren't supported: the corner lookup assumes `t - thetaOffset` stays non-negative.                                                                                                 |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |                                                                                                                                                                                                   |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                                                                                                                                   |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code>                         | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap.                                                                                                                            |

<a name="module_primitiveGeometry..TrapezoidPathOptions"></a>

### primitiveGeometry~TrapezoidPathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default            |
| -------------- | -------------------- | ------------------ |
| [sx]           | <code>number</code>  | <code>1</code>     |
| [sy]           | <code>number</code>  | <code>1</code>     |
| [topRatio]     | <code>number</code>  | <code>0.5</code>   |
| [topOffset]    | <code>number</code>  | <code>0</code>     |
| [radius]       | <code>number</code>  | <code>0.5</code>   |
| [edgeSegments] | <code>number</code>  | <code>1</code>     |
| [theta]        | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset]  | <code>number</code>  | <code>0</code>     |
| [closed]       | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..RightTriangleOptions"></a>

### primitiveGeometry~RightTriangleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   | Description                                                                                                                 |
| --------------- | ---------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>    | <code>1</code>                                            | Horizontal leg half-length: the leg itself runs the full `2 * sx`, from the right-angle corner to the opposite base corner. |
| [sy]            | <code>number</code>    | <code>1</code>                                            | Vertical leg half-length, likewise doubled.                                                                                 |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |                                                                                                                             |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |                                                                                                                             |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |                                                                                                                             |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |                                                                                                                             |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          |                                                                                                                             |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |                                                                                                                             |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                                                             |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code>                         |                                                                                                                             |

<a name="module_primitiveGeometry..RightTrianglePathOptions"></a>

### primitiveGeometry~RightTrianglePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default            |
| -------------- | -------------------- | ------------------ |
| [sx]           | <code>number</code>  | <code>1</code>     |
| [sy]           | <code>number</code>  | <code>1</code>     |
| [radius]       | <code>number</code>  | <code>0.5</code>   |
| [edgeSegments] | <code>number</code>  | <code>1</code>     |
| [theta]        | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset]  | <code>number</code>  | <code>0</code>     |
| [closed]       | <code>boolean</code> | <code>false</code> |

<a name="module_primitiveGeometry..TriangleOptions"></a>

### primitiveGeometry~TriangleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                   | Default                                                   | Description                                                                                                                                                                                                               |
| --------------- | ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sx]            | <code>number</code>    | <code>1</code>                                            | Base half-width: the base corners sit at `x =   -sx`/`x = sx`.                                                                                                                                                            |
| [sy]            | <code>number</code>    | <code>1</code>                                            | Half-height: the base sits at `y = -sy`, the apex at `y = sy`.                                                                                                                                                            |
| [apexOffset]    | <code>number</code>    | <code>0</code>                                            | Horizontal shift of the apex, in the same units as `sx`. `0` (default) keeps it centered (an isosceles triangle); `±sx` lands it directly above a base corner (a right triangle); anything else gives a scalene triangle. |
| [radius]        | <code>number</code>    | <code>0.5</code>                                          |                                                                                                                                                                                                                           |
| [edgeSegments]  | <code>number</code>    | <code>1</code>                                            |                                                                                                                                                                                                                           |
| [innerSegments] | <code>number</code>    | <code>16</code>                                           |                                                                                                                                                                                                                           |
| [innerRadius]   | <code>number</code>    | <code>0</code>                                            |                                                                                                                                                                                                                           |
| [theta]         | <code>number</code>    | <code>TAU</code>                                          | Negative values aren't supported: the corner lookup assumes `t - thetaOffset` stays non-negative.                                                                                                                         |
| [thetaOffset]   | <code>number</code>    | <code>0</code>                                            |                                                                                                                                                                                                                           |
| [mergeCentroid] | <code>boolean</code>   | <code>&quot;innerRadius &#x3D;&#x3D;&#x3D; 0&quot;</code> |                                                                                                                                                                                                                           |
| [mapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code>                         | Uv mapping function. Defaults to a flat, bounding-box-relative unwrap.                                                                                                                                                    |

<a name="module_primitiveGeometry..TrianglePathOptions"></a>

### primitiveGeometry~TrianglePathOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                 | Default            |
| -------------- | -------------------- | ------------------ |
| [sx]           | <code>number</code>  | <code>1</code>     |
| [sy]           | <code>number</code>  | <code>1</code>     |
| [apexOffset]   | <code>number</code>  | <code>0</code>     |
| [radius]       | <code>number</code>  | <code>0.5</code>   |
| [edgeSegments] | <code>number</code>  | <code>1</code>     |
| [theta]        | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset]  | <code>number</code>  | <code>0</code>     |
| [closed]       | <code>boolean</code> | <code>false</code> |

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

| Name | Type                | Default         |
| ---- | ------------------- | --------------- |
| [sx] | <code>number</code> | <code>1</code>  |
| [sy] | <code>number</code> | <code>sx</code> |
| [sz] | <code>number</code> | <code>sx</code> |
| [nx] | <code>number</code> | <code>1</code>  |
| [ny] | <code>number</code> | <code>nx</code> |
| [nz] | <code>number</code> | <code>nx</code> |

<a name="module_primitiveGeometry..HollowCubeOptions"></a>

### primitiveGeometry~HollowCubeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                | Default             | Description                                                                                     |
| ----------- | ------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| [sx]        | <code>number</code> | <code>1</code>      |                                                                                                 |
| [sy]        | <code>number</code> | <code>sx</code>     |                                                                                                 |
| [sz]        | <code>number</code> | <code>sx</code>     |                                                                                                 |
| [thickness] | <code>number</code> | <code>sx*0.2</code> | Uniform beam/wall size (must stay < half of the smallest of sx/sy/sz for positive-length beams) |

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
| [roundSegments]  | <code>number</code>                                                                  | <code>8</code>               |                                         |
| [nx]             | <code>number</code>                                                                  | <code>1</code>               | Segments along the straight x sections. |
| [ny]             | <code>number</code>                                                                  | <code>nx</code>              | Segments along the straight y sections. |
| [nz]             | <code>number</code>                                                                  | <code>nx</code>              | Segments along the straight z sections. |
| [roundDirection] | [<code>RoundedCubeDirection</code>](#module_primitiveGeometry..RoundedCubeDirection) | <code>&quot;all&quot;</code> |                                         |

<a name="module_primitiveGeometry..AntiprismOptions"></a>

### primitiveGeometry~AntiprismOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name         | Type                   | Default                           |
| ------------ | ---------------------- | --------------------------------- |
| [radius]     | <code>number</code>    | <code>0.25</code>                 |
| [height]     | <code>number</code>    | <code>1</code>                    |
| [sides]      | <code>number</code>    | <code>6</code>                    |
| [phiOffset]  | <code>number</code>    | <code>0</code>                    |
| [capMapping] | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..PrismOptions"></a>

### primitiveGeometry~PrismOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name         | Type                   | Default                           |
| ------------ | ---------------------- | --------------------------------- |
| [radius]     | <code>number</code>    | <code>0.25</code>                 |
| [height]     | <code>number</code>    | <code>1</code>                    |
| [sides]      | <code>number</code>    | <code>6</code>                    |
| [phiOffset]  | <code>number</code>    | <code>0</code>                    |
| [capMapping] | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..AppleOptions"></a>

### primitiveGeometry~AppleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                   | Description                                                                                                                                                                                     |
| --------------- | --------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>         | <code>0.5</code>          | Equatorial (belly) radius                                                                                                                                                                       |
| [height]        | <code>number</code>         | <code>radius</code>       | Full height between the two dimple points, silently clamped to (0, radius*2] - the generating circle's own radius must exceed its offset from the axis (see below), which fails past that bound |
| [nx]            | <code>number</code>         | <code>32</code>           |                                                                                                                                                                                                 |
| [ny]            | <code>number</code>         | <code>16</code>           |                                                                                                                                                                                                 |
| [phi]           | <code>number</code>         | <code>TAU</code>          |                                                                                                                                                                                                 |
| [phiOffset]     | <code>number</code>         | <code>0</code>            |                                                                                                                                                                                                 |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code> |                                                                                                                                                                                                 |

<a name="module_primitiveGeometry..AstroidalEllipsoidOptions"></a>

### primitiveGeometry~AstroidalEllipsoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                | Default              | Description                                                                                                                |
| ------------- | ------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [radius]      | <code>number</code> | <code>0.5</code>     |                                                                                                                            |
| [nx]          | <code>number</code> | <code>32</code>      |                                                                                                                            |
| [ny]          | <code>number</code> | <code>16</code>      |                                                                                                                            |
| [sx]          | <code>number</code> | <code>1</code>       |                                                                                                                            |
| [sy]          | <code>number</code> | <code>0.5</code>     |                                                                                                                            |
| [sz]          | <code>number</code> | <code>sy</code>      |                                                                                                                            |
| [theta]       | <code>number</code> | <code>Math.PI</code> | Meridian sweep length, silently clamped to [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions for why. |
| [thetaOffset] | <code>number</code> | <code>0</code>       | Meridian sweep start, silently clamped to [0, PI] - see theta.                                                             |
| [phi]         | <code>number</code> | <code>TAU</code>     |                                                                                                                            |
| [phiOffset]   | <code>number</code> | <code>0</code>       |                                                                                                                            |

<a name="module_primitiveGeometry..BarrelOptions"></a>

### primitiveGeometry~BarrelOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                           | Description                                                                                                                                                                                                                                                                    |
| --------------- | --------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [height]        | <code>number</code>         | <code>1</code>                    |                                                                                                                                                                                                                                                                                |
| [radius]        | <code>number</code>         | <code>0.5</code>                  | Belly radius, at the equator (y = 0)                                                                                                                                                                                                                                           |
| [endRadius]     | <code>number</code>         | <code>radius*0.7</code>           | Rim radius, at y = ±height/2 (both ends, symmetric) - must be < radius for an actual outward bulge; endRadius = radius degenerates to a plain cylinder, endRadius > radius pinches inward instead (a barrel held together the wrong way round, still a valid NaN-free surface) |
| [nx]            | <code>number</code>         | <code>32</code>                   |                                                                                                                                                                                                                                                                                |
| [ny]            | <code>number</code>         | <code>16</code>                   |                                                                                                                                                                                                                                                                                |
| [capSegments]   | <code>number</code>         | <code>1</code>                    |                                                                                                                                                                                                                                                                                |
| [capApex]       | <code>boolean</code>        | <code>true</code>                 |                                                                                                                                                                                                                                                                                |
| [capBase]       | <code>boolean</code>        | <code>true</code>                 |                                                                                                                                                                                                                                                                                |
| [phi]           | <code>number</code>         | <code>TAU</code>                  |                                                                                                                                                                                                                                                                                |
| [phiOffset]     | <code>number</code>         | <code>0</code>                    |                                                                                                                                                                                                                                                                                |
| [capMapping]    | <code>MappingFn</code>      | <code>mappings.rectangular</code> |                                                                                                                                                                                                                                                                                |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code>         |                                                                                                                                                                                                                                                                                |

<a name="module_primitiveGeometry..BiconeOptions"></a>

### primitiveGeometry~BiconeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name        | Type                | Default          | Description                                  |
| ----------- | ------------------- | ---------------- | -------------------------------------------- |
| [height]    | <code>number</code> | <code>1</code>   |                                              |
| [radius]    | <code>number</code> | <code>0.5</code> |                                              |
| [nx]        | <code>number</code> | <code>16</code>  |                                              |
| [ny]        | <code>number</code> | <code>1</code>   | Meridian segments per half (top/bottom cone) |
| [phi]       | <code>number</code> | <code>TAU</code> |                                              |
| [phiOffset] | <code>number</code> | <code>0</code>   |                                              |
| [sx]        | <code>number</code> | <code>1</code>   | Equator x scale, elliptical when != sz       |
| [sz]        | <code>number</code> | <code>1</code>   | Equator z scale, elliptical when != sx       |

<a name="module_primitiveGeometry..CapsuleOptions"></a>

### primitiveGeometry~CapsuleOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                   | Description                                                |
| --------------- | --------------------------- | ------------------------- | ---------------------------------------------------------- |
| [height]        | <code>number</code>         | <code>0.5</code>          |                                                            |
| [radius]        | <code>number</code>         | <code>0.25</code>         |                                                            |
| [nx]            | <code>number</code>         | <code>16</code>           |                                                            |
| [ny]            | <code>number</code>         | <code>1</code>            |                                                            |
| [roundSegments] | <code>number</code>         | <code>16</code>           | `0` collapses both hemispheres away, leaving an open tube. |
| [phi]           | <code>number</code>         | <code>TAU</code>          |                                                            |
| [phiOffset]     | <code>number</code>         | <code>0</code>            |                                                            |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code> |                                                            |

<a name="module_primitiveGeometry..ConeOptions"></a>

### primitiveGeometry~ConeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                           | Description                              |
| --------------- | --------------------------- | --------------------------------- | ---------------------------------------- |
| [height]        | <code>number</code>         | <code>1</code>                    |                                          |
| [radius]        | <code>number</code>         | <code>0.25</code>                 |                                          |
| [nx]            | <code>number</code>         | <code>16</code>                   |                                          |
| [ny]            | <code>number</code>         | <code>1</code>                    |                                          |
| [capSegments]   | <code>number</code>         | <code>1</code>                    |                                          |
| [capBase]       | <code>boolean</code>        | <code>true</code>                 |                                          |
| [phi]           | <code>number</code>         | <code>TAU</code>                  |                                          |
| [phiOffset]     | <code>number</code>         | <code>0</code>                    |                                          |
| [capMapping]    | <code>MappingFn</code>      | <code>mappings.rectangular</code> |                                          |
| [sx]            | <code>number</code>         | <code>1</code>                    | Base ring x scale, elliptical when != sz |
| [sz]            | <code>number</code>         | <code>1</code>                    | Base ring z scale, elliptical when != sx |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code>         |                                          |

<a name="module_primitiveGeometry..CylinderOptions"></a>

### primitiveGeometry~CylinderOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name              | Type                        | Default                           | Description                                |
| ----------------- | --------------------------- | --------------------------------- | ------------------------------------------ |
| [height]          | <code>number</code>         | <code>1</code>                    |                                            |
| [radius]          | <code>number</code>         | <code>0.25</code>                 |                                            |
| [nx]              | <code>number</code>         | <code>16</code>                   |                                            |
| [ny]              | <code>number</code>         | <code>1</code>                    |                                            |
| [radiusApex]      | <code>number</code>         | <code>radius</code>               |                                            |
| [capSegments]     | <code>number</code>         | <code>1</code>                    |                                            |
| [capApex]         | <code>boolean</code>        | <code>true</code>                 |                                            |
| [capBase]         | <code>boolean</code>        | <code>true</code>                 |                                            |
| [capBaseSegments] | <code>number</code>         | <code>capSegments</code>          |                                            |
| [phi]             | <code>number</code>         | <code>TAU</code>                  |                                            |
| [phiOffset]       | <code>number</code>         | <code>0</code>                    |                                            |
| [capMapping]      | <code>MappingFn</code>      | <code>mappings.rectangular</code> |                                            |
| [sx]              | <code>number</code>         | <code>1</code>                    | Base ring x scale, elliptical when != sz   |
| [sz]              | <code>number</code>         | <code>1</code>                    | Base ring z scale, elliptical when != sx   |
| [sxApex]          | <code>number</code>         | <code>sx</code>                   | Apex ring x scale, independent of the base |
| [szApex]          | <code>number</code>         | <code>sz</code>                   | Apex ring z scale, independent of the base |
| [vDistribution]   | <code>DistributionFn</code> | <code>utils.linear</code>         |                                            |

<a name="module_primitiveGeometry..DoubleConeOptions"></a>

### primitiveGeometry~DoubleConeOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name              | Type                   | Default                           | Description                                  |
| ----------------- | ---------------------- | --------------------------------- | -------------------------------------------- |
| [height]          | <code>number</code>    | <code>1</code>                    |                                              |
| [radius]          | <code>number</code>    | <code>0.5</code>                  |                                              |
| [nx]              | <code>number</code>    | <code>16</code>                   |                                              |
| [ny]              | <code>number</code>    | <code>1</code>                    | Meridian segments per half (top/bottom cone) |
| [capSegments]     | <code>number</code>    | <code>1</code>                    |                                              |
| [capApex]         | <code>boolean</code>   | <code>true</code>                 |                                              |
| [capBase]         | <code>boolean</code>   | <code>true</code>                 |                                              |
| [capBaseSegments] | <code>number</code>    | <code>capSegments</code>          |                                              |
| [phi]             | <code>number</code>    | <code>TAU</code>                  |                                              |
| [phiOffset]       | <code>number</code>    | <code>0</code>                    |                                              |
| [capMapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |                                              |
| [sx]              | <code>number</code>    | <code>1</code>                    | End ring x scale, elliptical when != sz      |
| [sz]              | <code>number</code>    | <code>1</code>                    | End ring z scale, elliptical when != sx      |

<a name="module_primitiveGeometry..EllipsoidOptions"></a>

### primitiveGeometry~EllipsoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                   | Description                                                                                                                                              |
| --------------- | --------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>         | <code>0.5</code>          |                                                                                                                                                          |
| [nx]            | <code>number</code>         | <code>32</code>           |                                                                                                                                                          |
| [ny]            | <code>number</code>         | <code>16</code>           |                                                                                                                                                          |
| [sx]            | <code>number</code>         | <code>1</code>            |                                                                                                                                                          |
| [sy]            | <code>number</code>         | <code>0.5</code>          |                                                                                                                                                          |
| [sz]            | <code>number</code>         | <code>sy</code>           |                                                                                                                                                          |
| [theta]         | <code>number</code>         | <code>Math.PI</code>      | Meridian sweep length, silently clamped to [-thetaOffset, PI - thetaOffset]: a pole can only sit at the sweep's own start or end, never partway through. |
| [thetaOffset]   | <code>number</code>         | <code>0</code>            | Meridian sweep start (0 = north pole), silently clamped to [0, PI] - see theta.                                                                          |
| [phi]           | <code>number</code>         | <code>TAU</code>          |                                                                                                                                                          |
| [phiOffset]     | <code>number</code>         | <code>0</code>            |                                                                                                                                                          |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code> |                                                                                                                                                          |

<a name="module_primitiveGeometry..FunnelOptions"></a>

### primitiveGeometry~FunnelOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                           | Description                                                                                                                                                                                                                                            |
| --------------- | --------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [height]        | <code>number</code>         | <code>1</code>                    |                                                                                                                                                                                                                                                        |
| [radius]        | <code>number</code>         | <code>0.1</code>                  | Spout radius, at y = -height/2                                                                                                                                                                                                                         |
| [radiusApex]    | <code>number</code>         | <code>radius*5</code>             | Mouth radius, at y = height/2 - must be > radius for the usual flared-outward shape; radiusApex = radius degenerates to a plain cylinder, radiusApex < radius flips the taper (still a valid, NaN-free surface, just narrowing toward the top instead) |
| [nx]            | <code>number</code>         | <code>32</code>                   |                                                                                                                                                                                                                                                        |
| [ny]            | <code>number</code>         | <code>16</code>                   |                                                                                                                                                                                                                                                        |
| [capSegments]   | <code>number</code>         | <code>1</code>                    |                                                                                                                                                                                                                                                        |
| [capApex]       | <code>boolean</code>        | <code>true</code>                 |                                                                                                                                                                                                                                                        |
| [capBase]       | <code>boolean</code>        | <code>true</code>                 |                                                                                                                                                                                                                                                        |
| [phi]           | <code>number</code>         | <code>TAU</code>                  |                                                                                                                                                                                                                                                        |
| [phiOffset]     | <code>number</code>         | <code>0</code>                    |                                                                                                                                                                                                                                                        |
| [capMapping]    | <code>MappingFn</code>      | <code>mappings.rectangular</code> |                                                                                                                                                                                                                                                        |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code>         |                                                                                                                                                                                                                                                        |

<a name="module_primitiveGeometry..HollowCylinderOptions"></a>

### primitiveGeometry~HollowCylinderOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                 | Default                 | Description                         |
| ------------- | -------------------- | ----------------------- | ----------------------------------- |
| [height]      | <code>number</code>  | <code>1</code>          |                                     |
| [radius]      | <code>number</code>  | <code>0.5</code>        |                                     |
| [innerRadius] | <code>number</code>  | <code>radius*0.5</code> | Bore radius                         |
| [nx]          | <code>number</code>  | <code>32</code>         |                                     |
| [ny]          | <code>number</code>  | <code>1</code>          |                                     |
| [capSegments] | <code>number</code>  | <code>1</code>          | Radial segments of each annular cap |
| [capApex]     | <code>boolean</code> | <code>true</code>       |                                     |
| [capBase]     | <code>boolean</code> | <code>true</code>       |                                     |
| [phi]         | <code>number</code>  | <code>TAU</code>        |                                     |
| [phiOffset]   | <code>number</code>  | <code>0</code>          |                                     |

<a name="module_primitiveGeometry..HollowSphereOptions"></a>

### primitiveGeometry~HollowSphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                | Default                  | Description                                                |
| ------------- | ------------------- | ------------------------ | ---------------------------------------------------------- |
| [radius]      | <code>number</code> | <code>0.5</code>         |                                                            |
| [innerRadius] | <code>number</code> | <code>radius*0.5</code>  |                                                            |
| [nx]          | <code>number</code> | <code>32</code>          |                                                            |
| [ny]          | <code>number</code> | <code>16</code>          |                                                            |
| [capSegments] | <code>number</code> | <code>1</code>           | Radial segments of each cut cap                            |
| [theta]       | <code>number</code> | <code>Math.PI / 2</code> | Meridian sweep length, silently clamped like `ellipsoid`'s |
| [thetaOffset] | <code>number</code> | <code>Math.PI / 4</code> | Meridian sweep start, silently clamped like `ellipsoid`'s  |
| [phi]         | <code>number</code> | <code>TAU</code>         |                                                            |
| [phiOffset]   | <code>number</code> | <code>0</code>           |                                                            |

<a name="module_primitiveGeometry..HyperboloidOptions"></a>

### primitiveGeometry~HyperboloidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                           | Description                                                                                                                                                                                                                                                                                                                        |
| --------------- | --------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [height]        | <code>number</code>         | <code>1</code>                    |                                                                                                                                                                                                                                                                                                                                    |
| [radius]        | <code>number</code>         | <code>0.25</code>                 | Waist radius, at y = 0                                                                                                                                                                                                                                                                                                             |
| [endRadius]     | <code>number</code>         | <code>radius*2</code>             | Rim radius, at y = ±height/2 (both ends, symmetric) - the classic one-sheet shape needs endRadius > radius (pinched waist flaring to both rims); endRadius = radius degenerates to a plain cylinder, and endRadius < radius traces an oblate-spheroid-like profile instead (still a valid, NaN-free surface, just not a hyperbola) |
| [nx]            | <code>number</code>         | <code>32</code>                   |                                                                                                                                                                                                                                                                                                                                    |
| [ny]            | <code>number</code>         | <code>16</code>                   |                                                                                                                                                                                                                                                                                                                                    |
| [capSegments]   | <code>number</code>         | <code>1</code>                    |                                                                                                                                                                                                                                                                                                                                    |
| [capApex]       | <code>boolean</code>        | <code>true</code>                 |                                                                                                                                                                                                                                                                                                                                    |
| [capBase]       | <code>boolean</code>        | <code>true</code>                 |                                                                                                                                                                                                                                                                                                                                    |
| [phi]           | <code>number</code>         | <code>TAU</code>                  |                                                                                                                                                                                                                                                                                                                                    |
| [phiOffset]     | <code>number</code>         | <code>0</code>                    |                                                                                                                                                                                                                                                                                                                                    |
| [capMapping]    | <code>MappingFn</code>      | <code>mappings.rectangular</code> |                                                                                                                                                                                                                                                                                                                                    |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code>         |                                                                                                                                                                                                                                                                                                                                    |

<a name="module_primitiveGeometry..LemonOptions"></a>

### primitiveGeometry~LemonOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                   | Description                                                                                                                                                                                                                                                                                            |
| --------------- | --------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [radius]        | <code>number</code>         | <code>0.3</code>          | Equatorial (widest) radius                                                                                                                                                                                                                                                                             |
| [height]        | <code>number</code>         | <code>1</code>            | Full height between the two pointed ends, silently raised to at least radius_2 - below that the generating circle's center offset would go negative, no longer tracing the lemon's own (minor, less-than-half-circle) arc; height = radius_2 exactly degenerates to a plain sphere (the offset hits 0) |
| [nx]            | <code>number</code>         | <code>32</code>           |                                                                                                                                                                                                                                                                                                        |
| [ny]            | <code>number</code>         | <code>16</code>           |                                                                                                                                                                                                                                                                                                        |
| [phi]           | <code>number</code>         | <code>TAU</code>          |                                                                                                                                                                                                                                                                                                        |
| [phiOffset]     | <code>number</code>         | <code>0</code>            |                                                                                                                                                                                                                                                                                                        |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code> |                                                                                                                                                                                                                                                                                                        |

<a name="module_primitiveGeometry..ParaboloidOptions"></a>

### primitiveGeometry~ParaboloidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                           | Description                        |
| --------------- | --------------------------- | --------------------------------- | ---------------------------------- |
| [height]        | <code>number</code>         | <code>1</code>                    |                                    |
| [radius]        | <code>number</code>         | <code>0.5</code>                  | Rim radius, at the open (base) end |
| [nx]            | <code>number</code>         | <code>32</code>                   |                                    |
| [ny]            | <code>number</code>         | <code>16</code>                   |                                    |
| [capSegments]   | <code>number</code>         | <code>1</code>                    |                                    |
| [capBase]       | <code>boolean</code>        | <code>true</code>                 |                                    |
| [phi]           | <code>number</code>         | <code>TAU</code>                  |                                    |
| [phiOffset]     | <code>number</code>         | <code>0</code>                    |                                    |
| [capMapping]    | <code>MappingFn</code>      | <code>mappings.rectangular</code> |                                    |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code>         |                                    |

<a name="module_primitiveGeometry..RoundedCylinderOptions"></a>

### primitiveGeometry~RoundedCylinderOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                   | Description                                                                                                                                                                 |
| --------------- | --------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [height]        | <code>number</code>         | <code>1</code>            |                                                                                                                                                                             |
| [radius]        | <code>number</code>         | <code>0.25</code>         |                                                                                                                                                                             |
| [roundRadius]   | <code>number</code>         | <code>radius*0.3</code>   | Fillet radius at the top/bottom rim, silently clamped to [0, min(radius, height/2)] - the fillet can neither exceed the body's own radius nor meet itself across the height |
| [nx]            | <code>number</code>         | <code>16</code>           |                                                                                                                                                                             |
| [ny]            | <code>number</code>         | <code>1</code>            | Straight side segments                                                                                                                                                      |
| [roundSegments] | <code>number</code>         | <code>8</code>            | Fillet segments (each end)                                                                                                                                                  |
| [capSegments]   | <code>number</code>         | <code>1</code>            | Flat cap segments (each end)                                                                                                                                                |
| [phi]           | <code>number</code>         | <code>TAU</code>          |                                                                                                                                                                             |
| [phiOffset]     | <code>number</code>         | <code>0</code>            |                                                                                                                                                                             |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code> |                                                                                                                                                                             |

<a name="module_primitiveGeometry..SphereOptions"></a>

### primitiveGeometry~SphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name          | Type                | Default              |
| ------------- | ------------------- | -------------------- |
| [radius]      | <code>number</code> | <code>0.5</code>     |
| [nx]          | <code>number</code> | <code>32</code>      |
| [ny]          | <code>number</code> | <code>16</code>      |
| [theta]       | <code>number</code> | <code>Math.PI</code> |
| [thetaOffset] | <code>number</code> | <code>0</code>       |
| [phi]         | <code>number</code> | <code>TAU</code>     |
| [phiOffset]   | <code>number</code> | <code>0</code>       |

<a name="module_primitiveGeometry..SphericalRingOptions"></a>

### primitiveGeometry~SphericalRingOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                   | Description                                                                                                         |
| --------------- | --------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>         | <code>0.5</code>          | Sphere radius                                                                                                       |
| [innerRadius]   | <code>number</code>         | <code>radius*0.5</code>   | Cylindrical bore radius, silently clamped to [0, radius] - a bore wider than the sphere has no sensible rim to meet |
| [nx]            | <code>number</code>         | <code>32</code>           |                                                                                                                     |
| [ny]            | <code>number</code>         | <code>16</code>           | Outer spherical band meridian segments                                                                              |
| [holeSegments]  | <code>number</code>         | <code>1</code>            | Inner bore wall segments                                                                                            |
| [phi]           | <code>number</code>         | <code>TAU</code>          |                                                                                                                     |
| [phiOffset]     | <code>number</code>         | <code>0</code>            |                                                                                                                     |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code> | Applies to the outer spherical band only - the inner bore wall is a plain cylinder.                                 |

<a name="module_primitiveGeometry..SphericonOptions"></a>

### primitiveGeometry~SphericonOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description                                                                                                                                   |
| -------- | ------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius] | <code>number</code> | <code>0.5</code> |                                                                                                                                               |
| [nx]     | <code>number</code> | <code>16</code>  | Segments per quarter-cone's half-turn sweep                                                                                                   |
| [ny]     | <code>number</code> | <code>1</code>   | Meridian segments per quarter-cone (its meridian is a straight cone slant, so ny > 1 buys nothing by default, same as cone/bicone/doubleCone) |

<a name="module_primitiveGeometry..SupereggOptions"></a>

### primitiveGeometry~SupereggOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                   | Description                                                                                                                                           |
| --------------- | --------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>         | <code>0.5</code>          | Equatorial radius                                                                                                                                     |
| [sy]            | <code>number</code>         | <code>5/6</code>          | Vertical (polar) scale                                                                                                                                |
| [nx]            | <code>number</code>         | <code>32</code>           |                                                                                                                                                       |
| [ny]            | <code>number</code>         | <code>16</code>           |                                                                                                                                                       |
| [n]             | <code>number</code>         | <code>2.5</code>          | Roundness exponent - Piet Hein's original; n > 2 gives a "true" superegg, n = 2 is a spheroid, n < 2 rounds toward a cylinder-capped-with-cones shape |
| [theta]         | <code>number</code>         | <code>Math.PI</code>      | Meridian sweep length, silently clamped to [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions for why.                            |
| [thetaOffset]   | <code>number</code>         | <code>0</code>            | Meridian sweep start, silently clamped to [0, PI] - see theta.                                                                                        |
| [phi]           | <code>number</code>         | <code>TAU</code>          |                                                                                                                                                       |
| [phiOffset]     | <code>number</code>         | <code>0</code>            |                                                                                                                                                       |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code> |                                                                                                                                                       |

<a name="module_primitiveGeometry..SuperellipsoidOptions"></a>

### primitiveGeometry~SuperellipsoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name            | Type                        | Default                   | Description                                                                                                                |
| --------------- | --------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [radius]        | <code>number</code>         | <code>0.5</code>          |                                                                                                                            |
| [nx]            | <code>number</code>         | <code>32</code>           |                                                                                                                            |
| [ny]            | <code>number</code>         | <code>16</code>           |                                                                                                                            |
| [sx]            | <code>number</code>         | <code>1</code>            |                                                                                                                            |
| [sy]            | <code>number</code>         | <code>0.5</code>          |                                                                                                                            |
| [sz]            | <code>number</code>         | <code>sy</code>           |                                                                                                                            |
| [n1]            | <code>number</code>         | <code>3</code>            | North-south (meridian) roundness exponent                                                                                  |
| [n2]            | <code>number</code>         | <code>n1</code>           | East-west (cross-section) roundness exponent                                                                               |
| [theta]         | <code>number</code>         | <code>Math.PI</code>      | Meridian sweep length, silently clamped to [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions for why. |
| [thetaOffset]   | <code>number</code>         | <code>0</code>            | Meridian sweep start, silently clamped to [0, PI] - see theta.                                                             |
| [phi]           | <code>number</code>         | <code>TAU</code>          |                                                                                                                            |
| [phiOffset]     | <code>number</code>         | <code>0</code>            |                                                                                                                            |
| [vDistribution] | <code>DistributionFn</code> | <code>utils.linear</code> |                                                                                                                            |

<a name="module_primitiveGeometry..TorusOptions"></a>

### primitiveGeometry~TorusOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name               | Type                   | Default                           | Description                                                            |
| ------------------ | ---------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| [radius]           | <code>number</code>    | <code>0.4</code>                  |                                                                        |
| [segments]         | <code>number</code>    | <code>64</code>                   |                                                                        |
| [minorRadius]      | <code>number</code>    | <code>0.1</code>                  |                                                                        |
| [minorSegments]    | <code>number</code>    | <code>32</code>                   |                                                                        |
| [theta]            | <code>number</code>    | <code>TAU</code>                  |                                                                        |
| [thetaOffset]      | <code>number</code>    | <code>0</code>                    |                                                                        |
| [phi]              | <code>number</code>    | <code>TAU</code>                  |                                                                        |
| [phiOffset]        | <code>number</code>    | <code>0</code>                    |                                                                        |
| [capSegments]      | <code>number</code>    | <code>1</code>                    |                                                                        |
| [capStart]         | <code>boolean</code>   | <code>true</code>                 |                                                                        |
| [capEnd]           | <code>boolean</code>   | <code>true</code>                 |                                                                        |
| [capStartSegments] | <code>number</code>    | <code>capSegments</code>          |                                                                        |
| [capEndSegments]   | <code>number</code>    | <code>capSegments</code>          |                                                                        |
| [capMapping]       | <code>MappingFn</code> | <code>mappings.rectangular</code> |                                                                        |
| [sx]               | <code>number</code>    | <code>1</code>                    | Major sweep x scale (footprint), elliptical when != sy                 |
| [sy]               | <code>number</code>    | <code>1</code>                    | Major sweep y scale (footprint), elliptical when != sx                 |
| [minorSx]          | <code>number</code>    | <code>1</code>                    | Tube radial scale (meridian cross-section), elliptical when != minorSy |
| [minorSy]          | <code>number</code>    | <code>1</code>                    | Tube z scale (meridian cross-section), elliptical when != minorSx      |

<a name="module_primitiveGeometry..DodecasphereOptions"></a>

### primitiveGeometry~DodecasphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>                                                     | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..HexasphereOptions"></a>

### primitiveGeometry~HexasphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>                                                     | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..IcosphereOptions"></a>

### primitiveGeometry~IcosphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>                                                     | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..OctasphereOptions"></a>

### primitiveGeometry~OctasphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>                                                     | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..TetrasphereOptions"></a>

### primitiveGeometry~TetrasphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                                                                    | Default                           |
| -------------- | ----------------------------------------------------------------------- | --------------------------------- |
| [radius]       | <code>number</code>                                                     | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>                                                     | <code>2</code>                    |
| [projection]   | <code>&quot;gnomonic&quot;</code> \| <code>&quot;spherical&quot;</code> | <code>&quot;gnomonic&quot;</code> |
| [mapping]      | <code>MappingFn</code>                                                  | <code>mappings.spherical</code>   |

<a name="module_primitiveGeometry..DodecahedronPolygonsOptions"></a>

### primitiveGeometry~DodecahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          |
| -------- | ------------------- | ---------------- |
| [radius] | <code>number</code> | <code>0.5</code> |

<a name="module_primitiveGeometry..DodecahedronOptions"></a>

### primitiveGeometry~DodecahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           |
| -------------- | ---------------------- | --------------------------------- |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>    | <code>0</code>                    |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..GreatDodecahedronPolygonsOptions"></a>

### primitiveGeometry~GreatDodecahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          |
| -------- | ------------------- | ---------------- |
| [radius] | <code>number</code> | <code>0.5</code> |

<a name="module_primitiveGeometry..GreatDodecahedronOptions"></a>

### primitiveGeometry~GreatDodecahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           |
| -------------- | ---------------------- | --------------------------------- |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>    | <code>0</code>                    |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..GreatIcosahedronPolygonsOptions"></a>

### primitiveGeometry~GreatIcosahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description                               |
| -------- | ------------------- | ---------------- | ----------------------------------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Radius of the shared icosahedron vertices |

<a name="module_primitiveGeometry..GreatIcosahedronOptions"></a>

### primitiveGeometry~GreatIcosahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           |
| -------------- | ---------------------- | --------------------------------- |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>    | <code>0</code>                    |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..GreatStellatedDodecahedronPolygonsOptions"></a>

### primitiveGeometry~GreatStellatedDodecahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description                                    |
| -------- | ------------------- | ---------------- | ---------------------------------------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Radius the star's tips touch (box half-extent) |

<a name="module_primitiveGeometry..GreatStellatedDodecahedronOptions"></a>

### primitiveGeometry~GreatStellatedDodecahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           | Description                                |
| -------------- | ---------------------- | --------------------------------- | ------------------------------------------ |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |                                            |
| [subdivisions] | <code>number</code>    | <code>0</code>                    | Barycentric grid subdivisions per triangle |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |                                            |

<a name="module_primitiveGeometry..HexahedronPolygonsOptions"></a>

### primitiveGeometry~HexahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          |
| -------- | ------------------- | ---------------- |
| [radius] | <code>number</code> | <code>0.5</code> |

<a name="module_primitiveGeometry..HexahedronOptions"></a>

### primitiveGeometry~HexahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           |
| -------------- | ---------------------- | --------------------------------- |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>    | <code>0</code>                    |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..IcosahedronPolygonsOptions"></a>

### primitiveGeometry~IcosahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          |
| -------- | ------------------- | ---------------- |
| [radius] | <code>number</code> | <code>0.5</code> |

<a name="module_primitiveGeometry..IcosahedronOptions"></a>

### primitiveGeometry~IcosahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           |
| -------------- | ---------------------- | --------------------------------- |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>    | <code>0</code>                    |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..OctahedronPolygonsOptions"></a>

### primitiveGeometry~OctahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          |
| -------- | ------------------- | ---------------- |
| [radius] | <code>number</code> | <code>0.5</code> |

<a name="module_primitiveGeometry..OctahedronOptions"></a>

### primitiveGeometry~OctahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           |
| -------------- | ---------------------- | --------------------------------- |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>    | <code>0</code>                    |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..SmallStellatedDodecahedronPolygonsOptions"></a>

### primitiveGeometry~SmallStellatedDodecahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                | Default          | Description                               |
| -------- | ------------------- | ---------------- | ----------------------------------------- |
| [radius] | <code>number</code> | <code>0.5</code> | Radius of the shared icosahedron vertices |

<a name="module_primitiveGeometry..SmallStellatedDodecahedronOptions"></a>

### primitiveGeometry~SmallStellatedDodecahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           |
| -------------- | ---------------------- | --------------------------------- |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>    | <code>0</code>                    |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_primitiveGeometry..TetrahedronPolygonsOptions"></a>

### primitiveGeometry~TetrahedronPolygonsOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name     | Type                 | Default           | Description                                                                                                                                                             |
| -------- | -------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [radius] | <code>number</code>  | <code>0.5</code>  |                                                                                                                                                                         |
| [center] | <code>boolean</code> | <code>true</code> | Center the bounding box at the origin. Set to false to keep every vertex at exactly the circumradius from the origin - needed as-is wherever radial projection applies. |

<a name="module_primitiveGeometry..TetrahedronOptions"></a>

### primitiveGeometry~TetrahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>primitiveGeometry</code>](#module_primitiveGeometry)
**Properties**

| Name           | Type                   | Default                           |
| -------------- | ---------------------- | --------------------------------- |
| [radius]       | <code>number</code>    | <code>0.5</code>                  |
| [subdivisions] | <code>number</code>    | <code>0</code>                    |
| [mapping]      | <code>MappingFn</code> | <code>mappings.rectangular</code> |

<a name="module_mappings"></a>

## mappings

- [mappings](#module_mappings)
  - _static_
    - [.rectangular()](#module_mappings.rectangular) : <code>MappingsFn</code>
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

| Param                        | Type                      |
| ---------------------------- | ------------------------- |
| mappingOptions               | <code>object</code>       |
| [mappingOptions.uvs]         | <code>Float32Array</code> |
| [mappingOptions.index]       | <code>number</code>       |
| [mappingOptions.x]           | <code>number</code>       |
| [mappingOptions.y]           | <code>number</code>       |
| [mappingOptions.radius]      | <code>number</code>       |
| [mappingOptions.nx]          | <code>number</code>       |
| [mappingOptions.ny]          | <code>number</code>       |
| [mappingOptions.nz]          | <code>number</code>       |
| [mappingOptions.sx]          | <code>number</code>       |
| [mappingOptions.sy]          | <code>number</code>       |
| [mappingOptions.t]           | <code>number</code>       |
| [mappingOptions.radiusRatio] | <code>number</code>       |
| [mappingOptions.thetaRatio]  | <code>number</code>       |

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

Select cells typed array from a size determined by amount of vertices.

**Kind**: static constant of [<code>utils</code>](#module_utils)
**See**: [MDN TypedArray objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects)

| Param | Type                | Description            |
| ----- | ------------------- | ---------------------- |
| size  | <code>number</code> | The max value expected |

<a name="module_utils.fullscreenTriangle"></a>

### utils.fullscreenTriangle() ⇒ <code>Object</code>

A single triangle, 3x oversized so its 3 vertices land past every edge of the
[-1, 1] clip-space square: the standard vertex-shader trick for a fullscreen
pass (rasterizes to exactly the viewport once clipped, with no diagonal seam
and no overdraw compared to a quad split into 2 triangles). xy positions
only

- No z, no normals/uvs, no cells - since a fullscreen pass reads screen-space
  data directly (`gl_FragCoord`, or a uv derived from the clip position
  in-shader) rather than interpolated vertex attributes, and needs no index
  buffer for a single triangle.

**Kind**: static method of [<code>utils</code>](#module_utils)
<a name="module_utils.setTypedArrayType"></a>

### utils.setTypedArrayType(type)

Enforce a typed array constructor for cells

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param | Type                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>Class.&lt;Uint8Array&gt;</code> \| <code>Class.&lt;Uint16Array&gt;</code> \| <code>Class.&lt;Uint32Array&gt;</code> |

<a name="module_utils.triangulateFaces"></a>

### utils.triangulateFaces(cells, numVertices) ⇒ <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>

Fan-triangulate a list of closed n-gon faces (a `PolygonalComplex`'s
`cells`, e.g. `[0, 1, 2, 3]`) from each face's last corner into a flat,
stride-3 `SimplicialComplex`-style typed array (e.g. `[3, 0, 1, 3, 1, 2]`).
Anchoring on the last corner rather than the first is deliberate for quads:
for the BL/BR/TR/TL winding used by eg. `rectanglePath`, it splits the quad
along the same diagonal a row-major `TRIANGLE_STRIP` produces (and that
`computePlane`/`computePolarGeometry`/ `computeRevolutionGeometry` already
use), so displacement in a vertex shader creases consistently across every
primitive in this library. Only valid for convex, planar faces.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param       | Type                                                         | Description                                          |
| ----------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| cells       | [<code>Array.&lt;TypedArrayLike&gt;</code>](#TypedArrayLike) |                                                      |
| numVertices | <code>number</code>                                          | Used to pick the returned typed array's element size |

<a name="module_utils.concatGeometries"></a>

### utils.concatGeometries(geometries) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Concatenate SimplicialComplex geometries into one, offsetting each one's cell
indices by the running vertex count. Positions coincident across inputs (eg.
two bands sharing a seam) stay as separate, unwelded vertices.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param      | Type                                                               |
| ---------- | ------------------------------------------------------------------ |
| geometries | [<code>Array.&lt;SimplicialComplex&gt;</code>](#SimplicialComplex) |

<a name="module_utils.invert"></a>

### utils.invert(geometry) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex)

Flip a geometry inside-out: negate every normal and swap 2 of each triangle's
3 indices so winding stays consistent with the flipped normal. Used to turn
an outward-facing surface (eg. a standalone sphere or cylinder) into the
inward-facing wall of a shell around it.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param    | Type                                                 |
| -------- | ---------------------------------------------------- |
| geometry | [<code>SimplicialComplex</code>](#SimplicialComplex) |

<a name="module_utils.linear"></a>

### utils.linear() : <code>DistributionFn</code>

Uniform spacing: v maps to itself. The default `vDistribution` for every
`computeRevolutionGeometry`-based solid.

**Kind**: static method of [<code>utils</code>](#module_utils)
<a name="module_utils.chebyshev"></a>

### utils.chebyshev() : <code>DistributionFn</code>

Chebyshev-node-like spacing: clusters rows toward both ends of the meridian
sweep (t = 0 and t = 1), sparser through the middle - the classic fix for a
pole/cusp at each end whose radius shrinks faster than the sweep parameter
grows (eg. `ellipsoid`'s poles, `apple`/`lemon`'s cusps).

**Kind**: static method of [<code>utils</code>](#module_utils)
<a name="module_utils.smoothstep"></a>

### utils.smoothstep() : <code>DistributionFn</code>

Smoothstep (Hermite ease-in-out) spacing: same both-ends clustering as
`chebyshev`, as a cheap polynomial instead of a cosine - the standard
"smoothstep" curve used throughout computer graphics.

**Kind**: static method of [<code>utils</code>](#module_utils)
<a name="module_utils.power"></a>

### utils.power([exponent]) ⇒ <code>function</code>

Power/ease-out spacing: clusters rows toward t = 1 only, leaving t = 0 as
sparse as `linear` - unlike `chebyshev`/`smoothstep`'s symmetric, both-ends
clustering. `exponent = 2` exactly cancels a sqrt radius law (eg.
`paraboloid`'s apex, where r = radius·sqrt(1 - v)); `exponent = 1` is
`linear`.

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param      | Type                | Default        |
| ---------- | ------------------- | -------------- |
| [exponent] | <code>number</code> | <code>2</code> |

<a name="module_utils..DistributionFn"></a>

### utils~DistributionFn ⇒ <code>number</code>

**Kind**: inner typedef of [<code>utils</code>](#module_utils)

| Param | Type                |
| ----- | ------------------- |
| t     | <code>number</code> |

<a name="TypedArrayLike"></a>

## TypedArrayLike : <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>

**Kind**: global typedef
<a name="SimplicialComplex"></a>

## SimplicialComplex : <code>object</code>

Geometry definition.

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

Geometry polygon definition: each
cell is a closed n-gon face (implicitly wraps its last index back to its
first - never repeat the first index at the end).

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

Geometry path definition: each cell
is an open polyline (no implicit closing edge between its last and first
index); repeat the first index at the end of a cell to close that loop
explicitly.

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
