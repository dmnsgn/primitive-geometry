/** @module barrel */
import { rectangular } from "../../mappings.js";
import { checkArguments, computeRevolutionGeometry, TAU } from "../../utils.js";

/**
 * @typedef {object} BarrelOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.5] Belly radius, at the equator (y = 0)
 * @property {number} [endRadius=radius*0.7] Rim radius, at y = ±height/2
 * (both ends, symmetric) - must be < radius for an actual outward bulge;
 * endRadius = radius degenerates to a plain cylinder, endRadius > radius
 * pinches inward instead (a barrel held together the wrong way round, still
 * a valid NaN-free surface)
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
 * Barrel/cask: a cylinder that bulges outward at the equator and tapers
 * back to a narrower flat rim at both ends (`hyperboloid`'s own frustum
 * structure, with a parabolic - not hyperbolic - radius law, curving the
 * other way: outward from the ends toward the middle instead of outward
 * from a pinched waist). Unlike `superegg` (which also bulges but tapers
 * all the way to a point at each pole), both ends here stay flat, open
 * rings, cappable exactly like `cylinder`'s.
 * @alias module:barrel
 * @param {BarrelOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function barrel({
  height = 1,
  radius = 0.5,
  endRadius = radius * 0.7,
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
  // r = radius - k·y², fixed by r = endRadius at both y = ±halfHeight
  const k = (radius - endRadius) / (halfHeight * halfHeight);

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;
    const y = height * v - halfHeight;
    const r = radius - k * y * y;
    const x = r * cosPhi;
    const z = r * sinPhi;

    return {
      position: [x, y, z],
      // Gradient of x² + z² - radius + k·y² = 0, ie. (2x, 2k·y, 2z)
      normal: [x, k * y, z],
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
