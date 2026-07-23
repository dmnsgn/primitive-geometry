/** @module cone */
import { cylinder } from "./cylinder.js";
import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} ConeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [capSegments=1]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {Function} [capMapping=mappings.rectangular]
 * @property {number} [sx=1] Base ring x scale, elliptical when != sz
 * @property {number} [sz=1] Base ring z scale, elliptical when != sx
 */

/**
 * Right circular cone by default. Other shapes fall out of the same
 * parameters: an open cone/funnel (capBase false) and an elliptical cone
 * (sx != sz). There's no apex-side ellipse - the apex is always a single
 * point (radiusApex is fixed at 0), so any apex scale would be a no-op.
 * @alias module:cone
 * @param {ConeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function cone({
  height,
  radius,
  nx,
  ny,
  capSegments,
  capBase,
  phi,
  capMapping,
  sx,
  sz,
} = {}) {
  checkArguments(arguments);

  return cylinder({
    height,
    radius,
    nx,
    ny,
    capSegments,
    capBase,
    phi,
    capMapping,
    sx,
    sz,

    radiusApex: 0,
    capApex: false,
  });
}
