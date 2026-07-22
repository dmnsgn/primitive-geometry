/** @module tetrahedron */
import { polyhedron } from "../polyhedron.js";
import { checkArguments } from "../../../utils.js";

/**
 * @typedef {object} TetrahedronFacesOptions
 * @property {number} [circumradius=0.5]
 */

/**
 * Regular tetrahedron, apex-up, every vertex at exactly `circumradius` from
 * the origin (uncentered) - needed as-is wherever radial projection applies.
 * @param {TetrahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function tetrahedronFaces({ circumradius = 0.5 } = {}) {
  checkArguments(arguments);

  const r0 = (circumradius * 2 * Math.sqrt(2)) / 3;
  return {
    // prettier-ignore
    positions: Float32Array.of(
      0, circumradius, 0,
      r0, -circumradius / 3, 0,
      -r0 / 2, -circumradius / 3, (r0 * Math.sqrt(3)) / 2,
      -r0 / 2, -circumradius / 3, -(r0 * Math.sqrt(3)) / 2,
    ),
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
  checkArguments(arguments);

  // A tetrahedron has no center of symmetry, so its bounding box can't be
  // centered and touch the unit box on every axis; scaled so its tallest
  // axis touches, then shifted so the box is centered at the origin.
  const { positions, cells } = tetrahedronFaces({
    circumradius: (radius * Math.sqrt(6)) / 2,
  });
  const shiftX = positions[3] / 4; // base vertex x
  const shiftY = (positions[1] + positions[4]) / 2; // (apex y + base y) / 2
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] -= shiftX;
    positions[i + 1] -= shiftY;
  }

  return polyhedron({ positions, cells }, { radius, subdivisions, mapping });
}
