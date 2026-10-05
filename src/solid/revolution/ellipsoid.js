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
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [sz=sy]
 * @property {number} [theta=Math.PI] Meridian sweep length, silently clamped to
 *   [-thetaOffset, PI - thetaOffset]: a pole can only sit at the sweep's own
 *   start or end, never partway through.
 * @property {number} [thetaOffset=0] Meridian sweep start (0 = north pole),
 *   silently clamped to [0, PI] - see theta.
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Unit-sphere direction cosines for a given meridian angle t (0 = north pole)
 * and (already computed) equatorial cosPhi/sinPhi: the [dx, dy, dz] this
 * module's own `equation` scales by radius/sx/sy/sz for position, and by
 * 1/sx/1/sy/1/sz for its gradient-based normal. Exported so other spherical
 * shapes (eg. `hollowSphere`'s theta/phi cut caps) can place a point on - or a
 * direction from - the exact same sphere without re-deriving the formula. This
 * guarantees bit-identical positions where they must weld to an
 * `ellipsoid`/`sphere` surface.
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
 * Default to an oblate spheroid.
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
      // Ellipsoid normal is the gradient of x²/sx² + y²/sy² + z²/sz² = 1,
      // i.e. inverse-square scaled, not the same scaling used for position.
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
