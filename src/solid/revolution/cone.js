/** @module cone */
import { rectangular } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * A single right-circular-cone-frustum segment of a meridian sweep between
 * two arbitrary y's. It's cylinder.js's elliptical-frustum case, minus the
 * per-end ellipse (sx/sz are constant across the segment, since a frustum
 * end that isn't a single point never occurs here), generalized from a
 * height/halfHeight-centered span to an arbitrary yFrom/yTo. `cone` below
 * is one such segment (apex at one end); bicone.js and doubleCone.js each
 * concatenate two others at their shared seam, instead of using a single
 * function with a v = 0.5 kink - see bicone.js for why that shared-row
 * approach can't be wound correctly on both sides.
 * @private
 */
export function computeConeSegment({
  yFrom,
  yTo,
  rFrom,
  rTo,
  nx,
  ny,
  phi,
  phiOffset,
  sx = 1,
  sz = 1,
  capOptions,
}) {
  const rPrime = rTo - rFrom;
  const yPrime = yTo - yFrom;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;
    const r = rFrom + rPrime * v;

    return {
      position: [r * sx * cosPhi, yFrom + yPrime * v, r * sz * sinPhi],
      // Same r-factored tangent cross-product as cylinder's cone case, with
      // sx/sz constant (no per-end ellipse - each end is a point)
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

/**
 * @typedef {object} ConeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [capSegments=1]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {Function} [capMapping=mappings.rectangular]
 * @property {number} [sx=1] Base ring x scale, elliptical when != sz
 * @property {number} [sz=1] Base ring z scale, elliptical when != sx
 */

/**
 * Right circular cone by default. Other shapes fall out of the same
 * parameters: an open cone/funnel (capBase false) and an elliptical cone
 * (sx != sz). There's no apex-side ellipse - the apex is always a single
 * point, so any apex scale would be a no-op.
 * @alias module:cone
 * @param {ConeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function cone({
  height = 1,
  radius = 0.25,
  nx = 16,
  ny = 1,
  capSegments = 1,
  capBase = true,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,
  sx = 1,
  sz = 1,
} = {}) {

  const halfHeight = height / 2;

  const { positions, normals, uvs, cells } = computeConeSegment({
    yFrom: -halfHeight,
    yTo: halfHeight,
    rFrom: radius,
    rTo: 0,
    nx,
    ny,
    phi,
    phiOffset,
    sx,
    sz,
    capOptions: { capBase, capBaseSegments: capSegments, capMapping },
  });

  return { positions, normals, uvs, cells };
}
