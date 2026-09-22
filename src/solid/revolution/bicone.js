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
 * @property {number} [nx=16]
 * @property {number} [ny=1] Meridian segments per half (top/bottom cone)
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {number} [sx=1] Equator x scale, elliptical when != sz
 * @property {number} [sz=1] Equator z scale, elliptical when != sx
 */

/**
 * Two right circular cones joined base-to-base at the equator (a bipyramid of
 * revolution/spinning-top shape) - both ends come to a point, so unlike
 * `cylinder`/`doubleCone` there are no cap options.
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
      phiOffset,
      sx,
      sz,
    });

  // Two independent cone segments concatenated at the equator rather than
  // one function with a v = 0.5 kink: the two halves need opposite-signed
  // local slopes there, which a single shared row (and vertex normal) can't
  // satisfy for both sides at once - each half gets its own equator ring
  // instead.
  return concatGeometries([
    segment(-halfHeight, 0, 0, radius),
    segment(0, halfHeight, radius, 0),
  ]);
}
