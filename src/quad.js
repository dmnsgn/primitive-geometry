/**
 * @module quad
 */

import { getCellsTypedArray } from "./utils.js";

/**
 * @typedef {Object} QuadOptions
 * @property {number} [scale=0.5]
 */

/**
 * @alias module:quad
 * @param {QuadOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
const quad = ({ scale = 0.5 } = {}) => ({
  // prettier-ignore
  positions:  Float32Array.of(
    -scale, -scale, 0,
    scale, -scale, 0,
    scale, scale, 0,
    -scale, scale, 0,
  ),
  // prettier-ignore
  normals: Int8Array.of(
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
  ),
  // prettier-ignore
  uvs: Uint8Array.of(
    0, 0,
    1, 0,
    1, 1,
    0, 1
  ),
  // prettier-ignore
  cells: (getCellsTypedArray(12)).of(
    0, 1, 2,
    2, 3, 0
  ),
});

export default quad;
