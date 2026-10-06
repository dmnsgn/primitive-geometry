/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { hexahedronPolygons } from "../regular/hexahedron.js";

/**
 * @typedef {object} HexasphereOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
 * @property {"gnomonic" | "spherical"} [projection="gnomonic"]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided
 * hexahedron (cube) - an alternative to icosphere's topology, with
 * cubemap-friendly UVs.
 *
 * @param {HexasphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function hexasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  return computePolyhedron(hexahedronPolygons({ radius }), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}
