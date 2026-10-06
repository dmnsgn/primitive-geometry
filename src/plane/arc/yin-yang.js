/**
 * @module primitiveGeometry
 * @ignore
 */
import { computeSweptArc } from "../../utils/polar.js";
import { rectangular } from "../../mappings.js";
import { clamp, concatGeometries } from "../../utils/common.js";

/**
 * @typedef {object} YinYangOptions
 * @property {number} [radius=0.5] Radius of the enclosing circle.
 * @property {number} [dotRadius=radius/6] Dot hole radius. `0` omits it.
 * @property {"yin" | "yang" | "yin-yang"} [part="yin-yang"] One half, or both
 *   merged in one mesh.
 * @property {import("../../../types.js").PositiveInteger} [segments=32] Rows
 *   along the outer circle and S-curve.
 * @property {import("../../../types.js").PositiveInteger} [holeSegments=16]
 *   Rows along a dot hole.
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 *   Columns on each side of a dot hole.
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 *   Use `uRatio`/`vRatio` to follow the arcs.
 */

/**
 * A yin-yang (taijitu): a circle split by an S-curve, each half holed at the
 * other's bulge.
 *
 * @param {YinYangOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Yin-Yang]{@link https://mathworld.wolfram.com/Yin-Yang.html}
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

  const yangDotBottom = -R / 2 - dotRadius;
  const yangDotTop = -R / 2 + dotRadius;
  const yinDotBottom = R / 2 - dotRadius;
  const yinDotTop = R / 2 + dotRadius;
  // Both halves sweep both dots' breakpoints so they sample the shared S-curve
  // at identical y-values
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

  // center/sx/sy: the bounding box uvs are relative to
  function buildHalf(isYin, center, sx, sy) {
    const outerMin = (y) => (isYin ? -diskEdge(y) : curve(y));
    const outerMax = (y) => (isYin ? curve(y) : diskEdge(y));
    const dotCenterY = (isYin ? R : -R) / 2;
    const dotBottom = isYin ? yinDotBottom : yangDotBottom;
    const dotTop = isYin ? yinDotTop : yangDotTop;

    // y - dotCenterY doesn't reliably round-trip to dotRadius
    const holeHalfWidth = (y) =>
      y <= dotBottom || y >= dotTop
        ? 0
        : Math.sqrt(Math.max(dotRadius * dotRadius - (y - dotCenterY) ** 2, 0));

    // clamp collapses a band to a point where it doesn't straddle x = 0
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
      computeSweptArc({
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
      ...schedule.map(([uMin, uMax, rows]) =>
        sweep(uMin, uMax, rows, leftBounds),
      ),
      ...schedule.map(([uMin, uMax, rows]) =>
        sweep(uMin, uMax, rows, rightBounds),
      ),
    ]);
  }

  if (part !== "yin-yang") {
    const isYin = part === "yin";
    // The S-curve bulges further one way in x
    return buildHalf(isYin, [(isYin ? -R : R) / 4, 0], (3 * R) / 4, R);
  }

  const wholeCenter = [0, 0];
  return concatGeometries([
    buildHalf(false, wholeCenter, R, R),
    buildHalf(true, wholeCenter, R, R),
  ]);
}
