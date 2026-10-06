/**
 * @module primitiveGeometry
 * @ignore
 */
import { ellipsoid } from "./ellipsoid.js";

/**
 * @typedef {object} SphereOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {import("../../../types.js").PolarAngle} [theta=Math.PI]
 * @property {import("../../../types.js").PolarAngle} [thetaOffset=0]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
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
  mergeSeam,
} = {}) {
  return ellipsoid({
    radius,
    nx,
    ny,
    theta,
    thetaOffset,
    phi,
    mergeSeam,
    phiOffset,
    sx: 1,
    sy: 1,
  });
}
