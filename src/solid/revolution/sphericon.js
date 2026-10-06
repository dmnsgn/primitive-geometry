/**
 * @module primitiveGeometry
 * @ignore
 */
import { concatGeometries, snapToZero } from "../../utils/common.js";
import { computeConeSegment } from "./cone.js";

/**
 * Math.sin(PI) isn't exactly 0, and `twist` moves that residual where an apex
 * is: snapping keeps both copies bit-identical.
 *
 * @private
 */
function snapZeros(array) {
  for (let i = 0; i < array.length; i++) array[i] = snapToZero(array[i]);
}

/**
 * Rotate by (x, y, z) -> (-y, -x, -z), the sphericon's 90° twist. A proper
 * rotation, so normals and winding carry over.
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
 * @property {import("../../../types.js").PositiveInteger} [nx=16] Segments per
 *   quarter-cone half-turn.
 * @property {import("../../../types.js").PositiveInteger} [ny=1] Meridian
 *   segments per quarter-cone.
 */

/**
 * A sphericon: a bicone split through its apexes, one half turned 90°.
 *
 * @param {SphericonOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
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
