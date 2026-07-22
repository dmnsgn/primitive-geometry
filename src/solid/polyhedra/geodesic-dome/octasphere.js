/** @module octasphere */
import { polyhedron } from "../polyhedron.js";
import { octahedronFaces } from "../regular/octahedron.js";
import { checkArguments } from "../../../utils.js";

/**
 * @typedef {object} OctasphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic"|"spherical"} [projection="gnomonic"]
 * @property {Function} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided octahedron.
 * @alias module:octasphere
 * @param {OctasphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function octasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  checkArguments(arguments);

  return polyhedron(octahedronFaces({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
