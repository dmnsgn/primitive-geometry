/** @module sphericalRing */
import {
  checkArguments,
  clamp,
  computeRevolutionGeometry,
  concatGeometries,
  snapToZero,
  TAU,
} from "../../utils.js";

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
 */

/**
 * A sphere with a cylindrical hole drilled through its center - MathWorld's
 * Spherical Ring, aka a napkin ring.
 * @see [Wolfram MathWorld – Spherical Ring]{@link https://mathworld.wolfram.com/SphericalRing.html}
 *
 * Unlike what "ring" might suggest, there's no flat annulus at either end:
 * at the rim height h/2 = sqrt(radius² - innerRadius²), the sphere's own
 * cross-section radius already equals innerRadius, so the outer (spherical)
 * and inner (cylindrical) surfaces meet directly there - the meridian
 * cross-section is a single closed loop (up the bore, back down the
 * sphere's own arc), topologically a torus with a lens-shaped minor curve
 * instead of a circular one.
 *
 * computeRevolutionGeometry only wraps its phi columns, not its v rows, so
 * that closed loop can't be swept in a single call - built instead as two
 * open pieces (outer band, inner wall) concatenated at their shared rims,
 * the same pattern bicone/doubleCone use for a meridian that genuinely
 * kinks (here, the sphere's tangent at the rim generally isn't parallel to
 * the bore wall). The inner wall's rim x/z is read straight off the outer
 * band's own equation at v = 0/1 rather than recomputed independently, so
 * the two pieces weld bit-identically there - the same trick computeCap
 * uses to derive a flat cap's own rim from the body it's capping.
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
} = {}) {
  checkArguments(arguments);

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

  const outer = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
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
