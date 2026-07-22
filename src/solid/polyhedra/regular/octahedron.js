/** @module octahedron */
import { polyhedron } from "../polyhedron.js";
import { checkArguments } from "../../../utils.js";

/**
 * @typedef {object} OctahedronFacesOptions
 * @property {number} [radius=0.5]
 */

/**
 * Regular octahedron.
 * @param {OctahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function octahedronFaces({ radius = 0.5 } = {}) {
  checkArguments(arguments);

  return {
    // prettier-ignore
    positions: Float32Array.of(
      radius, 0, 0,
      -radius, 0, 0,
      0, radius, 0,
      0, -radius, 0,
      0, 0, radius,
      0, 0, -radius,
    ),
    cells: [
      [0, 2, 4],
      [2, 1, 4],
      [1, 3, 4],
      [3, 0, 4],
      [2, 0, 5],
      [1, 2, 5],
      [3, 1, 5],
      [0, 3, 5],
    ],
  };
}

/**
 * @typedef {object} OctahedronOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * @alias module:octahedron
 * @param {OctahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function octahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  checkArguments(arguments);

  return polyhedron(octahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
