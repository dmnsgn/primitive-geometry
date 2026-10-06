/**
 * @module primitiveGeometry
 * @ignore
 */
import { TAU, concatGeometries } from "../../utils/common.js";
import { computeConeSegment } from "./cone.js";

/**
 * @typedef {object} BiconeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [nx=16]
 * @property {import("../../../types.js").PositiveInteger} [ny=1] Meridian
 *   segments per cone.
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {number} [sx=1] Equator x scale.
 * @property {number} [sz=1] Equator z scale.
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Two cones joined base to base.
 *
 * @param {BiconeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function bicone({
  height = 1,
  radius = 0.5,
  nx = 16,
  ny = 1,
  phi = TAU,
  phiOffset = 0,
  sx = 1,
  sz = 1,
  mergeSeam = false,
} = {}) {
  const halfHeight = height / 2;

  const segment = (yFrom, yTo, rFrom, rTo) =>
    computeConeSegment({
      yFrom,
      yTo,
      rFrom,
      rTo,
      nx,
      ny,
      phi,
      mergeSeam,
      phiOffset,
      sx,
      sz,
    });

  // Two segments rather than one with a kink: a shared equator row can't hold
  // both halves' normals
  return concatGeometries([
    segment(-halfHeight, 0, 0, radius),
    segment(0, halfHeight, radius, 0),
  ]);
}
