/**
 * @module utils
 * @ignore
 */

import { TAU, getCellsTypedArray } from "./common.js";

/**
 * @private
 * @typedef {object} CenteredCorners
 * @property {number[][]} centeredCorners
 * @property {number} cx
 * @property {number} cy
 */

/**
 * Center corners on their average, returned as (cx, cy) to translate back.
 *
 * @private
 * @param {number[][]} corners
 * @returns {CenteredCorners}
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
 * Translate positions in place by (dx, dy).
 *
 * @private
 * @param {Float32Array} positions
 * @param {number} dx
 * @param {number} dy
 */
export function translatePositions(positions, dx, dy) {
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += dx;
    positions[i + 1] += dy;
  }
}

/**
 * Point at angle t on an outline of arbitrary corners, one equal sector each.
 *
 * @private
 * @param {number[][]} corners
 * @param {number} thetaOffset
 * @param {number} t
 * @returns {[number, number]}
 */
export function computeOutlineEdge(corners, thetaOffset, t) {
  const cornerCount = corners.length;
  const sector = TAU / cornerCount;
  const local = (t - thetaOffset) / sector;
  // Assumes t >= thetaOffset: `%` keeps a negative dividend's sign
  const corner = Math.floor(local) % cornerCount;
  const frac = local - Math.floor(local);
  const [x0, y0] = corners[corner];
  const [x1, y1] = corners[(corner + 1) % cornerCount];
  return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}

// A full turn welds the last column onto the first; a partial sweep needs an
// extra column to reach thetaOffset + theta.
function computeColumnCount(segments, theta) {
  return segments + (theta !== 0 && theta % TAU === 0 ? 0 : 1);
}

// A merged centroid whose uv depends on the angle (eg. polar) has no uv of its
// own, so it's split per wedge, at the wedge's mid angle
function computeCentroidCount(mergeCentroid, mergeSeam, segments, mapCentroid) {
  if (!mergeCentroid) return 0;
  if (mergeSeam) return 1;

  const probe = new Float32Array(4);
  mapCentroid(probe, 0, 0);
  mapCentroid(probe, 2, 0.5);
  return probe[0] === probe[2] && probe[1] === probe[3] ? 1 : segments;
}

// The innermost ring fans to the merged centroid(s), at the start of the
// arrays. Every later ring bridges to the one before it with a quad. The next
// column shares the first one on the wrap for closed shapes.
function computeRingCells(
  cells,
  indices,
  { ringOffset, cols, segments, centroidCount, fan },
) {
  for (let i = 0; i < segments; i++) {
    const i1 = (i + 1) % cols;

    if (fan) {
      cells[indices.cell] = ringOffset + i;
      cells[indices.cell + 1] = ringOffset + i1;
      cells[indices.cell + 2] = centroidCount === 1 ? 0 : i;

      indices.cell += 3;
    } else {
      const a = ringOffset - cols + i;
      const b = ringOffset + i;
      const c = ringOffset + i1;
      const d = ringOffset - cols + i1;

      cells[indices.cell] = a;
      cells[indices.cell + 1] = b;
      cells[indices.cell + 2] = d;

      cells[indices.cell + 3] = b;
      cells[indices.cell + 4] = c;
      cells[indices.cell + 5] = d;

      indices.cell += 6;
    }
  }
}

