/**
 * @module primitiveGeometry
 * @ignore
 */
import { icosahedronPolygons } from "./icosahedron.js";
import { computePolyhedron } from "../../../utils/polyhedron.js";

/**
 * @typedef {object} GreatIcosahedronPolygonsOptions
 * @property {number} [radius=0.5] Circumradius.
 */

/**
 * Great icosahedron faces: on the icosahedron's vertices, each triangle joining
 * second-nearest neighbors.
 *
 * @param {GreatIcosahedronPolygonsOptions} [options={}]
 * @returns {import("../../../../types.js").PolygonalComplex}
 */
export function greatIcosahedronPolygons({ radius = 0.5 } = {}) {
  const { positions } = icosahedronPolygons({ radius });

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
 * @property {number} [radius=0.5] Circumradius.
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
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
  return computePolyhedron(greatIcosahedronPolygons({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
