/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";

/**
 * @typedef {object} OctahedronPolygonsOptions
 * @property {number} [radius=0.5] Circumradius.
 */

/**
 * Regular octahedron.
 *
 * @param {OctahedronPolygonsOptions} [options={}]
 * @returns {import("../../../../types.js").PolygonalComplex}
 */
export function octahedronPolygons({ radius = 0.5 } = {}) {
  return {
    // prettier-ignore
    positions: Float32Array.of(
      radius, 0, 0,
      -radius, 0, 0,
      0, radius, 0,
      0, -radius, 0,
      0, 0, radius,
      0, 0, -radius,
    ),
    cells: [
      [0, 2, 4],
      [2, 1, 4],
      [1, 3, 4],
      [3, 0, 4],
      [2, 0, 5],
      [1, 2, 5],
      [3, 1, 5],
      [0, 3, 5],
    ],
  };
}

/**
 * @typedef {object} OctahedronOptions
 * @property {number} [radius=0.5] Circumradius.
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * Regular octahedron.
 *
 * @param {OctahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function octahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  return computePolyhedron(octahedronPolygons({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
