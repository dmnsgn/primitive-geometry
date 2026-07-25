/** @module rhombus */
import { polygon } from "../polygon.js";
import { concentric } from "../../mappings.js";
import { checkArguments, HALF_PI, TAU } from "../../utils.js";

/**
 * @typedef {object} RhombusOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=HALF_PI]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * A rhombus: a diamond with vertices at top/right/bottom/left, sx and sy
 * independently scaling the horizontal and vertical diagonals. Equal sx/sy
 * gives a square rotated 45°.
 * @alias module:rhombus
 * @param {RhombusOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function rhombus({
  sx = 1,
  sy = 1,
  radius = 0.5,
  edgeSegments = 1,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = HALF_PI,
  mergeCentroid = true,
  mapping = concentric,
} = {}) {
  checkArguments(arguments);

  return polygon({
    sides: 4,
    sx,
    sy,
    radius,
    edgeSegments,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
  });
}
