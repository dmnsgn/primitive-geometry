/**
 * @module primitiveGeometry
 * @ignore
 */
import { superellipse, superellipsePath } from "./superellipse.js";
import { lamé } from "../../mappings.js";
import { TAU } from "../../utils/common.js";

/**
 * @typedef {object} AstroidOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.lamé]
 */

/**
 * A 4-cusped hypocycloid: `superellipse` with m = n = 2/3.
 *
 * @param {AstroidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Astroid]{@link https://mathworld.wolfram.com/Astroid.html}
 */
export function astroid({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  innerRadius = 0,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mergeSeam = true,
  mapping = lamé,
} = {}) {
  return superellipse({
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
    m: 2 / 3,
    n: 2 / 3,
  });
}

/**
 * @typedef {object} AstroidPathOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `astroid`.
 *
 * @param {AstroidPathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function astroidPath({
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  return superellipsePath({
    sx: 1,
    sy: 1,
    radius,
    segments,
    theta,
    thetaOffset,
    closed,
    m: 2 / 3,
    n: 2 / 3,
  });
}
