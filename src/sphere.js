/**
 * @module sphere
 */
import ellipsoid from "./ellipsoid.js";

/**
 * @typedef {Object} SphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 */

/**
 * @alias module:sphere
 * @param {SphereOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
const sphere = ({ radius = 0.5, nx = 32, ny = 16 } = {}) =>
  ellipsoid({ radius, nx, ny, rx: 1, ry: 1 });

export default sphere;
