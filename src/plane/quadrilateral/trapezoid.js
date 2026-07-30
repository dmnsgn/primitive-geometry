/** @module trapezoid */
import { rectangular } from "../../mappings.js";
import {
  centerCorners,
  checkArguments,
  computeOutlineEdge,
  computePolarGeometry,
  computePolarPathGeometry,
  translatePositions,
  TAU,
} from "../../utils.js";

const CORNER_COUNT = 4;

// The 4 corners, recentered on their own average so a radial fan (trapezoid)
// or radius scale (trapezoidPath) is centered on the shape rather than
// world origin - shared by both, see trapezoid's own doc comment for why.
function computeTrapezoidCorners(sx, sy, topRatio, topOffset) {
  return centerCorners([
    [-sx, -sy],
    [sx, -sy],
    [topOffset + sx * topRatio, sy],
    [topOffset - sx * topRatio, sy],
  ]);
}

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
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU] Negative values aren't supported: the
 *   corner lookup assumes `t - thetaOffset` stays non-negative.
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=innerRadius === 0]
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
  innerRadius = 0,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mapping = rectangular,
} = {}) {
  checkArguments(arguments);

  const { centeredCorners, cx, cy } = computeTrapezoidCorners(
    sx,
    sy,
    topRatio,
    topOffset,
  );

  const geometry = computePolarGeometry({
    sx: 1,
    sy: 1,
    radius,
    segments: edgeSegments * CORNER_COUNT,
    innerSegments,
    innerRadius,
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
    translatePositions(geometry.positions, radius * cx, radius * cy);
  }

  return geometry;
}

/**
 * @typedef {object} TrapezoidPathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [topRatio=0.5]
 * @property {number} [topOffset=0]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `trapezoid`: the same 4 corners (recentered so `radius`
 * scales around the shape's own centroid, then translated back), walked
 * directly with `computeOutlineEdge` instead of `trapezoid`'s radial fan.
 * @alias module:trapezoidPath
 * @param {TrapezoidPathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function trapezoidPath({
  sx = 1,
  sy = 1,
  topRatio = 0.5,
  topOffset = 0,
  radius = 0.5,
  edgeSegments = 1,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  checkArguments(arguments);

  const { centeredCorners, cx, cy } = computeTrapezoidCorners(
    sx,
    sy,
    topRatio,
    topOffset,
  );
  const dx = radius * cx;
  const dy = radius * cy;

  return computePolarPathGeometry({
    segments: edgeSegments * CORNER_COUNT,
    theta,
    thetaOffset,
    closed,
    equation: (t) => {
      const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
      return [radius * x + dx, radius * y + dy];
    },
  });
}
