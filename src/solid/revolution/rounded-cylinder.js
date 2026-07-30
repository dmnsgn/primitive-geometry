/** @module roundedCylinder */
import {
  TAU,
  clamp,
  snapToZero,
} from "../../utils/common.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} RoundedCylinderOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [roundRadius=radius*0.3] Fillet radius at the top/bottom
 * rim, silently clamped to [0, min(radius, height/2)] - the fillet can
 * neither exceed the body's own radius nor meet itself across the height
 * @property {number} [nx=16]
 * @property {number} [ny=1] Straight side segments
 * @property {number} [roundSegments=8] Fillet segments (each end)
 * @property {number} [capSegments=1] Flat cap segments (each end)
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * A cylinder with its top/bottom rim edges filleted instead of sharp - a
 * flat cap blended into the straight side by a quarter-circle fillet, both
 * ends symmetric. `roundRadius = 0` gives a plain flat-capped `cylinder`;
 * `roundRadius = radius = height / 2` pinches the flat cap away entirely,
 * becoming `capsule`'s hemisphere.
 * @alias module:roundedCylinder
 * @param {RoundedCylinderOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function roundedCylinder({
  height = 1,
  radius = 0.25,
  roundRadius = radius * 0.3,
  nx = 16,
  ny = 1,
  roundSegments = 8,
  capSegments = 1,
  phi = TAU,
  phiOffset = 0,
} = {}) {

  const halfHeight = height / 2;
  const clampedRoundRadius = clamp(
    roundRadius,
    0,
    Math.min(radius, halfHeight),
  );
  const hasFillet = clampedRoundRadius > 0;
  const activeRoundSegments = hasFillet ? roundSegments : 0;

  const flatRadius = radius - clampedRoundRadius;
  const hasFlatCap = flatRadius > 0;
  const activeCapSegments = hasFlatCap ? capSegments : 0;
  const sideHalfHeight = halfHeight - clampedRoundRadius;
  const hasSide = sideHalfHeight > 0;
  const activeNy = hasSide ? ny : 0;
  const halfPi = Math.PI / 2;

  const nyTotal = 2 * activeCapSegments + 2 * activeRoundSegments + activeNy;
  const v1 = activeCapSegments / nyTotal;
  const v2 = (activeCapSegments + activeRoundSegments) / nyTotal;
  const v3 = (activeCapSegments + activeRoundSegments + activeNy) / nyTotal;
  const v4 = (activeCapSegments + 2 * activeRoundSegments + activeNy) / nyTotal;

  const capLength = flatRadius;
  const filletLength = halfPi * clampedRoundRadius;
  const sideLength = 2 * sideHalfHeight;
  const totalLength = 2 * capLength + 2 * filletLength + sideLength;
  const cap1End = capLength;
  const fillet1End = cap1End + filletLength;
  const sideEnd = fillet1End + sideLength;
  const fillet2End = sideEnd + filletLength;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;

    let r, y, normalRadial, normalY, uvV;

    // v = 0 -> bottom, v = 1 -> top (matching capsule/ellipsoid's own pole
    // convention - empirically required: the mirrored, top-at-v=0 layout
    // produced a mesh wound backwards, confirmed via flippedNormalTriangles)
    if (v <= v1) {
      const localFraction = v1 === 0 ? 0 : v / v1;
      r = flatRadius * localFraction;
      y = -halfHeight;
      normalRadial = 0;
      normalY = -1;
      uvV = (localFraction * capLength) / totalLength;
    } else if (hasFillet && v <= v2) {
      const localFraction = (v - v1) / (v2 - v1);
      const a = localFraction * halfPi;
      const sinA = snapToZero(Math.sin(a));
      const cosA = snapToZero(Math.cos(a));
      r = flatRadius + clampedRoundRadius * sinA;
      y = -sideHalfHeight - clampedRoundRadius * cosA;
      normalRadial = sinA;
      normalY = -cosA;
      uvV = (cap1End + localFraction * filletLength) / totalLength;
    } else if (v <= v3) {
      const localFraction = v3 > v2 ? (v - v2) / (v3 - v2) : 0;
      r = radius;
      y = -sideHalfHeight + 2 * sideHalfHeight * localFraction;
      normalRadial = 1;
      normalY = 0;
      uvV = (fillet1End + localFraction * sideLength) / totalLength;
    } else if (hasFillet && v <= v4) {
      const localFraction = (v - v3) / (v4 - v3);
      const a = localFraction * halfPi;
      const sinA = snapToZero(Math.sin(halfPi - a));
      const cosA = snapToZero(Math.cos(halfPi - a));
      r = flatRadius + clampedRoundRadius * sinA;
      y = sideHalfHeight + clampedRoundRadius * cosA;
      normalRadial = sinA;
      normalY = cosA;
      uvV = (sideEnd + localFraction * filletLength) / totalLength;
    } else {
      const localFraction = v4 === 1 ? 0 : (v - v4) / (1 - v4);
      r = flatRadius * (1 - localFraction);
      y = halfHeight;
      normalRadial = 0;
      normalY = 1;
      uvV = (fillet2End + localFraction * capLength) / totalLength;
    }

    return {
      position: [r * cosPhi, y, r * sinPhi],
      normal: [normalRadial * cosPhi, normalY, normalRadial * sinPhi],
      collapsed: r === 0,
      v: uvV,
    };
  }

  // Every junction (flat cap -> fillet, fillet -> side) is C1-continuous
  // (the fillet's tangent is horizontal at the cap, vertical at the side, by
  // construction), so the whole meridian is one continuous sweep through
  // both poles in a single call, no concatGeometries seam needed.
  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny: nyTotal,
    phi,
    phiOffset,
    equation,
  });

  return { positions, normals, uvs, cells };
}
