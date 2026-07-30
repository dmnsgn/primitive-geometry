/** @module yinYang */
import { sweptArc } from "./swept-arc.js";
import { rectangular } from "../../mappings.js";
import { clamp, concatGeometries } from "../../utils.js";

/**
 * @typedef {object} YinYangOptions
 * @property {number} [radius=0.5] Radius of the enclosing circle.
 * @property {number} [dotRadius=radius/6] Radius of the hole cut at each
 *   returned half's own dot position. `0` omits the hole(s).
 * @property {"yin"|"yang"|"yin-yang"} [part="yin-yang"] `"yin"`/`"yang"`
 *   return one S-curve-divided half (bounded by half the outer circle and
 *   the S-curve), with its dot hole centered at the other half's bulge
 *   (`(0, -radius/2)` for yang, `(0, radius/2)` for yin). `"yin-yang"`
 *   merges both into one mesh; without per-face material/color the S-curve
 *   seam is then invisible (indistinguishable from a disc with two holes).
 * @property {number} [segments=32] Row count for the outer circle/S-curve
 *   boundary, swept bottom to top.
 * @property {number} [holeSegments=16] Row count for a dot hole's own
 *   boundary, independent of the outer boundary's `segments`.
 * @property {number} [innerSegments=16] Column count spanning each side of
 *   a dot hole (or the whole half, where the hole doesn't reach) at each
 *   row.
 * @property {Function} [mapping=mappings.rectangular] Uv mapping function.
 *   Defaults to a flat, bounding-box-relative unwrap; pass a function using
 *   `uRatio`/`vRatio` (the swept parametrization) to follow the arcs
 *   instead.
 */

/**
 * Yin-Yang (taijitu): a circle divided by an S-shaped seam of two opposing
 * semicircles, each side holed by a dot at the other's bulge.
 *
 * Quirks:
 * - Each half is built from two bands (left/right of its dot's own x = 0),
 *   split into five y-sub-sweeps around both dots' row ranges, not just
 *   this half's own - so yin and yang always sample the shared S-curve
 *   boundary at identical y-values. Skipped when `dotRadius` is `0`, back
 *   to one sweep per band.
 * - Both bands collapse to a point at the shape's own top and bottom tips.
 * @see [Wolfram MathWorld – Yin-Yang]{@link https://mathworld.wolfram.com/Yin-Yang.html}
 * @alias module:yinYang
 * @param {YinYangOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function yinYang({
  radius = 0.5,
  dotRadius = radius / 6,
  part = "yin-yang",
  segments = 32,
  holeSegments = 16,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {

  const R = radius;

  const curve = (y) =>
    y >= 0
      ? Math.sqrt(Math.max((R / 2) ** 2 - (y - R / 2) ** 2, 0))
      : -Math.sqrt(Math.max((R / 2) ** 2 - (y + R / 2) ** 2, 0));
  const diskEdge = (y) => Math.sqrt(Math.max(R * R - y * y, 0));

  // Both dots' breakpoints, shared by both halves so the S-curve is
  // sampled at identical y-values regardless of which half is built.
  const yangDotBottom = -R / 2 - dotRadius;
  const yangDotTop = -R / 2 + dotRadius;
  const yinDotBottom = R / 2 - dotRadius;
  const yinDotTop = R / 2 + dotRadius;
  const schedule =
    dotRadius <= 0
      ? [[-R, R, segments]]
      : [
          [-R, yangDotBottom, segments],
          [yangDotBottom, yangDotTop, holeSegments],
          [yangDotTop, yinDotBottom, segments],
          [yinDotBottom, yinDotTop, holeSegments],
          [yinDotTop, R, segments],
        ];

  // Builds one S-curve-divided half, holed at its own dot position.
  // center/sx/sy set the bounding box the uv mapping is relative to.
  function buildHalf(isYin, center, sx, sy) {
    const outerMin = (y) => (isYin ? -diskEdge(y) : curve(y));
    const outerMax = (y) => (isYin ? curve(y) : diskEdge(y));
    const dotCenterY = isYin ? R / 2 : -R / 2;
    const dotBottom = isYin ? yinDotBottom : yangDotBottom;
    const dotTop = isYin ? yinDotTop : yangDotTop;

    // Compares against dotBottom/dotTop directly rather than re-deriving
    // via y - dotCenterY, which doesn't reliably round-trip to dotRadius.
    const holeHalfWidth = (y) =>
      y <= dotBottom || y >= dotTop
        ? 0
        : Math.sqrt(Math.max(dotRadius * dotRadius - (y - dotCenterY) ** 2, 0));

    // holeHalfWidth is 0 outside this half's own dot range (including the
    // other half's dot range, where this half has no hole); clamp collapses
    // a band to a point wherever it doesn't straddle x = 0 at all.
    const leftBounds = (y) => {
      const lo = outerMin(y);
      const hi = outerMax(y);
      return [lo, clamp(-holeHalfWidth(y), lo, hi)];
    };
    const rightBounds = (y) => {
      const lo = outerMin(y);
      const hi = outerMax(y);
      return [clamp(holeHalfWidth(y), lo, hi), hi];
    };

    const sweep = (uMin, uMax, rows, bounds) =>
      sweptArc({
        segments: rows,
        innerSegments,
        uMin,
        uMax,
        mapping,
        center,
        sx,
        sy,
        bounds,
        point: (y, x) => [x, y],
        flip: true,
      });

    return concatGeometries([
      ...schedule.map(([uMin, uMax, rows]) => sweep(uMin, uMax, rows, leftBounds)),
      ...schedule.map(([uMin, uMax, rows]) => sweep(uMin, uMax, rows, rightBounds)),
    ]);
  }

  if (part !== "yin-yang") {
    const isYin = part === "yin";
    // Bounding box is asymmetric in x (the S-curve bulges further one way)
    // but always spans [-R, R] in y.
    return buildHalf(isYin, [isYin ? -R / 4 : R / 4, 0], (3 * R) / 4, R);
  }

  const wholeCenter = [0, 0];
  return concatGeometries([
    buildHalf(false, wholeCenter, R, R),
    buildHalf(true, wholeCenter, R, R),
  ]);
}
