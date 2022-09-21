/** @module superellipse */
import ellipse from "./ellipse.js";
import { lamé } from "./mappings.js";
import { checkArguments, TAU } from "./utils.js";

/**
 * @typedef {Object} SuperellipseOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {Function} [mapping=mappings.lamé]
 * @property {number} [m=2]
 * @property {number} [n=m]
 */

/**
 * Lamé curve
 * See elliptical-mapping example for a few special cases
 * @see [Wolfram MathWorld – Superellipse]{@link https://mathworld.wolfram.com/Superellipse.html}
 * @see [Wikipedia – Superellipse]{@link https://en.wikipedia.org/wiki/Superellipse}
 * @alias module:superellipse
 * @param {SuperellipseOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function superellipse({
  sx = 1,
  sy = 0.5,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mapping = lamé,
  m = 2,
  n = m,
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
    equation: ({ rx, ry, cosTheta, sinTheta }) => {
      return [
        rx * Math.abs(cosTheta) ** (2 / m) * Math.sign(cosTheta),
        ry * Math.abs(sinTheta) ** (2 / n) * Math.sign(sinTheta),
      ];
    },
  });
}

export default superellipse;
