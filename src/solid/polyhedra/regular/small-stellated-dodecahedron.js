/** @module smallStellatedDodecahedron */
import { greatDodecahedronFaces } from "./great-dodecahedron.js";
import { assembleFaces, computePentagram } from "./pentagram.js";
import { computePolyhedron } from "../../../utils/polyhedron.js";

/**
 * @typedef {object} SmallStellatedDodecahedronFacesOptions
 * @property {number} [radius=0.5] Radius of the shared icosahedron vertices
 */

/**
 * Small stellated dodecahedron: the same 12 vertices and pentagon groupings
 * as the great dodecahedron, with each face's 5 corners connected as a
 * pentagram (skip-one star) instead of a convex pentagon.
 * @param {SmallStellatedDodecahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function smallStellatedDodecahedronFaces({ radius = 0.5 } = {}) {
  const { positions, cells: pentagons } = greatDodecahedronFaces({ radius });

  return assembleFaces(positions, pentagons, (points) =>
    computePentagram(points),
  );
}

/**
 * @typedef {object} SmallStellatedDodecahedronOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * Small stellated dodecahedron.
 * @alias module:smallStellatedDodecahedron
 * @param {SmallStellatedDodecahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function smallStellatedDodecahedron({
  radius = 0.5,
  subdivisions = 0,
  mapping,
} = {}) {
  return computePolyhedron(smallStellatedDodecahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
