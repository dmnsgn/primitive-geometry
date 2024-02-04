/** @module icosahedron */
import icosphere from "./icosphere.js";
import { checkArguments } from "./utils.js";

/**
 * @typedef {object} IcosahedronOptions
 * @property {number} [radius=0.5]
 */

/**
 * @alias module:icosahedron
 * @param {IcosahedronOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function icosahedron({ radius } = {}) {
  checkArguments(arguments);

  return icosphere({ subdivisions: 0, radius });
}

export default icosahedron;
