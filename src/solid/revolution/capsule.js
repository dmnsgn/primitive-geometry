/**
 * @module primitiveGeometry
 * @ignore
 */
import { TAU, snapToZero } from "../../utils/common.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} CapsuleOptions
 * @property {number} [height=0.5]
 * @property {number} [radius=0.25]
 * @property {import("../../../types.js").PositiveInteger} [nx=16]
 * @property {import("../../../types.js").PositiveInteger} [ny=1]
 * @property {import("../../../types.js").NonNegativeInteger} [roundSegments=16]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A capsule: a cylinder capped with 2 hemispheres.
 *
 * Special cases: open tube (roundSegments = 0).
 *
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
  mergeSeam = false,
} = {}) {
  const halfHeight = height / 2;
  const halfPi = Math.PI / 2;

  // One sweep: both joins are C1-continuous so need no seam, unlike bicone's
  const nyTotal = 2 * roundSegments + ny;
  const bodyStart = roundSegments / nyTotal;
  const bodyEnd = (roundSegments + ny) / nyTotal;

  // uv v from meridian arc length: row fractions stretch unevenly across
  // sections, and axial y squashes the texture into the poles
  const quarterArc = radius * halfPi;
  const meridianLength = 2 * quarterArc + height;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;

    let r, y, normalRadial, normalY, arcLength;

    if (roundSegments > 0 && v <= bodyStart) {
      const a = (v / bodyStart) * halfPi;
      const sinA = snapToZero(Math.sin(a));
      const cosA = snapToZero(Math.cos(a));
      r = radius * sinA;
      y = -halfHeight - radius * cosA;
      normalRadial = sinA;
      normalY = -cosA;
      arcLength = radius * a;
    } else if (roundSegments > 0 && v >= bodyEnd) {
      const a = (1 - (v - bodyEnd) / (1 - bodyEnd)) * halfPi;
      const sinA = snapToZero(Math.sin(a));
      const cosA = snapToZero(Math.cos(a));
      r = radius * sinA;
      y = halfHeight + radius * cosA;
      normalRadial = sinA;
      normalY = cosA;
      arcLength = meridianLength - radius * a;
    } else {
      const s = (v - bodyStart) / (bodyEnd - bodyStart);
      r = radius;
      y = -halfHeight + height * s;
      normalRadial = 1;
      normalY = 0;
      arcLength = quarterArc + height * s;
    }

    return {
      position: [r * cosPhi, y, r * sinPhi],
      normal: [normalRadial * cosPhi, normalY, normalRadial * sinPhi],
      collapsed: r === 0,
      v: arcLength / meridianLength,
    };
  }

  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny: nyTotal,
    phi,
    mergeSeam,
    phiOffset,
    equation,
  });

  return { positions, normals, uvs, cells };
}