/**
 * Concentric rings at angular columns, fan-triangulated. `equation` maps
 * samples to positions, `mapping` (required) to uvs. `mergeSeam: false` keeps a
 * separate wrap column, and a centroid per wedge when its uv depends on the
 * angle.
 *
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
  mergeSeam = true,
  mapping,
  equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta],
} = {}) {
  const closed = computeColumnCount(segments, theta) === segments;
  const cols = closed && mergeSeam ? segments : segments + 1;

  // Mapped like any other vertex rather than hardcoded so a mapping with no
  // centered origin (eg. polar's radiusRatio 0) gets its own uv
  const mapCentroid = (target, index, thetaRatio) =>
    mapping({
      uvs: target,
      index,
      u: 0,
      v: 0,
      radius,
      radiusRatio: 0,
      thetaRatio,
      t: thetaOffset + thetaRatio * theta,
      x: 0,
      y: 0,
      sx,
      sy,
    });

  const centroidCount = computeCentroidCount(
    mergeCentroid,
    mergeSeam,
    segments,
    mapCentroid,
  );

  const size =
    centroidCount + (mergeCentroid ? innerSegments : innerSegments + 1) * cols;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    mergeCentroid
      ? segments * 3 + (innerSegments - 1) * segments * 6
      : innerSegments * segments * 6,
  );

  for (let i = 0; i < centroidCount; i++) {
    normals[i * 3 + 2] = 1;
    mapCentroid(uvs, i * 2, centroidCount === 1 ? 0 : (i + 0.5) / segments);
  }

  // A separate wrap column reuses the first angle exactly, so its positions
  // match bit-identically
  const thetaAt = (i) =>
    thetaOffset + (closed && i === segments ? 0 : i / segments) * theta;

  let vertexIndex = centroidCount;
  const indices = { cell: 0 };

  for (let j = mergeCentroid ? 1 : 0; j <= innerSegments; j++) {
    const radiusRatio = j / innerSegments;

    const r = innerRadius + (radius - innerRadius) * radiusRatio;

    const ringOffset = vertexIndex;

    for (let i = 0; i < cols; i++, vertexIndex++) {
      const thetaRatio = i / segments;
      const t = thetaAt(i);

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
    }

    if (j > 0) {
      computeRingCells(cells, indices, {
        ringOffset,
        cols,
        segments,
        centroidCount,
        fan: mergeCentroid && j === 1,
      });
    }
  }

  return { positions, normals, uvs, cells };
}

/**
 * `computePolarGeometry`'s outline: one ring of points, `closed` repeating
 * index 0.
 *
 * @private
 */
export function computePolarPathGeometry({
  segments,
  theta,
  thetaOffset,
  closed,
  equation,
}) {
  const cols = computeColumnCount(segments, theta);
  const positions = new Float32Array(cols * 3);
  const path = Array.from({ length: cols + (closed ? 1 : 0) });

  for (let i = 0; i < cols; i++) {
    const t = (i / segments) * theta + thetaOffset;
    const [x, y] = equation(t);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    path[i] = i;
  }

  if (closed) path[cols] = 0;

  return { positions, cells: [path] };
}

/**
 * Point at angle t on a polygon boundary, its corners scaled per quadrant by
 * the factors.
 *
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

const COLLAPSE_EPSILON = 1e-6;

/**
 * Column `i` of `[uMin, uMax]`, Chebyshev-spaced: denser at both ends, where a
 * pinching sweep's boundary is steepest.
 *
 * @private
 */
export function computeChebyshevColumn(i, segments, uMin, uMax) {
  // Exact ends and midpoint: interpolation and cos(PI / 2) aren't bit-exact
  return i === 0
    ? uMin
    : i === segments
      ? uMax
      : 2 * i === segments
        ? (uMin + uMax) / 2
        : uMin + ((1 - Math.cos((Math.PI * i) / segments)) / 2) * (uMax - uMin);
}

/**
 * Fill between two boundary curves swept along `u`: `bounds(u)` gives `[vMin,
 * vMax]`, `point(u, v)` the position.
 *
 * - A collapsed column (`vMin === vMax`) is one vertex, fanned to its neighbor.
 * - `point` must be right-handed for CCW winding, or pass `flip: true`.
 * - Uvs default to `(uRatio, vRatio)`. `mapping` receives `(x, y)` relative to
 *   `center`.
 *
 * @private
 */
