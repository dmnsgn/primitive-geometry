/** @module sphericalRing */
import {
  TAU,
  clamp,
  concatGeometries,
  snapToZero,
} from "../../utils/common.js";
import { linear } from "../../utils/distribution.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} SphericalRingOptions
 * @property {number} [radius=0.5] Sphere radius
 * @property {number} [innerRadius=radius*0.5] Cylindrical bore radius,
 * silently clamped to [0, radius] - a bore wider than the sphere has no
 * sensible rim to meet
 * @property {number} [nx=32]
 * @property {number} [ny=16] Outer spherical band meridian segments
 * @property {number} [holeSegments=1] Inner bore wall segments
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {Function} [vDistribution=utils.linear] Applies to the outer
 * spherical band only - the inner bore wall is a plain cylinder.
 */

/**
 * A sphere with a cylindrical hole drilled through its center - MathWorld's
 * Spherical Ring, aka a napkin ring. Unlike what "ring" might suggest,
 * there's no flat annulus at either end: at the rim (height
 * `sqrt(radius² - innerRadius²)`), the sphere's and bore's surfaces meet
 * directly, so the meridian cross-section is a single closed loop -
 * topologically a torus with a lens-shaped minor curve instead of a
 * circular one.
 * @see [Wolfram MathWorld – Spherical Ring]{@link https://mathworld.wolfram.com/SphericalRing.html}
 * @alias module:sphericalRing
 * @param {SphericalRingOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function sphericalRing({
  radius = 0.5,
  innerRadius = radius * 0.5,
  nx = 32,
  ny = 16,
  holeSegments = 1,
  phi = TAU,
  phiOffset = 0,
  vDistribution = linear,
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

  // computeRevolutionGeometry only wraps its phi columns, not its v rows, so
  // the sphere+bore's single closed meridian loop can't be swept in one
  // call - built instead as two open pieces (outer band, inner wall)
  // concatenated at their shared rims, the same pattern bicone/doubleCone
  // use for a meridian that genuinely kinks.
  const outer = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
    vDistribution,
    equation: outerEquation,
  });

  const bottomRim = outerEquation({ v: 0, cosPhi: 1, sinPhi: 0 }).position;
  const topRim = outerEquation({ v: 1, cosPhi: 1, sinPhi: 0 }).position;
  const yBottom = bottomRim[1];
  const yTop = topRim[1];

  function innerEquation({ v, cosPhi, sinPhi }) {
    // Reuse the outer band's own v = 0 rim x/z formula directly instead of
    // rederiving it, guaranteeing a bit-identical weld (the bore has a
    // constant radius, so the same x/z holds at both ends - only y sweeps)
    const { position: rim } = outerEquation({ v: 0, cosPhi, sinPhi });

    return {
      // v = 0 -> yTop, v = 1 -> yBottom: reversed vs. the outer band's own
      // bottom -> top sweep, which flips this piece's winding to face into
      // the bore instead of out of it, matching the inward normal below
      // (confirmed empirically via flippedNormalTriangles, not derived by
      // hand - computeRevolutionGeometry's fixed row/column triangulation
      // makes the resulting winding non-obvious to predict analytically)
      position: [rim[0], yTop + (yBottom - yTop) * v, rim[2]],
      normal: [-rim[0], 0, -rim[2]],
      collapsed: false,
    };
  }

  const inner = computeRevolutionGeometry({
    nx,
    ny: holeSegments,
    phi,
    phiOffset,
    equation: innerEquation,
  });

  return concatGeometries([outer, inner]);
}
