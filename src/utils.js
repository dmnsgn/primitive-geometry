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
 * Square root of 6.
 * @constant {number}
 */
export const SQRT6 = Math.sqrt(6);

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
 * Restrict a value to [min, max].
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
 * superellipsoid, superegg, hollowSphere's own cut caps) since
 * `computeRevolutionGeometry` only supports a pole at v = 0/1 - the sweep can
 * never cross the axis anywhere but its own start/end.
 * @param {number} theta
 * @param {number} thetaOffset
 * @returns {[number, number]} [clampedTheta, clampedThetaOffset]
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
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Snap a near-zero value to exact 0. Math.cos/sin of an exact multiple of
 * PI/2 aren't bit-exact (eg. Math.cos(Math.PI / 2) is ~6e-17) - left as-is,
 * that residual can make two vertices meant to be identical (a pole, a wrap
 * seam) compare as distinct and read as a crack, or - raised to a negative
 * signedPow exponent - explode into a huge, effectively-random-signed value.
 * @param {number} x
 * @returns {number}
 */
export function snapToZero(x) {
  return Math.abs(x) < 1e-9 ? 0 : x;
}

/**
 * x raised to a signed power: sign(x) * |x|^e. Used for superquadric/
 * superellipse curves, where e can be a fraction (even < 1, a pinched cusp)
 * and x negative - plain `x ** e` is only defined for non-negative x. x = 0
 * short-circuits to 0, avoiding both `0 ** negative` (Infinity) and JS's
 * `0 ** 0 = 1` quirk; the true tangent at a pinched pole is a genuine cusp
 * with no well-defined direction anyway, so 0 is as good a fallback as any.
 * @param {number} x
 * @param {number} e
 * @returns {number}
 */
export function signedPow(x, e) {
  return x === 0 ? 0 : Math.sign(x) * Math.abs(x) ** e;
}

/**
 * A single triangle, 3x oversized so its 3 vertices land past every edge of
 * the [-1, 1] clip-space square: the standard vertex-shader trick for a
 * fullscreen pass (rasterizes to exactly the viewport once clipped, with no
 * diagonal seam and no overdraw compared to a quad split into 2 triangles).
 * xy positions only - no z, no normals/uvs, no cells - since a fullscreen
 * pass reads screen-space data directly (`gl_FragCoord`, or a uv derived from
 * the clip position in-shader) rather than interpolated vertex attributes,
 * and needs no index buffer for a single triangle.
 * @returns {{positions: Float32Array}}
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
  (size <= 255 ? Uint8Array : size <= 65_535 ? Uint16Array : Uint32Array);

/**
 * Fan-triangulate a list of closed n-gon faces (a
 * `SimplicialComplexPolygon`'s `cells`, e.g. `[0, 1, 2, 3]`) from each face's
 * last corner into a flat, stride-3 `SimplicialComplex`-style typed array
 * (e.g. `[3, 0, 1, 3, 1, 2]`). Anchoring on the last corner rather than the
 * first is deliberate for quads: for the BL/BR/TR/TL winding used by eg.
 * `rectanglePath`, it splits the quad along the same diagonal a row-major
 * `TRIANGLE_STRIP` produces (and that `computePlane`/`computePolarGeometry`/
 * `computeRevolutionGeometry` already use), so displacement in a vertex
 * shader creases consistently across every primitive in this library. Only
 * valid for convex, planar faces - the same assumption `polyhedron.js` makes
 * for its own (subdivision/projection aware) fan triangulation.
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
    const anchor = face[face.length - 1];
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
 * Flip a geometry inside-out: negate every normal and swap 2 of each
 * triangle's 3 indices so winding stays consistent with the flipped normal.
 * Used to turn an outward-facing surface (eg. a standalone sphere or
 * cylinder) into the inward-facing wall of a shell around it.
 * @param {import("../types.js").SimplicialComplex} geometry
 * @returns {import("../types.js").SimplicialComplex}
 * @private
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

/**
 * @private
 */
export const TMP = [0, 0, 0];

