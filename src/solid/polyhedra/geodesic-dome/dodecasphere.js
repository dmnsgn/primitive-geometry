/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { dodecahedronFaces } from "../regular/dodecahedron.js";

/**
 * @typedef {object} DodecasphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic" | "spherical"} [projection="gnomonic"]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided
 * dodecahedron
 *
 * @param {DodecasphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function dodecasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  return computePolyhedron(dodecahedronFaces({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
