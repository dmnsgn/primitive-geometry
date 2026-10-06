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
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {boolean} [capBase=true]
 * @property {boolean} [capApex=true]
 * @property {number} [capBaseSegments=1]
 * @property {number} [capApexSegments=1]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {number} [sxBase=1] Base ring x scale, elliptical when != szBase
 * @property {number} [szBase=1] Base ring z scale, elliptical when != sxBase
 * @property {number} [sxApex=1] Apex ring x scale, elliptical when != szApex
 * @property {number} [szApex=1] Apex ring z scale, elliptical when != sxApex
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Right circular cylinder by default. Other shapes fall out of the same
 * parameters: a tube (capBase/capApex false, any radii), a frustum/cone
 * (radiusApex != radiusBase, 0 for a true cone apex), and an elliptical cylinder
 * or frustum (sxBase != szBase, sxApex != szApex).
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

  // Ellipse scale varies linearly with height like radiusBase/radiusApex; the
  // *Prime terms are their (constant) derivatives w.r.t. v, needed alongside
  // r/rPrime for the tangent cross-product normal below (product rule)
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
      // Tangent_v x Tangent_phi of the elliptical-frustum surface, with the
      // common r factor divided out (harmless since normalize() erases
      // positive scalar multiples, and it keeps this well-defined at r = 0,
      // ie. a cone apex, same trick the sx = sz = 1 formula already relied
      // on). Reduces to (height*cosPhi, radiusBase-radiusApex, height*sinPhi)
      // when every ring scale is 1.
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
