/** @module funnel */
import { rectangular } from "../../mappings.js";
import { checkArguments, computeRevolutionGeometry, TAU } from "../../utils.js";

/**
 * @typedef {object} FunnelOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.1] Spout radius, at y = -height/2
 * @property {number} [radiusTop=radius*5] Mouth radius, at y = height/2 -
 * must be > radius for the usual flared-outward shape; radiusTop = radius
 * degenerates to a plain cylinder, radiusTop < radius flips the taper (still
 * a valid, NaN-free surface, just narrowing toward the top instead)
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {Function} [capMapping=mappings.rectangular]
 */

/**
 * Revolution of y = a·ln(r) (equivalently r = radius·e^(k·(y+height/2)), an
 * exponential - not linear (`cone`) or hyperbolic (`hyperboloid`) - radius
 * law) between a narrow spout and a wide mouth. Both ends stay flat, open
 * rings, cappable exactly like `hyperboloid`'s.
 * @see [Wolfram MathWorld – Funnel]{@link https://mathworld.wolfram.com/Funnel.html}
 * @alias module:funnel
 * @param {FunnelOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function funnel({
  height = 1,
  radius = 0.1,
  radiusTop = radius * 5,
  nx = 32,
  ny = 16,
  capSegments = 1,
  capApex = true,
  capBase = true,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,
} = {}) {
  checkArguments(arguments);

  const halfHeight = height / 2;
  // r = radius·e^(k·(y+halfHeight)), fixed by r = radiusTop at y = halfHeight
  const k = Math.log(radiusTop / radius) / height;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;
    const r = radius * (radiusTop / radius) ** v;
    const x = r * cosPhi;
    const z = r * sinPhi;

    return {
      position: [x, height * v - halfHeight, z],
      // Gradient of x² + z² - r(y)² = 0, ie. (2x, -2k·r², 2z)
      normal: [x, -k * (x * x + z * z), z],
      collapsed: false,
    };
  }

  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
    capApex,
    capBase,
    capApexSegments: capSegments,
    capBaseSegments: capSegments,
    capMapping,
    equation,
  });

  return { positions, normals, uvs, cells };
}
