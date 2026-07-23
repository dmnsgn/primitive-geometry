/** @module plane */

import { checkArguments, computePlane, getCellsTypedArray } from "../../utils.js";

/**
 * @typedef {object} PlaneOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {PlaneDirection} [direction="z"]
 */

/**
 * @typedef {"x" | "-x" | "y" | "-y" | "z" | "-z"} PlaneDirection
 */

/**
 * @alias module:plane
 * @param {PlaneOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function plane({ sx = 1, sy = sx, nx = 1, ny = nx, direction = "z" } = {}) {
  checkArguments(arguments);

  const size = (nx + 1) * (ny + 1);

  return computePlane(
    {
      positions: new Float32Array(size * 3),
      normals: new Float32Array(size * 3),
      uvs: new Float32Array(size * 2),
      cells: new (getCellsTypedArray(size))(nx * ny * 6),
    },
    { vertex: 0, cell: 0 },
    sx,
    sy,
    nx,
    ny,
    direction,
    0,
  );
}
