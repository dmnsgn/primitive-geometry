/** @module icosahedron */
import { polyhedron } from "../polyhedron.js";
import { PHI } from "../../../utils.js";

/**
 * @typedef {object} IcosahedronFacesOptions
 * @property {number} [radius=0.5]
 */

/**
 * Regular icosahedron.
 * @param {IcosahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function icosahedronFaces({ radius = 0.5 } = {}) {
  const s = radius / PHI;
  const f = PHI * s;

  return {
    // prettier-ignore
    positions: Float32Array.of(
      -s, f, 0,
      s, f, 0,
      -s, -f, 0,
      s, -f, 0,
      0, -s, f,
      0, s, f,
      0, -s, -f,
      0, s, -f,
      f, 0, -s,
      f, 0, s,
      -f, 0, -s,
      -f, 0, s,
    ),
    cells: [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [11, 10, 2],
      [5, 11, 4],
      [1, 5, 9],
      [7, 1, 8],
      [10, 7, 6],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],
      [9, 8, 1],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
    ],
  };
}

/**
 * @typedef {object} IcosahedronOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * Regular icosahedron.
 * @alias module:icosahedron
 * @param {IcosahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function icosahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  return polyhedron(icosahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
