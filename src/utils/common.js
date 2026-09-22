/**
 * @module utils
 * @ignore
 */

/**
 * Two times PI.
 *
 * @constant {number}
 */
export const TAU = Math.PI * 2;

/**
 * Half of PI.
 *
 * @constant {number}
 */
export const HALF_PI = Math.PI / 2;

/**
 * Square root of 2.
 *
 * @constant {number}
 */
export const SQRT2 = Math.sqrt(2);

/**
 * Square root of 3.
 *
 * @constant {number}
 */
export const SQRT3 = Math.sqrt(3);

/**
 * Square root of 6.
 *
 * @constant {number}
 */
export const SQRT6 = Math.sqrt(6);

/**
 * Golden ratio: (1 + √5) / 2.
 *
 * @constant {number}
 */
export const PHI = (1 + Math.sqrt(5)) / 2;

// Math

/**
 * Ratio of a regular star polygon {points/density}'s inner (notch) radius to
 * its outer (tip) radius, ie. cos(density * PI / points) / cos((density - 1)
 *
 * - PI / points). `computeStarRatio(5, 2)` is `1 / PHI ** 2`, the pentagram's
 *   fixed ratio.
 *
 * @private
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
 *
 * @private
 * @param {number[]} v Vector 3 array
 * @returns {number[]} Normalized vector
 */
export function normalize(v) {
  // eslint-disable-next-line unicorn/prefer-modern-math-apis
  const l = 1 / (Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1);
  v[0] *= l;
  v[1] *= l;
  v[2] *= l;
  return v;
}

/**
 * Restrict a value to [min, max].
 *
 * @private
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Clamp a theta/thetaOffset meridian sweep to [0, PI]: thetaOffset first (0 =
 * north pole), then theta to whatever range keeps thetaOffset + theta inside
 * [0, PI] too. Shared by every meridian-based revolution shape (ellipsoid,
 * superellipsoid, superegg, hollowSphere's cut caps): a pole can only sit at
 * the sweep's own start or end, never partway through.
 *
 * @private
 * @param {number} theta
 * @param {number} thetaOffset
 * @returns {[number, number] | undefined} ClampedTheta, clampedThetaOffset
 */
export function clampMeridianSweep(theta, thetaOffset) {
  const clampedThetaOffset = clamp(thetaOffset, 0, Math.PI);
  const clampedTheta = clamp(
    theta,
    -clampedThetaOffset,
    Math.PI - clampedThetaOffset,
  );
  return [clampedTheta, clampedThetaOffset];
}

/**
 * Linear interpolation between a and b at t.
 *
 * @private
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Snap a near-zero value to exact 0. Math.cos/sin of an exact multiple of PI/2
 * aren't bit-exact (eg. Math.cos(Math.PI / 2) is ~6e-17) - left as-is, that
 * residual can make two vertices meant to be identical (a pole, a wrap seam)
 * compare as distinct and read as a crack, or - raised to a negative signedPow
 * exponent - explode into a huge, effectively-random-signed value.
 *
 * @private
 * @param {number} x
 * @returns {number}
 */
export function snapToZero(x) {
  return Math.abs(x) < 1e-9 ? 0 : x;
}

/**
 * X raised to a signed power: sign(x) * |x|^e. Used for superquadric/
 * superellipse curves, where e can be a fraction (even < 1, a pinched cusp) and
 * x negative - plain `x ** e` is only defined for non-negative x. x = 0
 * short-circuits to 0, avoiding both `0 ** negative` (Infinity) and JS's `0 **
 * 0 = 1` quirk; the true tangent at a pinched pole is a genuine cusp with no
 * well-defined direction anyway, so 0 is as good a fallback as any.
 *
 * @private
 * @param {number} x
 * @param {number} e
 * @returns {number}
 */
export function signedPow(x, e) {
  return x === 0 ? 0 : Math.sign(x) * Math.abs(x) ** e;
}

/** @private */
export function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/** @private */
export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// Below this angle (radians), two slerp endpoints are treated as coincident
// to avoid a 0/0 division
const SLERP_MIN_ANGLE = 1e-6;

// Below this combined barycentric weight, a point is treated as sitting
// exactly at the fan apex to avoid a 0/0 division
const BARYCENTRIC_MIN_WEIGHT = 1e-9;

