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

const CORNER_COUNT = 3;

// Recentered on their average so an off-center apex doesn't bunch rings on one
// side
function computeTriangleCorners(sx, sy, apexOffset) {
  return centerCorners([
    [-sx, -sy],
    [sx, -sy],
    [apexOffset, sy],
  ]);
}

/**
 * @typedef {object} TriangleOptions
 * @property {number} [sx=1] Base half-width.
 * @property {number} [sy=1] Half-height.
 * @property {number} [apexOffset=0] Horizontal apex shift.
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
 * A triangle with a horizontal base, swept CCW from the bottom-left corner.
 *
 * Special cases: isosceles (apexOffset = 0), right (apexOffset = ±sx), scalene
 * otherwise.
 *
 * @param {TriangleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Triangle]{@link https://mathworld.wolfram.com/Triangle.html}
 */
export function triangle({
  sx = 1,
  sy = 1,
  apexOffset = 0,
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
  const { centeredCorners, cx, cy } = computeTriangleCorners(
    sx,
    sy,
    apexOffset,
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
 * @typedef {object} TrianglePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [apexOffset=0]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `triangle`.
 *
 * @param {TrianglePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function trianglePath({
  sx = 1,
  sy = 1,
  apexOffset = 0,
  radius = 0.5,
  edgeSegments = 1,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  const { centeredCorners, cx, cy } = computeTriangleCorners(
    sx,
    sy,
    apexOffset,
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
