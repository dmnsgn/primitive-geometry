/**
 * @module primitiveGeometry
 * @ignore
 */
import { ellipse, ellipsePath } from "./ellipse.js";
import { concentric } from "../../mappings.js";
import { TAU } from "../../utils/common.js";

/**
 * @typedef {object} DiscOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * A disc: `ellipse` with sx = sy = 1.
 *
 * @param {DiscOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function disc({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  innerRadius = 0,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mergeSeam = true,
  mapping = concentric,
} = {}) {
  return ellipse({
    sx: 1,
    sy: 1,
    radius,
    segments,
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
 * @typedef {object} CirclePathOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `disc`.
 *
 * @param {CirclePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function circlePath({
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  return ellipsePath({
    sx: 1,
    sy: 1,
    radius,
    segments,
    theta,
    thetaOffset,
    closed,
  });
}