/**
 * Point on the great circle between unit vectors p and q, at fraction t.
 *
 * @private
 */
export function slerp(p, q, t) {
  const cosTheta = Math.min(1, Math.max(-1, dot(p, q)));
  const theta = Math.acos(cosTheta);
  if (theta < SLERP_MIN_ANGLE) return normalize([...p]);

  const sinTheta = Math.sin(theta);
  const wp = Math.sin((1 - t) * theta) / sinTheta;
  const wq = Math.sin(t * theta) / sinTheta;
  return [p[0] * wp + q[0] * wq, p[1] * wp + q[1] * wq, p[2] * wp + q[2] * wq];
}

/**
 * Barycentric point (weight v toward uB, w toward uC) on a spherical triangle
 * of unit vectors, via nested slerp along BC then A to that point.
 *
 * @private
 */
export function slerpTriangle(uA, uB, uC, v, w) {
  return v + w < BARYCENTRIC_MIN_WEIGHT
    ? normalize([...uA])
    : slerp(uA, slerp(uB, uC, w / (v + w)), v + w);
}

// Geometry

/**
 * A single triangle, 3x oversized so its 3 vertices land past every edge of the
 * [-1, 1] clip-space square: the standard vertex-shader trick for a fullscreen
 * pass (rasterizes to exactly the viewport once clipped, with no diagonal seam
 * and no overdraw compared to a quad split into 2 triangles). xy positions
 * only
 *
 * - No z, no normals/uvs, no cells - since a fullscreen pass reads screen-space
 *   data directly (`gl_FragCoord`, or a uv derived from the clip position
 *   in-shader) rather than interpolated vertex attributes, and needs no index
 *   buffer for a single triangle.
 *
 * @returns {{ positions: Float32Array }}
 */
export function fullscreenTriangle() {
  return {
    // prettier-ignore
    positions: Float32Array.of(
      -1, -1,
      3, -1,
      -1, 3,
    ),
  };
}

/** @private */
let TYPED_ARRAY_TYPE;

/**
 * Enforce a typed array constructor for cells
 *
 * @param {Class<Uint8Array> | Class<Uint16Array> | Class<Uint32Array>} type
 */
export function setTypedArrayType(type) {
  TYPED_ARRAY_TYPE = type;
}

/**
 * Select cells typed array from a size determined by amount of vertices.
 *
 * @param {number} size The max value expected
 * @returns {Uint8Array | Uint16Array | Uint32Array}
 * @see [MDN TypedArray objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects}
 */
export const getCellsTypedArray = (size) =>
  TYPED_ARRAY_TYPE ||
  (size <= 255 ? Uint8Array : size <= 65_535 ? Uint16Array : Uint32Array);

/**
 * Fan-triangulate a list of closed n-gon faces (a `SimplicialComplexPolygon`'s
 * `cells`, e.g. `[0, 1, 2, 3]`) from each face's last corner into a flat,
 * stride-3 `SimplicialComplex`-style typed array (e.g. `[3, 0, 1, 3, 1, 2]`).
 * Anchoring on the last corner rather than the first is deliberate for quads:
 * for the BL/BR/TR/TL winding used by eg. `rectanglePath`, it splits the quad
 * along the same diagonal a row-major `TRIANGLE_STRIP` produces (and that
 * `computePlane`/`computePolarGeometry`/ `computeRevolutionGeometry` already
 * use), so displacement in a vertex shader creases consistently across every
 * primitive in this library. Only valid for convex, planar faces.
 *
 * @param {import("../../types.js").TypedArrayLike[]} cells
 * @param {number} numVertices Used to pick the returned typed array's element
 *   size
 * @returns {Uint8Array | Uint16Array | Uint32Array}
 */
export function triangulateFaces(cells, numVertices) {
  let numTriangles = 0;
  for (const face of cells) numTriangles += face.length - 2;

  const triangles = new (getCellsTypedArray(numVertices))(numTriangles * 3);

  let index = 0;
  for (const face of cells) {
    const anchor = face.at(-1);
    for (let i = 0; i < face.length - 2; i++) {
      triangles[index] = anchor;
      triangles[index + 1] = face[i];
      triangles[index + 2] = face[i + 1];
      index += 3;
    }
  }

  return triangles;
}