/**
 * Fan-triangulated flat disk cap shared by revolution solids (cylinder/cone,
 * torus): capSegments concentric rings sampled at ringSegments + 1 angular
 * positions, with the innermost ring collapsed to a point and fanned with a
 * single triangle per quad instead of two, skipping the degenerate one.
 *
 * The disk is defined in the caller's own local 2D coordinates (x along the
 * angular sample's cosine, y along its sine, both scaled by capRadius *
 * radiusRatio, then independently by sx/sy for an elliptical cap);
 * `point(x, y)` embeds those into the solid's 3D space and `normal` is that
 * embedding's flat outward normal - both are the caller's responsibility
 * since the two solids embed their cap plane differently (cylinder:
 * axis-aligned; torus: offset and rotated by its phi angle). A flat disk's
 * normal only depends on the plane it sits in, not its in-plane shape, so
 * sx/sy don't affect `normal` - only the position/uv scale.
 * `flip` (1 or -1) selects which of a cap pair (base/apex, start/end) this
 * is, driving winding order; `normal` must already have flip folded in so it
 * points outward, ie. away from the solid.
 * @private
 */
export function computeCap(
  geometry,
  indices,
  {
    ringSegments,
    capSegments,
    capRadius,
    sx = 1,
    sy = 1,
    flip,
    angleAt,
    point,
    normal,
    mapping,
  },
) {
  const { positions, normals, uvs, cells } = geometry;
  const ringVertexOffset = indices.vertex;

  const writeVertex = (radiusRatio, cos, sin, t, thetaRatio) => {
    const x = capRadius * sx * radiusRatio * cos;
    const y = capRadius * sy * radiusRatio * sin;
    const [px, py, pz] = point(x, y);

    const i = indices.vertex;

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;

    normals[i * 3] = normal[0];
    normals[i * 3 + 1] = normal[1];
    normals[i * 3 + 2] = normal[2];

    mapping({
      uvs,
      index: i * 2,
      u: radiusRatio * cos,
      v: radiusRatio * sin,
      radius: capRadius,
      sx,
      sy,
      radiusRatio,
      thetaRatio,
      t,
      x,
      y,
    });

    indices.vertex++;
  };

  for (let r = 0; r < capSegments; r++) {
    for (let j = 0; j <= ringSegments; j++) {
      const { cos, sin, t } = angleAt(j);
      const thetaRatio = j / ringSegments;

      writeVertex(r / capSegments, cos, sin, t, thetaRatio);
      writeVertex((r + 1) / capSegments, cos, sin, t, thetaRatio);
    }
  }

  const m = ringSegments + 1;
  for (let r = 0; r < capSegments; r++) {
    for (let j = 0; j < ringSegments; j++) {
      const n = ringVertexOffset + r * m * 2 + j * 2;
      const a = n;
      const b = n + 1;
      const c = n + 2;
      const d = n + 3;

      // The innermost ring is collapsed at the center: fan with a single
      // triangle, skipping the degenerate one
      if (r > 0) {
        if (flip === 1) {
          cells[indices.cell] = a;
          cells[indices.cell + 1] = c;
          cells[indices.cell + 2] = d;
        } else {
          cells[indices.cell] = a;
          cells[indices.cell + 1] = d;
          cells[indices.cell + 2] = c;
        }
        indices.cell += 3;
      }

      if (flip === 1) {
        cells[indices.cell] = a;
        cells[indices.cell + 1] = d;
        cells[indices.cell + 2] = b;
      } else {
        cells[indices.cell] = a;
        cells[indices.cell + 1] = b;
        cells[indices.cell + 2] = d;
      }
      indices.cell += 3;
    }
  }
}

/**
 * Triangulate one quad of a (rows+1) x (cols+1) vertex grid already written
 * in row-major order (cols vertices per row), for the vertex just written at
 * `indices.vertex` - the quad's own corner d, with a/b/c the 3
 * already-written corners at vertexIndex - cols - 1/- cols/- 1. Called
 * whenever a full quad is available (row > 0 && col > 0). Splits along the
 * b-c diagonal, matching `computePlane`/`computePolarGeometry`/
 * `computeRevolutionGeometry` so displacement in a vertex shader creases
 * consistently across the library. flip (1 or -1) picks the winding, same
 * convention as `computeCap` - which value maps to "outward" depends on how
 * the caller's row/col axes relate to its own surface normal, so callers
 * work that out for themselves (see torus.js/hollow-sphere.js).
 * @private
 */
export function computeGridQuad(cells, indices, cols, flip) {
  const vertexIndex = indices.vertex;
  const a = vertexIndex - cols - 1;
  const b = vertexIndex - cols;
  const c = vertexIndex - 1;
  const d = vertexIndex;

  if (flip === 1) {
    cells[indices.cell] = a;
    cells[indices.cell + 1] = c;
    cells[indices.cell + 2] = b;

    cells[indices.cell + 3] = b;
    cells[indices.cell + 4] = c;
    cells[indices.cell + 5] = d;
  } else {
    cells[indices.cell] = a;
    cells[indices.cell + 1] = b;
    cells[indices.cell + 2] = c;

    cells[indices.cell + 3] = b;
    cells[indices.cell + 4] = d;
    cells[indices.cell + 5] = c;
  }

  indices.cell += 6;
}

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
 * Piecewise sampling so region boundaries are computed once and bit-exact.
 * n = 0 collapses the straight section to a single column; cornerSegments = 0
 * collapses to a plain -size/2 + index * size/n grid.
 * @private
 */
