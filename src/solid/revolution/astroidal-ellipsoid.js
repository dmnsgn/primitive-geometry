/**
 * @module primitiveGeometry
 * @ignore
 */
import { superellipsoid } from "./superellipsoid.js";
import { TAU } from "../../utils/common.js";

/**
 * @typedef {object} AstroidalEllipsoidOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [sz=sy]
 * @property {number} [theta=Math.PI] Meridian sweep length, silently clamped to
 *   [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions for
 *   why.
 * @property {number} [thetaOffset=0] Meridian sweep start, silently clamped to
 *   [0, PI] - see theta.
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * A superellipsoid special case (n1 = n2 = 2/3): the surface
 *
 * |x/a|^(2/3) + |y/b|^(2/3) + |z/c|^(2/3) = 1, pinched to 6 cusps along
 *
 * The axes.
 *
 * @param {AstroidalEllipsoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Astroidal Ellipsoid]{@link https://mathworld.wolfram.com/AstroidalEllipsoid.html}
 */
export function astroidalEllipsoid({
  radius = 0.5,
  nx = 32,
  ny = 16,
  sx = 1,
  sy = 0.5,
  sz = sy,
  theta = Math.PI,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,
} = {}) {
  return superellipsoid({
    radius,
    nx,
    ny,
    sx,
    sy,
    sz,
    n1: 2 / 3,
    n2: 2 / 3,
    theta,
    thetaOffset,
    phi,
    phiOffset,
  });
}
