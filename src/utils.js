/**
 * @module utils
 */

/**
 * Two times PI.
 * @constant {number}
 */
export const TAU = Math.PI * 2;

/**
 * Normalize a vector 3.
 * @param {number[]} v Vector 3 array
 * @returns {number[]} Normalized vector
 */
export function normalize(v) {
  const l = 1 / (Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1);
  v[0] *= l;
  v[1] *= l;
  v[2] *= l;
  return v;
}

/**
 * Ensure first argument passed to the primitive functions is an object
 * @param {...*} args
 */
export function checkArguments(args) {
  const argumentType = typeof args[0];
  if (argumentType !== "object" && argumentType !== "undefined") {
    console.error("First argument must be an object.");
  }
}

/**
 * @private
 */
let TYPED_ARRAY_TYPE;

/**
 * Enforce a typed array constructor for cells
 * @param {(Class<Uint8Array>|Class<Uint16Array>|Class<Uint32Array>)} type
 */
export function setTypedArrayType(type) {
  TYPED_ARRAY_TYPE = type;
}

/**
 * Select cells typed array from a size determined by amount of vertices.
 *
 * @param {number} size The max value expected
 * @returns {(Uint8Array|Uint16Array|Uint32Array)}
 * @see [MDN TypedArray objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects}
 */
export const getCellsTypedArray = (size) =>
  TYPED_ARRAY_TYPE ||
  (size <= 255 ? Uint8Array : size <= 65535 ? Uint16Array : Uint32Array);
/**
 * @private
 */
const PLANE_DIRECTIONS = {
  z: [0, 1, 2, 1, -1],
  "-z": [0, 1, 2, -1, -1],
  "-x": [2, 1, 0, 1, -1],
  x: [2, 1, 0, -1, -1],
  y: [0, 2, 1, 1, 1],
  "-y": [0, 2, 1, 1, -1],
};

/**
 * @private
 */
export function computePlane(
  geometry,
  indices,
  su,
  sv,
  nu,
  nv,
  direction = "z",
  pw = 0
) {
  const { positions, normals, uvs, cells } = geometry;
  const [u, v, w, flipU, flipV] = PLANE_DIRECTIONS[direction];

  const vertexOffset = indices.vertex;

  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      positions[indices.vertex * 3 + u] = (-su / 2 + (i * su) / nu) * flipU;
      positions[indices.vertex * 3 + v] = (-sv / 2 + (j * sv) / nv) * flipV;
      positions[indices.vertex * 3 + w] = pw;

      normals[indices.vertex * 3 + u] = 0;
      normals[indices.vertex * 3 + v] = 0;
      normals[indices.vertex * 3 + w] = pw / Math.abs(pw);

      uvs[indices.vertex * 2] = i / nu;
      uvs[indices.vertex * 2 + 1] = 1 - j / nv;

      indices.vertex++;

      if (j < nv && i < nu) {
        const n = vertexOffset + j * (nu + 1) + i;
        cells[indices.cell] = n;
        cells[indices.cell + 1] = n + nu + 1;
        cells[indices.cell + 2] = n + nu + 2;

        cells[indices.cell + 3] = n;
        cells[indices.cell + 4] = n + nu + 2;
        cells[indices.cell + 5] = n + 1;
        indices.cell += 6;
      }
    }
  }

  return geometry;
}
