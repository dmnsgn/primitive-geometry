/**
 * @module primitiveGeometry
 * @ignore
 */
import { rhombus, rhombusPath } from "./rhombus.js";

/**
 * @typedef {object} LozengeOptions
 * @property {number} [sx=0.5]
 * @property {number} [sy=sx*2]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap
 *   edge for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * A rhombus elongated along its vertical diagonal by default (sy = sx * 2), the
 * classic narrow diamond look.
 *
 * @param {LozengeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function lozenge({
  sx = 0.5,
  sy = sx * 2,
  radius,
  edgeSegments,
  innerSegments,
  innerRadius,
  theta,
  thetaOffset,
  mergeCentroid,
  mergeSeam,
  mapping,
} = {}) {
  return rhombus({
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
 * @typedef {object} LozengePathOptions
 * @property {number} [sx=0.5]
 * @property {number} [sy=sx*2]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `lozenge`: `rhombusPath` elongated along its vertical
 * diagonal by default (sy = sx * 2).
 *
 * @param {LozengePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function lozengePath({
  sx = 0.5,
  sy = sx * 2,
  radius,
  edgeSegments,
  theta,
  thetaOffset,
  closed,
} = {}) {
  return rhombusPath({
    sx,
    sy,
    radius,
    edgeSegments,
    theta,
    thetaOffset,
    closed,
  });
}
