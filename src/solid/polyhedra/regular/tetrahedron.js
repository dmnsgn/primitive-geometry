/** @module tetrahedron */
import { polyhedron } from "../polyhedron.js";
import { SQRT2, SQRT3, SQRT6 } from "../../../utils.js";

/**
 * @typedef {object} TetrahedronFacesOptions
 * @property {number} [radius=0.5]
 * @property {boolean} [center=true] Center the bounding box at the origin.
 * Set to false to keep every vertex at exactly the circumradius from the
 * origin - needed as-is wherever radial projection applies.
 */

/**
 * Regular tetrahedron, apex-up, bounding box centered at the origin.
 * @param {TetrahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function tetrahedronFaces({ radius = 0.5, center = true } = {}) {
  // A tetrahedron has no center of symmetry, so its bounding box can't touch
  // the unit box on every axis when centered; scale instead so its tallest
  // axis (apex to base) touches.
  const circumradius = (radius * SQRT6) / 2;
  const r0 = (circumradius * 2 * SQRT2) / 3;
  // prettier-ignore
  const positions = Float32Array.of(
    0, circumradius, 0,
    r0, -circumradius / 3, 0,
    -r0 / 2, -circumradius / 3, (r0 * SQRT3) / 2,
    -r0 / 2, -circumradius / 3, -(r0 * SQRT3) / 2,
  );

  if (center) {
    const shiftX = positions[3] / 4; // base vertex x
    const shiftY = (positions[1] + positions[4]) / 2; // (apex y + base y) / 2
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
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * @alias module:tetrahedron
 * @param {TetrahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function tetrahedron({ radius = 0.5, subdivisions = 0, mapping } = {}) {
  return polyhedron(tetrahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