export function getPlaneCoordinate(
  index,
  n,
  size,
  cornerRadius,
  cornerSegments,
) {
  return index < cornerSegments
    ? -size / 2 - cornerRadius + (index * cornerRadius) / cornerSegments
    : index <= cornerSegments + n
      ? -size / 2 + (n ? ((index - cornerSegments) * size) / n : 0)
      : size / 2 +
        ((index - cornerSegments - n) * cornerRadius) / cornerSegments;
}

/**
 * Remap a 2D offset from a corner reference point onto the true circular arc
 * of the same radius: preserves the offset's angle and rescales its distance
 * from Chebyshev (the flat square grid extension) to Euclidean (the circle).
 * @param {number} dx
 * @param {number} dy
 * @returns {[number, number]}
 * @private
 */
export function remapCornerOffset(dx, dy) {
  const scale = Math.max(Math.abs(dx), Math.abs(dy)) / Math.hypot(dx, dy);
  return [dx * scale, dy * scale];
}

/**
 * Whether a plane grid index falls in the rounded-corner range (before 0 or
 * after n), given cornerSegments straight-section columns/rows on each side.
 * @private
 */
export function isPlaneCorner(index, n, cornerSegments) {
  return index < cornerSegments || index >= cornerSegments + n;
}

/**
 * Reference corner coordinate a rounded value is beyond, or null when it
 * sits within the straight [-half, half] span (no rounding needed there).
 * @private
 */
export function getPlaneCornerReference(value, half) {
  return value < -half ? -half : value > half ? half : null;
}

/**
 * Whether the corner a value pair [cx, cy] sits in (relative to plane
 * center, by sign) is selected by roundCorners: a uniform true/false, or a
 * 4-item boolean array indexing [-u-v, +u-v, +u+v, -u+v]. False when either
 * is null (getPlaneCornerReference's sentinel for "not in a corner").
 * @private
 */
export function isPlaneCornerRounded(cx, cy, roundCorners) {
  if (cx === null || cy === null) return false;
  if (roundCorners === true || roundCorners === false) return roundCorners;
  const index = cx < 0 ? (cy < 0 ? 0 : 3) : cy < 0 ? 1 : 2;
  return roundCorners[index];
}

/**
 * Plane as a single welded grid, optionally with rounded corners
 * (cornerRadius/cornerSegments > 0): [cornerSegments|nu|cornerSegments] x
 * [cornerSegments|nv|cornerSegments] so face, edges and corners share their
 * boundary vertices, with radial diagonals in the corner quads. su/sv are the
 * inner face sizes (full size minus 2 * cornerRadius) and collapse to the
 * plain su/sv grid when cornerRadius/cornerSegments are 0. roundCorners is
 * false (none rounded), true (all 4 rounded) or a 4-item boolean array
 * selecting which of [-u-v, +u-v, +u+v, -u+v] round; unselected corners stay
 * flat/square (their raw grid extension left as-is).
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
  cornerRadius = 0,
  cornerSegments = 0,
  roundCorners = false,
) {
  const { positions, normals, uvs, cells } = geometry;
  const [u, v, w, flipU, flipV, normal] = PLANE_DIRECTIONS[direction];

  const cols = 2 * cornerSegments + nu;
  const rows = 2 * cornerSegments + nv;

  const width = su + 2 * cornerRadius;
  const height = sv + 2 * cornerRadius;

  const vertexOffset = indices.vertex;

  for (let j = 0; j <= rows; j++) {
    const y0 = getPlaneCoordinate(j, nv, sv, cornerRadius, cornerSegments);
    const cornerV = isPlaneCorner(j, nv, cornerSegments);

    for (let i = 0; i <= cols; i++) {
      const x0 = getPlaneCoordinate(i, nu, su, cornerRadius, cornerSegments);
      const cornerU = isPlaneCorner(i, nu, cornerSegments);

      let x = x0;
      let y = y0;

      // Corner quad: remap the flat square extension onto the true circular
      // arc, preserving angle from the inner corner and scaling its distance
      // from Chebyshev (square) to Euclidean (circle). isPlaneCornerRounded
      // is false unless the raw coordinate is strictly beyond both straight
      // spans (cx/cy non-null), so dx/dy below are guaranteed non-zero - no
      // 0/0 divide.
      if (cornerRadius > 0) {
        const cx = getPlaneCornerReference(x0, su / 2);
        const cy = getPlaneCornerReference(y0, sv / 2);

        if (isPlaneCornerRounded(cx, cy, roundCorners)) {
          const [dx, dy] = remapCornerOffset(x0 - cx, y0 - cy);
          x = cx + dx;
          y = cy + dy;
        }
      }

      positions[indices.vertex * 3 + u] = x * flipU + center[u];
      positions[indices.vertex * 3 + v] = y * flipV + center[v];
      positions[indices.vertex * 3 + w] = pw + center[w];

      normals[indices.vertex * 3 + w] = normal;

      uvs[indices.vertex * 2] =
        ((x0 + width / 2) / width) * uvScale[0] + uvOffset[0];
      uvs[indices.vertex * 2 + 1] =
        (1 - (y0 + height / 2) / height) * uvScale[1] + uvOffset[1];

      indices.vertex++;

      if (j < rows && i < cols) {
        const n = vertexOffset + j * (cols + 1) + i;
        const o = n + cols + 1;

        if (cornerU && cornerV && i < cornerSegments !== j < cornerSegments) {
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

/**
 * Center a closed corner list on its own vertex average, returning the
 * centered corners alongside that average (cx, cy) so a caller can translate
 * a shape built around them back afterward - shared by trapezoid/triangle,
 * whose radial fan (via computePolarGeometry) or outline (via
 * computeOutlineEdge) must be centered on the shape's own centroid rather
 * than world origin for an off-center corner (eg. trapezoid's topOffset,
 * triangle's apexOffset) to not bunch rings tight on one side.
 * @param {number[][]} corners
 * @returns {{centeredCorners: number[][], cx: number, cy: number}}
 * @private
 */
