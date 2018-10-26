# primitive-geometry [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[![npm version](https://badge.fury.io/js/primitive-geometry.svg)](https://www.npmjs.com/package/primitive-geometry)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A package exporting geometries for 3D rendering, including normals, UVs and cell indices (faces). Perfect if you want to supercharge your `node_modules` folder... with 100KB of geometries.

![](https://raw.githubusercontent.com/dmnsgn/primitive-geometry/master/screenshot.gif)

See the [demo](https://dmnsgn.github.io/primitive-geometry/) and its [source](demo/index.js) for an example with [REGL](http://regl.party/).

## Installation

```bash
npm install primitive-geometry
```

[![NPM](https://nodei.co/npm/primitive-geometry.png)](https://nodei.co/npm/primitive-geometry/)

## Usage

```js
const Primitives = require("primitive-geometry");

const quadGeometry = Primitives.quad();
const planeGeometry = Primitives.plane();
const cubeGeometry = Primitives.cube();
const roundedCubeGeometry = Primitives.roundedCube();
const capsuleGeometry = Primitives.capsule();
const sphereGeometry = Primitives.sphere();
const icosphereGeometry = Primitives.icosphere();
const ellipsoidGeometry = Primitives.ellipsoid();
const torusGeometry = Primitives.torus();
const cylinderGeometry = Primitives.cylinder();

console.log(quadGeometry);
// {
//   positions: [ [x, y, z], [x, y, z], ... ],
//   cells: [ [a, b, c], [a, b, c], ... ],
//   uvs: [ [u, v], [u, v], ... ],
//   normals: [ [x, y, z], [x, y, z], ... ]
// }
```

## API

See individual packages for details:

- [primitive-quad](https://npmjs.com/package/primitive-quad)
- [primitive-plane](https://npmjs.com/package/primitive-plane)
- [primitive-cube](https://npmjs.com/package/primitive-cube)
- [primitive-rounded-cube](https://npmjs.com/package/primitive-rounded-cube)
- [primitive-capsule](https://npmjs.com/package/primitive-capsule)
- [primitive-sphere](https://npmjs.com/package/primitive-sphere)
- [primitive-icosphere](https://npmjs.com/package/primitive-icosphere)
- [primitive-ellipsoid](https://npmjs.com/package/primitive-ellipsoid)
- [primitive-cylinder](https://npmjs.com/package/primitive-cylinder)
- [primitive-torus](https://npmjs.com/package/primitive-torus)

## License

MIT. See [license file](https://github.com/dmnsgn/primitive-geometry/blob/master/LICENSE.md).
