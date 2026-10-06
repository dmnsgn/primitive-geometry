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
 * @property {number} [innerRadius=radius*0.5] Bore radius.
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=1]
 * @property {import("../../../types.js").PositiveInteger} [capSegments=1]
 *   Radial segments per cap.
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A cylinder with a concentric bore. A `phi < TAU` cut is left open.
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

  // A cone segment with yFrom = yTo is a flat ring
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
