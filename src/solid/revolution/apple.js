/**
 * @module primitiveGeometry
 * @ignore
 */
import { TAU, clamp } from "../../utils/common.js";
import { linear } from "../../utils/distribution.js";
import { computeSpindleArcRevolution } from "../../utils/revolution.js";

/**
 * @typedef {object} AppleOptions
 * @property {number} [radius=0.5] Equatorial (belly) radius
 * @property {number} [height=radius] Full height between the two dimple points,
 *   silently clamped to (0, radius*2] - the generating circle's own radius must
 *   exceed its offset from the axis (see below), which fails past that bound
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * MathWorld's Apple Surface: "more than half of a circular arc rotated about an
 * axis passing through the [arc's] endpoints" - the outer lobe of a spindle
 * torus. Poles are true cusps (dimples), not smooth tangent points like a
 * sphere's - each pole's normal varies per column, same as `cone`'s apex.
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
  vDistribution = linear,
  mergeSeam = false,
} = {}) {
  const halfHeight = clamp(height, 0, radius * 2) / 2;

  // Solve the generating circle's radius (a) and axis offset (d) - with
  // a > d (the spindle condition), so the circle touches the axis at its own
  // two endpoints - from radius = a + d (equatorial extent) and
  // halfHeight² = a² - d² (pole extent, ie. how far the arc's two
  // axis-crossings sit from the equator): (a - d)(a + d) = halfHeight² and
  // a + d = radius give a - d directly.
  const aMinusD = (halfHeight * halfHeight) / radius;
  const a = (radius + aMinusD) / 2;
  const d = radius - a;

  // r = d + a·cosTheta with cosTheta = -d/a is only *mathematically* exactly
  // 0 - a/(-d/a) doesn't reliably round-trip to -d in floating point, which
  // left the pole undetected as collapsed (computed r a few ULPs off 0) and
  // a degenerate fan triangle behind - poleCosTheta is passed to
  // computeSpindleArcRevolution directly rather than derived from radiusAt.
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
    vDistribution,
  });

  return { positions, normals, uvs, cells };
}
