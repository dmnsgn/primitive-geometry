/**
 * @module primitiveGeometry
 * @ignore
 */
import { icosahedronPolygons } from "./icosahedron.js";
import { computePolyhedron } from "../../../utils/polyhedron.js";

/**
 * @typedef {object} GreatDodecahedronPolygonsOptions
 * @property {number} [radius=0.5] Circumradius.
 */

/**
 * Great dodecahedron faces: on the icosahedron's vertices, one pentagon per
 * vertex's 5 neighbors.
 *
 * @param {GreatDodecahedronPolygonsOptions} [options={}]
 * @returns {import("../../../../types.js").PolygonalComplex}
 */
export function greatDodecahedronPolygons({ radius = 0.5 } = {}) {
  const { positions } = icosahedronPolygons({ radius });

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
 * @property {number} [radius=0.5] Circumradius.
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * Great dodecahedron.
 *
 * @param {GreatDodecahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function greatDodecahedron({
  radius = 0.5,
  subdivisions = 0,
  mapping,
} = {}) {
  return computePolyhedron(greatDodecahedronPolygons({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
