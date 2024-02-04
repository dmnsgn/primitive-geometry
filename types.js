/**
 * @typedef {object} BasicSimplicialComplex Geometry definition without normals and UVs.
 * @property {Float32Array} positions
 * @property {(Uint8Array|Uint16Array|Uint32Array)} cells
 */

/**
 * @typedef {object} SimplicialComplex Geometry definition.
 * @property {Float32Array} positions
 * @property {Float32Array} normals
 * @property {Float32Array} uvs
 * @property {(Uint8Array|Uint16Array|Uint32Array)} cells
 */

export {};
