/** @module hyperboloid */
import { rectangular } from "../../mappings.js";
import { checkArguments, computeRevolutionGeometry, TAU } from "../../utils.js";

/**
 * @typedef {object} HyperboloidOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25] Waist radius, at y = 0
 * @property {number} [radiusTop=radius*2] Rim radius, at y = ±height/2 (both
 * ends, symmetric) - the classic one-sheet shape needs radiusTop > radius
 * (pinched waist flaring to both rims); radiusTop = radius degenerates to a
 * plain cylinder, and radiusTop < radius traces an oblate-spheroid-like
 * profile instead (still a valid, NaN-free surface, just not a hyperbola)
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
 * Hyperboloid of one sheet (revolution of x² + z² = radius² + k·y², a
 * pinched-waist, flared-both-ends shape - cooling towers, gear/skew-roller
 * profiles) - `cylinder`'s own frustum equation with a hyperbolic (not
 * linear) radius law, so it shares its cappable, symmetric-around-neither-
 * pole structure: both ends are flat rings, not points, same as an
 * uncapped cylinder frustum.
 * @see [Wolfram MathWorld – One-Sheeted Hyperboloid]{@link https://mathworld.wolfram.com/One-SheetedHyperboloid.html}
 * @alias module:hyperboloid
 * @param {HyperboloidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
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
} = {}) {
  checkArguments(arguments);

  const halfHeight = height / 2;
  // r² = radius² + k·y², fixed by r = radiusTop at both y = ±halfHeight
  const k = (radiusTop * radiusTop - radius * radius) / (halfHeight * halfHeight);

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;
    const y = height * v - halfHeight;
    const r = Math.sqrt(radius * radius + k * y * y);
    const x = r * cosPhi;
    const z = r * sinPhi;

    return {
      position: [x, y, z],
      // Gradient of x² + z² - radius² - k·y² = 0, ie. (2x, -2k·y, 2z)
      normal: [x, -k * y, z],
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
