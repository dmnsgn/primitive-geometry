/** @module trapezoid */
import { rectangular } from "../../mappings.js";
import {
  checkArguments,
  computeOutlineEdge,
  computePolarGeometry,
  TAU,
} from "../../utils.js";

const CORNER_COUNT = 4;

/**
 * @typedef {object} TrapezoidOptions
 * @property {number} [sx=1] Bottom edge half-width.
 * @property {number} [sy=1] Half-height: the bottom/top edges sit at
 *   `y = -sy`/`y = sy`.
 * @property {number} [topRatio=0.5] Top edge half-width, as a fraction of
 *   `sx`. `1` matches the bottom edge's width (a parallelogram once
 *   `topOffset` shifts it off-center); `0` collapses the top edge to a
 *   point (a triangle).
 * @property {number} [topOffset=0] Horizontal shift of the top edge's
 *   center, as a fraction of `sx`. `0` (default) keeps both legs symmetric
 *   (an isosceles trapezoid); a non-zero shift skews it into a right/scalene
 *   trapezoid.
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU] Negative values aren't supported: the
 *   corner lookup assumes `t - thetaOffset` stays non-negative.
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.rectangular] Uv mapping function.
 *   Defaults to a flat, bounding-box-relative unwrap.
 */

/**
 * A trapezoid: a quad with horizontal top/bottom edges, the top narrowed to
 * `topRatio` of the bottom's width and optionally shifted by `topOffset`.
 * Each ring between the fan point and the outline is a smaller self-similar
 * copy (same trick as `star`/`cross`'s `innerRadius`), fanned from the
 * outline's own vertex average rather than world origin - `topOffset` pulls
 * the outline off-center, and `computePolarGeometry`'s merged apex is
 * otherwise pinned at `(0, 0)`, which would bunch rings tight on one side and
 * stretch them thin on the other. `equation` builds around a recentered copy
 * of `corners` so that apex lands at the shape's own center instead, then a
 * final pass translates every vertex back by that same center so the
 * documented, `topOffset`-relative corner positions are unaffected. Unlike
 * `rhombus`'s kite family (corners at top/left/bottom/right), the default
 * `thetaOffset=0` starts at the bottom-left corner and sweeps CCW through
 * bottom-right, top-right, top-left - the same order as `rectanglePath`'s
 * corners.
 * @see [Wolfram MathWorld – Trapezoid]{@link https://mathworld.wolfram.com/Trapezoid.html}
 * @alias module:trapezoid
 * @param {TrapezoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function trapezoid({
  sx = 1,
  sy = 1,
  topRatio = 0.5,
  topOffset = 0,
  radius = 0.5,
  edgeSegments = 1,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = true,
  mapping = rectangular,
} = {}) {
  checkArguments(arguments);

  const corners = [
    [-sx, -sy],
    [sx, -sy],
    [topOffset + sx * topRatio, sy],
    [topOffset - sx * topRatio, sy],
  ];

  const [cx, cy] = corners
    .reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0])
    .map((sum) => sum / CORNER_COUNT);
  const centeredCorners = corners.map(([x, y]) => [x - cx, y - cy]);

  const geometry = computePolarGeometry({
    sx: 1,
    sy: 1,
    radius,
    segments: edgeSegments * CORNER_COUNT,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    equation: ({ rx, t }) => {
      const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
      return [rx * x, rx * y];
    },
  });

  if (cx !== 0 || cy !== 0) {
    const { positions } = geometry;
    const dx = radius * cx;
    const dy = radius * cy;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += dx;
      positions[i + 1] += dy;
    }
  }

  return geometry;
}
