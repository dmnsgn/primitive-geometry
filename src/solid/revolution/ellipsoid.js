/**
 * @module primitiveGeometry
 * @ignore
 */
import { TAU, clampMeridianSweep, snapToZero } from "../../utils/common.js";
import { linear } from "../../utils/distribution.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} EllipsoidOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [sz=sy]
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
 * Unit-sphere direction at meridian angle t, shared so surfaces welding to an
 * ellipsoid (eg. `hollowSphere`'s cut caps) get bit-identical positions.
 *
 * @private
 * @param {number} t Meridian angle, 0 at the north pole
 * @param {number} cosPhi
 * @param {number} sinPhi
 * @returns {[number, number, number]}
 */
export function sphereDirection(t, cosPhi, sinPhi) {
  const cosTheta = snapToZero(Math.cos(t));
  // Ensure poles weld exactly at multiples of PI
  const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
  cosPhi = snapToZero(cosPhi);
  sinPhi = snapToZero(sinPhi);

  return [-cosPhi * sinTheta, -cosTheta, sinPhi * sinTheta];
}

/**
 * An ellipsoid, oblate by default.
 *
 * Special cases: sphere (sx = sy = sz), prolate spheroid (sy > sx = sz).
 *
 * @param {EllipsoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function ellipsoid({
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
  vDistribution = linear,
  mergeSeam = false,
} = {}) {
  const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(
    theta,
    thetaOffset,
  );

  function equation({ v, cosPhi, sinPhi }) {
    const t = v * clampedTheta + clampedThetaOffset;
    const [dx, dy, dz] = sphereDirection(t, cosPhi, sinPhi);

    return {
      position: [radius * sx * dx, radius * sy * dy, radius * sz * dz],
      // Gradient of x²/sx² + y²/sy² + z²/sz² = 1
      normal: [dx / sx, dy / sy, dz / sz],
      // Ensure poles weld exactly at multiples of PI
      collapsed: t % Math.PI === 0,
    };
  }

  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
    vDistribution,
    equation,
  });

  return { positions, normals, uvs, cells };
}