export function centerCorners(corners) {
  const [cx, cy] = corners
    .reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0])
    .map((sum) => sum / corners.length);

  return {
    centeredCorners: corners.map(([x, y]) => [x - cx, y - cy]),
    cx,
    cy,
  };
}

/**
 * Translate a geometry's positions in place by (dx, dy), z untouched - the
 * inverse of the recentering `centerCorners` sets up, applied after building
 * around the recentered origin so the shape lands back at its documented,
 * caller-relative position.
 * @param {Float32Array} positions
 * @param {number} dx
 * @param {number} dy
 * @private
 */
export function translatePositions(positions, dx, dy) {
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += dx;
    positions[i + 1] += dy;
  }
}

/**
 * A point on a closed, explicit-corner outline at angle t: splits the
 * outline into corners.length equal sectors starting at thetaOffset, finds
 * which one t falls in, and linearly interpolates between its two corners.
 * Unlike computePolygonEdge (a regular polygon, corners derived from rx/ry),
 * corners are arbitrary [x, y] pairs supplied by the caller (eg. cross's
 * dodecagon, trapezoid's quad) - shared so the two don't duplicate the same
 * sector-lookup arithmetic.
 * Assumes theta >= 0 (t - thetaOffset never negative): a negative theta
 * makes local negative, and JS's `%` keeps a negative dividend's sign, so
 * `corners[corner]` would index before the array's start.
 * @param {number[][]} corners
 * @param {number} thetaOffset
 * @param {number} t
 * @returns {[number, number]}
 * @private
 */
export function computeOutlineEdge(corners, thetaOffset, t) {
  const cornerCount = corners.length;
  const sector = TAU / cornerCount;
  const local = (t - thetaOffset) / sector;
  const corner = Math.floor(local) % cornerCount;
  const frac = local - Math.floor(local);
  const [x0, y0] = corners[corner];
  const [x1, y1] = corners[(corner + 1) % cornerCount];
  return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}

/**
 * A grid of concentric rings (innerSegments, radiusRatio 0..1 from
 * innerRadius to radius) sampled at evenly-spaced angular columns (segments,
 * closed for a full revolution when theta is a multiple of TAU - the last
 * column then shares its vertices with the first so the wrap edge is
 * welded), fan-triangulated between rings. equation maps each (radiusRatio,
 * angle) sample to its [x, y] position, defaulting to an ellipse's arc;
 * mapping computes its uv and has no default, so it must always be supplied.
 * @private
 */
