/** @module tetrasphere */
import { polyhedron } from "../polyhedron.js";
import { tetrahedronFaces } from "../regular/tetrahedron.js";
import { checkArguments } from "../../../utils.js";

/**
 * @typedef {object} TetrasphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic"|"spherical"} [projection="gnomonic"]
 * @property {Function} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided tetrahedron.
 * @alias module:tetrasphere
 * @param {TetrasphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function tetrasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  checkArguments(arguments);

  return polyhedron(tetrahedronFaces({ circumradius: radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
