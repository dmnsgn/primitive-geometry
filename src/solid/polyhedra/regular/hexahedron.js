/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { cubeFaces } from "../../cuboid/cube.js";

/**
 * @typedef {object} HexahedronFacesOptions
 * @property {number} [radius=0.5]
 */

/**
 * Regular hexahedron (cube) faces: 8 corners, cells order +x, -x, +y, -y, +z,
 * -z - `cubeFaces`'s own layout, since a regular hexahedron is exactly a cube
 * whose half-extent (`radius`) is the same on all 3 axes.
 *
 * @param {HexahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function hexahedronFaces({ radius = 0.5 } = {}) {
  return cubeFaces({ sx: radius * 2, sy: radius * 2, sz: radius * 2 });
}

/**
 * @typedef {object} HexahedronOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * Regular hexahedron (cube).
 *
 * @param {HexahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function hexahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  return computePolyhedron(hexahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
