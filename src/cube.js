/**
 * @module cube
 */

import { checkArguments, computePlane, getCellsTypedArray } from "./utils.js";

/**
 * @typedef {Object} CubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [nz=nx]
 */

/**
 * @alias module:cube
 * @param {CubeOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function cube({ sx = 1, sy = sx, sz = sx, nx = 1, ny = nx, nz = nx } = {}) {
  checkArguments(arguments);

  const size =
    (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(
      (nx * ny * 2 + nx * nz * 2 + nz * ny * 2) * 6
    ),
  };

  const halfSX = sx * 0.5;
  const halfSY = sy * 0.5;
  const halfSZ = sz * 0.5;

  const indices = { vertex: 0, cell: 0 };

  computePlane(geometry, indices, sx, sy, nx, ny, "z", halfSZ);
  computePlane(geometry, indices, sx, sy, nx, ny, "-z", -halfSZ);
  computePlane(geometry, indices, sz, sy, nz, ny, "-x", -halfSX);
  computePlane(geometry, indices, sz, sy, nz, ny, "x", halfSX);
  computePlane(geometry, indices, sx, sz, nx, nz, "y", halfSY);
  computePlane(geometry, indices, sx, sz, nx, nz, "-y", -halfSY);

  return geometry;
}

export default cube;
