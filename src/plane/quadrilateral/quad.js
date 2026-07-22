/** @module quad */

import { checkArguments, triangulateFaces } from "../../utils.js";

/**
 * @typedef {object} QuadFacesOptions
 * @property {number} [scale=0.5]
 */

/**
 * @param {QuadFacesOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPolygon}
 */
export function quadFaces({ scale = 0.5 } = {}) {
  checkArguments(arguments);

  return {
    // prettier-ignore
    positions:  Float32Array.of(
      -scale, -scale, 0,
      scale, -scale, 0,
      scale, scale, 0,
      -scale, scale, 0,
    ),
    cells: [[0, 1, 2, 3]],
  };
}

/**
 * @typedef {object} QuadOptions
 * @property {number} [scale=0.5]
 */

/**
 * @alias module:quad
 * @param {QuadOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function quad({ scale = 0.5 } = {}) {
  checkArguments(arguments);

  const { positions, cells } = quadFaces({ scale });

  return {
    positions,
    // prettier-ignore
    normals: Int8Array.of(
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ),
    // prettier-ignore
    uvs: Uint8Array.of(
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ),
    cells: triangulateFaces(cells, 4),
  };
}
