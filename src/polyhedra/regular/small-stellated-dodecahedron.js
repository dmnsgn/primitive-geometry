/** @module smallStellatedDodecahedron */
import { computeGreatDodecahedron } from "./great-dodecahedron.js";
import { assembleFaces, computePentagram } from "./pentagram.js";
import polyhedron from "../polyhedron.js";
import { checkArguments } from "../../utils.js";

/**
 * Small stellated dodecahedron: the same 12 vertices and pentagon groupings
 * as the great dodecahedron, with each face's 5 corners connected as a
 * pentagram (skip-one star) instead of a convex pentagon. Since a pentagram
 * outline can't be fan-triangulated, each face is decomposed into 8 filled
 * triangles around 5 computed inner vertices - mathematically shared across
 * faces (the icosahedron's vertex figures are vertex-transitive) but
 * computed independently per face, hence the welding in assembleFaces.
 * @private
 * @param {number} radius Radius of the shared icosahedron vertices
 * @returns {import("../../../types.js").SimplicialComplexPolygon}
 */
export function computeSmallStellatedDodecahedron(radius) {
  const { positions, cells: pentagons } = computeGreatDodecahedron(radius);

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
 * @returns {import("../../../types.js").SimplicialComplex}
 */
function smallStellatedDodecahedron({
  radius = 0.5,
  subdivisions = 0,
  mapping,
} = {}) {
  checkArguments(arguments);

  return polyhedron(computeSmallStellatedDodecahedron(radius), {
    radius,
    subdivisions,
    mapping,
  });
}

export default smallStellatedDodecahedron;
