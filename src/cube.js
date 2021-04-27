/**
 * @module cube
 */

import { getCellsTypedArray } from "./utils.js";

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
  const size =
    (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    (nx * ny * 2 + nx * nz * 2 + nz * ny * 2) * 6
  );

  let vertexIndex = 0;
  let cellIndex = 0;

  function computePlane(u, v, w, su, sv, nu, nv, pw, flipU, flipV) {
    const vertexOffset = vertexIndex;

    for (let j = 0; j <= nv; j++) {
      for (let i = 0; i <= nu; i++) {
        positions[vertexIndex * 3 + u] = (-su / 2 + (i * su) / nu) * flipU;
        positions[vertexIndex * 3 + v] = (-sv / 2 + (j * sv) / nv) * flipV;
        positions[vertexIndex * 3 + w] = pw;

        normals[vertexIndex * 3 + u] = 0;
        normals[vertexIndex * 3 + v] = 0;
        normals[vertexIndex * 3 + w] = pw / Math.abs(pw);

        uvs[vertexIndex * 2] = i / nu;
        uvs[vertexIndex * 2 + 1] = 1 - j / nv;

        vertexIndex++;

        if (j < nv && i < nu) {
          const n = vertexOffset + j * (nu + 1) + i;
          cells[cellIndex] = n;
          cells[cellIndex + 1] = n + nu + 1;
          cells[cellIndex + 2] = n + nu + 2;

          cells[cellIndex + 3] = n;
          cells[cellIndex + 4] = n + nu + 2;
          cells[cellIndex + 5] = n + 1;
          cellIndex += 6;
        }
      }
    }
  }

  const halfSX = sx * 0.5;
  const halfSY = sy * 0.5;
  const halfSZ = sz * 0.5;

  computePlane(0, 1, 2, sx, sy, nx, ny, halfSZ, 1, -1); // front
  computePlane(0, 1, 2, sx, sy, nx, ny, -halfSZ, -1, -1); // back
  computePlane(2, 1, 0, sz, sy, nz, ny, -halfSX, 1, -1); // left
  computePlane(2, 1, 0, sz, sy, nz, ny, halfSX, -1, -1); // right
  computePlane(0, 2, 1, sx, sz, nx, nz, halfSY, 1, 1); // top
  computePlane(0, 2, 1, sx, sz, nx, nz, -halfSY, 1, -1); // bottom

  return {
    positions,
    normals,
    uvs,
    cells,
  };
}

export default cube;
