/** @module icosphere */
import { polyhedron } from "../polyhedron.js";
import { icosahedronFaces } from "../regular/icosahedron.js";

/**
 * @typedef {object} IcosphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic"|"spherical"} [projection="gnomonic"]
 * @property {Function} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided icosahedron.
 * @alias module:icosphere
 * @param {IcosphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function icosphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {

  return polyhedron(icosahedronFaces({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
