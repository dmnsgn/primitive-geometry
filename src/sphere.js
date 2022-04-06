/**
 * @module sphere
 */
import ellipsoid from "./ellipsoid.js";
import { checkArguments } from "./utils.js";

/**
 * @typedef {Object} SphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [theta=Math.PI]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:sphere
 * @param {SphereOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function sphere({ radius = 0.5, nx = 32, ny = 16, theta, phi } = {}) {
  checkArguments(arguments);

  return ellipsoid({ radius, nx, ny, theta, phi, rx: 1, ry: 1 });
}

export default sphere;
