/**
 * @module primitiveGeometry
 * @ignore
 */
import { polygon, polygonPath } from "../polygon.js";
import { concentric } from "../../mappings.js";
import { HALF_PI, TAU } from "../../utils/common.js";

/**
 * @typedef {object} RhombusOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=HALF_PI]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * A rhombus: a diamond with vertices at top/right/bottom/left, sx and sy
 * independently scaling the horizontal and vertical diagonals. Equal sx/sy
 * gives a square rotated 45°.
 *
 * @param {RhombusOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function rhombus({
  sx = 1,
  sy = 1,
  radius = 0.5,
  edgeSegments = 1,
  innerSegments = 16,
  innerRadius = 0,
  theta = TAU,
  thetaOffset = HALF_PI,
  mergeCentroid = innerRadius === 0,
  mapping = concentric,
} = {}) {
  return polygon({
    sides: 4,
    sx,
    sy,
    radius,
    edgeSegments,
    innerSegments,
    innerRadius,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
  });
}

/**
 * @typedef {object} RhombusPathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=HALF_PI]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `rhombus`: `polygonPath` with sides fixed to `4`.
 *
 * @param {RhombusPathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function rhombusPath({
  sx = 1,
  sy = 1,
  radius = 0.5,
  edgeSegments = 1,
  theta = TAU,
  thetaOffset = HALF_PI,
  closed = false,
} = {}) {
  return polygonPath({
    sides: 4,
    sx,
    sy,
    radius,
    edgeSegments,
    theta,
    thetaOffset,
    closed,
  });
}