/**
 * Concatenate SimplicialComplex geometries into one, offsetting each one's cell
 * indices by the running vertex count. Positions coincident across inputs (eg.
 * two bands sharing a seam) stay as separate, unwelded vertices.
 *
 * @param {import("../../types.js").SimplicialComplex[]} geometries
 * @returns {import("../../types.js").SimplicialComplex}
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
 * Flip a geometry inside-out: negate every normal and swap 2 of each triangle's
 * 3 indices so winding stays consistent with the flipped normal. Used to turn
 * an outward-facing surface (eg. a standalone sphere or cylinder) into the
 * inward-facing wall of a shell around it.
 *
 * @param {import("../../types.js").SimplicialComplex} geometry
 * @returns {import("../../types.js").SimplicialComplex}
 */
export function invert({ positions, normals, uvs, cells }) {
  const invertedNormals = new Float32Array(normals.length);
  for (let i = 0; i < normals.length; i++) invertedNormals[i] = -normals[i];

  const invertedCells = cells.slice();
  for (let i = 0; i < invertedCells.length; i += 3) {
    const tmp = invertedCells[i + 1];
    invertedCells[i + 1] = invertedCells[i + 2];
    invertedCells[i + 2] = tmp;
  }

  return { positions, normals: invertedNormals, uvs, cells: invertedCells };
}

/** @private */
export function point(positions, index) {
  return [
    positions[index * 3],
    positions[index * 3 + 1],
    positions[index * 3 + 2],
  ];
}

/** @private */
export function subtract(positions, a, b) {
  return [
    positions[a * 3] - positions[b * 3],
    positions[a * 3 + 1] - positions[b * 3 + 1],
    positions[a * 3 + 2] - positions[b * 3 + 2],
  ];
}

/**
 * Per-face constants: a flat normal and a tangent basis (+ extent) used for the
 * default per-face planar uv unwrap. The normal is summed via Newell's method
 * over every edge, so it stays correct for faces with (nearly) collinear
 * corners and averages out slightly non-planar faces.
 *
 * @private
 */
export function computeFaceContext(seedPositions, face) {
  const normal = [0, 0, 0];
  for (let i = 0; i < face.length; i++) {
    const a = point(seedPositions, face[i]);
    const b = point(seedPositions, face[(i + 1) % face.length]);
    normal[0] += (a[1] - b[1]) * (a[2] + b[2]);
    normal[1] += (a[2] - b[2]) * (a[0] + b[0]);
    normal[2] += (a[0] - b[0]) * (a[1] + b[1]);
  }
  normalize(normal);
  const v = normalize(subtract(seedPositions, face[0], face[1]));
  const u = cross(v, normal);

  const centroid = [0, 0, 0];
  for (const index of face) {
    centroid[0] += seedPositions[index * 3];
    centroid[1] += seedPositions[index * 3 + 1];
    centroid[2] += seedPositions[index * 3 + 2];
  }
  centroid[0] /= face.length;
  centroid[1] /= face.length;
  centroid[2] /= face.length;

  let extent = 0;
  for (const index of face) {
    const p = [
      seedPositions[index * 3] - centroid[0],
      seedPositions[index * 3 + 1] - centroid[1],
      seedPositions[index * 3 + 2] - centroid[2],
    ];
    extent = Math.max(extent, Math.abs(dot(p, u)), Math.abs(dot(p, v)));
  }

  return { normal, u, v, centroid, extent: extent || 1 };
}

/**
 * Point on edge (a, b) at k/S from a to b, canonicalized on min(a, b) so two
 * faces sharing this edge compute bit-identical floats regardless of winding.
 *
 * @private
 */
export function edgePoint(seedPositions, a, b, k, S, slerped) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const t = (a < b ? k : S - k) / S;

  const p = [
    seedPositions[lo * 3],
    seedPositions[lo * 3 + 1],
    seedPositions[lo * 3 + 2],
  ];
  const q = [
    seedPositions[hi * 3],
    seedPositions[hi * 3 + 1],
    seedPositions[hi * 3 + 2],
  ];

  if (slerped) return slerp(normalize(p), normalize(q), t);

  const t1 = 1 - t;
  return [p[0] * t1 + q[0] * t, p[1] * t1 + q[1] * t, p[2] * t1 + q[2] * t];
}
