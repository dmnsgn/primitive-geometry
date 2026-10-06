/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { dodecahedronPolygons } from "../regular/dodecahedron.js";

/**
 * @typedef {object} DodecasphereOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
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
  return computePolyhedron(dodecahedronPolygons({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
