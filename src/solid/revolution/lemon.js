/**
 * @module primitiveGeometry
 * @ignore
 */
import { TAU } from "../../utils/common.js";
import { computeSpindleArcRevolution } from "../../utils/revolution.js";

/**
 * @typedef {object} LemonOptions
 * @property {number} [radius=0.3] Equatorial (widest) radius
 * @property {number} [height=1] Full height between the two pointed ends,
 *   silently raised to at least radius_2 - below that the generating circle's
 *   center offset would go negative, no longer tracing the lemon's own (minor,
 *   less-than-half-circle) arc; height = radius_2 exactly degenerates to a
 *   plain sphere (the offset hits 0)
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Lemon (geometry): "a circular arc of angle less than half of a full circle"
 * rotated about the chord through its own endpoints - `apple`'s exact
 * complementary half. Unlike apple, the meridian is plain y-monotonic: no
 * dimple, just a smooth convex taper to a point (still a cusp, not a tangent
 * point, at each pole).
 *
 * @param {LemonOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wikipedia – Lemon (geometry)]{@link https://en.wikipedia.org/wiki/Lemon_(geometry)}
 */
export function lemon({
  radius = 0.3,
  height = 1,
  nx = 32,
  ny = 16,
  phi = TAU,
  phiOffset = 0,
  mergeSeam = false,
} = {}) {
  const halfHeight = Math.max(height, radius * 2) / 2;

  // Same a (generating circle radius) / d (its axis offset) solve as
  // apple.js, mirrored: radius here is the *near* point (a - d), not
  // apple's *far* point (a + d), so a + d is what falls out of halfHeight².
  const aPlusD = (halfHeight * halfHeight) / radius;
  const a = (radius + aPlusD) / 2;
  const d = aPlusD - a;

  // Same bit-exactness concern as apple.js's own poles: a * (d / a) doesn't
  // reliably round-trip to exactly d, so poleCosTheta is passed to
  // computeSpindleArcRevolution directly rather than derived from radiusAt.
  const thetaLemon = Math.acos(d / a);

  const { positions, normals, uvs, cells } = computeSpindleArcRevolution({
    a,
    halfHeight,
    thetaCross: thetaLemon,
    poleCosTheta: d / a,
    radiusAt: (cosTheta) => a * cosTheta - d,
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
  });

  return { positions, normals, uvs, cells };
}
