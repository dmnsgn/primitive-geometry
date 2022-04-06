/**
 * @module ellipsoid
 */
import {
  checkArguments,
  getCellsTypedArray,
  normalize,
  TAU,
  TMP,
} from "./utils.js";

/**
 * @typedef {Object} EllipsoidOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [rx=1]
 * @property {number} [rx=0.5]
 * @property {number} [rz=ry]
 */

/**
 * Default to an oblate spheroid.
 * @alias module:ellipsoid
 * @param {EllipsoidOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function ellipsoid({
  radius = 1,
  nx = 32,
  ny = 16,
  rx = 0.5,
  ry = 0.25,
  rz = ry,
} = {}) {
  checkArguments(arguments);

  const size = (ny + 1) * (nx + 1);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(ny * nx * 6);

  let vertexIndex = 0;
  let cellIndex = 0;

  for (let y = 0; y <= ny; y++) {
    const v = y / ny;
    const theta = v * Math.PI;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    for (let x = 0; x <= nx; x++) {
      const u = x / nx;
      const phi = u * TAU;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      TMP[0] = -rx * cosPhi * sinTheta;
      TMP[1] = -ry * cosTheta;
      TMP[2] = rz * sinPhi * sinTheta;

      positions[vertexIndex * 3] = radius * TMP[0];
      positions[vertexIndex * 3 + 1] = radius * TMP[1];
      positions[vertexIndex * 3 + 2] = radius * TMP[2];

      normalize(TMP);

      normals[vertexIndex * 3] = TMP[0];
      normals[vertexIndex * 3 + 1] = TMP[1];
      normals[vertexIndex * 3 + 2] = TMP[2];

      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = v;

      vertexIndex++;
    }

    if (y > 0) {
      for (let i = vertexIndex - 2 * (nx + 1); i + nx + 2 < vertexIndex; i++) {
        const a = i;
        const b = i + 1;
        const c = i + nx + 1;
        const d = i + nx + 2;
        cells[cellIndex] = a;
        cells[cellIndex + 1] = b;
        cells[cellIndex + 2] = c;

        cells[cellIndex + 3] = c;
        cells[cellIndex + 4] = b;
        cells[cellIndex + 5] = d;

        cellIndex += 6;
      }
    }
  }

  return {
    positions,
    normals,
    uvs,
    cells,
  };
}

export default ellipsoid;
