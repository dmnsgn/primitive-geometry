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
 * @property {number} [radiusBase=0.1] Spout radius.
 * @property {number} [radiusApex=0.5] Mouth radius.
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {boolean} [capBase=true]
 * @property {boolean} [capApex=true]
 * @property {import("../../../types.js").PositiveInteger} [capBaseSegments=1]
 * @property {import("../../../types.js").PositiveInteger} [capApexSegments=1]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A funnel: a logarithmic profile from spout to mouth.
 *
 * Special cases: cylinder (radiusApex = radiusBase).
 *
 * @param {FunnelOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Funnel]{@link https://mathworld.wolfram.com/Funnel.html}
 */
export function funnel({
  height = 1,
  radiusBase = 0.1,
  radiusApex = 0.5,
  nx = 32,
  ny = 16,
  capBase = true,
  capApex = true,
  capBaseSegments = 1,
  capApexSegments = 1,
  phi = TAU,
  phiOffset = 0,
  capMapping = rectangular,
  vDistribution = linear,
  mergeSeam = false,
} = {}) {
  // r = radiusBase·e^(k·(y + height/2)), with r = radiusApex at the top
  const k = Math.log(radiusApex / radiusBase) / height;

  const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
    height,
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
    vDistribution,
    profile: (_, v) => {
      const r = radiusBase * (radiusApex / radiusBase) ** v;
      // Gradient of x² + z² - r(y)² = 0, ie. (2x, -2k·r², 2z)
      return [r, -k * (r * r)];
    },
  });

  return { positions, normals, uvs, cells };
}
