/** @module doubleCone */
import { rectangular } from "../../mappings.js";
import {
  checkArguments,
  computeRevolutionGeometry,
  concatGeometries,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} DoubleConeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.5]
 * @property {number} [nx=16]
 * @property {number} [ny=1] Meridian segments per half (top/bottom cone)
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {Function} [capMapping=mappings.rectangular]
 * @property {number} [sx=1] End ring x scale, elliptical when != sz
 * @property {number} [sz=1] End ring z scale, elliptical when != sx
 */

/**
 * Two right circular cones joined apex-to-apex at the waist (an hourglass of
 * revolution) - the wide top/bottom ends are flat, so unlike bicone it takes
 * the same capBase/capApex/capSegments/capMapping options as cylinder. Built
 * as two independent cones (cylinder's elliptical-cone case, generalized to
 * an arbitrary y span) concatenated at the waist rather than one function
 * with a v = 0.5 kink - see bicone.js for why that shared-row approach
 * doesn't give a correctly-wound normal on both sides.
 * @alias module:doubleCone
 * @param {DoubleConeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
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
  checkArguments(arguments);

  const halfHeight = height / 2;

  function cone(yFrom, yTo, rFrom, rTo, capOptions) {
    const rPrime = rTo - rFrom;
    const yPrime = yTo - yFrom;

    function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
      const cosPhi = -rawCosPhi;
      const r = rFrom + rPrime * v;

      return {
        position: [r * sx * cosPhi, yFrom + yPrime * v, r * sz * sinPhi],
        normal: [
          yPrime * sz * cosPhi,
          -(rPrime * sx * sz),
          yPrime * sx * sinPhi,
        ],
        collapsed: r === 0,
      };
    }

    return computeRevolutionGeometry({
      nx,
      ny,
      phi,
      phiOffset,
      equation,
      ...capOptions,
    });
  }

  return concatGeometries([
    cone(-halfHeight, 0, radius, 0, { capBase, capBaseSegments, capMapping }),
    cone(0, halfHeight, 0, radius, {
      capApex,
      capApexSegments: capSegments,
      capMapping,
    }),
  ]);
}
