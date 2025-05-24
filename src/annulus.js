/** @module annulus */
import ellipse from "./ellipse.js";
import { concentric } from "./mappings.js";
import { checkArguments, TAU } from "./utils.js";

/**
 * @typedef {object} AnnulusOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {number} [innerRadius=radius * 0.5]
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * @alias module:annulus
 * @param {AnnulusOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function annulus({
  sx = 1,
  sy = 1,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  innerRadius = radius * 0.5,
  mapping = concentric,
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
    innerRadius,
    mergeCentroid: false,
    mapping,
  });
}

export default annulus;
