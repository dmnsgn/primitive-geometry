/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { octahedronPolygons } from "../regular/octahedron.js";

/**
 * @typedef {object} OctasphereOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
 * @property {"gnomonic" | "spherical"} [projection="gnomonic"]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided
 * octahedron.
 *
 * @param {OctasphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function octasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  return computePolyhedron(octahedronPolygons({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
