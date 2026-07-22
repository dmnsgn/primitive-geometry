/** @module hexahedron */
import { polyhedron } from "../polyhedron.js";
import { checkArguments } from "../../../utils.js";

/**
 * @typedef {object} HexahedronFacesOptions
 * @property {number} [radius=0.5]
 */

/**
 * Regular hexahedron (cube) faces: two unit squares (0, 0), (1, 0), (1, 1),
 * (0, 1), +z then -z. Cells order: +z, +x, -z, -x, +y, -y.
 * @param {HexahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function hexahedronFaces({ radius = 0.5 } = {}) {
  checkArguments(arguments);

  return {
    // prettier-ignore
    positions: Float32Array.of(
      -radius, -radius, radius,
      radius, -radius, radius,
      radius, radius, radius,
      -radius, radius, radius,
      -radius, -radius, -radius,
      radius, -radius, -radius,
      radius, radius, -radius,
      -radius, radius, -radius,
    ),

    cells: [
      [0, 1, 2, 3], // +z
      [1, 5, 6, 2], // +x
      [5, 4, 7, 6], // -z
      [4, 0, 3, 7], // -x
      [3, 2, 6, 7], // +y
      [4, 5, 1, 0], // -y
    ],
  };
}

/**
 * @typedef {object} HexahedronOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * @alias module:hexahedron
 * @param {HexahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function hexahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  checkArguments(arguments);

  return polyhedron(hexahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
