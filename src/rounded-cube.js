/**
 * @module rounded-cube
 */
import cube from "./cube.js";
import { checkArguments, normalize, TMP } from "./utils.js";

/**
 * @typedef {Object} RoundedCubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {number} [nx=16]
 * @property {number} [ny=nx]
 * @property {number} [nz=nx]
 * @property {number} [radius=sx * 0.25]
 */

/**
 * @alias module:rounded-cube
 * @param {RoundedCubeOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function roundedCube({
  sx = 1,
  sy = sx,
  sz = sx,
  nx = 16,
  ny = nx,
  nz = nx,
  radius = sx * 0.25,
} = {}) {
  checkArguments(arguments);

  const geometry = cube({ sx, sy, sz, nx, ny, nz });

  const rx = sx * 0.5;
  const ry = sy * 0.5;
  const rz = sz * 0.5;

  for (let i = 0; i < geometry.positions.length; i += 3) {
    const position = [
      geometry.positions[i],
      geometry.positions[i + 1],
      geometry.positions[i + 2],
    ];
    TMP[0] = position[0];
    TMP[1] = position[1];
    TMP[2] = position[2];

    if (position[0] < -rx + radius) {
      position[0] = -rx + radius;
    } else if (position[0] > rx - radius) {
      position[0] = rx - radius;
    }

    if (position[1] < -ry + radius) {
      position[1] = -ry + radius;
    } else if (position[1] > ry - radius) {
      position[1] = ry - radius;
    }

    if (position[2] < -rz + radius) {
      position[2] = -rz + radius;
    } else if (position[2] > rz - radius) {
      position[2] = rz - radius;
    }

    TMP[0] -= position[0];
    TMP[1] -= position[1];
    TMP[2] -= position[2];

    normalize(TMP);

    geometry.normals[i] = TMP[0];
    geometry.normals[i + 1] = TMP[1];
    geometry.normals[i + 2] = TMP[2];

    geometry.positions[i] = position[0] + radius * TMP[0];
    geometry.positions[i + 1] = position[1] + radius * TMP[1];
    geometry.positions[i + 2] = position[2] + radius * TMP[2];
  }

  return geometry;
}

export default roundedCube;
