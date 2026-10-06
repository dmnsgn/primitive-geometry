/**
 * @module primitiveGeometry
 * @ignore
 */
import { ellipse, ellipsePath } from "./ellipse.js";
import { concentric } from "../../mappings.js";
import { TAU } from "../../utils/common.js";

/**
 * @typedef {object} AnnulusOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {number} [innerRadius=radius * 0.5]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * An annulus (ring): the region between two concentric circles.
 *
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
  mergeSeam = true,
  mapping = concentric,
} = {}) {
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
    mergeSeam,
    mapping,
  });
}

/**
 * @typedef {object} AnnulusPathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {number} [innerRadius=radius * 0.5]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `annulus`: 2 path cells, outer loop first.
 *
 * @param {AnnulusPathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
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
  const outer = ellipsePath({
    sx,
    sy,
    radius,
    segments,
    theta,
    thetaOffset,
    closed,
  });
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
