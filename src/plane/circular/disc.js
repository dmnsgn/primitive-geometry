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
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
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
    mapping,
  });
}

/**
 * @typedef {object} CirclePathOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `disc`: `ellipsePath` with sx = sy = 1.
 *
 * @param {CirclePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath} `segments`
 *   positions (`+ 1` for a partial `theta`) and a single path cell of that many
 *   indices (`+ 1`, repeating index `0`, when `closed`)
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