export function computeSweptArc({
  segments,
  innerSegments,
  uMin,
  uMax,
  bounds,
  point,
  flip = false,
  mapping,
  center = [0, 0],
  radius = 1,
  sx = 1,
  sy = 1,
}) {
  const cols = segments + 1;
  const rows = innerSegments + 1;

  const columnBounds = Array.from({ length: cols });
  const collapsed = new Uint8Array(cols);
  let vertexCount = 0;

  for (let i = 0; i < cols; i++) {
    const u = computeChebyshevColumn(i, segments, uMin, uMax);
    const [vMin, vMax] = bounds(u);
    columnBounds[i] = [u, vMin, vMax];
    collapsed[i] = Math.abs(vMax - vMin) < COLLAPSE_EPSILON ? 1 : 0;
    vertexCount += collapsed[i] ? 1 : rows;
  }

  // A strip beside a collapsed column fans, between two it's empty
  const stripCellCount = (i) =>
    collapsed[i] && collapsed[i + 1]
      ? 0
      : collapsed[i] || collapsed[i + 1]
        ? (rows - 1) * 3
        : (rows - 1) * 6;

  let cellCount = 0;
  for (let i = 0; i < segments; i++) cellCount += stripCellCount(i);

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const cells = new (getCellsTypedArray(vertexCount))(cellCount);

  const columnOffsets = new Int32Array(cols);
  let vertexIndex = 0;
  let cellIndex = 0;

  const writeColumn = (i) => {
    const [u, vMin, vMax] = columnBounds[i];
    const uRatio = i / segments;
    const rowCount = collapsed[i] ? 1 : rows;

    for (let j = 0; j < rowCount; j++, vertexIndex++) {
      const vRatio = collapsed[i] ? 0.5 : j / innerSegments;
      const v = vMin + (collapsed[i] ? 0 : vRatio) * (vMax - vMin);

      const [x, y] = point(u, v);

      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = y;
      normals[vertexIndex * 3 + 2] = 1;

      if (mapping) {
        mapping({
          uvs,
          index: vertexIndex * 2,
          x: x - center[0],
          y: y - center[1],
          radius,
          sx,
          sy,
          u,
          v,
          uRatio,
          vRatio,
        });
      } else {
        uvs[vertexIndex * 2] = uRatio;
        uvs[vertexIndex * 2 + 1] = vRatio;
      }
    }
  };

  for (let i = 0; i < cols; i++) {
    columnOffsets[i] = vertexIndex;
    writeColumn(i);
  }

  // `flip` swaps the two corners around a triangle's apex or first corner
  const [rim0, rim1] = flip ? [2, 1] : [1, 2];
  const [end0, end1] = flip ? [2, 0] : [0, 2];

  const writeStrip = (i) => {
    if (collapsed[i] && collapsed[i + 1]) return;

    const a = columnOffsets[i];
    const b = columnOffsets[i + 1];

    if (collapsed[i]) {
      for (let j = 0; j < rows - 1; j++, cellIndex += 3) {
        cells[cellIndex] = a;
        cells[cellIndex + rim0] = b + j;
        cells[cellIndex + rim1] = b + j + 1;
      }
      return;
    }

    if (collapsed[i + 1]) {
      for (let j = 0; j < rows - 1; j++, cellIndex += 3) {
        cells[cellIndex + end0] = a + j;
        cells[cellIndex + 1] = b;
        cells[cellIndex + end1] = a + j + 1;
      }
      return;
    }

    for (let j = 0; j < rows - 1; j++, cellIndex += 6) {
      const p = a + j;
      const q = b + j;

      cells[cellIndex] = p;
      cells[cellIndex + rim0] = q;
      cells[cellIndex + rim1] = q + 1;

      cells[cellIndex + 3] = p;
      cells[cellIndex + 3 + rim0] = q + 1;
      cells[cellIndex + 3 + rim1] = p + 1;
    }
  };

  for (let i = 0; i < segments; i++) writeStrip(i);

  return { positions, normals, uvs, cells };
}
