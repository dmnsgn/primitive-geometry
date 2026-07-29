/** @module hexahedron */
import { polyhedron } from "../polyhedron.js";
import { checkArguments } from "../../../utils.js";

/**
 * @typedef {object} HexahedronFacesOptions
 * @property {number} [radius=0.5]
 */

/**
 * Regular hexahedron (cube) faces: 8 corners.
 * Cells order: +x, -x, +y, -y, +z, -z.
 * @param {HexahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function hexahedronFaces({ radius = 0.5 } = {}) {
  checkArguments(arguments);

  return {
    // prettier-ignore
    positions: Float32Array.of(
      -radius, radius, radius,
      -radius, -radius, radius,
      radius, -radius, radius,
      radius, radius, radius,
      radius, radius, -radius,
      radius, -radius, -radius,
      -radius, -radius, -radius,
      -radius, radius, -radius,
    ),

    cells: [
      [3, 2, 5, 4], // +x
      [7, 6, 1, 0], // -x
      [7, 0, 3, 4], // +y
      [1, 6, 5, 2], // -y
      [0, 1, 2, 3], // +z
      [4, 5, 6, 7], // -z
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
