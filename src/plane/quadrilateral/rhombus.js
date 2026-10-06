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
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * A rhombus: `polygon` with 4 sides, sx/sy scaling its diagonals.
 *
 * Special cases: square rotated 45° (sx = sy).
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
  mergeSeam = true,
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
    mergeSeam,
    mapping,
  });
}

/**
 * @typedef {object} RhombusPathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `rhombus`.
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
