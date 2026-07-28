/** @module lozenge */
import { rhombus } from "./rhombus.js";
import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} LozengeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx*2]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=HALF_PI]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * A rhombus elongated along its vertical diagonal by default (sy = sx * 2),
 * the classic narrow diamond look.
 * @alias module:lozenge
 * @param {LozengeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function lozenge({
  sx = 0.5,
  sy = sx * 2,
  radius,
  edgeSegments,
  innerSegments,
  innerRadius,
  theta,
  thetaOffset,
  mergeCentroid,
  mapping,
} = {}) {
  checkArguments(arguments);

  return rhombus({
    sx,
    sy,
    radius,
    edgeSegments,
    innerSegments,
    innerRadius,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
  });
}
