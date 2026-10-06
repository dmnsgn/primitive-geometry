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
 * @typedef {object} SuperellipsoidOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [sz=sy]
 * @property {number} [n1=3] Meridian roundness exponent.
 * @property {number} [n2=n1] Cross-section roundness exponent.
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
 * A superellipsoid: n > 2 rounds toward a box, n < 2 pinches.
 *
 * Special cases: ellipsoid (n1 = n2 = 2), octahedron (n1 = n2 = 1), astroidal
 * ellipsoid (n1 = n2 = 2/3), superegg-like (n2 = 2, sx = sz).
 *
 * @param {SuperellipsoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Superellipsoid]{@link https://mathworld.wolfram.com/Superellipsoid.html}
 * @see [Wikipedia – Superellipsoid]{@link https://en.wikipedia.org/wiki/Superellipsoid}
 */
export function superellipsoid({
  radius = 0.5,
  nx = 32,
  ny = 16,
  sx = 1,
  sy = 0.5,
  sz = sy,
  n1 = 3,
  n2 = n1,
  theta = Math.PI,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,
  vDistribution = linear,
  mergeSeam = false,
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
      position: [radius * sx * dx, radius * sy * dy, radius * sz * dz],
      // Barr's complementary-exponent gradient: ellipsoid's at n1 = n2 = 2
      normal: [
        (-signedPow(cosPhi, 2 - e2) * signedPow(sinTheta, 2 - e1)) / sx,
        -signedPow(cosTheta, 2 - e1) / sy,
        (signedPow(sinPhi, 2 - e2) * signedPow(sinTheta, 2 - e1)) / sz,
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
