import { checkArguments, getCellsTypedArray, TAU } from "./utils.js";
/** @module disc */

/**
 * @typedef {Object} DiscOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 */

/**
 * @alias module:disc
 * @param {DiscOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function disc({ radius = 0.5, segments = 32, theta = TAU } = {}) {
  checkArguments(arguments);

  const size = segments + 2;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))((size + 2) * 3);

  // Center
  normals[2] = 1;
  uvs[0] = 0.5;
  uvs[1] = 0.5;

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * theta;

    positions[(i + 1) * 3] = radius * Math.cos(t);
    positions[(i + 1) * 3 + 1] = radius * Math.sin(t);

    normals[(i + 1) * 3 + 2] = 1;

    uvs[(i + 1) * 2] = (positions[(i + 1) * 3] / radius + 1) / 2;
    uvs[(i + 1) * 2 + 1] = (positions[(i + 1) * 3 + 1] / radius + 1) / 2;

    cells[(i + 1) * 3] = i;
    cells[(i + 1) * 3 + 1] = i + 1;
  }

  return { positions, normals, uvs, cells };
}

export default disc;
