/**
 * @module primitiveGeometry
 * @ignore
 */
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { SQRT2, SQRT3 } from "../../../utils/common.js";

/**
 * @typedef {object} TetrahedronPolygonsOptions
 * @property {number} [radius=0.5] Circumradius.
 * @property {boolean} [center=true] Center the bounding box. `false` centers
 *   the centroid, keeping vertices on the circumsphere.
 */

/**
 * Regular tetrahedron, apex-up, bounding box centered at the origin.
 *
 * @param {TetrahedronPolygonsOptions} [options={}]
 * @returns {import("../../../../types.js").PolygonalComplex}
 */
export function tetrahedronPolygons({ radius = 0.5, center = true } = {}) {
  // Base ring radius, its plane a third of the circumradius below the centroid
  const r0 = (radius * 2 * SQRT2) / 3;
  // prettier-ignore
  const positions = Float32Array.of(
    0, radius, 0,
    r0, -radius / 3, 0,
    -r0 / 2, -radius / 3, (r0 * SQRT3) / 2,
    -r0 / 2, -radius / 3, -(r0 * SQRT3) / 2,
  );

  // No center of symmetry: the centroid sits off the bounding box center
  if (center) {
    const shiftX = r0 / 4; // (base vertex x + base edge x) / 2
    const shiftY = radius / 3; // (apex y + base y) / 2
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] -= shiftX;
      positions[i + 1] -= shiftY;
    }
  }

  return {
    positions,
    cells: [
      [0, 2, 1],
      [0, 3, 2],
      [0, 1, 3],
      [1, 2, 3],
    ],
  };
}

/**
 * @typedef {object} TetrahedronOptions
 * @property {number} [radius=0.5] Circumradius.
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * Regular tetrahedron.
 *
 * @param {TetrahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function tetrahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  return computePolyhedron(tetrahedronPolygons({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