export function computePolarGeometry({
  sx = 1,
  sy = 1,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  innerRadius = 0,
  mergeCentroid = true,
  mapping,
  equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta],
} = {}) {
  const closed = theta !== 0 && theta % TAU === 0;
  const cols = segments + (closed ? 0 : 1);

  const size = mergeCentroid
    ? 1 + innerSegments * cols
    : (innerSegments + 1) * cols;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    mergeCentroid
      ? segments * 3 + (innerSegments - 1) * segments * 6
      : innerSegments * segments * 6,
  );

  if (mergeCentroid) {
    normals[2] = 1;
    uvs[0] = 0.5;
    uvs[1] = 0.5;
  }

  let vertexIndex = mergeCentroid ? 1 : 0;
  let cellIndex = 0;

  for (let j = mergeCentroid ? 1 : 0; j <= innerSegments; j++) {
    const radiusRatio = j / innerSegments;

    const r = innerRadius + (radius - innerRadius) * radiusRatio;

    const ringOffset = vertexIndex;

    for (let i = 0; i < cols; i++, vertexIndex++) {
      const thetaRatio = i / segments;
      const t = thetaOffset + thetaRatio * theta;

      const cosTheta = Math.cos(t);
      const sinTheta = Math.sin(t);

      const [x, y] = equation({
        rx: sx * r,
        ry: sy * r,
        cosTheta,
        sinTheta,
        s: radiusRatio,
        t,
      });

      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = y;

      normals[vertexIndex * 3 + 2] = 1;

      mapping({
        uvs,
        index: vertexIndex * 2,
        u: radiusRatio * cosTheta,
        v: radiusRatio * sinTheta,
        radius,
        radiusRatio,
        thetaRatio,
        t,
        // For rectangular
        x,
        y,
        sx,
        sy,
      });

      if (i < segments) {
        // Next column, sharing the first one on the wrap for closed shapes
        const i1 = (i + 1) % cols;

        if (mergeCentroid && j === 1) {
          cells[cellIndex] = ringOffset + i;
          cells[cellIndex + 1] = ringOffset + i1;

          cellIndex += 3;
        } else if (j > (mergeCentroid ? 1 : 0)) {
          const a = ringOffset - cols + i;
          const b = ringOffset + i;
          const c = ringOffset + i1;
          const d = ringOffset - cols + i1;

          cells[cellIndex] = a;
          cells[cellIndex + 1] = b;
          cells[cellIndex + 2] = d;

          cells[cellIndex + 3] = b;
          cells[cellIndex + 4] = c;
          cells[cellIndex + 5] = d;

          cellIndex += 6;
        }
      }
    }
  }

  return { positions, normals, uvs, cells };
}

/**
 * A single ring of `segments` points swept across `theta` (`thetaOffset`
 * start) - the path-only counterpart of `computePolarGeometry`'s angular
 * dimension, with no radial rings or fan-triangulation: just the boundary
 * loop `equation(t, i)` maps each angle (and its integer sample index, eg.
 * for `starPath`'s tip/notch parity) to. `closed` repeats index `0` to
 * explicitly close the loop; open (the default) leaves the last vertex
 * unconnected to the first, matching every other path primitive's
 * convention.
 * @private
 */
export function computePolarPathGeometry({
  segments,
  theta,
  thetaOffset,
  closed,
  equation,
}) {
  const positions = new Float32Array(segments * 3);
  const path = Array.from({ length: segments + (closed ? 1 : 0) });

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * theta + thetaOffset;
    const [x, y] = equation(t, i);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    path[i] = i;
  }

  if (closed) path[segments] = 0;

  return { positions, cells: [path] };
}

