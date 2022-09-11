/** @module cone */
import cylinder from "./cylinder.js";
import { checkArguments } from "./utils.js";

/**
 * @typedef {Object} ConeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [capSegments=1]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:cone
 * @param {ConeOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function cone({ height, radius, nx, ny, capSegments, capBase, phi } = {}) {
  checkArguments(arguments);

  return cylinder({
    height,
    radius,
    nx,
    ny,
    capSegments,
    capBase,
    phi,

    radiusApex: 0,
    capApex: false,
  });
}

export default cone;
