/** @module smallStellatedDodecahedron */
import { greatDodecahedronFaces } from "./great-dodecahedron.js";
import { assembleFaces, computePentagram } from "./pentagram.js";
import { polyhedron } from "../polyhedron.js";

/**
 * @typedef {object} SmallStellatedDodecahedronFacesOptions
 * @property {number} [radius=0.5] Radius of the shared icosahedron vertices
 */

/**
 * Small stellated dodecahedron: the same 12 vertices and pentagon groupings
 * as the great dodecahedron, with each face's 5 corners connected as a
 * pentagram (skip-one star) instead of a convex pentagon. Since a pentagram
 * outline can't be fan-triangulated, each face is decomposed into 8 filled
 * triangles around 5 computed inner vertices - mathematically shared across
 * faces (the icosahedron's vertex figures are vertex-transitive) but
 * computed independently per face, hence the welding in assembleFaces.
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
 * @alias module:smallStellatedDodecahedron
 * @param {SmallStellatedDodecahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function smallStellatedDodecahedron({
  radius = 0.5,
  subdivisions = 0,
  mapping,
} = {}) {
  return polyhedron(smallStellatedDodecahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
