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

Geometries for 3D rendering: planes, grids, solids, polyhedra and outline paths, with normals, UVs and cell indices (faces). Perfect if you want to supercharge your dependency folder... with 20KB of geometries.

[![paypal](https://img.shields.io/badge/donate-paypal-informational?logo=paypal)](https://paypal.me/dmnsgn)
[![coinbase](https://img.shields.io/badge/donate-coinbase-informational?logo=coinbase)](https://commerce.coinbase.com/checkout/56cbdf28-e323-48d8-9c98-7019e72c97f3)
[![twitter](https://img.shields.io/twitter/follow/dmnsgn?style=social)](https://twitter.com/dmnsgn)

[![primitive-geometry screenshot](https://raw.githubusercontent.com/dmnsgn/primitive-geometry/main/screenshot.gif)](https://dmnsgn.github.io/primitive-geometry/)

## Installation

```bash
npm install primitive-geometry
```

## Features

- **72 geometries**: planes and grids, quadrilaterals and arcs, solids of revolution, prisms, platonic and stellated polyhedra, geodesic spheres - plus 21 outline paths.
- **Common API**: options object in, simplicial complex out. Parameters are named the same everywhere (`sx/sy/sz`, `nx/ny/nz`, `radius`, `segments`, `theta`/`phi`).
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

const geometry = Primitives.quad({ scale: 0.5 });
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
// `*Faces` n-gon seed variant: see the API below.

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
  scale: 0.5,
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
  edgeSegments: 1,
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
  edgeSegments: 1,
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
  radius: 0.5,
  segments: 32,
  innerSegments: 16,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mergeCentroid: true,
  mapping: mappings.concentric,
  n: 3,
});
const star = Primitives.star({
  points: 5,
  density: 2,
  radius: 0.5,
  notchRadius: 0.5 * utils.computeStarRatio(5, 2),
  innerRadius: 0,
  circularHole: false,
  innerSegments: 16,
  theta: Math.PI * 2,
  thetaOffset: 0,
  mapping: mappings.concentric,
});
const cross = Primitives.cross({
  radius: 0.5,
  armWidth: 0.5 / 3,
  segments: 1,
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
  edgeSegments: 1,
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
  radius: 1,
  nx: 32,
  ny: 16,
  rx: 0.5,
  ry: 0.25,
  rz: 0.25,
  theta: Math.PI,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
  vDistribution: utils.linear,
});
const superellipsoid = Primitives.superellipsoid({
  radius: 1,
  nx: 32,
  ny: 16,
  rx: 0.5,
  ry: 0.25,
  rz: 0.25,
  n1: 3,
  n2: 3,
  theta: Math.PI,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
  vDistribution: utils.linear,
});
const astroidalEllipsoid = Primitives.astroidalEllipsoid({
  radius: 1,
  nx: 32,
  ny: 16,
  rx: 0.5,
  ry: 0.25,
  rz: 0.25,
  theta: Math.PI,
  thetaOffset: 0,
  phi: Math.PI * 2,
  phiOffset: 0,
});
const superegg = Primitives.superegg({
  radius: 0.5,
  ry: (0.5 * 5) / 6,
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
  radius: 0.25,
  nx: 16,
  ny: 1,
  radiusApex: 0.25,
  capSegments: 1,
  capApex: true,
  capBase: true,
  capBaseSegments: 1,
  phi: Math.PI * 2,
  phiOffset: 0,
  capMapping: mappings.rectangular,
  sx: 1,
  sz: 1,
  sxApex: 1,
  szApex: 1,
  vDistribution: utils.linear,
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
  vDistribution: utils.linear,
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
  vDistribution: utils.linear,
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
  capSegments: 1,
  capApex: true,
  capBase: true,
  capBaseSegments: 1,
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
  vDistribution: utils.linear,
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
  capSegments: 1,
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
  vDistribution: utils.linear,
});
const lemon = Primitives.lemon({
  radius: 0.3,
  height: 1,
  nx: 32,
  ny: 16,
  phi: Math.PI * 2,
  phiOffset: 0,
  vDistribution: utils.linear,
});
const sphericalRing = Primitives.sphericalRing({
  radius: 0.5,
  innerRadius: 0.25,
  nx: 32,
  ny: 16,
  holeSegments: 1,
  phi: Math.PI * 2,
  phiOffset: 0,
  vDistribution: utils.linear,
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
  radiusTop: 0.5,
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
  radius: 0.1,
  radiusTop: 0.5,
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
<dt><a href="#module_index">index</a></dt>
<dd><p>Re-export all geometries, UV mappings functions and utils.</p>
</dd>
<dt><a href="#module_annulus">annulus</a></dt>
<dd></dd>
<dt><a href="#module_box">box</a></dt>
<dd></dd>
<dt><a href="#module_capsule">capsule</a></dt>
<dd></dd>
<dt><a href="#module_circle">circle</a></dt>
<dd></dd>
<dt><a href="#module_cone">cone</a></dt>
<dd></dd>
<dt><a href="#module_cube">cube</a></dt>
<dd></dd>
<dt><a href="#module_cylinder">cylinder</a></dt>
<dd></dd>
<dt><a href="#module_disc">disc</a></dt>
<dd></dd>
<dt><a href="#module_ellipse">ellipse</a></dt>
<dd></dd>
<dt><a href="#module_ellipsoid">ellipsoid</a></dt>
<dd></dd>
<dt><a href="#module_icosahedron">icosahedron</a></dt>
<dd></dd>
<dt><a href="#module_icosphere">icosphere</a></dt>
<dd></dd>
<dt><a href="#module_mappings">mappings</a></dt>
<dd></dd>
<dt><a href="#module_plane">plane</a></dt>
<dd></dd>
<dt><a href="#module_quad">quad</a></dt>
<dd></dd>
<dt><a href="#module_reuleux">reuleux</a></dt>
<dd></dd>
<dt><a href="#module_roundedCube">roundedCube</a></dt>
<dd></dd>
<dt><a href="#module_roundedRectangle">roundedRectangle</a></dt>
<dd></dd>
<dt><a href="#module_sphere">sphere</a></dt>
<dd></dd>
<dt><a href="#module_squircle">squircle</a></dt>
<dd></dd>
<dt><a href="#module_stadium">stadium</a></dt>
<dd></dd>
<dt><a href="#module_superellipse">superellipse</a></dt>
<dd></dd>
<dt><a href="#module_tetrahedron">tetrahedron</a></dt>
<dd></dd>
<dt><a href="#module_torus">torus</a></dt>
<dd></dd>
<dt><a href="#module_utils">utils</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#BasicSimplicialComplex">BasicSimplicialComplex</a> : <code>object</code></dt>
<dd><p>Geometry definition without normals and UVs.</p>
</dd>
<dt><a href="#SimplicialComplex">SimplicialComplex</a> : <code>object</code></dt>
<dd><p>Geometry definition.</p>
</dd>
</dl>

<a name="module_index"></a>

## index

Re-export all geometries, UV mappings functions and utils.

<a name="module_annulus"></a>

## annulus

- [annulus](#module_annulus)
  - [annulus([options])](#exp_module_annulus--annulus) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~AnnulusOptions](#module_annulus--annulus..AnnulusOptions) : <code>object</code>

<a name="exp_module_annulus--annulus"></a>

### annulus([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                    | Default         |
| --------- | ----------------------------------------------------------------------- | --------------- |
| [options] | [<code>AnnulusOptions</code>](#module_annulus--annulus..AnnulusOptions) | <code>{}</code> |

<a name="module_annulus--annulus..AnnulusOptions"></a>

#### annulus~AnnulusOptions : <code>object</code>

**Kind**: inner typedef of [<code>annulus</code>](#exp_module_annulus--annulus)
**Properties**

| Name            | Type                  | Default                          |
| --------------- | --------------------- | -------------------------------- |
| [sx]            | <code>number</code>   | <code>1</code>                   |
| [sy]            | <code>number</code>   | <code>1</code>                   |
| [radius]        | <code>number</code>   | <code>0.5</code>                 |
| [segments]      | <code>number</code>   | <code>32</code>                  |
| [innerSegments] | <code>number</code>   | <code>16</code>                  |
| [theta]         | <code>number</code>   | <code>TAU</code>                 |
| [thetaOffset]   | <code>number</code>   | <code>0</code>                   |
| [innerRadius]   | <code>number</code>   | <code>radius \* 0.5</code>       |
| [mapping]       | <code>function</code> | <code>mappings.concentric</code> |

<a name="module_box"></a>

## box

- [box](#module_box)
  - [box([options])](#exp_module_box--box) ⇒ [<code>BasicSimplicialComplex</code>](#BasicSimplicialComplex) ⏏
    - [~BoxOptions](#module_box--box..BoxOptions) : <code>object</code>

<a name="exp_module_box--box"></a>

### box([options]) ⇒ [<code>BasicSimplicialComplex</code>](#BasicSimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                    | Default         |
| --------- | ------------------------------------------------------- | --------------- |
| [options] | [<code>BoxOptions</code>](#module_box--box..BoxOptions) | <code>{}</code> |

<a name="module_box--box..BoxOptions"></a>

#### box~BoxOptions : <code>object</code>

**Kind**: inner typedef of [<code>box</code>](#exp_module_box--box)
**Properties**

| Name | Type                | Default         |
| ---- | ------------------- | --------------- |
| [sx] | <code>number</code> | <code>1</code>  |
| [sy] | <code>number</code> | <code>sx</code> |
| [sz] | <code>number</code> | <code>sx</code> |

<a name="module_capsule"></a>

## capsule

- [capsule](#module_capsule)
  - [capsule([options])](#exp_module_capsule--capsule) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~CapsuleOptions](#module_capsule--capsule..CapsuleOptions) : <code>object</code>

<a name="exp_module_capsule--capsule"></a>

### capsule([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                    | Default         |
| --------- | ----------------------------------------------------------------------- | --------------- |
| [options] | [<code>CapsuleOptions</code>](#module_capsule--capsule..CapsuleOptions) | <code>{}</code> |

<a name="module_capsule--capsule..CapsuleOptions"></a>

#### capsule~CapsuleOptions : <code>object</code>

**Kind**: inner typedef of [<code>capsule</code>](#exp_module_capsule--capsule)
**Properties**

| Name            | Type                | Default           |
| --------------- | ------------------- | ----------------- |
| [height]        | <code>number</code> | <code>0.5</code>  |
| [radius]        | <code>number</code> | <code>0.25</code> |
| [nx]            | <code>number</code> | <code>16</code>   |
| [ny]            | <code>number</code> | <code>1</code>    |
| [roundSegments] | <code>number</code> | <code>32</code>   |
| [phi]           | <code>number</code> | <code>TAU</code>  |

<a name="module_circle"></a>

## circle

- [circle](#module_circle)
  - [circle([options])](#exp_module_circle--circle) ⇒ [<code>BasicSimplicialComplex</code>](#BasicSimplicialComplex) ⏏
    - [~CircleOptions](#module_circle--circle..CircleOptions) : <code>object</code>

<a name="exp_module_circle--circle"></a>

### circle([options]) ⇒ [<code>BasicSimplicialComplex</code>](#BasicSimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                | Default         |
| --------- | ------------------------------------------------------------------- | --------------- |
| [options] | [<code>CircleOptions</code>](#module_circle--circle..CircleOptions) | <code>{}</code> |

<a name="module_circle--circle..CircleOptions"></a>

#### circle~CircleOptions : <code>object</code>

**Kind**: inner typedef of [<code>circle</code>](#exp_module_circle--circle)
**Properties**

| Name          | Type                 | Default            |
| ------------- | -------------------- | ------------------ |
| [radius]      | <code>number</code>  | <code>0.5</code>   |
| [segments]    | <code>number</code>  | <code>32</code>    |
| [theta]       | <code>number</code>  | <code>TAU</code>   |
| [thetaOffset] | <code>number</code>  | <code>0</code>     |
| [closed]      | <code>boolean</code> | <code>false</code> |

<a name="module_cone"></a>

## cone

- [cone](#module_cone)
  - [cone([options])](#exp_module_cone--cone) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~ConeOptions](#module_cone--cone..ConeOptions) : <code>object</code>

<a name="exp_module_cone--cone"></a>

### cone([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                        | Default         |
| --------- | ----------------------------------------------------------- | --------------- |
| [options] | [<code>ConeOptions</code>](#module_cone--cone..ConeOptions) | <code>{}</code> |

<a name="module_cone--cone..ConeOptions"></a>

#### cone~ConeOptions : <code>object</code>

**Kind**: inner typedef of [<code>cone</code>](#exp_module_cone--cone)
**Properties**

| Name          | Type                 | Default           |
| ------------- | -------------------- | ----------------- |
| [height]      | <code>number</code>  | <code>1</code>    |
| [radius]      | <code>number</code>  | <code>0.25</code> |
| [nx]          | <code>number</code>  | <code>16</code>   |
| [ny]          | <code>number</code>  | <code>1</code>    |
| [capSegments] | <code>number</code>  | <code>1</code>    |
| [capBase]     | <code>boolean</code> | <code>true</code> |
| [phi]         | <code>number</code>  | <code>TAU</code>  |

<a name="module_cube"></a>

## cube

- [cube](#module_cube)
  - [cube([options])](#exp_module_cube--cube) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~CubeOptions](#module_cube--cube..CubeOptions) : <code>object</code>

<a name="exp_module_cube--cube"></a>

### cube([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                        | Default         |
| --------- | ----------------------------------------------------------- | --------------- |
| [options] | [<code>CubeOptions</code>](#module_cube--cube..CubeOptions) | <code>{}</code> |

<a name="module_cube--cube..CubeOptions"></a>

#### cube~CubeOptions : <code>object</code>

**Kind**: inner typedef of [<code>cube</code>](#exp_module_cube--cube)
**Properties**

| Name | Type                | Default         |
| ---- | ------------------- | --------------- |
| [sx] | <code>number</code> | <code>1</code>  |
| [sy] | <code>number</code> | <code>sx</code> |
| [sz] | <code>number</code> | <code>sx</code> |
| [nx] | <code>number</code> | <code>1</code>  |
| [ny] | <code>number</code> | <code>nx</code> |
| [nz] | <code>number</code> | <code>nx</code> |

<a name="module_cylinder"></a>

## cylinder

- [cylinder](#module_cylinder)
  - [cylinder([options])](#exp_module_cylinder--cylinder) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~CylinderOptions](#module_cylinder--cylinder..CylinderOptions) : <code>object</code>

<a name="exp_module_cylinder--cylinder"></a>

### cylinder([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                        | Default         |
| --------- | --------------------------------------------------------------------------- | --------------- |
| [options] | [<code>CylinderOptions</code>](#module_cylinder--cylinder..CylinderOptions) | <code>{}</code> |

<a name="module_cylinder--cylinder..CylinderOptions"></a>

#### cylinder~CylinderOptions : <code>object</code>

**Kind**: inner typedef of [<code>cylinder</code>](#exp_module_cylinder--cylinder)
**Properties**

| Name          | Type                 | Default             |
| ------------- | -------------------- | ------------------- |
| [height]      | <code>number</code>  | <code>1</code>      |
| [radius]      | <code>number</code>  | <code>0.25</code>   |
| [nx]          | <code>number</code>  | <code>16</code>     |
| [ny]          | <code>number</code>  | <code>1</code>      |
| [radiusApex]  | <code>number</code>  | <code>radius</code> |
| [capSegments] | <code>number</code>  | <code>1</code>      |
| [capApex]     | <code>boolean</code> | <code>true</code>   |
| [capBase]     | <code>boolean</code> | <code>true</code>   |
| [phi]         | <code>number</code>  | <code>TAU</code>    |

<a name="module_disc"></a>

## disc

- [disc](#module_disc)
  - [disc([options])](#exp_module_disc--disc) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~DiscOptions](#module_disc--disc..DiscOptions) : <code>object</code>

<a name="exp_module_disc--disc"></a>

### disc([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                        | Default         |
| --------- | ----------------------------------------------------------- | --------------- |
| [options] | [<code>DiscOptions</code>](#module_disc--disc..DiscOptions) | <code>{}</code> |

<a name="module_disc--disc..DiscOptions"></a>

#### disc~DiscOptions : <code>object</code>

**Kind**: inner typedef of [<code>disc</code>](#exp_module_disc--disc)
**Properties**

| Name            | Type                  | Default                          |
| --------------- | --------------------- | -------------------------------- |
| [radius]        | <code>number</code>   | <code>0.5</code>                 |
| [segments]      | <code>number</code>   | <code>32</code>                  |
| [innerSegments] | <code>number</code>   | <code>16</code>                  |
| [theta]         | <code>number</code>   | <code>TAU</code>                 |
| [thetaOffset]   | <code>number</code>   | <code>0</code>                   |
| [mergeCentroid] | <code>boolean</code>  | <code>true</code>                |
| [mapping]       | <code>function</code> | <code>mappings.concentric</code> |

<a name="module_ellipse"></a>

## ellipse

- [ellipse](#module_ellipse)
  - [ellipse([options])](#exp_module_ellipse--ellipse) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~EllipseOptions](#module_ellipse--ellipse..EllipseOptions) : <code>object</code>

<a name="exp_module_ellipse--ellipse"></a>

### ellipse([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                    | Default         |
| --------- | ----------------------------------------------------------------------- | --------------- |
| [options] | [<code>EllipseOptions</code>](#module_ellipse--ellipse..EllipseOptions) | <code>{}</code> |

<a name="module_ellipse--ellipse..EllipseOptions"></a>

#### ellipse~EllipseOptions : <code>object</code>

**Kind**: inner typedef of [<code>ellipse</code>](#exp_module_ellipse--ellipse)
**Properties**

| Name            | Type                  | Default                          |
| --------------- | --------------------- | -------------------------------- |
| [sx]            | <code>number</code>   | <code>1</code>                   |
| [sy]            | <code>number</code>   | <code>0.5</code>                 |
| [radius]        | <code>number</code>   | <code>0.5</code>                 |
| [segments]      | <code>number</code>   | <code>32</code>                  |
| [innerSegments] | <code>number</code>   | <code>16</code>                  |
| [theta]         | <code>number</code>   | <code>TAU</code>                 |
| [thetaOffset]   | <code>number</code>   | <code>0</code>                   |
| [mergeCentroid] | <code>boolean</code>  | <code>true</code>                |
| [mapping]       | <code>function</code> | <code>mappings.elliptical</code> |

<a name="module_ellipsoid"></a>

## ellipsoid

- [ellipsoid](#module_ellipsoid)
  - [ellipsoid([options])](#exp_module_ellipsoid--ellipsoid) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~EllipsoidOptions](#module_ellipsoid--ellipsoid..EllipsoidOptions) : <code>object</code>

<a name="exp_module_ellipsoid--ellipsoid"></a>

### ellipsoid([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

Default to an oblate spheroid.

**Kind**: Exported function

| Param     | Type                                                                            | Default         |
| --------- | ------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>EllipsoidOptions</code>](#module_ellipsoid--ellipsoid..EllipsoidOptions) | <code>{}</code> |

<a name="module_ellipsoid--ellipsoid..EllipsoidOptions"></a>

#### ellipsoid~EllipsoidOptions : <code>object</code>

**Kind**: inner typedef of [<code>ellipsoid</code>](#exp_module_ellipsoid--ellipsoid)
**Properties**

| Name          | Type                | Default              |
| ------------- | ------------------- | -------------------- |
| [radius]      | <code>number</code> | <code>0.5</code>     |
| [nx]          | <code>number</code> | <code>32</code>      |
| [ny]          | <code>number</code> | <code>16</code>      |
| [rx]          | <code>number</code> | <code>1</code>       |
| [ry]          | <code>number</code> | <code>0.5</code>     |
| [rz]          | <code>number</code> | <code>ry</code>      |
| [theta]       | <code>number</code> | <code>Math.PI</code> |
| [thetaOffset] | <code>number</code> | <code>0</code>       |
| [phi]         | <code>number</code> | <code>TAU</code>     |
| [phiOffset]   | <code>number</code> | <code>0</code>       |

<a name="module_icosahedron"></a>

## icosahedron

- [icosahedron](#module_icosahedron)
  - [icosahedron([options])](#exp_module_icosahedron--icosahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~IcosahedronOptions](#module_icosahedron--icosahedron..IcosahedronOptions) : <code>object</code>

<a name="exp_module_icosahedron--icosahedron"></a>

### icosahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                                    | Default         |
| --------- | --------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>IcosahedronOptions</code>](#module_icosahedron--icosahedron..IcosahedronOptions) | <code>{}</code> |

<a name="module_icosahedron--icosahedron..IcosahedronOptions"></a>

#### icosahedron~IcosahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>icosahedron</code>](#exp_module_icosahedron--icosahedron)
**Properties**

| Name     | Type                | Default          |
| -------- | ------------------- | ---------------- |
| [radius] | <code>number</code> | <code>0.5</code> |

<a name="module_icosphere"></a>

## icosphere

- [icosphere](#module_icosphere)
  - [icosphere([options])](#exp_module_icosphere--icosphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~IcosphereOptions](#module_icosphere--icosphere..IcosphereOptions) : <code>object</code>

<a name="exp_module_icosphere--icosphere"></a>

### icosphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                            | Default         |
| --------- | ------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>IcosphereOptions</code>](#module_icosphere--icosphere..IcosphereOptions) | <code>{}</code> |

<a name="module_icosphere--icosphere..IcosphereOptions"></a>

#### icosphere~IcosphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>icosphere</code>](#exp_module_icosphere--icosphere)
**Properties**

| Name           | Type                | Default          |
| -------------- | ------------------- | ---------------- |
| [radius]       | <code>number</code> | <code>0.5</code> |
| [subdivisions] | <code>number</code> | <code>2</code>   |

<a name="module_mappings"></a>

## mappings

<a name="module_plane"></a>

## plane

- [plane](#module_plane)
  - [plane([options])](#exp_module_plane--plane) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~PlaneOptions](#module_plane--plane..PlaneOptions) : <code>object</code>
    - [~PlaneDirection](#module_plane--plane..PlaneDirection) : <code>&quot;x&quot;</code> \| <code>&quot;-x&quot;</code> \| <code>&quot;y&quot;</code> \| <code>&quot;-y&quot;</code> \| <code>&quot;z&quot;</code> \| <code>&quot;-z&quot;</code>

<a name="exp_module_plane--plane"></a>

### plane([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                            | Default         |
| --------- | --------------------------------------------------------------- | --------------- |
| [options] | [<code>PlaneOptions</code>](#module_plane--plane..PlaneOptions) | <code>{}</code> |

<a name="module_plane--plane..PlaneOptions"></a>

#### plane~PlaneOptions : <code>object</code>

**Kind**: inner typedef of [<code>plane</code>](#exp_module_plane--plane)
**Properties**

| Name        | Type                                                                | Default                    |
| ----------- | ------------------------------------------------------------------- | -------------------------- |
| [sx]        | <code>number</code>                                                 | <code>1</code>             |
| [sy]        | <code>number</code>                                                 | <code>sx</code>            |
| [nx]        | <code>number</code>                                                 | <code>1</code>             |
| [ny]        | <code>number</code>                                                 | <code>nx</code>            |
| [direction] | [<code>PlaneDirection</code>](#module_plane--plane..PlaneDirection) | <code>&quot;z&quot;</code> |
| [quads]     | <code>boolean</code>                                                | <code>false</code>         |

<a name="module_plane--plane..PlaneDirection"></a>

#### plane~PlaneDirection : <code>&quot;x&quot;</code> \| <code>&quot;-x&quot;</code> \| <code>&quot;y&quot;</code> \| <code>&quot;-y&quot;</code> \| <code>&quot;z&quot;</code> \| <code>&quot;-z&quot;</code>

**Kind**: inner typedef of [<code>plane</code>](#exp_module_plane--plane)
<a name="module_quad"></a>

## quad

- [quad](#module_quad)
  - [quad([options])](#exp_module_quad--quad) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~QuadOptions](#module_quad--quad..QuadOptions) : <code>object</code>

<a name="exp_module_quad--quad"></a>

### quad([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                        | Default         |
| --------- | ----------------------------------------------------------- | --------------- |
| [options] | [<code>QuadOptions</code>](#module_quad--quad..QuadOptions) | <code>{}</code> |

<a name="module_quad--quad..QuadOptions"></a>

#### quad~QuadOptions : <code>object</code>

**Kind**: inner typedef of [<code>quad</code>](#exp_module_quad--quad)
**Properties**

| Name    | Type                | Default          |
| ------- | ------------------- | ---------------- |
| [scale] | <code>number</code> | <code>0.5</code> |

<a name="module_reuleux"></a>

## reuleux

- [reuleux](#module_reuleux)
  - [reuleux([options])](#exp_module_reuleux--reuleux) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~ReuleuxOptions](#module_reuleux--reuleux..ReuleuxOptions) : <code>object</code>

<a name="exp_module_reuleux--reuleux"></a>

### reuleux([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function
**See**: [Parametric equations for regular and Reuleaux polygons](https://tpfto.wordpress.com/2011/09/15/parametric-equations-for-regular-and-reuleaux-polygons/)

| Param     | Type                                                                    | Default         |
| --------- | ----------------------------------------------------------------------- | --------------- |
| [options] | [<code>ReuleuxOptions</code>](#module_reuleux--reuleux..ReuleuxOptions) | <code>{}</code> |

<a name="module_reuleux--reuleux..ReuleuxOptions"></a>

#### reuleux~ReuleuxOptions : <code>object</code>

**Kind**: inner typedef of [<code>reuleux</code>](#exp_module_reuleux--reuleux)
**Properties**

| Name            | Type                  | Default                          |
| --------------- | --------------------- | -------------------------------- |
| [radius]        | <code>number</code>   | <code>0.5</code>                 |
| [segments]      | <code>number</code>   | <code>32</code>                  |
| [innerSegments] | <code>number</code>   | <code>16</code>                  |
| [theta]         | <code>number</code>   | <code>TAU</code>                 |
| [thetaOffset]   | <code>number</code>   | <code>0</code>                   |
| [mergeCentroid] | <code>boolean</code>  | <code>true</code>                |
| [mapping]       | <code>function</code> | <code>mappings.concentric</code> |
| [n]             | <code>number</code>   | <code>3</code>                   |

<a name="module_roundedCube"></a>

## roundedCube

- [roundedCube](#module_roundedCube)
  - [roundedCube([options])](#exp_module_roundedCube--roundedCube) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~RoundedCubeOptions](#module_roundedCube--roundedCube..RoundedCubeOptions) : <code>object</code>

<a name="exp_module_roundedCube--roundedCube"></a>

### roundedCube([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                                    | Default         |
| --------- | --------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>RoundedCubeOptions</code>](#module_roundedCube--roundedCube..RoundedCubeOptions) | <code>{}</code> |

<a name="module_roundedCube--roundedCube..RoundedCubeOptions"></a>

#### roundedCube~RoundedCubeOptions : <code>object</code>

**Kind**: inner typedef of [<code>roundedCube</code>](#exp_module_roundedCube--roundedCube)
**Properties**

| Name            | Type                | Default                 |
| --------------- | ------------------- | ----------------------- |
| [sx]            | <code>number</code> | <code>1</code>          |
| [sy]            | <code>number</code> | <code>sx</code>         |
| [sz]            | <code>number</code> | <code>sx</code>         |
| [nx]            | <code>number</code> | <code>1</code>          |
| [ny]            | <code>number</code> | <code>nx</code>         |
| [nz]            | <code>number</code> | <code>nx</code>         |
| [radius]        | <code>number</code> | <code>sx \* 0.25</code> |
| [roundSegments] | <code>number</code> | <code>8</code>          |
| [edgeSegments]  | <code>number</code> | <code>1</code>          |

<a name="module_roundedRectangle"></a>

## roundedRectangle

- [roundedRectangle](#module_roundedRectangle)
  - [roundedRectangle([options])](#exp_module_roundedRectangle--roundedRectangle) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~RoundedCubeOptions](#module_roundedRectangle--roundedRectangle..RoundedCubeOptions) : <code>object</code>

<a name="exp_module_roundedRectangle--roundedRectangle"></a>

### roundedRectangle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                                              | Default         |
| --------- | ------------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>RoundedCubeOptions</code>](#module_roundedRectangle--roundedRectangle..RoundedCubeOptions) | <code>{}</code> |

<a name="module_roundedRectangle--roundedRectangle..RoundedCubeOptions"></a>

#### roundedRectangle~RoundedCubeOptions : <code>object</code>

**Kind**: inner typedef of [<code>roundedRectangle</code>](#exp_module_roundedRectangle--roundedRectangle)
**Properties**

| Name            | Type                | Default                 |
| --------------- | ------------------- | ----------------------- |
| [sx]            | <code>number</code> | <code>1</code>          |
| [sy]            | <code>number</code> | <code>sx</code>         |
| [nx]            | <code>number</code> | <code>1</code>          |
| [ny]            | <code>number</code> | <code>nx</code>         |
| [radius]        | <code>number</code> | <code>sx \* 0.25</code> |
| [roundSegments] | <code>number</code> | <code>8</code>          |
| [edgeSegments]  | <code>number</code> | <code>1</code>          |

<a name="module_sphere"></a>

## sphere

- [sphere](#module_sphere)
  - [sphere([options])](#exp_module_sphere--sphere) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~SphereOptions](#module_sphere--sphere..SphereOptions) : <code>object</code>

<a name="exp_module_sphere--sphere"></a>

### sphere([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                | Default         |
| --------- | ------------------------------------------------------------------- | --------------- |
| [options] | [<code>SphereOptions</code>](#module_sphere--sphere..SphereOptions) | <code>{}</code> |

<a name="module_sphere--sphere..SphereOptions"></a>

#### sphere~SphereOptions : <code>object</code>

**Kind**: inner typedef of [<code>sphere</code>](#exp_module_sphere--sphere)
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

<a name="module_squircle"></a>

## squircle

- [squircle](#module_squircle)
  - [squircle([options])](#exp_module_squircle--squircle) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~SquircleOptions](#module_squircle--squircle..SquircleOptions) : <code>object</code>

<a name="exp_module_squircle--squircle"></a>

### squircle([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

Fernández-Guasti squircle

**Kind**: Exported function
**See**: [Squircular Calculations – Chamberlain Fong](https://arxiv.org/vc/arxiv/papers/1604/1604.02174v1.pdf)

| Param     | Type                                                                        | Default         |
| --------- | --------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SquircleOptions</code>](#module_squircle--squircle..SquircleOptions) | <code>{}</code> |

<a name="module_squircle--squircle..SquircleOptions"></a>

#### squircle~SquircleOptions : <code>object</code>

**Kind**: inner typedef of [<code>squircle</code>](#exp_module_squircle--squircle)
**Properties**

| Name            | Type                  | Default                            | Description             |
| --------------- | --------------------- | ---------------------------------- | ----------------------- |
| [sx]            | <code>number</code>   | <code>1</code>                     |                         |
| [sy]            | <code>number</code>   | <code>1</code>                     |                         |
| [radius]        | <code>number</code>   | <code>0.5</code>                   |                         |
| [segments]      | <code>number</code>   | <code>128</code>                   |                         |
| [innerSegments] | <code>number</code>   | <code>16</code>                    |                         |
| [theta]         | <code>number</code>   | <code>TAU</code>                   |                         |
| [thetaOffset]   | <code>number</code>   | <code>0</code>                     |                         |
| [mergeCentroid] | <code>boolean</code>  | <code>true</code>                  |                         |
| [mapping]       | <code>function</code> | <code>mappings.fgSquircular</code> |                         |
| [squareness]    | <code>number</code>   | <code>0.95</code>                  | Squareness (0 < s <= 1) |

<a name="module_stadium"></a>

## stadium

- [stadium](#module_stadium)
  - [stadium([options])](#exp_module_stadium--stadium) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~StadiumOptions](#module_stadium--stadium..StadiumOptions) : <code>object</code>

<a name="exp_module_stadium--stadium"></a>

### stadium([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                    | Default         |
| --------- | ----------------------------------------------------------------------- | --------------- |
| [options] | [<code>StadiumOptions</code>](#module_stadium--stadium..StadiumOptions) | <code>{}</code> |

<a name="module_stadium--stadium..StadiumOptions"></a>

#### stadium~StadiumOptions : <code>object</code>

**Kind**: inner typedef of [<code>stadium</code>](#exp_module_stadium--stadium)
**Properties**

| Name            | Type                | Default         |
| --------------- | ------------------- | --------------- |
| [sx]            | <code>number</code> | <code>1</code>  |
| [sy]            | <code>number</code> | <code>sx</code> |
| [nx]            | <code>number</code> | <code>1</code>  |
| [ny]            | <code>number</code> | <code>nx</code> |
| [roundSegments] | <code>number</code> | <code>8</code>  |
| [edgeSegments]  | <code>number</code> | <code>1</code>  |

<a name="module_superellipse"></a>

## superellipse

- [superellipse](#module_superellipse)
  - [superellipse([options])](#exp_module_superellipse--superellipse) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~SuperellipseOptions](#module_superellipse--superellipse..SuperellipseOptions) : <code>object</code>

<a name="exp_module_superellipse--superellipse"></a>

### superellipse([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

Lamé curve
See elliptical-mapping example for a few special cases

**Kind**: Exported function
**See**

- [Wolfram MathWorld – Superellipse](https://mathworld.wolfram.com/Superellipse.html)
- [Wikipedia – Superellipse](https://en.wikipedia.org/wiki/Superellipse)

| Param     | Type                                                                                        | Default         |
| --------- | ------------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>SuperellipseOptions</code>](#module_superellipse--superellipse..SuperellipseOptions) | <code>{}</code> |

<a name="module_superellipse--superellipse..SuperellipseOptions"></a>

#### superellipse~SuperellipseOptions : <code>object</code>

**Kind**: inner typedef of [<code>superellipse</code>](#exp_module_superellipse--superellipse)
**Properties**

| Name            | Type                  | Default                    |
| --------------- | --------------------- | -------------------------- |
| [sx]            | <code>number</code>   | <code>1</code>             |
| [sy]            | <code>number</code>   | <code>0.5</code>           |
| [radius]        | <code>number</code>   | <code>0.5</code>           |
| [segments]      | <code>number</code>   | <code>32</code>            |
| [innerSegments] | <code>number</code>   | <code>16</code>            |
| [theta]         | <code>number</code>   | <code>TAU</code>           |
| [thetaOffset]   | <code>number</code>   | <code>0</code>             |
| [mergeCentroid] | <code>boolean</code>  | <code>true</code>          |
| [mapping]       | <code>function</code> | <code>mappings.lamé</code> |
| [m]             | <code>number</code>   | <code>2</code>             |
| [n]             | <code>number</code>   | <code>m</code>             |

<a name="module_tetrahedron"></a>

## tetrahedron

- [tetrahedron](#module_tetrahedron)
  - [tetrahedron([options])](#exp_module_tetrahedron--tetrahedron) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~TetrahedronOptions](#module_tetrahedron--tetrahedron..TetrahedronOptions) : <code>object</code>

<a name="exp_module_tetrahedron--tetrahedron"></a>

### tetrahedron([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                                                    | Default         |
| --------- | --------------------------------------------------------------------------------------- | --------------- |
| [options] | [<code>TetrahedronOptions</code>](#module_tetrahedron--tetrahedron..TetrahedronOptions) | <code>{}</code> |

<a name="module_tetrahedron--tetrahedron..TetrahedronOptions"></a>

#### tetrahedron~TetrahedronOptions : <code>object</code>

**Kind**: inner typedef of [<code>tetrahedron</code>](#exp_module_tetrahedron--tetrahedron)
**Properties**

| Name     | Type                | Default          |
| -------- | ------------------- | ---------------- |
| [radius] | <code>number</code> | <code>0.5</code> |

<a name="module_torus"></a>

## torus

- [torus](#module_torus)
  - [torus([options])](#exp_module_torus--torus) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏
    - [~TorusOptions](#module_torus--torus..TorusOptions) : <code>object</code>

<a name="exp_module_torus--torus"></a>

### torus([options]) ⇒ [<code>SimplicialComplex</code>](#SimplicialComplex) ⏏

**Kind**: Exported function

| Param     | Type                                                            | Default         |
| --------- | --------------------------------------------------------------- | --------------- |
| [options] | [<code>TorusOptions</code>](#module_torus--torus..TorusOptions) | <code>{}</code> |

<a name="module_torus--torus..TorusOptions"></a>

#### torus~TorusOptions : <code>object</code>

**Kind**: inner typedef of [<code>torus</code>](#exp_module_torus--torus)
**Properties**

| Name            | Type                | Default          |
| --------------- | ------------------- | ---------------- |
| [radius]        | <code>number</code> | <code>0.4</code> |
| [segments]      | <code>number</code> | <code>64</code>  |
| [minorRadius]   | <code>number</code> | <code>0.1</code> |
| [minorSegments] | <code>number</code> | <code>32</code>  |
| [theta]         | <code>number</code> | <code>TAU</code> |
| [thetaOffset]   | <code>number</code> | <code>0</code>   |
| [phi]           | <code>number</code> | <code>TAU</code> |
| [phiOffset]     | <code>number</code> | <code>0</code>   |

<a name="module_utils"></a>

## utils

- [utils](#module_utils)
  - [.TAU](#module_utils.TAU) : <code>number</code>
  - [.HALF_PI](#module_utils.HALF_PI) : <code>number</code>
  - [.SQRT2](#module_utils.SQRT2) : <code>number</code>
  - [.getCellsTypedArray](#module_utils.getCellsTypedArray) ⇒ <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>
  - [.normalize(v)](#module_utils.normalize) ⇒ <code>Array.&lt;number&gt;</code>
  - [.checkArguments(...args)](#module_utils.checkArguments)
  - [.setTypedArrayType(type)](#module_utils.setTypedArrayType)

<a name="module_utils.TAU"></a>

### utils.TAU : <code>number</code>

Two times PI.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.HALF_PI"></a>

### utils.HALF_PI : <code>number</code>

Two times PI.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.SQRT2"></a>

### utils.SQRT2 : <code>number</code>

Square root of 2.

**Kind**: static constant of [<code>utils</code>](#module_utils)
<a name="module_utils.getCellsTypedArray"></a>

### utils.getCellsTypedArray ⇒ <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code>

Select cells typed array from a size determined by amount of vertices.

**Kind**: static constant of [<code>utils</code>](#module_utils)
**See**: [MDN TypedArray objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects)

| Param | Type                | Description            |
| ----- | ------------------- | ---------------------- |
| size  | <code>number</code> | The max value expected |

<a name="module_utils.normalize"></a>

### utils.normalize(v) ⇒ <code>Array.&lt;number&gt;</code>

Normalize a vector 3.

**Kind**: static method of [<code>utils</code>](#module_utils)
**Returns**: <code>Array.&lt;number&gt;</code> - Normalized vector

| Param | Type                              | Description    |
| ----- | --------------------------------- | -------------- |
| v     | <code>Array.&lt;number&gt;</code> | Vector 3 array |

<a name="module_utils.checkArguments"></a>

### utils.checkArguments(...args)

Ensure first argument passed to the primitive functions is an object

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param   | Type            |
| ------- | --------------- |
| ...args | <code>\*</code> |

<a name="module_utils.setTypedArrayType"></a>

### utils.setTypedArrayType(type)

Enforce a typed array constructor for cells

**Kind**: static method of [<code>utils</code>](#module_utils)

| Param | Type                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>Class.&lt;Uint8Array&gt;</code> \| <code>Class.&lt;Uint16Array&gt;</code> \| <code>Class.&lt;Uint32Array&gt;</code> |

<a name="BasicSimplicialComplex"></a>

## BasicSimplicialComplex : <code>object</code>

Geometry definition without normals and UVs.

**Kind**: global typedef
**Properties**

| Name      | Type                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| positions | <code>Float32Array</code>                                                       |
| cells     | <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code> |

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
