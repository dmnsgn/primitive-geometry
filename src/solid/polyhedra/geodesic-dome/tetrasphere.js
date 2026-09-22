/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { tetrahedronFaces } from "../regular/tetrahedron.js";

/**
 * @typedef {object} TetrasphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic" | "spherical"} [projection="gnomonic"]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided
 * tetrahedron.
 *
 * @param {TetrasphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function tetrasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  return computePolyhedron(tetrahedronFaces({ radius, center: false }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
