/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * A frustum segment between yFrom and yTo, with constant sx/sz.
 *
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
  mergeSeam,
  capOptions,
}) {
  const rPrime = rTo - rFrom;
  const yPrime = yTo - yFrom;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;
    const r = rFrom + rPrime * v;

    return {
      position: [r * sx * cosPhi, yFrom + yPrime * v, r * sz * sinPhi],
      // cylinder's r-factored normal, with constant sx/sz
      normal: [yPrime * sz * cosPhi, -(rPrime * sx * sz), yPrime * sx * sinPhi],
      collapsed: r === 0,
    };
  }

  return computeRevolutionGeometry({
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
    equation,
    ...capOptions,
  });
}

/**
 * @typedef {object} ConeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {import("../../../types.js").PositiveInteger} [nx=16]
 * @property {import("../../../types.js").PositiveInteger} [ny=1]
 * @property {import("../../../types.js").PositiveInteger} [capSegments=1]
 * @property {boolean} [capBase=true]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {number} [sx=1] Base ring x scale.
 * @property {number} [sz=1] Base ring z scale.
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A right circular cone.
 *
 * Special cases: open cone (capBase = false), elliptical cone (sx != sz).
 *
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
  mergeSeam = false,
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
    mergeSeam,
    phiOffset,
    sx,
    sz,
    capOptions: { capBase, capBaseSegments: capSegments, capMapping },
  });

  return { positions, normals, uvs, cells };
}
