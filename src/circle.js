/** @module circle */
import { checkArguments, getCellsTypedArray, TAU } from "./utils.js";

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
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function circle({
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  checkArguments(arguments);

  const positions = new Float32Array(segments * 3);
  const cells = new (getCellsTypedArray(segments))(
    (segments - (closed ? 0 : 1)) * 2,
  );

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * theta + thetaOffset;
    positions[i * 3] = radius * Math.cos(t);
    positions[i * 3 + 1] = radius * Math.sin(t);

    if (i > 0) {
      cells[(i - 1) * 2] = i - 1;
      cells[(i - 1) * 2 + 1] = i;
    }
  }

  if (closed) {
    cells[(segments - 1) * 2] = segments - 1;
    cells[(segments - 1) * 2 + 1] = 0;
  }

  return { positions, cells };
}

export default circle;
