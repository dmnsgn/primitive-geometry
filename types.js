/** @typedef {number[] | Uint8Array | Uint16Array | Uint32Array} TypedArrayLike */

/** @typedef {number} PositiveInteger Integer >= 1. */

/** @typedef {number} NonNegativeInteger Integer >= 0. */

/** @typedef {number} Angle In radians. */

/** @typedef {number} PolarAngle In radians, from the pole, within [0, π]. */

/**
 * @typedef {object} SimplicialComplex Triangle cells over shared positions.
 * @property {Float32Array} positions
 * @property {Float32Array} normals
 * @property {Float32Array} uvs
 * @property {Uint8Array | Uint16Array | Uint32Array} cells
 */

/**
 * @typedef {object} PolygonalComplex Polygon cells over shared positions: each
 *   cell is a closed n-gon (implicitly wraps its last index back to its first -
 *   never repeat the first index at the end).
 * @property {Float32Array} positions
 * @property {Float32Array} [normals]
 * @property {Float32Array} [uvs]
 * @property {TypedArrayLike[]} cells
 */

/**
 * @typedef {object} PolylineComplex Polyline cells over shared positions: each
 *   cell is an open polyline (no implicit closing edge between its last and
 *   first index); repeat the first index at the end of a cell to close that
 *   loop explicitly.
 * @property {Float32Array} positions
 * @property {TypedArrayLike[]} cells
 */

export {};
