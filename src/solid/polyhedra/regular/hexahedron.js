/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { cubePolygons } from "../../cuboid/cube.js";

/**
 * @typedef {object} HexahedronPolygonsOptions
 * @property {number} [radius=0.5]
 */

/**
 * Regular hexahedron (cube) faces, ordered +x, -x, +y, -y, +z, -z.
 *
 * @param {HexahedronPolygonsOptions} [options={}]
 * @returns {import("../../../../types.js").PolygonalComplex}
 */
export function hexahedronPolygons({ radius = 0.5 } = {}) {
  return cubePolygons({ sx: radius * 2, sy: radius * 2, sz: radius * 2 });
}

/**
 * @typedef {object} HexahedronOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * Regular hexahedron (cube).
 *
 * @param {HexahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function hexahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  return computePolyhedron(hexahedronPolygons({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
