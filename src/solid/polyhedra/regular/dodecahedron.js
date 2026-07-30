/** @module dodecahedron */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { PHI } from "../../../utils/common.js";

/**
 * @typedef {object} DodecahedronFacesOptions
 * @property {number} [radius=0.5]
 */

/**
 * Regular dodecahedron.
 * @param {DodecahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function dodecahedronFaces({ radius = 0.5 } = {}) {
  const a = radius;
  const b = radius / PHI;
  const c = radius * (2 - PHI);

  return {
    // prettier-ignore
    positions: Float32Array.of(
      c, 0, a,
      -c, 0, a,
      -b, b, b,
      0, a, c,
      b, b, b,
      b, -b, b,
      0, -a, c,
      -b, -b, b,
      c, 0, -a,
      -c, 0, -a,
      -b, -b, -b,
      0, -a, -c,
      b, -b, -b,
      b, b, -b,
      0, a, -c,
      -b, b, -b,
      a, c, 0,
      -a, c, 0,
      -a, -c, 0,
      a, -c, 0,
    ),
    cells: [
      [4, 3, 2, 1, 0],
      [7, 6, 5, 0, 1],
      [12, 11, 10, 9, 8],
      [15, 14, 13, 8, 9],
      [14, 3, 4, 16, 13],
      [3, 14, 15, 17, 2],
      [11, 6, 7, 18, 10],
      [6, 11, 12, 19, 5],
      [4, 0, 5, 19, 16],
      [12, 8, 13, 16, 19],
      [15, 9, 10, 18, 17],
      [7, 1, 2, 17, 18],
    ],
  };
}

/**
 * @typedef {object} DodecahedronOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * Regular dodecahedron.
 * @alias module:dodecahedron
 * @param {DodecahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function dodecahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  return computePolyhedron(dodecahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
