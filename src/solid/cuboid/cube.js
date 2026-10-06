/**
 * @module primitiveGeometry
 * @ignore
 */

import { getCellsTypedArray } from "../../utils/common.js";
import { computePlane } from "../../utils/plane-grid.js";

/**
 * @typedef {object} CubePolygonsOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 */

/**
 * Cuboid faces: 8 positions and 6 quad faces (indices into positions). Cells
 * order: +x, -x, +y, -y, +z, -z.
 *
 * @param {CubePolygonsOptions} [options={}]
 * @returns {import("../../../types.js").PolygonalComplex}
 */
export function cubePolygons({ sx = 1, sy = sx, sz = sx } = {}) {
  const x = sx / 2;
  const y = sy / 2;
  const z = sz / 2;

  return {
    // prettier-ignore
    positions:  Float32Array.of(
      -x, y, z,
      -x, -y, z,
      x, -y, z,
      x, y, z,

      // -z
      x, y, -z,
      x, -y, -z,
      -x, -y, -z,
      -x, y, -z,
    ),
    cells: [
      [3, 2, 5, 4], // +x
      [7, 6, 1, 0], // -x
      [7, 0, 3, 4], // +y
      [1, 6, 5, 2], // -y
      [0, 1, 2, 3], // +z
      [4, 5, 6, 7], // -z
    ],
  };
}

/**
 * @typedef {object} CubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {import("../../../types.js").PositiveInteger} [nx=1]
 * @property {import("../../../types.js").PositiveInteger} [ny=nx]
 * @property {import("../../../types.js").PositiveInteger} [nz=nx]
 */

/**
 * A cuboid (rectangular box).
 *
 * @param {CubeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function cube({
  sx = 1,
  sy = sx,
  sz = sx,
  nx = 1,
  ny = nx,
  nz = nx,
} = {}) {
  const size =
    (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(
      (nx * ny * 2 + nx * nz * 2 + nz * ny * 2) * 6,
    ),
  };

  const halfSX = sx * 0.5;
  const halfSY = sy * 0.5;
  const halfSZ = sz * 0.5;

  const indices = { vertex: 0, cell: 0 };

  computePlane(geometry, indices, sz, sy, nz, ny, "x", halfSX);
  computePlane(geometry, indices, sz, sy, nz, ny, "-x", -halfSX);
  computePlane(geometry, indices, sx, sz, nx, nz, "y", halfSY);
  computePlane(geometry, indices, sx, sz, nx, nz, "-y", -halfSY);
  computePlane(geometry, indices, sx, sy, nx, ny, "z", halfSZ);
  computePlane(geometry, indices, sx, sy, nx, ny, "-z", -halfSZ);

  return geometry;
}
