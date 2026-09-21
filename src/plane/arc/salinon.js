/** @module salinon */
import { computeSweptArc } from "../../utils/polar.js";
import { rectangular } from "../../mappings.js";

/**
 * @typedef {object} SalinonOptions
 * @property {number} [radius=0.5] Outer (enclosing) radius: half the total
 *   width, and the radius of the semicircle forming the bottom boundary.
 * @property {number} [innerRadius=radius*0.25] Radius of the central
 *   semicircle, bulging _opposite_ the enclosing one (up, above the baseline)
 *   over the middle third. The two flanking "ear" semicircles bulge the _same_
 *   way as the enclosing one (down, a shallower dip below the baseline) over
 *   the outer two thirds, sized to meet it at the baseline: `(radius -
 *   innerRadius) / 2` each.
 * @property {number} [segments=32] Column count, swept left to right.
 * @property {number} [innerSegments=16] Row count between the bottom and top
 *   boundary at each column.
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular] Uv mapping function.
 *   Defaults to a flat, bounding-box-relative unwrap; pass a function using
 *   `uRatio`/`vRatio` (the swept parametrization) to follow the arcs instead.
 */

/**
 * Archimedes' salinon: a "salt cellar" bounded by four semicircles - one
 * full-width on the bottom, a smaller one opposite it on top, and two "ear"
 * semicircles filling the remaining top thirds. Area: `pi/4 * (radius +
 * innerRadius) ** 2` (Archimedes' theorem).
 *
 * @param {SalinonOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @alias module:salinon
 * @see [Wolfram MathWorld – Salinon]{@link https://mathworld.wolfram.com/Salinon.html}
 */
export function salinon({
  radius = 0.5,
  innerRadius = radius * 0.25,
  segments = 32,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {
  const R = radius;
  const r = innerRadius;
  const earRadius = (R - r) / 2;
  const earCenter = (R + r) / 2;

  return computeSweptArc({
    segments,
    innerSegments,
    uMin: -R,
    uMax: R,
    mapping,
    center: [0, (r - R) / 2],
    sx: R,
    sy: (R + r) / 2,
    bounds: (x) => {
      const bottom = -Math.sqrt(Math.max(R * R - x * x, 0));
      const top =
        Math.abs(x) <= r
          ? Math.sqrt(Math.max(r * r - x * x, 0))
          : -Math.sqrt(
              Math.max(
                earRadius * earRadius - (x - Math.sign(x) * earCenter) ** 2,
                0,
              ),
            );
      return [bottom, top];
    },
    point: (x, y) => [x, y],
  });
}
