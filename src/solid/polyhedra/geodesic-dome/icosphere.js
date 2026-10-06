/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { icosahedronPolygons } from "../regular/icosahedron.js";

/**
 * @typedef {object} IcosphereOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
 * @property {"gnomonic" | "spherical"} [projection="gnomonic"]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere from a subdivided icosahedron.
 *
 * @param {IcosphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function icosphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  return computePolyhedron(icosahedronPolygons({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
