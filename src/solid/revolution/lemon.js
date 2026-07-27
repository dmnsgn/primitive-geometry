/** @module lemon */
import {
  checkArguments,
  computeRevolutionGeometry,
  snapToZero,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} LemonOptions
 * @property {number} [radius=0.3] Equatorial (widest) radius
 * @property {number} [height=1] Full height between the two pointed ends,
 * silently raised to at least radius*2 - below that the generating circle's
 * center offset would go negative, no longer tracing the lemon's own
 * (minor, less-than-half-circle) arc; height = radius*2 exactly degenerates
 * to a plain sphere (the offset hits 0)
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * Lemon (geometry): "a circular arc of angle less than half of a full
 * circle" rotated about the chord through its own endpoints - `apple`'s
 * exact complementary half (apple keeps the arc's major, more-than-half-
 * circle, portion; lemon keeps the minor, less-than-half-circle, portion of
 * the very same spindle-torus-generating circle). Unlike apple, the kept
 * arc doesn't sweep past either pole's own latitude on its way to the
 * equator, so the meridian is plain y-monotonic - no dimple, no double-
 * back, just a smooth convex taper to a point (still a cusp, not a tangent
 * point, at each pole - same per-column-normal reasoning as apple's/cone's
 * own apex).
 * @see [Wikipedia – Lemon (geometry)]{@link https://en.wikipedia.org/wiki/Lemon_(geometry)}
 * @alias module:lemon
 * @param {LemonOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function lemon({
  radius = 0.3,
  height = 1,
  nx = 32,
  ny = 16,
  phi = TAU,
  phiOffset = 0,
} = {}) {
  checkArguments(arguments);

  const halfHeight = Math.max(height, radius * 2) / 2;

  // Same a (generating circle radius) / d (its axis offset) solve as
  // apple.js, mirrored: radius here is the *near* point (a - d), not
  // apple's *far* point (a + d), so a + d is what falls out of halfHeight².
  const aPlusD = (halfHeight * halfHeight) / radius;
  const a = (radius + aPlusD) / 2;
  const d = aPlusD - a;

  const thetaLemon = Math.acos(d / a);

  function equation({ v, cosPhi: rawCosPhi, sinPhi: rawSinPhi }) {
    const cosPhi = snapToZero(rawCosPhi);
    const sinPhi = snapToZero(rawSinPhi);

    let cosTheta, sinTheta, r, y;
    if (v === 0 || v === 1) {
      // Same bit-exactness concern as apple.js's own poles: a * (d / a)
      // doesn't reliably round-trip to exactly d, so r/y are set directly
      // here rather than derived from cosTheta/sinTheta (still used below,
      // for the normal).
      cosTheta = d / a;
      sinTheta = v === 0 ? -halfHeight / a : halfHeight / a;
      r = 0;
      y = v === 0 ? -halfHeight : halfHeight;
    } else {
      const theta = -thetaLemon + v * 2 * thetaLemon;
      cosTheta = snapToZero(Math.cos(theta));
      sinTheta = snapToZero(Math.sin(theta));
      r = a * cosTheta - d;
      y = a * sinTheta;
    }

    return {
      position: [-cosPhi * r, y, sinPhi * r],
      // Direction from the generating circle's own (off-axis) center, same
      // trick as apple.js's normal (and for the same reason: position and
      // normal direction aren't simply proportional here, unlike a sphere).
      normal: [-cosPhi * cosTheta, sinTheta, sinPhi * cosTheta],
      collapsed: r === 0,
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
