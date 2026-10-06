/**
 * @module primitiveGeometry
 * @ignore
 */
import { computeSweptArc } from "../../utils/polar.js";
import { rectangular } from "../../mappings.js";

/**
 * @typedef {object} SalinonOptions
 * @property {number} [radius=0.5] Bottom semicircle radius.
 * @property {number} [innerRadius=radius*0.25] Top central semicircle radius.
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 *   Columns, left to right.
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 *   Rows between the bottom and top boundaries.
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 *   Use `uRatio`/`vRatio` to follow the arcs.
 */

/**
 * Archimedes' salinon: a shape bounded by 4 semicircles.
 *
 * @param {SalinonOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
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