/**
 * A grid of meridian rings (v = 0..1, row-major/outer) x nx + 1 angular
 * columns (phi, inner - wrapped and welded on the last column when phi is a
 * multiple of TAU, same rule as the other revolution solids) revolved
 * around the y-axis. `equation({ v, cosPhi, sinPhi })` computes a single
 * vertex's analytic position/normal - already embedding whatever axis-scale
 * or ellipse the caller needs (eg. cylinder's per-end sx/sz, ellipsoid's
 * rx/ry/rz) - and whether the whole v-ring is pinched to a point on the
 * axis (a pole or an apex). `collapsed` must depend on v only: it's probed
 * once per row (at cosPhi = 1, sinPhi = 0) to size and fan-triangulate the
 * mesh before the main fill, generalizing ellipsoid's original pole
 * handling to any meridian curve, not just an ellipse's sin/cos one. A pole
 * is only supported at v = 0 or v = 1: the meridian curve must not cross
 * the axis anywhere in between (callers with a bounded theta/thetaOffset,
 * eg. ellipsoid, clamp them so their sweep can't).
 *
 * The uv v-coordinate defaults to the row's structural v (row-index
 * fraction), which distorts whenever a caller allocates rows non-uniformly
 * across the meridian (eg. capsule.js packing more/fewer rows into its
 * hemispheres than its cylindrical body) - the texture would stretch across
 * whichever section got more rows instead of following actual surface
 * position. `equation` may return its own `v` to override just the uv
 * (structural v - row spacing, pole detection - is unaffected, since it's
 * only ever read from the input parameter, never the return value).
 *

 * capBase/capApex add a flat disk at v = 0/v = 1 (skip them when that end is
 * already collapsed, ie. a true point apex - same convention cylinder/cone
 * use today). Since position.x/z are always linear in (cosPhi, sinPhi) with
 * no cross term for an axis-aligned surface of revolution (the defining
 * property of this whole family), each cap's radius/ellipse-scale is
 * reconstructed by probing `equation` at that end rather than requiring the
 * caller to pass it separately: `equation(v, 1, 0).position` and
 * `equation(v, 0, 1).position` give the rim's x/z extent directly, positive
 * or negative depending on the shape's own internal sign convention (eg.
 * cylinder's cosPhi = -cos(p)). capRadius is fixed at 1 and the sign is
 * folded into a per-cap cos/sin flip instead of `Math.abs`-ing it away
 * blindly, so the reconstructed rim still lands exactly on the body's own
 * boundary ring (bit-identical, same "seam" convention as every other welded
 * boundary in this codebase) while keeping the cap's sx/sy positive for
 * mapping functions that divide by them (eg. `rectangular`).
 * @private
 */
export function computeRevolutionGeometry({
  nx = 32,
  ny = 16,
  phi = TAU,
  phiOffset = 0,
  capBase = false,
  capApex = false,
  capSegments = 1,
  capBaseSegments = capSegments,
  capApexSegments = capSegments,
  capMapping,
  equation,
} = {}) {
  const wrap = phi % TAU === 0;

  // Rings collapsed to a point (poles, apexes) fan with a single triangle per
  // quad instead of two, skipping the degenerate one
  const collapsedAt = Array.from({ length: ny + 1 });
  let fans = 0;
  for (let y = 0; y <= ny; y++) {
    collapsedAt[y] = equation({ v: y / ny, cosPhi: 1, sinPhi: 0 }).collapsed;
    if (collapsedAt[y]) fans += y === 0 || y === ny ? 1 : 2;
  }

  const hasCapBase = capBase && !collapsedAt[0];
  const hasCapApex = capApex && !collapsedAt[ny];
  const capBaseCount = hasCapBase ? capBaseSegments : 0;
  const capApexCount = hasCapApex ? capApexSegments : 0;
  const capFans =
    (hasCapBase && capBaseSegments > 0 ? 1 : 0) +
    (hasCapApex && capApexSegments > 0 ? 1 : 0);

  const size =
    (ny + 1) * (nx + 1) + (nx + 1) * 2 * (capBaseCount + capApexCount);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    ny * nx * 6 -
      fans * nx * 3 +
      (capBaseCount + capApexCount) * nx * 6 -
      capFans * nx * 3,
  );

  let vertexIndex = 0;
  let cellIndex = 0;

  for (let y = 0; y <= ny; y++) {
    const v = y / ny;

    for (let x = 0; x <= nx; x++, vertexIndex++) {
      const u = x / nx;
      const p = (wrap && x === nx ? 0 : u) * phi + phiOffset;
      const cosPhi = Math.cos(p);
      const sinPhi = Math.sin(p);

      const {
        position,
        normal,
        v: uvV = v,
      } = equation({ v, cosPhi, sinPhi });

      positions[vertexIndex * 3] = position[0];
      positions[vertexIndex * 3 + 1] = position[1];
      positions[vertexIndex * 3 + 2] = position[2];

      TMP[0] = normal[0];
      TMP[1] = normal[1];
      TMP[2] = normal[2];
      normalize(TMP);

      normals[vertexIndex * 3] = TMP[0];
      normals[vertexIndex * 3 + 1] = TMP[1];
      normals[vertexIndex * 3 + 2] = TMP[2];

      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = uvV;
    }

    if (y > 0) {
      const rowOffset = vertexIndex - 2 * (nx + 1);

      for (let x = 0; x < nx; x++) {
        const a = rowOffset + x;
        const b = a + 1;
        const c = a + nx + 1;
        const d = a + nx + 2;

        if (!collapsedAt[y - 1]) {
          cells[cellIndex] = a;
          cells[cellIndex + 1] = b;
          cells[cellIndex + 2] = c;

          cellIndex += 3;
        }

        if (!collapsedAt[y]) {
          cells[cellIndex] = c;
          cells[cellIndex + 1] = b;
          cells[cellIndex + 2] = d;

          cellIndex += 3;
        }
      }
    }
  }

  const geometry = { positions, normals, uvs, cells };
  const indices = { vertex: vertexIndex, cell: cellIndex };

  if (hasCapBase || hasCapApex) {
    const angleAt = (i) => {
      const u = i / nx;
      const p = (wrap && i === nx ? 0 : u) * phi + phiOffset;
      return { cos: Math.cos(p), sin: Math.sin(p), t: p };
    };

    const addCap = (v, capSegments, flip, normalY) => {
      const atCos = equation({ v, cosPhi: 1, sinPhi: 0 });
      const atSin = equation({ v, cosPhi: 0, sinPhi: 1 });

      const xSign = atCos.position[0] < 0 ? -1 : 1;
      const zSign = atSin.position[2] < 0 ? -1 : 1;

      computeCap(geometry, indices, {
        ringSegments: nx,
        capSegments,
        capRadius: 1,
        sx: xSign * atCos.position[0],
        sy: zSign * atSin.position[2],
        flip,
        angleAt: (i) => {
          const { cos, sin, t } = angleAt(i);
          return { cos: xSign * cos, sin: zSign * sin, t };
        },
        point: (x, y) => [x, atCos.position[1], y],
        normal: [0, normalY, 0],
        mapping: capMapping,
      });
    };

    if (hasCapBase) addCap(0, capBaseSegments, 1, -1);
    if (hasCapApex) addCap(1, capApexSegments, -1, 1);
  }

  return { positions, normals, uvs, cells, indices };
}

