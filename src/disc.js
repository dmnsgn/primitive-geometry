/** @module disc */
import ellipse from "./ellipse.js";
import { concentric } from "./mappings.js";
import { checkArguments, TAU } from "./utils.js";

/**
 * @typedef {object} DiscOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * @alias module:disc
 * @param {DiscOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function disc({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mapping = concentric,
} = {}) {
  checkArguments(arguments);

  return ellipse({
    sx: 1,
    sy: 1,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    mapping,
  });
}

export default disc;
