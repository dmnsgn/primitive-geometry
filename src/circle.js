/**
 * @module circle
 */
import { getCellsTypedArray, TAU } from "./utils.js";

/**
 * @typedef {Object} BoxOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 */

/**
 * @alias module:circle
 * @param {BoxOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function circle({ radius = 0.5, segments = 32 } = {}) {
  const positions = new Float32Array(segments * 2);
  const cells = new (getCellsTypedArray(segments))((segments - 1) * 2);

  for (let i = 0; i < segments; i++) {
    positions[i * 2] = radius * Math.cos((i / segments) * TAU);
    positions[i * 2 + 1] = radius * Math.sin((i / segments) * TAU);

    if (i > 0) {
      cells[(i - 1) * 2] = i - 1;
      cells[(i - 1) * 2 + 1] = i;
    }
  }

  return {
    positions: positions,
    cells: cells,
  };
}

export default circle;
