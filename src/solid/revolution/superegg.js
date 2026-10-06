/**
 * @module primitiveGeometry
 * @ignore
 */
import {
  TAU,
  clampMeridianSweep,
  signedPow,
  snapToZero,
} from "../../utils/common.js";
import { linear } from "../../utils/distribution.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} SupereggOptions
 * @property {number} [radius=0.5] Equatorial radius
 * @property {number} [sy=5/6] Vertical (polar) scale
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {number} [n=2.5] Roundness exponent.
 * @property {import("../../../types.js").PolarAngle} [theta=Math.PI] Meridian
 *   sweep length, clamped so poles stay at its ends.
 * @property {import("../../../types.js").PolarAngle} [thetaOffset=0] Meridian
 *   sweep start from the north pole, clamped to [0, π].
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Piet Hein's superegg: a superellipsoid of revolution.
 *
 * Special cases: spheroid (n = 2).
 *
 * @param {SupereggOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Superegg]{@link https://mathworld.wolfram.com/Superegg.html}
 * @see [Wikipedia – Superegg]{@link https://en.wikipedia.org/wiki/Superegg}
 */
export function superegg({
  radius = 0.5,
  sy = 5 / 6,
  nx = 32,
  ny = 16,
  n = 2.5,
  theta = Math.PI,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,
  vDistribution = linear,
  mergeSeam = false,
} = {}) {
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
        radius * sy * -signedPow(cosTheta, e),
        radius * sinPhi * s,
      ],
      // superellipsoid's gradient with a circular cross-section (e2 = 1)
      normal: [
        (-cosPhi * signedPow(sinTheta, 2 - e)) / radius,
        -signedPow(cosTheta, 2 - e) / (radius * sy),
        (sinPhi * signedPow(sinTheta, 2 - e)) / radius,
      ],
      collapsed: sinTheta === 0,
    };
  }

  return computeRevolutionGeometry({
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
    vDistribution,
    equation,
  });
}
