/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import { linear } from "../../utils/distribution.js";
import { computeFlatRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} HyperboloidOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25] Waist radius, at y = 0
 * @property {number} [endRadius=radius*2] Rim radius, at y = ±height/2 (both
 *   ends, symmetric) - the classic one-sheet shape needs endRadius > radius
 *   (pinched waist flaring to both rims); endRadius = radius degenerates to a
 *   plain cylinder, and endRadius < radius traces an oblate-spheroid-like
 *   profile instead (still a valid, NaN-free surface, just not a hyperbola)
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {import("../../../types.js").PositiveInteger} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Hyperboloid of one sheet (revolution of x² + z² = radius² + k·y², a
 * pinched-waist, flared-both-ends shape - cooling towers, gear/skew-roller
 * profiles). Both ends are flat rings, not points, cappable like `cylinder`'s
 * frustum.
 *
 * @param {HyperboloidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – One-Sheeted Hyperboloid]{@link https://mathworld.wolfram.com/One-SheetedHyperboloid.html}
 */
export function hyperboloid({
  height = 1,
  radius = 0.25,
  endRadius = radius * 2,
  nx = 32,
  ny = 16,
  capSegments = 1,
  capApex = true,
  capBase = true,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,
  vDistribution = linear,
  mergeSeam = false,
} = {}) {
  const halfHeight = height / 2;
  // r² = radius² + k·y², fixed by r = endRadius at both y = ±halfHeight
  const k =
    (endRadius * endRadius - radius * radius) / (halfHeight * halfHeight);

  const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
    height,
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
    capApex,
    capBase,
    capApexSegments: capSegments,
    capBaseSegments: capSegments,
    capMapping,
    vDistribution,
    // Gradient of x² + z² - radius² - k·y² = 0, ie. (2x, -2k·y, 2z)
    profile: (y) => [Math.sqrt(radius * radius + k * y * y), -k * y],
  });

  return { positions, normals, uvs, cells };
}
