/** @module capsule */
import {
  checkArguments,
  computeRevolutionGeometry,
  snapToZero,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} CapsuleOptions
 * @property {number} [height=0.5]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [roundSegments=16]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * A cylindrical body capped with two hemispheres (a "pill" shape). The
 * meridian sweep is piecewise (hemisphere/cylinder/hemisphere) but stays a
 * single computeRevolutionGeometry call: a cylinder's side normal is already
 * purely radial, matching a sphere's own normal at its equator, so both
 * joins are C1-continuous and need no seam vertices - unlike bicone/
 * doubleCone's genuinely kinked joins, which do need concatGeometries (see
 * bicone.js). roundSegments = 0 collapses both hemispheres away, leaving an
 * open tube.
 * @alias module:capsule
 * @param {CapsuleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function capsule({
  height = 0.5,
  radius = 0.25,
  nx = 16,
  ny = 1,
  roundSegments = 16,
  phi = TAU,
  phiOffset = 0,
} = {}) {
  checkArguments(arguments);

  const halfHeight = height / 2;
  const halfPi = Math.PI / 2;

  // Row budget across the whole meridian: roundSegments rings per hemisphere,
  // ny for the straight body - same proportions as the pre-refactor version.
  const nyTotal = 2 * roundSegments + ny;
  const bodyStart = roundSegments / nyTotal;
  const bodyEnd = (roundSegments + ny) / nyTotal;

  // computeRevolutionGeometry's default uv v is the row-index fraction,
  // which would stretch across whichever section (caps vs body) got more
  // rows. Rederive it from the vertex's actual y instead, proportional to
  // true position along the capsule's axis regardless of row allocation.
  const axisExtent = 2 * radius + height;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;

    let r, y, normalRadial, normalY;

    if (roundSegments > 0 && v <= bodyStart) {
      const a = (v / bodyStart) * halfPi;
      const sinA = snapToZero(Math.sin(a));
      const cosA = snapToZero(Math.cos(a));
      r = radius * sinA;
      y = -halfHeight - radius * cosA;
      normalRadial = sinA;
      normalY = -cosA;
    } else if (roundSegments > 0 && v >= bodyEnd) {
      const a = (1 - (v - bodyEnd) / (1 - bodyEnd)) * halfPi;
      const sinA = snapToZero(Math.sin(a));
      const cosA = snapToZero(Math.cos(a));
      r = radius * sinA;
      y = halfHeight + radius * cosA;
      normalRadial = sinA;
      normalY = cosA;
    } else {
      const s = (v - bodyStart) / (bodyEnd - bodyStart);
      r = radius;
      y = -halfHeight + height * s;
      normalRadial = 1;
      normalY = 0;
    }

    return {
      position: [r * cosPhi, y, r * sinPhi],
      normal: [normalRadial * cosPhi, normalY, normalRadial * sinPhi],
      collapsed: r === 0,
      v: 0.5 + y / axisExtent,
    };
  }

  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny: nyTotal,
    phi,
    phiOffset,
    equation,
  });

  return { positions, normals, uvs, cells };
}
