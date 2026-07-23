/** @module sweptArc */
import { getCellsTypedArray } from "../../utils.js";

const COLLAPSE_EPSILON = 1e-6;

/**
 * Fills the region between two boundary curves swept along a parameter `u`:
 * for each of `segments + 1` columns spanning `[uMin, uMax]`, `bounds(u)`
 * gives `[vMin, vMax]`, and `point(u, v)` maps to an `(x, y)` position as
 * `v` sweeps `[0, 1]` across `innerSegments + 1` rows.
 *
 * Quirks:
 * - A column where `vMin === vMax` collapses to one vertex and fan-connects
 *   to its neighboring column, instead of a zero-area quad.
 * - `point`'s `(u, v)` must be right-handed (increasing `v` turns 90deg CCW
 *   from increasing `u`) for CCW winding; pass `flip: true` otherwise.
 * - Columns are Chebyshev-spaced (denser near `uMin`/`uMax`) rather than
 *   evenly spaced, since a sweep pinches at both ends and a boundary curve
 *   is steepest right there.
 * - `uvs` default to `(uRatio, vRatio)`, following the arcs. Pass `mapping`
 *   for a flat unwrap instead: it receives `(x, y)` shifted by `center` and
 *   scaled by `radius`/`sx`/`sy`.
 * @private
 */
export function sweptArc({
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

  const columnBounds = new Array(cols);
  const collapsed = new Uint8Array(cols);
  let vertexCount = 0;

  for (let i = 0; i < cols; i++) {
    // uMin/uMax/midpoint are special-cased to their exact values: floating
    // point doesn't guarantee `uMin + t * (uMax - uMin)` reconstructs `uMax`
    // at t=1, nor that `Math.cos(Math.PI / 2)` is bit-exact 0 at the
    // midpoint.
    const u =
      i === 0
        ? uMin
        : i === segments
          ? uMax
          : 2 * i === segments
            ? (uMin + uMax) / 2
            : uMin +
              ((1 - Math.cos((Math.PI * i) / segments)) / 2) * (uMax - uMin);
    const [vMin, vMax] = bounds(u);
    columnBounds[i] = [u, vMin, vMax];
    collapsed[i] = Math.abs(vMax - vMin) < COLLAPSE_EPSILON ? 1 : 0;
    vertexCount += collapsed[i] ? 1 : rows;
  }

  let cellCount = 0;
  for (let i = 0; i < segments; i++) {
    cellCount += collapsed[i] && collapsed[i + 1]
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
      continue;
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
