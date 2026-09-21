/** @module octasphere */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { octahedronFaces } from "../regular/octahedron.js";

/**
 * @typedef {object} OctasphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic" | "spherical"} [projection="gnomonic"]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided
 * octahedron.
 *
 * @param {OctasphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 * @alias module:octasphere
 */
export function octasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  return computePolyhedron(octahedronFaces({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
