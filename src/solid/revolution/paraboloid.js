/** @module paraboloid */
import { rectangular } from "../../mappings.js";
import { computeRevolutionGeometry, TAU } from "../../utils.js";

/**
 * @typedef {object} ParaboloidOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.5] Rim radius, at the open (base) end
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [capSegments=1]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {Function} [capMapping=mappings.rectangular]
 */

/**
 * Circular paraboloid (revolution of x² + z² = k·(apexY - y), the classic
 * satellite-dish/reflector shape) - apex up, rim down, same orientation
 * convention as `cone`, and like `cone` only the rim end (naturally open)
 * takes a cap option; the apex is a single point but - unlike a cone's -
 * has one genuine tangent plane there (the surface is smooth, not
 * creased), so its normal is well-defined and shared across every column
 * instead of needing cone's per-column duplicates.
 * @see [Wolfram MathWorld – Paraboloid]{@link https://mathworld.wolfram.com/Paraboloid.html}
 * @alias module:paraboloid
 * @param {ParaboloidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function paraboloid({
  height = 1,
  radius = 0.5,
  nx = 32,
  ny = 16,
  capSegments = 1,
  capBase = true,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,
} = {}) {

  const halfHeight = height / 2;
  // r² = k·(halfHeight - y), fixed by r = radius at the rim (y = -halfHeight)
  const k = (radius * radius) / height;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;
    const r = radius * Math.sqrt(1 - v);
    const x = r * cosPhi;
    const z = r * sinPhi;

    return {
      position: [x, -halfHeight + height * v, z],
      // Gradient of x² + z² - k·(halfHeight - y) = 0, ie. (2x, k, 2z)
      normal: [x, k / 2, z],
      collapsed: r === 0,
    };
  }

  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
    capBase,
    capBaseSegments: capSegments,
    capMapping,
    equation,
  });

  return { positions, normals, uvs, cells };
}
