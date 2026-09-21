/** @module doubleCone */
import { rectangular } from "../../mappings.js";
import { TAU, concatGeometries } from "../../utils/common.js";
import { computeConeSegment } from "./cone.js";

/**
 * @typedef {object} DoubleConeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.5]
 * @property {number} [nx=16]
 * @property {number} [ny=1] Meridian segments per half (top/bottom cone)
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [capBaseSegments=capSegments]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {number} [sx=1] End ring x scale, elliptical when != sz
 * @property {number} [sz=1] End ring z scale, elliptical when != sx
 */

/**
 * Two right circular cones joined apex-to-apex at the waist (an hourglass of
 * revolution) - the wide top/bottom ends are flat, so unlike `bicone` it takes
 * the same capBase/capApex/capSegments/capMapping options as `cylinder`.
 *
 * @param {DoubleConeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @alias module:doubleCone
 */
export function doubleCone({
  height = 1,
  radius = 0.5,
  nx = 16,
  ny = 1,
  capSegments = 1,
  capApex = true,
  capBase = true,
  capBaseSegments = capSegments,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,
  sx = 1,
  sz = 1,
} = {}) {
  const halfHeight = height / 2;

  const segment = (yFrom, yTo, rFrom, rTo, capOptions) =>
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
      capOptions,
    });

  // Two independent cones concatenated at the waist rather than one function
  // with a v = 0.5 kink - see bicone.js for why that shared-row approach
  // can't give a correctly-wound normal on both sides.
  return concatGeometries([
    segment(-halfHeight, 0, radius, 0, {
      capBase,
      capBaseSegments,
      capMapping,
    }),
    segment(0, halfHeight, 0, radius, {
      capApex,
      capApexSegments: capSegments,
      capMapping,
    }),
  ]);
}
