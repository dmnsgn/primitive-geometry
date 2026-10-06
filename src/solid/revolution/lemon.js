/**
 * @module primitiveGeometry
 * @ignore
 */
import { TAU } from "../../utils/common.js";
import { computeSpindleArcRevolution } from "../../utils/revolution.js";

/**
 * @typedef {object} LemonOptions
 * @property {number} [radius=0.3] Equatorial radius.
 * @property {number} [height=1] Height between the tips, raised to at least
 *   radius * 2.
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A lemon: a minor circular arc revolved about its chord, `apple`'s complement.
 *
 * Special cases: sphere (height = radius * 2).
 *
 * @param {LemonOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wikipedia – Lemon (geometry)]{@link https://en.wikipedia.org/wiki/Lemon_(geometry)}
 */
export function lemon({
  radius = 0.3,
  height = 1,
  nx = 32,
  ny = 16,
  phi = TAU,
  phiOffset = 0,
  mergeSeam = false,
} = {}) {
  const halfHeight = Math.max(height, radius * 2) / 2;

  // apple's solve, with radius = a - d
  const aPlusD = (halfHeight * halfHeight) / radius;
  const a = (radius + aPlusD) / 2;
  const d = aPlusD - a;

  // Passed as is, as in apple
  const thetaLemon = Math.acos(d / a);

  const { positions, normals, uvs, cells } = computeSpindleArcRevolution({
    a,
    halfHeight,
    thetaCross: thetaLemon,
    poleCosTheta: d / a,
    radiusAt: (cosTheta) => a * cosTheta - d,
    nx,
    ny,
    phi,
    mergeSeam,
    phiOffset,
  });

  return { positions, normals, uvs, cells };
}
