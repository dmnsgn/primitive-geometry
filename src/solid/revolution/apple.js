/**
 * @module primitiveGeometry
 * @ignore
 */
import { TAU, clamp } from "../../utils/common.js";
import { computeSpindleArcRevolution } from "../../utils/revolution.js";

/**
 * @typedef {object} AppleOptions
 * @property {number} [radius=0.5] Equatorial radius.
 * @property {number} [height=radius] Height between the dimples, clamped to (0,
 *   radius * 2].
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * An apple surface: the outer lobe of a spindle torus, dimpled at the poles.
 *
 * @param {AppleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Apple Surface]{@link https://mathworld.wolfram.com/AppleSurface.html}
 */
export function apple({
  radius = 0.5,
  height = radius,
  nx = 32,
  ny = 16,
  phi = TAU,
  phiOffset = 0,
  mergeSeam = false,
} = {}) {
  const halfHeight = clamp(height, 0, radius * 2) / 2;

  // Generating circle radius a and axis offset d, from radius = a + d and
  // halfHeight² = a² - d²
  const aMinusD = (halfHeight * halfHeight) / radius;
  const a = (radius + aMinusD) / 2;
  const d = radius - a;

  // Passed as is: r derived at the pole misses 0 by a few ULPs, leaving it
  // uncollapsed with a degenerate fan
  const thetaCross = Math.acos(-d / a);

  const { positions, normals, uvs, cells } = computeSpindleArcRevolution({
    a,
    halfHeight,
    thetaCross,
    poleCosTheta: -d / a,
    radiusAt: (cosTheta) => d + a * cosTheta,
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
  });

  return { positions, normals, uvs, cells };
}
