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

// The 3 corners, recentered on their own average so an off-center apex
// doesn't bunch rings tight on one side (same reasoning as trapezoid's own
// helper). Shared by triangle (radial fan) and trianglePath (radius scale).
function computeTriangleCorners(sx, sy, apexOffset) {
  return centerCorners([
    [-sx, -sy],
    [sx, -sy],
    [apexOffset, sy],
  ]);
}

/**
 * @typedef {object} TriangleOptions
 * @property {number} [sx=1] Base half-width: the base corners sit at `x =
 *   -sx`/`x = sx`.
 * @property {number} [sy=1] Half-height: the base sits at `y = -sy`, the apex
 *   at `y = sy`.
 * @property {number} [apexOffset=0] Horizontal shift of the apex, in the same
 *   units as `sx`. `0` (default) keeps it centered (an isosceles triangle);
 *   `±sx` lands it directly above a base corner (a right triangle); anything
 *   else gives a scalene triangle.
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU] Negative values aren't supported: the corner
 *   lookup assumes `t - thetaOffset` stays non-negative.
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=innerRadius===0]
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 *   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap.
 */

/**
 * A triangle: a horizontal base with the apex placed anywhere above it via
 * `apexOffset`. `thetaOffset=0` starts at the bottom-left corner and sweeps CCW
 * through bottom-right, apex.
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
 * @property {number} [edgeSegments=1]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `triangle`: the same 3 corners, walked directly instead of
 * fanned.
 *
 * @param {TrianglePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
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
