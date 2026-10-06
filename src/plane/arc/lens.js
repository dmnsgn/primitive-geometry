/**
 * @module primitiveGeometry
 * @ignore
 */
import { computeSweptArc } from "../../utils/polar.js";
import { rectangular } from "../../mappings.js";

/**
 * @typedef {object} LensOptions
 * @property {number} [radius=0.5] First circle radius.
 * @property {number} [radius2=radius] Second circle radius.
 * @property {number} [distance=radius] Distance between centers.
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 *   Columns, left to right.
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 *   Rows between the bottom and top boundaries.
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 *   Use `uRatio`/`vRatio` to follow the arcs.
 */

/**
 * A lens: the overlap of 2 circles. Defaults to a vesica piscis.
 *
 * @param {LensOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Lens]{@link https://mathworld.wolfram.com/Lens.html}
 * @see [Wolfram MathWorld – Vesica Piscis]{@link https://mathworld.wolfram.com/VesicaPiscis.html}
 */
export function lens({
  radius = 0.5,
  radius2 = radius,
  distance = radius,
  segments = 32,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {
  const r1 = radius;
  const r2 = radius2;
  const c1 = -distance / 2;
  const c2 = distance / 2;

  const uMin = Math.max(c1 - r1, c2 - r2);
  const uMax = Math.min(c1 + r1, c2 + r2);

  // The overlap is convex: the tighter arc bounds each column
  const height = (x) =>
    Math.min(
      Math.sqrt(Math.max(r1 * r1 - (x - c1) ** 2, 0)),
      Math.sqrt(Math.max(r2 * r2 - (x - c2) ** 2, 0)),
    );
  const centerX = (uMin + uMax) / 2;

  return computeSweptArc({
    segments,
    innerSegments,
    uMin,
    uMax,
    mapping,
    center: [centerX, 0],
    sx: (uMax - uMin) / 2,
    sy: height(centerX),
    bounds: (x) => {
      const h = height(x);
      return [-h, h];
    },
    point: (x, y) => [x, y],
  });
}