/**
 * A point on a regular sides-gon ring at the given angle/radius/height -
 * same x/z sign convention as `cylinder`'s own `equation()`, so a prism,
 * antiprism and cylinder built with the same radius/phiOffset share a
 * corner. Shared by prism/antiprism's own wall corners and cap rims (see
 * `computePolygonCap`), so a wall corner's position is computed by the
 * exact same expression as its coincident cap vertex - required for them to
 * weld bit-identically (`analyze()`'s crack check), not just approximately.
 * @private
 */
export function computePolygonCorner(angle, radius, y) {
  return [-radius * Math.cos(angle), y, radius * Math.sin(angle)];
}

/**
 * A prism/antiprism's flat sides-gon cap: `computeCap`'s own `sides + 1`
 * angle samples with no further interpolation between them trace a
 * straight sides-gon boundary, not an arc (see `prism.js`'s own doc
 * comment for why). Shared by `prism` (whose bottom/top ends sample the
 * same `angleAt`) and `antiprism` (whose top ring is rotated by half a
 * sector, so each end supplies its own).
 * @private
 */
export function computePolygonCap(
  geometry,
  indices,
  { sides, radius, y, flip, normalY, angleAt, mapping },
) {
  computeCap(geometry, indices, {
    ringSegments: sides,
    capSegments: 1,
    capRadius: radius,
    flip,
    angleAt: (i) => {
      const p = angleAt(i);
      return { cos: -Math.cos(p), sin: Math.sin(p), t: p };
    },
    point: (x, z) => [x, y, z],
    normal: [0, normalY, 0],
    mapping,
  });
}

/**
 * A spindle-torus generating-circle revolution: the meridian is an arc of a
 * circle (radius `a`, offset from the axis) that crosses the revolution
 * axis at its own two endpoints, producing cusped poles - not smooth
 * tangent points like a sphere's - each with its own per-column normal.
 * Shared by `apple` (the major, more-than-half-circle arc) and `lemon` (the
 * minor, less-than-half-circle arc of the same construction, opposite sign
 * convention) - see each file's own doc comment for the halfHeight domain
 * that distinguishes them and the derivation of `a`/`thetaCross`/
 * `poleCosTheta`/`radiusAt`, which this helper takes as given rather than
 * re-deriving, since the two files' sign conventions for the circle's own
 * axis offset are mirrored.
 * `radiusAt(cosTheta)` computes the meridian's radius away from the poles;
 * `poleCosTheta` is the same circle's cosTheta at r = 0, used for the
 * pole's own normal - kept separate from `radiusAt` since deriving it via
 * `radiusAt`'s own formula wouldn't reliably round-trip to exactly 0 in
 * floating point, leaving the pole undetected as collapsed (see apple.js's
 * own comment on its equation for the full reasoning).
 * @private
 */
