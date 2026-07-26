/** @module cylinder */
import { rectangular } from "../../mappings.js";
import { checkArguments, computeRevolutionGeometry, TAU } from "../../utils.js";

/**
 * @typedef {object} CylinderOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [radiusApex=radius]
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {Function} [capMapping=mappings.rectangular]
 * @property {number} [sx=1] Base ring x scale, elliptical when != sz
 * @property {number} [sz=1] Base ring z scale, elliptical when != sx
 * @property {number} [sxApex=sx] Apex ring x scale, independent of the base
 * @property {number} [szApex=sz] Apex ring z scale, independent of the base
 */

/**
 * Right circular cylinder by default. Other shapes fall out of the same
 * parameters: a tube (capBase/capApex false, any radii), a frustum/cone
 * (radiusApex != radius, 0 for a true cone apex), and an elliptical cylinder
 * or frustum (sx != sz, optionally different per end via sxApex/szApex).
 * @alias module:cylinder
 * @param {CylinderOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function cylinder({
  height = 1,
  radius = 0.25,
  nx = 16,
  ny = 1,

  radiusApex = radius,
  capSegments = 1,
  capApex = true,
  capBase = true,
  capBaseSegments = capSegments,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,

  sx = 1,
  sz = 1,
  sxApex = sx,
  szApex = sz,
} = {}) {
  checkArguments(arguments);

  const halfHeight = height / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  // Ellipse scale varies linearly with height like radius/radiusApex; the
  // *Prime terms are their (constant) derivatives w.r.t. v, needed alongside
  // r/rPrime for the tangent cross-product normal below (product rule)
  const rPrime = radiusApex - radius;
  const sxPrime = sxApex - sx;
  const szPrime = szApex - sz;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;

    const r = lerp(radius, radiusApex, v);
    const sxV = lerp(sx, sxApex, v);
    const szV = lerp(sz, szApex, v);

    return {
      position: [r * sxV * cosPhi, height * v - halfHeight, r * szV * sinPhi],
      // Tangent_v x Tangent_phi of the elliptical-frustum surface, with the
      // common r factor divided out (harmless since normalize() erases
      // positive scalar multiples, and it keeps this well-defined at r = 0,
      // ie. a cone apex, same trick the sx = sz = 1 formula already relied
      // on). Reduces to (height*cosPhi, radius-radiusApex, height*sinPhi)
      // when sx = sz = sxApex = szApex = 1.
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
    phiOffset,
    capBase,
    capApex,
    capBaseSegments,
    capApexSegments: capSegments,
    capMapping,
    equation,
  });

  return { positions, normals, uvs, cells };
}
