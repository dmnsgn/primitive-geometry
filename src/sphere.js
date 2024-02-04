/** @module sphere */
import ellipsoid from "./ellipsoid.js";
import { checkArguments } from "./utils.js";

/**
 * @typedef {object} SphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [theta=Math.PI]
 * @property {number} [thetaOffset=0]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * @alias module:sphere
 * @param {SphereOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function sphere({
  radius = 0.5,
  nx = 32,
  ny = 16,
  theta,
  thetaOffset,
  phi,
  phiOffset,
} = {}) {
  checkArguments(arguments);

  return ellipsoid({
    radius,
    nx,
    ny,
    theta,
    thetaOffset,
    phi,
    phiOffset,
    rx: 1,
    ry: 1,
  });
}

export default sphere;
