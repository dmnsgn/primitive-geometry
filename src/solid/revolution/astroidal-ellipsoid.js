/** @module astroidal-ellipsoid */
import { superellipsoid } from "./superellipsoid.js";
import { TAU } from "../../utils.js";

/**
 * @typedef {object} AstroidalEllipsoidOptions
 * @property {number} [radius=1]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [rx=0.5]
 * @property {number} [ry=0.25]
 * @property {number} [rz=ry]
 * @property {number} [theta=Math.PI] Meridian sweep length, silently clamped
 * to [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions
 * for why (computeRevolutionGeometry only supports a pole at v = 0/1).
 * @property {number} [thetaOffset=0] Meridian sweep start, silently clamped
 * to [0, PI] - see theta.
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * A superellipsoid special case (n1 = n2 = 2/3): the surface
 * |x/rx|^(2/3) + |y/ry|^(2/3) + |z/rz|^(2/3) = 1, pinched to 6 cusps along
 * the axes.
 * @see [Wolfram MathWorld – Astroidal Ellipsoid]{@link https://mathworld.wolfram.com/AstroidalEllipsoid.html}
 * @alias module:astroidalEllipsoid
 * @param {AstroidalEllipsoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function astroidalEllipsoid({
  radius = 1,
  nx = 32,
  ny = 16,
  rx = 0.5,
  ry = 0.25,
  rz = ry,
  theta = Math.PI,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,
} = {}) {

  return superellipsoid({
    radius,
    nx,
    ny,
    rx,
    ry,
    rz,
    n1: 2 / 3,
    n2: 2 / 3,
    theta,
    thetaOffset,
    phi,
    phiOffset,
  });
}
