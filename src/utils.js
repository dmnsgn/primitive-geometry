/** @module utils */

/**
 * Two times PI.
 * @constant {number}
 */
export const TAU = Math.PI * 2;

/**
 * Two times PI.
 * @constant {number}
 */
export const HALF_PI = Math.PI / 2;

/**
 * Square root of 2.
 * @constant {number}
 */
export const SQRT2 = Math.sqrt(2);

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
export const TMP = [0, 0, 0];

/**
 * @private
 */
export const PLANE_DIRECTIONS = {
  z: [0, 1, 2, 1, -1, 1],
  "-z": [0, 1, 2, -1, -1, -1],
  "-x": [2, 1, 0, 1, -1, -1],
  x: [2, 1, 0, -1, -1, 1],
  y: [0, 2, 1, 1, 1, 1],
  "-y": [0, 2, 1, 1, -1, -1],
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
  pw = 0,
  quads = false,
  uvScale = [1, 1],
  uvOffset = [0, 0],
  center = [0, 0, 0],
  ccw = true,
) {
  const { positions, normals, uvs, cells } = geometry;
  const [u, v, w, flipU, flipV, normal] = PLANE_DIRECTIONS[direction];

  const vertexOffset = indices.vertex;

  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      positions[indices.vertex * 3 + u] =
        (-su / 2 + (i * su) / nu) * flipU + center[u];
      positions[indices.vertex * 3 + v] =
        (-sv / 2 + (j * sv) / nv) * flipV + center[v];
      positions[indices.vertex * 3 + w] = pw + center[w];

      normals[indices.vertex * 3 + w] = normal;

      uvs[indices.vertex * 2] = (i / nu) * uvScale[0] + uvOffset[0];
      uvs[indices.vertex * 2 + 1] = (1 - j / nv) * uvScale[1] + uvOffset[1];

      indices.vertex++;

      if (j < nv && i < nu) {
        const n = vertexOffset + j * (nu + 1) + i;
        if (quads) {
          const o = vertexOffset + (j + 1) * (nu + 1) + i;
          cells[indices.cell] = n;
          cells[indices.cell + 1] = o;
          cells[indices.cell + 2] = o + 1;
          cells[indices.cell + 3] = n + 1;
        } else {
          cells[indices.cell] = n;
          cells[indices.cell + (ccw ? 1 : 2)] = n + nu + 1;
          cells[indices.cell + (ccw ? 2 : 1)] = n + nu + 2;

          cells[indices.cell + 3] = n;
          cells[indices.cell + (ccw ? 4 : 5)] = n + nu + 2;
          cells[indices.cell + (ccw ? 5 : 4)] = n + 1;
        }
        indices.cell += quads ? 4 : 6;
      }
    }
  }

  return geometry;
}
