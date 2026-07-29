/** @module annulus */
import { ellipse, ellipsePath } from "./ellipse.js";
import { concentric } from "../../mappings.js";
import { checkArguments, TAU } from "../../utils.js";

/**
 * @typedef {object} AnnulusOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {number} [innerRadius=radius * 0.5]
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * @alias module:annulus
 * @param {AnnulusOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function annulus({
  sx = 1,
  sy = 1,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  innerRadius = radius * 0.5,
  mapping = concentric,
} = {}) {
  checkArguments(arguments);

  return ellipse({
    sx,
    sy,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    innerRadius,
    mergeCentroid: false,
    mapping,
  });
}

/**
 * @typedef {object} AnnulusPathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {number} [innerRadius=radius * 0.5]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `annulus`: unlike every other path in this module, an
 * annulus's boundary is 2 disjoint loops, not one - `ellipsePath` at
 * `radius` and again at `innerRadius`, concatenated into a single geometry
 * with 2 path cells (outer loop first, inner second) rather than fanned into
 * a single ring of triangles between them.
 * @alias module:annulusPath
 * @param {AnnulusPathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function annulusPath({
  sx = 1,
  sy = 1,
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  innerRadius = radius * 0.5,
  closed = false,
} = {}) {
  checkArguments(arguments);

  const outer = ellipsePath({ sx, sy, radius, segments, theta, thetaOffset, closed });
  const inner = ellipsePath({
    sx,
    sy,
    radius: innerRadius,
    segments,
    theta,
    thetaOffset,
    closed,
  });

  const outerCount = outer.positions.length / 3;
  const positions = new Float32Array(
    outer.positions.length + inner.positions.length,
  );
  positions.set(outer.positions, 0);
  positions.set(inner.positions, outer.positions.length);

  const innerCell = inner.cells[0].map((i) => i + outerCount);

  return { positions, cells: [outer.cells[0], innerCell] };
}
