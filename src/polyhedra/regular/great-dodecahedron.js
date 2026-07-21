/** @module greatDodecahedron */
import { computeIcosahedron } from "./icosahedron.js";
import polyhedron from "../polyhedron.js";
import { checkArguments } from "../../utils.js";

/**
 * Great dodecahedron, sharing the icosahedron's 12 vertices; each of its 12
 * pentagonal faces is the convex pentagon formed by one vertex's 5
 * neighbors, deeply interpenetrating the other 11 faces.
 * @private
 * @param {number} radius
 * @returns {import("../../../types.js").SimplicialComplexPolygon}
 */
export function computeGreatDodecahedron(radius) {
  const { positions } = computeIcosahedron(radius);

  return {
    positions,
    cells: [
      [11, 5, 1, 7, 10],
      [0, 5, 9, 8, 7],
      [11, 10, 6, 3, 4],
      [9, 4, 2, 6, 8],
      [5, 11, 2, 3, 9],
      [0, 11, 4, 9, 1],
      [10, 7, 8, 3, 2],
      [0, 1, 8, 6, 10],
      [7, 1, 9, 3, 6],
      [1, 5, 4, 3, 8],
      [0, 7, 6, 2, 11],
      [5, 0, 10, 2, 4],
    ],
  };
}

/**
 * @typedef {object} GreatDodecahedronOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * @alias module:greatDodecahedron
 * @param {GreatDodecahedronOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
function greatDodecahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  checkArguments(arguments);

  return polyhedron(computeGreatDodecahedron(radius), {
    radius,
    subdivisions,
    mapping,
  });
}

export default greatDodecahedron;
