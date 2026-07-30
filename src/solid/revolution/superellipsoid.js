/** @module superellipsoid */
import {
  clampMeridianSweep,
  computeRevolutionGeometry,
  signedPow,
  snapToZero,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} SuperellipsoidOptions
 * @property {number} [radius=1]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [rx=0.5]
 * @property {number} [ry=0.25]
 * @property {number} [rz=ry]
 * @property {number} [n1=3] North-south (meridian) roundness exponent
 * @property {number} [n2=n1] East-west (cross-section) roundness exponent
 * @property {number} [theta=Math.PI] Meridian sweep length, silently clamped
 * to [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions
 * for why.
 * @property {number} [thetaOffset=0] Meridian sweep start, silently clamped
 * to [0, PI] - see theta.
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * Superquadric ellipsoid (Barr 1981): generalizes ellipsoid by raising its
 * meridian (n1) and cross-section (n2) sin/cos terms to signed powers -
 * n = 2 is a plain ellipsoid, n < 2 rounds toward a box, n > 2 (the default,
 * n1 = n2 = 3) pinches toward a star/octahedron. See superegg for the n2 = 2
 * (circular cross-section) special case.
 * @see [Wolfram MathWorld – Superellipsoid]{@link https://mathworld.wolfram.com/Superellipsoid.html}
 * @see [Wikipedia – Superellipsoid]{@link https://en.wikipedia.org/wiki/Superellipsoid}
 * @alias module:superellipsoid
 * @param {SuperellipsoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function superellipsoid({
  radius = 1,
  nx = 32,
  ny = 16,
  rx = 0.5,
  ry = 0.25,
  rz = ry,
  n1 = 3,
  n2 = n1,
  theta = Math.PI,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,
} = {}) {

  const e1 = 2 / n1;
  const e2 = 2 / n2;

  const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(
    theta,
    thetaOffset,
  );

  function equation({ v, cosPhi, sinPhi }) {
    const t = v * clampedTheta + clampedThetaOffset;
    const cosTheta = snapToZero(Math.cos(t));
    // Ensure poles weld exactly at multiples of PI
    const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
    cosPhi = snapToZero(cosPhi);
    sinPhi = snapToZero(sinPhi);

    const dx = -signedPow(cosPhi, e2) * signedPow(sinTheta, e1);
    const dy = -signedPow(cosTheta, e1);
    const dz = signedPow(sinPhi, e2) * signedPow(sinTheta, e1);

    return {
      position: [radius * rx * dx, radius * ry * dy, radius * rz * dz],
      // Barr's complementary-exponent (2 - e) form of the implicit
      // surface's gradient, verified numerically against the tangent cross
      // product - reduces exactly to ellipsoid.js's dx/rx, dy/ry, dz/rz at
      // n1 = n2 = 2 (e1 = e2 = 1, self-complementary).
      normal: [
        (-signedPow(cosPhi, 2 - e2) * signedPow(sinTheta, 2 - e1)) / rx,
        -signedPow(cosTheta, 2 - e1) / ry,
        (signedPow(sinPhi, 2 - e2) * signedPow(sinTheta, 2 - e1)) / rz,
      ],
      collapsed: sinTheta === 0,
    };
  }

  return computeRevolutionGeometry({ nx, ny, phi, phiOffset, equation });
}
