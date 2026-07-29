/** @module rightTriangle */
import { triangle, trianglePath } from "./triangle.js";
import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} RightTriangleOptions
 * @property {number} [sx=1] Horizontal leg half-length: the leg itself runs
 *   the full `2 * sx`, from the right-angle corner to the opposite base
 *   corner.
 * @property {number} [sy=1] Vertical leg half-length, likewise doubled.
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=innerRadius === 0]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * A right triangle: `triangle` with its apex pulled directly above the
 * bottom-left corner (`apexOffset = -sx`), landing the right angle there.
 * @alias module:rightTriangle
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
  mapping,
} = {}) {
  checkArguments(arguments);

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
    mapping,
  });
}

/**
 * @typedef {object} RightTrianglePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `rightTriangle`: `trianglePath` with `apexOffset` fixed to
 * `-sx`.
 * @alias module:rightTrianglePath
 * @param {RightTrianglePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
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
  checkArguments(arguments);

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
