/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import {
  centerCorners,
  computeOutlineEdge,
  computePolarGeometry,
  computePolarPathGeometry,
  translatePositions,
} from "../../utils/polar.js";

const CORNER_COUNT = 4;

// Recentered on their average: the fan's centroid is pinned at the origin, so
// an off-center outline would bunch rings on one side. Callers translate back.
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
 * @property {number} [sy=1] Half-height.
 * @property {number} [topRatio=0.5] Top edge half-width, as a fraction of `sx`.
 * @property {number} [topOffset=0] Horizontal shift of the top edge.
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU] Negative values
 *   aren't supported.
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * A trapezoid with horizontal edges, swept CCW from the bottom-left corner.
 *
 * Special cases: isosceles (topOffset = 0), parallelogram (topRatio = 1),
 * triangle (topRatio = 0).
 *
 * @param {TrapezoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Trapezoid]{@link https://mathworld.wolfram.com/Trapezoid.html}
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
  mergeSeam = true,
  mapping = rectangular,
} = {}) {
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
    mergeSeam,
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
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `trapezoid`.
 *
 * @param {TrapezoidPathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
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
