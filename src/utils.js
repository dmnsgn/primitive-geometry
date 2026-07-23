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
 * Square root of 3.
 * @constant {number}
 */
export const SQRT3 = Math.sqrt(3);

/**
 * Golden ratio: (1 + √5) / 2.
 * @constant {number}
 */
export const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * Ratio of a regular star polygon {points/density}'s inner (notch) radius to
 * its outer (tip) radius, ie. cos(density * PI / points) / cos((density - 1)
 * * PI / points). `computeStarRatio(5, 2)` is `1 / PHI ** 2`, the pentagram's
 * fixed ratio.
 * @param {number} points
 * @param {number} [density=2] Default is `2`
 * @returns {number}
 * @see [Wolfram MathWorld – Star Polygon]{@link https://mathworld.wolfram.com/StarPolygon.html}
 */
export function computeStarRatio(points, density = 2) {
  return (
    Math.cos((density * Math.PI) / points) /
    Math.cos(((density - 1) * Math.PI) / points)
  );
}

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
 * Fan-triangulate a list of closed n-gon faces (a
 * `SimplicialComplexPolygon`'s `cells`, e.g. `[0, 1, 2, 3]`) from each face's
 * first corner into a flat, stride-3 `SimplicialComplex`-style typed array
 * (e.g. `[0, 1, 2, 0, 2, 3]`). Only valid for convex, planar faces - the same
 * assumption `polyhedron.js` makes for its own (subdivision/projection aware)
 * fan triangulation.
 * @param {Array<number[]|Uint8Array|Uint16Array|Uint32Array>} cells
 * @param {number} numVertices Used to pick the returned typed array's element size
 * @returns {(Uint8Array|Uint16Array|Uint32Array)}
 */
export function triangulateFaces(cells, numVertices) {
  let numTriangles = 0;
  for (const face of cells) numTriangles += face.length - 2;

  const triangles = new (getCellsTypedArray(numVertices))(numTriangles * 3);

  let index = 0;
  for (const face of cells) {
    for (let i = 1; i < face.length - 1; i++) {
      triangles[index] = face[0];
      triangles[index + 1] = face[i];
      triangles[index + 2] = face[i + 1];
      index += 3;
    }
  }

  return triangles;
}

/**
 * Concatenate SimplicialComplex geometries into one, offsetting each one's
 * cell indices by the running vertex count. Positions coincident across
 * inputs (eg. two bands sharing a seam) stay as separate, unwelded vertices.
 * @param {import("../types.js").SimplicialComplex[]} geometries
 * @returns {import("../types.js").SimplicialComplex}
 * @private
 */
export function concatGeometries(geometries) {
  let vertexCount = 0;
  let cellCount = 0;
  for (const { positions, cells } of geometries) {
    vertexCount += positions.length / 3;
    cellCount += cells.length;
  }

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const cells = new (getCellsTypedArray(vertexCount))(cellCount);

  let vertexOffset = 0;
  let cellIndex = 0;

  for (const geometry of geometries) {
    positions.set(geometry.positions, vertexOffset * 3);
    normals.set(geometry.normals, vertexOffset * 3);
    uvs.set(geometry.uvs, vertexOffset * 2);

    for (let i = 0; i < geometry.cells.length; i++, cellIndex++) {
      cells[cellIndex] = geometry.cells[i] + vertexOffset;
    }

    vertexOffset += geometry.positions.length / 3;
  }

  return { positions, normals, uvs, cells };
}

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
 * Plane as a single welded grid, optionally with rounded corners
 * (radius/roundSegments > 0): [roundSegments|nu|roundSegments] x
 * [roundSegments|nv|roundSegments] so face, edges and corners share their
 * boundary vertices, with radial diagonals in the corner quads. su/sv are the
 * inner face sizes (full size minus 2 * radius) and collapse to the plain
 * su/sv grid when radius/roundSegments are 0.
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
  uvScale = [1, 1],
  uvOffset = [0, 0],
  center = [0, 0, 0],
  ccw = true,
  radius = 0,
  roundSegments = 0,
) {
  const { positions, normals, uvs, cells } = geometry;
  const [u, v, w, flipU, flipV, normal] = PLANE_DIRECTIONS[direction];

  const cols = 2 * roundSegments + nu;
  const rows = 2 * roundSegments + nv;

  const width = su + 2 * radius;
  const height = sv + 2 * radius;

  // Piecewise sampling so region boundaries are computed once and bit-exact;
  // n = 0 collapses the straight section into a single welded column;
  // collapses to a plain -size/2 + index * size/n grid when roundSegments = 0
  const coordinate = (index, n, size) =>
    index < roundSegments
      ? -size / 2 - radius + (index * radius) / roundSegments
      : index <= roundSegments + n
        ? -size / 2 + (n ? ((index - roundSegments) * size) / n : 0)
        : size / 2 + ((index - roundSegments - n) * radius) / roundSegments;

  const vertexOffset = indices.vertex;

  for (let j = 0; j <= rows; j++) {
    const y = coordinate(j, nv, sv);

    for (let i = 0; i <= cols; i++) {
      const x = coordinate(i, nu, su);

      positions[indices.vertex * 3 + u] = x * flipU + center[u];
      positions[indices.vertex * 3 + v] = y * flipV + center[v];
      positions[indices.vertex * 3 + w] = pw + center[w];

      normals[indices.vertex * 3 + w] = normal;

      uvs[indices.vertex * 2] =
        ((x + width / 2) / width) * uvScale[0] + uvOffset[0];
      uvs[indices.vertex * 2 + 1] =
        (1 - (y + height / 2) / height) * uvScale[1] + uvOffset[1];

      indices.vertex++;

      if (j < rows && i < cols) {
        const n = vertexOffset + j * (cols + 1) + i;
        const o = n + cols + 1;

        const isCornerU = i < roundSegments || i >= roundSegments + nu;
        const isCornerV = j < roundSegments || j >= roundSegments + nv;

        if (isCornerU && isCornerV && i < roundSegments !== j < roundSegments) {
          // Anti-diagonal so corner quad seams are radial
          cells[indices.cell] = n + 1;
          cells[indices.cell + (ccw ? 1 : 2)] = n;
          cells[indices.cell + (ccw ? 2 : 1)] = o;

          cells[indices.cell + 3] = n + 1;
          cells[indices.cell + (ccw ? 4 : 5)] = o;
          cells[indices.cell + (ccw ? 5 : 4)] = o + 1;
        } else {
          cells[indices.cell] = n;
          cells[indices.cell + (ccw ? 1 : 2)] = o;
          cells[indices.cell + (ccw ? 2 : 1)] = o + 1;

          cells[indices.cell + 3] = n;
          cells[indices.cell + (ccw ? 4 : 5)] = o + 1;
          cells[indices.cell + (ccw ? 5 : 4)] = n + 1;
        }
        indices.cell += 6;
      }
    }
  }

  return geometry;
}
