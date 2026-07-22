/** @module circle */
import { checkArguments, TAU } from "../../utils.js";

/**
 * @typedef {object} CircleOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * @alias module:circle
 * @param {CircleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath} `segments`
 *   positions and a single path cell of `segments` indices (`segments + 1`,
 *   repeating index `0`, when `closed`)
 */
export function circle({
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  checkArguments(arguments);

  const positions = new Float32Array(segments * 3);
  const path = Array.from({ length: segments + (closed ? 1 : 0) });

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * theta + thetaOffset;
    positions[i * 3] = radius * Math.cos(t);
    positions[i * 3 + 1] = radius * Math.sin(t);
    path[i] = i;
  }

  if (closed) path[segments] = 0;

  return { positions, cells: [path] };
}
