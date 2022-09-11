/** @module tetrahedron */
import cylinder from "./cylinder.js";
import { checkArguments } from "./utils.js";

/**
 * @typedef {Object} TetrahedronOptions
 * @property {number} [radius=0.5]
 */

/**
 * @alias module:tetrahedron
 * @param {TetrahedronOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function tetrahedron({ radius = 0.5 } = {}) {
  checkArguments(arguments);

  return cylinder({
    height: radius * 1.5,
    radius,
    nx: 3,
    ny: 1,

    radiusApex: 0,
    capSegments: 0,
    capApex: false,
    capBaseSegments: 1,
  });
}

export default tetrahedron;
