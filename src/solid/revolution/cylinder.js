/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../../mappings.js";
import { TAU, lerp } from "../../utils/common.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} CylinderOptions
 * @property {number} [height=1]
 * @property {number} [radiusBase=0.25]
 * @property {number} [radiusApex=0.25]
 * @property {import("../../../types.js").PositiveInteger} [nx=16]
 * @property {import("../../../types.js").PositiveInteger} [ny=1]
 * @property {boolean} [capBase=true]
 * @property {boolean} [capApex=true]
 * @property {import("../../../types.js").PositiveInteger} [capBaseSegments=1]
 * @property {import("../../../types.js").PositiveInteger} [capApexSegments=1]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {number} [sxBase=1] Base ring x scale.
 * @property {number} [szBase=1] Base ring z scale.
 * @property {number} [sxApex=1] Apex ring x scale.
 * @property {number} [szApex=1] Apex ring z scale.
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A right circular cylinder.
 *
 * Special cases: tube (no caps), frustum (radiusApex != radiusBase), cone
 * (radiusApex = 0), elliptical cylinder (sxBase != szBase, sxApex != szApex).
 *
 * @param {CylinderOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function cylinder({
  height = 1,
  radiusBase = 0.25,
  radiusApex = 0.25,
  nx = 16,
  ny = 1,

  capBase = true,
  capApex = true,
  capBaseSegments = 1,
  capApexSegments = 1,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,

  sxBase = 1,
  szBase = 1,
  sxApex = 1,
  szApex = 1,
  mergeSeam = false,
} = {}) {
  const halfHeight = height / 2;

  // Derivatives w.r.t. v, for the tangent cross-product normal
  const rPrime = radiusApex - radiusBase;
  const sxPrime = sxApex - sxBase;
  const szPrime = szApex - szBase;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;

    const r = lerp(radiusBase, radiusApex, v);
    const sxV = lerp(sxBase, sxApex, v);
    const szV = lerp(szBase, szApex, v);

    return {
      position: [r * sxV * cosPhi, height * v - halfHeight, r * szV * sinPhi],
      // Tangent cross product with r factored out, so it stays defined at a
      // cone apex
      normal: [
        height * szV * cosPhi,
        -(
          rPrime * sxV * szV +
          r *
            (sxPrime * szV * cosPhi * cosPhi + sxV * szPrime * sinPhi * sinPhi)
        ),
        height * sxV * sinPhi,
      ],
      collapsed: r === 0,
    };
  }

  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
    capBase,
    capApex,
    capBaseSegments,
    capApexSegments,
    capMapping,
    equation,
  });

  return { positions, normals, uvs, cells };
}
