/**
 * @module plane
 */

import { checkArguments, getCellsTypedArray } from "./utils.js";

/**
 * @typedef {Object} PlaneOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 */

/**
 * @alias module:plane
 * @param {PlaneOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function plane({ sx = 1, sy = sx, nx = 1, ny = nx } = {}) {
  checkArguments(arguments);

  const size = (nx + 1) * (ny + 1);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(nx * ny * 6);

  let vertexIndex = 0;

  const halfSX = sx * 0.5;
  const halfSY = sy * 0.5;

  for (let y = 0; y <= ny; y++) {
    for (let x = 0; x <= nx; x++) {
      const u = x / nx;
      const v = y / ny;

      positions[vertexIndex * 3] = -halfSX + u * sx;
      positions[vertexIndex * 3 + 1] = halfSY - v * sy;
      positions[vertexIndex * 3 + 2] = 0;

      normals[vertexIndex * 3] = 0;
      normals[vertexIndex * 3 + 1] = 0;
      normals[vertexIndex * 3 + 2] = 1;

      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = 1 - v;

      if (y < ny && x < nx) {
        const a = y * (nx + 1) + x;
        const b = (y + 1) * (nx + 1) + x + 1;
        const c = y * (nx + 1) + x + 1;
        const d = (y + 1) * (nx + 1) + x;
        cells[vertexIndex * 6] = a;
        cells[vertexIndex * 6 + 1] = b;
        cells[vertexIndex * 6 + 2] = c;

        cells[vertexIndex * 6 + 3] = b;
        cells[vertexIndex * 6 + 4] = a;
        cells[vertexIndex * 6 + 5] = d;
      }

      vertexIndex++;
    }
  }

  return {
    positions,
    normals,
    uvs,
    cells,
  };
}

export default plane;
