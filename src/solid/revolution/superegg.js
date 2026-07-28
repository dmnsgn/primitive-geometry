/** @module superegg */
import {
  checkArguments,
  clampMeridianSweep,
  computeRevolutionGeometry,
  signedPow,
  snapToZero,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} SupereggOptions
 * @property {number} [radius=0.5] Equatorial radius
 * @property {number} [ry=radius*5/6] Vertical (polar) semi-axis
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [n=2.5] Roundness exponent - Piet Hein's original;
 * n > 2 gives a "true" superegg, n = 2 is a spheroid, n < 2 rounds toward a
 * cylinder-capped-with-cones shape
 * @property {number} [theta=Math.PI] Meridian sweep length, silently clamped
 * to [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions
 * for why (computeRevolutionGeometry only supports a pole at v = 0/1).
 * @property {number} [thetaOffset=0] Meridian sweep start, silently clamped
 * to [0, PI] - see theta.
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * Piet Hein's superegg: a superellipsoid special case (n2 = 2, rx = rz) with
 * a circular cross-section at every height, ie. an actual surface of
 * revolution - unlike the general superellipsoid, whose cross-sections are
 * themselves superelliptical.
 * @see [Wolfram MathWorld – Superegg]{@link https://mathworld.wolfram.com/Superegg.html}
 * @see [Wikipedia – Superegg]{@link https://en.wikipedia.org/wiki/Superegg}
 * @alias module:superegg
 * @param {SupereggOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function superegg({
  radius = 0.5,
  ry = (radius * 5) / 6,
  nx = 32,
  ny = 16,
  n = 2.5,
  theta = Math.PI,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,
} = {}) {
  checkArguments(arguments);

  const e = 2 / n;

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

    const s = signedPow(sinTheta, e);

    return {
      position: [
        radius * -cosPhi * s,
        ry * -signedPow(cosTheta, e),
        radius * sinPhi * s,
      ],
      // Same complementary-exponent gradient as superellipsoid, with the
      // cross-section term left plain (e2 = 1, self-complementary) since
      // the whole point of the superegg is a circular cross-section
      normal: [
        (-cosPhi * signedPow(sinTheta, 2 - e)) / radius,
        -signedPow(cosTheta, 2 - e) / ry,
        (sinPhi * signedPow(sinTheta, 2 - e)) / radius,
      ],
      collapsed: sinTheta === 0,
    };
  }

  return computeRevolutionGeometry({ nx, ny, phi, phiOffset, equation });
}
