/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import { linear } from "../../utils/distribution.js";
import { computeFlatRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} FunnelOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.1] Spout radius, at y = -height/2
 * @property {number} [radiusApex=radius*5] Mouth radius, at y = height/2 - must
 *   be > radius for the usual flared-outward shape; radiusApex = radius
 *   degenerates to a plain cylinder, radiusApex < radius flips the taper (still
 *   a valid, NaN-free surface, just narrowing toward the top instead)
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Revolution of y = a·ln(r) (equivalently r = radius·e^(k·(y+height/2)), an
 * exponential - not linear (`cone`) or hyperbolic (`hyperboloid`) - radius law)
 * between a narrow spout and a wide mouth. Both ends stay flat, open rings,
 * cappable exactly like `hyperboloid`'s.
 *
 * @param {FunnelOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Funnel]{@link https://mathworld.wolfram.com/Funnel.html}
 */
export function funnel({
  height = 1,
  radius = 0.1,
  radiusApex = radius * 5,
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
  // r = radius·e^(k·(y + height/2)), fixed by r = radiusApex at y = height/2
  const k = Math.log(radiusApex / radius) / height;

  const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
    height,
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
    capApex,
    capBase,
    capSegments,
    capMapping,
    vDistribution,
    profile: (_, v) => {
      const r = radius * (radiusApex / radius) ** v;
      // Gradient of x² + z² - r(y)² = 0, ie. (2x, -2k·r², 2z)
      return [r, -k * (r * r)];
    },
  });

  return { positions, normals, uvs, cells };
}
