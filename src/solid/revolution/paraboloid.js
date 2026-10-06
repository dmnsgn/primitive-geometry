/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import { linear } from "../../utils/distribution.js";
import { computeRevolutionGeometry } from "../../utils/revolution.js";

/**
 * @typedef {object} ParaboloidOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.5] Rim radius, at the open (base) end
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {import("../../../types.js").PositiveInteger} [capSegments=1]
 * @property {boolean} [capBase=true]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Circular paraboloid (revolution of x² + z² = k·(apexY - y), the classic
 * satellite-dish/reflector shape) - apex up, rim down, same orientation as
 * `cone`, and like `cone` only the rim end takes a cap option. Unlike a cone's
 * apex, the surface here is smooth at the apex (no crease), with a single
 * well-defined normal there.
 *
 * @param {ParaboloidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Paraboloid]{@link https://mathworld.wolfram.com/Paraboloid.html}
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
  vDistribution = linear,
  mergeSeam = false,
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
    mergeSeam,
    phiOffset,
    capBase,
    capBaseSegments: capSegments,
    capMapping,
    vDistribution,
    equation,
  });

  return { positions, normals, uvs, cells };
}
