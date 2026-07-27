/** @module ellipsoid */
import {
  checkArguments,
  clamp,
  computeRevolutionGeometry,
  snapToZero,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} EllipsoidOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [rx=1]
 * @property {number} [ry=0.5]
 * @property {number} [rz=ry]
 * @property {number} [theta=Math.PI] Meridian sweep length. computeRevolutionGeometry
 * only supports a pole at v = 0/1, so theta is silently clamped to
 * [-thetaOffset, PI - thetaOffset] - the sweep can never cross the axis
 * anywhere but its own start/end.
 * @property {number} [thetaOffset=0] Meridian sweep start (0 = north pole),
 * silently clamped to [0, PI] - see theta.
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * Default to an oblate spheroid.
 * @alias module:ellipsoid
 * @param {EllipsoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function ellipsoid({
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
  checkArguments(arguments);

  const clampedThetaOffset = clamp(thetaOffset, 0, Math.PI);
  const clampedTheta = clamp(
    theta,
    -clampedThetaOffset,
    Math.PI - clampedThetaOffset,
  );

  function equation({ v, cosPhi, sinPhi }) {
    const t = v * clampedTheta + clampedThetaOffset;
    const cosTheta = snapToZero(Math.cos(t));
    // Ensure poles weld exactly at multiples of PI
    const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
    cosPhi = snapToZero(cosPhi);
    sinPhi = snapToZero(sinPhi);

    const dx = -cosPhi * sinTheta;
    const dy = -cosTheta;
    const dz = sinPhi * sinTheta;

    return {
      position: [radius * rx * dx, radius * ry * dy, radius * rz * dz],
      // Ellipsoid normal is the gradient of x²/rx² + y²/ry² + z²/rz² = 1,
      // i.e. inverse-square scaled, not the same scaling used for position.
      normal: [dx / rx, dy / ry, dz / rz],
      collapsed: sinTheta === 0,
    };
  }

  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
    equation,
  });

  return { positions, normals, uvs, cells };
}
