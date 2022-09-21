/** @module squircle */
import ellipse from "./ellipse.js";
import { fgSquircular } from "./mappings.js";
import { checkArguments, HALF_PI, SQRT2, TAU } from "./utils.js";

/**
 * @typedef {Object} SquircleOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [segments=128]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {Function} [mapping=mappings.fgSquircular]
 * @property {number} [squareness=0.95] Squareness (0 < s <= 1)
 */

/**
 * Fernández-Guasti squircle
 * @see [Squircular Calculations – Chamberlain Fong]{@link https://arxiv.org/vc/arxiv/papers/1604/1604.02174v1.pdf}
 *
 * @alias module:squircle
 * @param {SquircleOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function squircle({
  sx = 1,
  sy = 1,
  radius = 0.5,
  segments = 128,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mapping = fgSquircular,
  squareness = 0.95,
} = {}) {
  checkArguments(arguments);

  return ellipse({
    sx,
    sy,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    mapping,
    equation: ({ rx, ry, cosTheta, sinTheta, t }) => {
      // Fix singularities
      // https://codereview.stackexchange.com/questions/233496/handling-singularities-in-squircle-parametric-equations
      if (t === 0 || t === TAU) {
        return [rx, 0];
      } else if (t === HALF_PI) {
        return [0, ry];
      } else if (t === Math.PI) {
        return [-rx, 0];
      } else if (t === TAU - HALF_PI) {
        return [0, -ry];
      } else {
        const sqrt = Math.sqrt(
          1 - Math.sqrt(1 - squareness ** 2 * Math.sin(2 * t) ** 2)
        );

        return [
          ((rx * Math.sign(cosTheta)) /
            (squareness * SQRT2 * Math.abs(sinTheta))) *
            sqrt,
          ((ry * Math.sign(sinTheta)) /
            (squareness * SQRT2 * Math.abs(cosTheta))) *
            sqrt,
        ];
      }
    },
  });
}

export default squircle;
