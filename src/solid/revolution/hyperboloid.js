/** @module hyperboloid */
import { rectangular } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import { linear } from "../../utils/distribution.js";
import { computeFlatRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} HyperboloidOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25] Waist radius, at y = 0
 * @property {number} [radiusTop=radius*2] Rim radius, at y = ±height/2 (both
 *   ends, symmetric) - the classic one-sheet shape needs radiusTop > radius
 *   (pinched waist flaring to both rims); radiusTop = radius degenerates to a
 *   plain cylinder, and radiusTop < radius traces an oblate-spheroid-like
 *   profile instead (still a valid, NaN-free surface, just not a hyperbola)
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
 */

/**
 * Hyperboloid of one sheet (revolution of x² + z² = radius² + k·y², a
 * pinched-waist, flared-both-ends shape - cooling towers, gear/skew-roller
 * profiles). Both ends are flat rings, not points, cappable like `cylinder`'s
 * frustum.
 *
 * @param {HyperboloidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @alias module:hyperboloid
 * @see [Wolfram MathWorld – One-Sheeted Hyperboloid]{@link https://mathworld.wolfram.com/One-SheetedHyperboloid.html}
 */
export function hyperboloid({
  height = 1,
  radius = 0.25,
  radiusTop = radius * 2,
  nx = 32,
  ny = 16,
  capSegments = 1,
  capApex = true,
  capBase = true,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,
  vDistribution = linear,
} = {}) {
  const halfHeight = height / 2;
  // r² = radius² + k·y², fixed by r = radiusTop at both y = ±halfHeight
  const k =
    (radiusTop * radiusTop - radius * radius) / (halfHeight * halfHeight);

  const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
    height,
    nx,
    ny,
    phi,
    phiOffset,
    capApex,
    capBase,
    capSegments,
    capMapping,
    vDistribution,
    // Gradient of x² + z² - radius² - k·y² = 0, ie. (2x, -2k·y, 2z)
    profile: (y) => [Math.sqrt(radius * radius + k * y * y), -k * y],
  });

  return { positions, normals, uvs, cells };
}
