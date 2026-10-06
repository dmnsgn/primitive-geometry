/**
 * @module primitiveGeometry
 * @ignore
 */
import { triangle, trianglePath } from "./triangle.js";

/**
 * @typedef {object} RightTriangleOptions
 * @property {number} [sx=1] Horizontal leg half-length: the leg itself runs the
 *   full `2 * sx`, from the right-angle corner to the opposite base corner.
 * @property {number} [sy=1] Vertical leg half-length, likewise doubled.
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap
 *   edge for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * A right triangle: `triangle` with its apex pulled directly above the
 * bottom-left corner (`apexOffset = -sx`), landing the right angle there.
 *
 * @param {RightTriangleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function rightTriangle({
  sx = 1,
  sy = 1,
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
  return triangle({
    sx,
    sy,
    apexOffset: -sx,
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
 * @typedef {object} RightTrianglePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `rightTriangle`: `trianglePath` with `apexOffset` fixed to
 * `-sx`.
 *
 * @param {RightTrianglePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function rightTrianglePath({
  sx = 1,
  sy = 1,
  radius,
  edgeSegments,
  theta,
  thetaOffset,
  closed,
} = {}) {
  return trianglePath({
    sx,
    sy,
    apexOffset: -sx,
    radius,
    edgeSegments,
    theta,
    thetaOffset,
    closed,
  });
}
