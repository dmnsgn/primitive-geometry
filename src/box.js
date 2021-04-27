/**
 * @module box
 */
/**
 * @typedef {Object} BoxOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 */

/**
 * @alias module:box
 * @param {BoxOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function box({ sx = 1, sy = sx, sz = sx } = {}) {
  const x = sx / 2;
  const y = sy / 2;
  const z = sz / 2;

  return {
    // prettier-ignore
    positions:  Float32Array.of(
      -x, y, z,
      -x, -y, z,
      x, -y, z,
      x, y, z,

      // -z
      x, y, -z,
      x, -y, -z,
      -x, -y, -z,
      -x, y, -z,
    ),
    // prettier-ignore
    cells: Uint8Array.of(
      0, 1, 2, 3, // +z
      3, 2, 5, 4, // +x
      4, 5, 6, 7, // -z
      7, 6, 1, 0, // -x
      7, 0, 3, 4, // +y
      1, 6, 5, 2, // -y
    ),
  };
}

export default box;
