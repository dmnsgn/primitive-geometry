/** @module sphericon */
import { concatGeometries, snapToZero } from "../../utils/common.js";
import { computeConeSegment } from "./cone.js";

/**
 * `computeConeSegment`'s phi = PI boundary column hits Math.sin(PI) (~1e-16,
 * not exact 0): harmless on its own, but `twist` below moves that residual into
 * a different coordinate slot, where it collides with an apex point that's
 * exactly 0 there (r = 0 forces it). Snapping before twisting keeps both copies
 * bit-identical.
 *
 * @private
 */
function snapZeros(array) {
  for (let i = 0; i < array.length; i++) array[i] = snapToZero(array[i]);
}

/**
 * Rotate a geometry's positions/normals by (x, y, z) -> (-y, -x, -z): the
 * rigid, orientation-preserving map that carries `half` (apex N = (0, r, 0),
 * shared equator rim through W = (-r, 0, 0), (0, 0, r), E = (r, 0, 0)) onto the
 * other two quarter-cones (apex W, shared rim through N, (0, 0, -r), S = (0,
 * -r, 0)). This is the 90°-twisted reattachment that makes a sphericon a
 * sphericon rather than a plain bicone. Since it's a proper rotation (not a
 * reflection), normals carry over unchanged in direction - no inverse-transpose
 * needed, and winding stays correct.
 *
 * @private
 */
function twist({ positions, normals, uvs, cells }) {
  const twistedPositions = new Float32Array(positions.length);
  const twistedNormals = new Float32Array(normals.length);

  for (let i = 0; i < positions.length; i += 3) {
    twistedPositions[i] = -positions[i + 1];
    twistedPositions[i + 1] = -positions[i];
    twistedPositions[i + 2] = -positions[i + 2];

    twistedNormals[i] = -normals[i + 1];
    twistedNormals[i + 1] = -normals[i];
    twistedNormals[i + 2] = -normals[i + 2];
  }

  return { positions: twistedPositions, normals: twistedNormals, uvs, cells };
}

/**
 * @typedef {object} SphericonOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=16] Segments per quarter-cone's half-turn sweep
 * @property {number} [ny=1] Meridian segments per quarter-cone (its meridian is
 *   a straight cone slant, so ny > 1 buys nothing by default, same as
 *   cone/bicone/doubleCone)
 */

/**
 * A right-circular bicone with a 90° apex angle, split along the plane through
 * both apexes and reattached with one half rotated 90° - the classic
 * 4-quarter-cone rolling solid. No flat faces: a single continuous developable
 * surface that rolls by wobbling in a straight line.
 *
 * @param {SphericonOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @alias module:sphericon
 * @see [Wolfram MathWorld – Sphericon]{@link https://mathworld.wolfram.com/Sphericon.html}
 */
export function sphericon({ radius = 0.5, nx = 16, ny = 1 } = {}) {
  const segment = (yFrom, yTo, rFrom, rTo) =>
    computeConeSegment({
      yFrom,
      yTo,
      rFrom,
      rTo,
      nx,
      ny,
      phi: Math.PI,
      phiOffset: 0,
    });

  const half = concatGeometries([
    segment(-radius, 0, 0, radius),
    segment(0, radius, radius, 0),
  ]);
  snapZeros(half.positions);
  snapZeros(half.normals);

  return concatGeometries([half, twist(half)]);
}
