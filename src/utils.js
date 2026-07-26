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
  (size <= 255 ? Uint8Array : size <= 65_535 ? Uint16Array : Uint32Array);

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
 * A grid of ny + 1 meridian rings (v = 0..1, row-major/outer) x nx + 1
 * angular columns (phi, inner - wrapped and welded on the last column when
 * phi is a multiple of TAU, same rule as the other revolution solids)
 * revolved around the y-axis. `equation({ v, cosPhi, sinPhi })` computes a
 * single vertex's analytic position/normal - already embedding whatever
 * axis-scale or ellipse the caller needs (eg. cylinder's per-end sx/sz,
 * ellipsoid's rx/ry/rz) - and whether the whole v-ring is pinched to a point
 * on the axis (a pole or an apex). `collapsed` must depend on v only: it's
 * probed once per row (at cosPhi = 1, sinPhi = 0) to size and fan-triangulate
 * the mesh before the main fill, generalizing ellipsoid's original pole
 * handling to any meridian curve, not just an ellipse's sin/cos one.
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

      const { position, normal } = equation({ v, cosPhi, sinPhi });

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
      uvs[vertexIndex * 2 + 1] = v;
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
