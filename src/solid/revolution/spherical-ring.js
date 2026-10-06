/**
 * @module primitiveGeometry
 * @ignore
 */
import {
  TAU,
  clamp,
  concatGeometries,
  invert,
  snapToZero,
} from "../../utils/common.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} SphericalRingOptions
 * @property {number} [radius=0.5] Sphere radius.
 * @property {number} [innerRadius=radius*0.5] Bore radius, clamped to [0,
 *   radius].
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16] Outer band
 *   meridian segments.
 * @property {import("../../../types.js").PositiveInteger} [holeSegments=1]
 *   Bore wall segments.
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A spherical ring (napkin ring): a sphere with a cylindrical bore.
 *
 * @param {SphericalRingOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Spherical Ring]{@link https://mathworld.wolfram.com/SphericalRing.html}
 */
export function sphericalRing({
  radius = 0.5,
  innerRadius = radius * 0.5,
  nx = 32,
  ny = 16,
  holeSegments = 1,
  phi = TAU,
  phiOffset = 0,
  mergeSeam = false,
} = {}) {
  const clampedInnerRadius = clamp(innerRadius, 0, radius);

  // Polar angle from the pole to the rim where the bore meets the sphere
  const thetaRim = Math.asin(clampedInnerRadius / radius);
  const theta = Math.PI - 2 * thetaRim;

  function outerEquation({ v, cosPhi, sinPhi }) {
    const t = v * theta + thetaRim;
    const cosTheta = snapToZero(Math.cos(t));
    const sinTheta = snapToZero(Math.sin(t));
    cosPhi = snapToZero(cosPhi);
    sinPhi = snapToZero(sinPhi);

    const dx = -cosPhi * sinTheta;
    const dy = -cosTheta;
    const dz = sinPhi * sinTheta;

    return {
      position: [radius * dx, radius * dy, radius * dz],
      normal: [dx, dy, dz],
      collapsed: false,
    };
  }

  // Rows don't wrap, so the closed meridian loop is split into band and bore
  const outer = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
    equation: outerEquation,
  });

  const bottomRim = outerEquation({ v: 0, cosPhi: 1, sinPhi: 0 }).position;
  const topRim = outerEquation({ v: 1, cosPhi: 1, sinPhi: 0 }).position;
  const yBottom = bottomRim[1];
  const yTop = topRim[1];

  function innerEquation({ v, cosPhi, sinPhi }) {
    // The outer rim's own x/z, so the weld is bit-identical
    const { position: rim } = outerEquation({ v: 0, cosPhi, sinPhi });

    return {
      // Outward like the band: invert() turns it into the bore
      position: [rim[0], yBottom + (yTop - yBottom) * v, rim[2]],
      normal: [rim[0], 0, rim[2]],
      collapsed: false,
    };
  }

  const inner = invert(
    computeRevolutionGeometry({
      nx,
      ny: holeSegments,
      phi,
      mergeSeam,
      phiOffset,
      equation: innerEquation,
    }),
  );

  return concatGeometries([outer, inner]);
}
