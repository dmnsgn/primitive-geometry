/** @module reuleux */
import ellipse from "./ellipse.js";
import { concentric } from "./mappings.js";
import { checkArguments, TAU } from "./utils.js";

/**
 * @typedef {Object} ReuleuxOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {Function} [mapping=mappings.concentric]
 * @property {number} [n=3]
 */

/**
 * @see [Parametric equations for regular and Reuleaux polygons]{@link https://tpfto.wordpress.com/2011/09/15/parametric-equations-for-regular-and-reuleaux-polygons/}
 *
 * @alias module:reuleux
 * @param {ReuleuxOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function reuleux({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mapping = concentric,
  n = 3,
} = {}) {
  checkArguments(arguments);

  const cosN = 2 * Math.cos(Math.PI / (2 * n));
  const PIoverN = Math.PI / n;

  return ellipse({
    sx: 1,
    sy: 1,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    mapping,
    equation: ({ rx, ry, t }) => [
      rx *
        (cosN *
          Math.cos(0.5 * (t + PIoverN * (2 * Math.floor((n * t) / TAU) + 1))) -
          Math.cos(PIoverN * (2 * Math.floor((n * t) / TAU) + 1))),
      ry *
        (cosN *
          Math.sin(0.5 * (t + PIoverN * (2 * Math.floor((n * t) / TAU) + 1))) -
          Math.sin(PIoverN * (2 * Math.floor((n * t) / TAU) + 1))),
    ],
  });
}

export default reuleux;
