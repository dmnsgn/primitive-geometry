/** @module hexasphere */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { hexahedronFaces } from "../regular/hexahedron.js";

/**
 * @typedef {object} HexasphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic"|"spherical"} [projection="gnomonic"]
 * @property {Function} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided
 * hexahedron (cube) - an alternative to icosphere's topology, with
 * cubemap-friendly UVs.
 * @alias module:hexasphere
 * @param {HexasphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function hexasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {

  return computePolyhedron(hexahedronFaces({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
