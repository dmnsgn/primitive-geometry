/**
 * @module primitiveGeometry
 * @ignore
 */
import { icosahedronFaces } from "./icosahedron.js";
import { computePolyhedron } from "../../../utils/polyhedron.js";

/**
 * @typedef {object} GreatIcosahedronFacesOptions
 * @property {number} [radius=0.5] Radius of the shared icosahedron vertices
 */

/**
 * Great icosahedron, sharing the icosahedron's 12 vertices; each of its 20
 * triangular faces connects a vertex to two of its "second-shell" neighbors
 * (rather than its 5 immediate ones), deeply interpenetrating the rest.
 *
 * @param {GreatIcosahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function greatIcosahedronFaces({ radius = 0.5 } = {}) {
  const { positions } = icosahedronFaces({ radius });

  return {
    positions,
    cells: [
      [5, 4, 9],
      [5, 11, 4],
      [5, 0, 11],
      [5, 1, 0],
      [5, 9, 1],
      [4, 3, 9],
      [4, 2, 3],
      [4, 11, 2],
      [6, 7, 8],
      [6, 10, 7],
      [6, 2, 10],
      [6, 3, 2],
      [6, 8, 3],
      [7, 1, 8],
      [7, 0, 1],
      [7, 10, 0],
      [1, 9, 8],
      [0, 10, 11],
      [2, 11, 10],
      [3, 8, 9],
    ],
  };
}

/**
 * @typedef {object} GreatIcosahedronOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * Great icosahedron.
 *
 * @param {GreatIcosahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function greatIcosahedron({
  radius = 0.5,
  subdivisions = 0,
  mapping,
} = {}) {
  return computePolyhedron(greatIcosahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
