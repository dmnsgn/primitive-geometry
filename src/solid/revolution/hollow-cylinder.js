/**
 * @module primitiveGeometry
 * @ignore
 */
import { TAU, concatGeometries, invert } from "../../utils/common.js";
import { cylinder } from "./cylinder.js";
import { computeConeSegment } from "./cone.js";

/**
 * @typedef {object} HollowCylinderOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.5]
 * @property {number} [innerRadius=radius*0.5] Bore radius
 * @property {number} [nx=32]
 * @property {number} [ny=1]
 * @property {number} [capSegments=1] Radial segments of each annular cap
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A cylinder with a concentric cylindrical bore through it - a washer/pipe
 * extruded to a given height. Doesn't close the `phi < TAU` wedge cut (no wall
 * between the outer/inner walls or the 2 caps there) - same limitation as a
 * plain `cylinder({ phi: <TAU })`.
 *
 * @param {HollowCylinderOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function hollowCylinder({
  height = 1,
  radius = 0.5,
  innerRadius = radius * 0.5,
  nx = 32,
  ny = 1,
  capSegments = 1,
  capApex = true,
  capBase = true,
  phi = TAU,
  phiOffset = 0,
  mergeSeam = false,
} = {}) {
  const halfHeight = height / 2;

  // A flat annular ring: computeConeSegment with yFrom = yTo degenerates its
  // usual slope to none, so y stays constant while r sweeps rFrom -> rTo
  const annularCap = (y, rFrom, rTo) =>
    computeConeSegment({
      yFrom: y,
      yTo: y,
      rFrom,
      rTo,
      nx,
      ny: capSegments,
      phi,
      mergeSeam,
      phiOffset,
    });

  // cylinder's own lateral surface (capBase/capApex false, its "tube" case)
  // called twice: once at radius for the outer wall, once at innerRadius
  // inverted for the bore wall.
  const pieces = [
    cylinder({
      height,
      radiusBase: radius,
      radiusApex: radius,
      nx,
      ny,
      phi,
      mergeSeam,
      phiOffset,
      capBase: false,
      capApex: false,
    }),
    invert(
      cylinder({
        height,
        radiusBase: innerRadius,
        radiusApex: innerRadius,
        nx,
        ny,
        phi,
        mergeSeam,
        phiOffset,
        capBase: false,
        capApex: false,
      }),
    ),
  ];

  if (capApex) pieces.push(annularCap(halfHeight, radius, innerRadius));
  if (capBase) pieces.push(annularCap(-halfHeight, innerRadius, radius));

  return concatGeometries(pieces);
}
