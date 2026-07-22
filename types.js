/**
 * @typedef {object} SimplicialComplex Geometry definition.
 * @property {Float32Array} positions
 * @property {Float32Array} normals
 * @property {Float32Array} uvs
 * @property {(Uint8Array|Uint16Array|Uint32Array)} cells
 */

/**
 * @typedef {object} SimplicialComplexPolygon Geometry polygon definition: each
 * cell is a closed n-gon face (implicitly wraps its last index back to its
 * first - never repeat the first index at the end).
 * @property {Float32Array} positions
 * @property {Float32Array} [normals]
 * @property {Float32Array} [uvs]
 * @property {Array<number[]|Uint8Array|Uint16Array|Uint32Array>} cells
 */

/**
 * @typedef {object} SimplicialComplexPath Geometry path definition: each cell
 * is an open polyline (no implicit closing edge between its last and first
 * index); repeat the first index at the end of a cell to close that loop
 * explicitly.
 * @property {Float32Array} positions
 * @property {Array<number[]|Uint8Array|Uint16Array|Uint32Array>} cells
 */

export {};
