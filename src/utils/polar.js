/** @module polar */

import { TAU, getCellsTypedArray } from "./common.js";

/**
 * @private
 * @typedef {object} CenteredCorners
 * @property {number[][]} centeredCorners
 * @property {number} cx
 * @property {number} cy
 */

/**
 * Center a closed corner list on its own vertex average, returning the centered
 * corners alongside that average (cx, cy) so a caller can translate a shape
 * built around them back afterward. Shared by trapezoid/triangle: their radial
 * fan (via computePolarGeometry) or outline (via computeOutlineEdge) must be
 * centered on the shape's own centroid, not world origin, or an off-center
 * corner (eg. trapezoid's topOffset, triangle's apexOffset) bunches rings tight
 * on one side.
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
 * Translate a geometry's positions in place by (dx, dy), z untouched. The
 * inverse of the recentering `centerCorners` sets up - applied after building
 * around the recentered origin, so the shape lands back at its documented,
 * caller-relative position.
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
 * A point on a closed, explicit-corner outline at angle t: splits the outline
 * into corners.length equal sectors starting at thetaOffset, finds which one t
 * falls in, and linearly interpolates between its two corners. Unlike
 * computePolygonEdge (a regular polygon, corners derived from rx/ry), corners
 * are arbitrary [x, y] pairs supplied by the caller (eg. cross's dodecagon,
 * trapezoid's quad) - shared so the two don't duplicate the same sector-lookup
 * arithmetic. Assumes theta >= 0 (t - thetaOffset never negative): a negative
 * theta makes local negative, and JS's `%` keeps a negative dividend's sign, so
 * `corners[corner]` would index before the array's start.
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
  const corner = Math.floor(local) % cornerCount;
  const frac = local - Math.floor(local);
  const [x0, y0] = corners[corner];
  const [x1, y1] = corners[(corner + 1) % cornerCount];
  return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}

/**
 * A grid of concentric rings (innerSegments, radiusRatio 0..1 from innerRadius
 * to radius) sampled at evenly-spaced angular columns (segments, closed for a
 * full revolution when theta is a multiple of TAU - the last column then shares
 * its vertices with the first so the wrap edge is welded), fan-triangulated
 * between rings. equation maps each (radiusRatio, angle) sample to its [x, y]
 * position, defaulting to an ellipse's arc; mapping computes its uv and has no
 * default, so it must always be supplied.
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
 * A single ring of `segments` points swept across `theta` (`thetaOffset` start)
 *
 * - The path-only counterpart of `computePolarGeometry`'s angular dimension, with
 *   no radial rings or fan-triangulation: just the boundary loop `equation(t,
 *   i)` maps each angle (and its integer sample index, eg. for `starPath`'s
 *   tip/notch parity) to. `closed` repeats index `0` to explicitly close the
 *   loop; open (the default) leaves the last vertex unconnected to the first,
 *   matching every other path primitive's convention.
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
 * A point on a straight-edged polygon's boundary at angle t: splits the circle
 * into cornerCount equal sectors starting at thetaOffset, finds which one t
 * falls in, and linearly interpolates between its two corners. Each corner sits
 * at (rx * cos(angle), ry * sin(angle)), independently scaled by
 * xFactor/negativeXFactor (cos positive/negative) and yFactor/ negativeYFactor
 * (sin positive/negative) - all default to 1, a regular polygon.
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
 * Chebyshev-spaced sample of `[uMin, uMax]` at column `i` of `segments + 1`:
 * denser near `uMin`/`uMax` than an even split, matching a sweep that pinches
 * at both ends, where a boundary curve is steepest. `uMin`/`uMax`/ midpoint are
 * special-cased to their exact values: floating point doesn't guarantee `uMin +
 * t * (uMax - uMin)` reconstructs `uMax` at t=1, nor that `Math.cos(Math.PI /
 * 2)` is bit-exact 0 at the midpoint.
 *
 * @private
 */
export function computeChebyshevColumn(i, segments, uMin, uMax) {
  return i === 0
    ? uMin
    : i === segments
      ? uMax
      : 2 * i === segments
        ? (uMin + uMax) / 2
        : uMin + ((1 - Math.cos((Math.PI * i) / segments)) / 2) * (uMax - uMin);
}

/**
 * Fills the region between two boundary curves swept along a parameter `u`: for
 * each of `segments + 1` columns spanning `[uMin, uMax]`, `bounds(u)` gives
 * `[vMin, vMax]`, and `point(u, v)` maps to an `(x, y)` position as `v` sweeps
 * `[0, 1]` across `innerSegments + 1` rows.
 *
 * Quirks:
 *
 * - A column where `vMin === vMax` collapses to one vertex and fan-connects to
 *   its neighboring column, instead of a zero-area quad.
 * - `point`'s `(u, v)` must be right-handed (increasing `v` turns 90deg CCW from
 *   increasing `u`) for CCW winding; pass `flip: true` otherwise.
 * - Columns are Chebyshev-spaced (denser near `uMin`/`uMax`) rather than evenly
 *   spaced, since a sweep pinches at both ends and a boundary curve is steepest
 *   right there.
 * - `uvs` default to `(uRatio, vRatio)`, following the arcs. Pass `mapping` for a
 *   flat unwrap instead: it receives `(x, y)` shifted by `center` and scaled by
 *   `radius`/`sx`/`sy`.
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

  let cellCount = 0;
  for (let i = 0; i < segments; i++) {
    cellCount +=
      collapsed[i] && collapsed[i + 1]
        ? 0
        : collapsed[i] || collapsed[i + 1]
          ? (rows - 1) * 3
          : (rows - 1) * 6;
  }

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const cells = new (getCellsTypedArray(vertexCount))(cellCount);

  const columnOffsets = new Int32Array(cols);
  let vertexIndex = 0;
  let cellIndex = 0;

  for (let i = 0; i < cols; i++) {
    columnOffsets[i] = vertexIndex;

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
  }

  for (let i = 0; i < segments; i++) {
    const a = columnOffsets[i];
    const b = columnOffsets[i + 1];

    if (collapsed[i] && collapsed[i + 1]) {
      // Both columns collapsed: zero-width sliver, nothing to fill.
    } else if (collapsed[i]) {
      for (let j = 0; j < rows - 1; j++, cellIndex += 3) {
        const t = flip ? [a, b + j + 1, b + j] : [a, b + j, b + j + 1];
        cells.set(t, cellIndex);
      }
    } else if (collapsed[i + 1]) {
      for (let j = 0; j < rows - 1; j++, cellIndex += 3) {
        const t = flip ? [a + j + 1, b, a + j] : [a + j, b, a + j + 1];
        cells.set(t, cellIndex);
      }
    } else {
      for (let j = 0; j < rows - 1; j++, cellIndex += 6) {
        const p = a + j;
        const q = b + j;
        const t = flip
          ? [p, q + 1, q, p, p + 1, q + 1]
          : [p, q, q + 1, p, q + 1, p + 1];
        cells.set(t, cellIndex);
      }
    }
  }

  return { positions, normals, uvs, cells };
}
