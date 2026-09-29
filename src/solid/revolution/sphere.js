/**
 * @module primitiveGeometry
 * @ignore
 */
import { ellipsoid } from "./ellipsoid.js";

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
 * A sphere: `ellipsoid` with sx = sy = 1.
 *
 * @param {SphereOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function sphere({
  radius = 0.5,
  nx = 32,
  ny = 16,
  theta,
  thetaOffset,
  phi,
  phiOffset,
} = {}) {
  return ellipsoid({
    radius,
    nx,
    ny,
    theta,
    thetaOffset,
    phi,
    phiOffset,
    sx: 1,
    sy: 1,
  });
}