export function computeSpindleArcRevolution({
  a,
  halfHeight,
  thetaCross,
  poleCosTheta,
  radiusAt,
  nx,
  ny,
  phi,
  phiOffset,
}) {
  function equation({ v, cosPhi: rawCosPhi, sinPhi: rawSinPhi }) {
    const cosPhi = snapToZero(rawCosPhi);
    const sinPhi = snapToZero(rawSinPhi);

    let cosTheta, sinTheta, r, y;
    if (v === 0 || v === 1) {
      cosTheta = poleCosTheta;
      sinTheta = v === 0 ? -halfHeight / a : halfHeight / a;
      r = 0;
      y = v === 0 ? -halfHeight : halfHeight;
    } else {
      const theta = -thetaCross + v * 2 * thetaCross;
      cosTheta = snapToZero(Math.cos(theta));
      sinTheta = snapToZero(Math.sin(theta));
      r = radiusAt(cosTheta);
      y = a * sinTheta;
    }

    return {
      position: [-cosPhi * r, y, sinPhi * r],
      // Direction from the generating circle's own (off-axis) center, not
      // from the revolution axis - unlike a sphere/ellipsoid, position and
      // normal direction aren't simply proportional here. `a` is left out
      // (normalize() erases positive scalar multiples), same "factor out
      // the radius" trick cylinder/cone's tangent-cross-product normals use.
      normal: [-cosPhi * cosTheta, sinTheta, sinPhi * cosTheta],
      collapsed: r === 0,
    };
  }

  return computeRevolutionGeometry({ nx, ny, phi, phiOffset, equation });
}

/**
 * A flat-ended surface of revolution around the y axis, both ends open
 * rings cappable exactly like `cylinder`'s - shared plumbing for
 * `barrel`/`funnel`/`hyperboloid`, which only differ in their own radius
 * law (parabolic/exponential/hyperbolic). `profile(y, v)` returns `[r,
 * normalY]`: the meridian's radius at that height and the y-component of
 * the implicit surface's gradient there (x/z components are always `x`/`z`
 * themselves for this whole family, since none of their defining equations
 * has an x/y or z/y cross term). Both `y` and the raw sweep parameter `v`
 * are passed through so a caller whose own radius law is naturally written
 * in terms of one or the other (eg. funnel's exponential, in `v`) doesn't
 * have to round-trip through the other and risk a 1-ULP drift.
 * @private
 */
export function computeFlatRevolutionGeometry({
  height,
  nx,
  ny,
  phi,
  phiOffset,
  capApex,
  capBase,
  capSegments,
  capMapping,
  profile,
}) {
  const halfHeight = height / 2;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;
    const y = height * v - halfHeight;
    const [r, normalY] = profile(y, v);
    const x = r * cosPhi;
    const z = r * sinPhi;

    return {
      position: [x, y, z],
      normal: [x, normalY, z],
      collapsed: false,
    };
  }

  return computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
    capApex,
    capBase,
    capApexSegments: capSegments,
    capBaseSegments: capSegments,
    capMapping,
    equation,
  });
}

/**
 * A point on a straight-edged polygon's boundary at angle t: splits the
 * circle into cornerCount equal sectors starting at thetaOffset, finds which
 * one t falls in, and linearly interpolates between its two corners. Each
 * corner sits at (rx * cos(angle), ry * sin(angle)), independently scaled by
 * xFactor/negativeXFactor (cos positive/negative) and yFactor/
 * negativeYFactor (sin positive/negative) - all default to 1, a regular
 * polygon.
 * @private
 */
export function computePolygonEdge(
  thetaOffset,
  cornerCount,
  rx,
  ry,
  t,
  xFactor = 1,
  negativeXFactor = 1,
  yFactor = 1,
  negativeYFactor = 1,
) {
  const sector = TAU / cornerCount;
  const local = (t - thetaOffset) / sector;
  const corner = Math.floor(local);
  const frac = local - corner;

  const angle0 = thetaOffset + corner * sector;
  const angle1 = angle0 + sector;

  const x0 =
    rx * (Math.cos(angle0) >= 0 ? xFactor : negativeXFactor) * Math.cos(angle0);
  const x1 =
    rx * (Math.cos(angle1) >= 0 ? xFactor : negativeXFactor) * Math.cos(angle1);

  const y0 =
    ry * (Math.sin(angle0) >= 0 ? yFactor : negativeYFactor) * Math.sin(angle0);
  const y1 =
    ry * (Math.sin(angle1) >= 0 ? yFactor : negativeYFactor) * Math.sin(angle1);

  return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}
