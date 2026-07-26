/** @module bicone */
import {
  checkArguments,
  computeRevolutionGeometry,
  concatGeometries,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} BiconeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.5]
 * @property {number} [nx=16]
 * @property {number} [ny=1] Meridian segments per half (top/bottom cone)
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {number} [sx=1] Equator x scale, elliptical when != sz
 * @property {number} [sz=1] Equator z scale, elliptical when != sx
 */

/**
 * Two right circular cones joined base-to-base at the equator (a bipyramid
 * of revolution/spinning-top shape) - both ends come to a point, so unlike
 * cylinder/doubleCone there are no cap options. Built as two independent
 * cones (cylinder's elliptical-cone case, generalized to an arbitrary y
 * span) concatenated at the equator rather than one function with a v = 0.5
 * kink: the two halves need opposite-signed local slopes there, which a
 * single shared row (and thus a single vertex normal) can't satisfy for
 * both sides at once - concatGeometries gives each half its own equator
 * ring instead, the same seam convention used for cap/body boundaries
 * elsewhere in this codebase.
 * @alias module:bicone
 * @param {BiconeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function bicone({
  height = 1,
  radius = 0.5,
  nx = 16,
  ny = 1,
  phi = TAU,
  phiOffset = 0,
  sx = 1,
  sz = 1,
} = {}) {
  checkArguments(arguments);

  const halfHeight = height / 2;

  function cone(yFrom, yTo, rFrom, rTo) {
    const rPrime = rTo - rFrom;
    const yPrime = yTo - yFrom;

    function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
      const cosPhi = -rawCosPhi;
      const r = rFrom + rPrime * v;

      return {
        position: [r * sx * cosPhi, yFrom + yPrime * v, r * sz * sinPhi],
        // Same r-factored tangent cross-product as cylinder's cone case,
        // with sx/sz constant (no per-end ellipse - each end is a point)
        normal: [
          yPrime * sz * cosPhi,
          -(rPrime * sx * sz),
          yPrime * sx * sinPhi,
        ],
        collapsed: r === 0,
      };
    }

    return computeRevolutionGeometry({ nx, ny, phi, phiOffset, equation });
  }

  return concatGeometries([
    cone(-halfHeight, 0, 0, radius),
    cone(0, halfHeight, radius, 0),
  ]);
}
