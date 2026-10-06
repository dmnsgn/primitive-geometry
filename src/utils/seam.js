/**
 * @module utils
 * @ignore
 */

import { getCellsTypedArray } from "./common.js";

// A triangle's span in the wrapping component above this fraction of the full
// [0, 1) wrap is treated as crossing the seam rather than merely being wide
const SEAM_WRAP_THRESHOLD = 0.5;

// Quantization applied to a pole's wrapping value when folding it into its
// duplicate-vertex cache key (see `duplicate` below)
const POLE_KEY_SCALE = 1e6;

// Values can be shifted by +1 during unwrapping, so quantized values stay below
// 2 * POLE_KEY_SCALE; this stride keeps each corner's key range disjoint from
// its neighbor's
const POLE_KEY_CORNER_STRIDE = 3 * POLE_KEY_SCALE;

/**
 * Shift one triangle's corners onto a single local window, in place: cut the
 * circle at its widest empty gap and shift every corner before the cut up by
 * +1, which minimizes the maximum pairwise difference. A pole corner has no
 * value of its own, so it lands midway between the other two.
 *
 * @private
 */
function unwrapTriangle(w, pole) {
  const order = [0, 1, 2]
    .filter((k) => !pole[k])
    .toSorted((a, b) => w[a] - w[b]);
  const count = order.length;

  let widestGap = -1;
  let cutAt = -1;
  for (let m = 0; m < count; m++) {
    const gap =
      m < count - 1
        ? w[order[m + 1]] - w[order[m]]
        : w[order[0]] + 1 - w[order[count - 1]];
    if (gap > widestGap) {
      widestGap = gap;
      cutAt = m;
    }
  }
  if (cutAt < count - 1) {
    for (let m = 0; m <= cutAt; m++) w[order[m]] += 1;
  }

  for (let k = 0; k < 3; k++) {
    if (!pole[k]) continue;
    const [m, n] = [0, 1, 2].filter((o) => o !== k);
    w[k] = (w[m] + w[n]) / 2;
  }
}

/**
 * Split vertices along a periodic uv seam (eg. `polar`'s v or `spherical`'s u
 * wrapping from 1 back to 0) so each triangle interpolates a continuous range.
 *
 * Can't fix a triangle spanning half the wrap or more on its own (eg. a
 * 3-segment disc): only splitting the triangle would.
 *
 * @param {import("../../types.js").SimplicialComplex} geometry
 * @param {object} [options={}]
 * @param {number} [options.component=0] The uv component wrapping at 0/1: `0`
 *   for u, `1` for v.
 * @param {function(number): boolean} [options.isPole] Vertices with no value of
 *   their own in that component (eg. a sphere's poles, a fan's centroid):
 *   duplicated per triangle, midway between the two other corners.
 * @returns {import("../../types.js").SimplicialComplex} A new geometry, or the
 *   input one when no seam is found.
 */
export function splitSeam(
  geometry,
  { component = 0, isPole = () => false } = {},
) {
  const { positions, normals, uvs, cells } = geometry;
  const vertexCount = positions.length / 3;

  const extraPositions = [];
  const extraNormals = [];
  const extraUvs = [];
  // Non-pole corners need at most one alternate value, so their index is a
  // unique key. Poles can need any, so they're keyed above vertexCount.
  const duplicateCache = new Map();
  let nextIndex = vertexCount;

  const duplicate = (key, index, value) => {
    let dup = duplicateCache.get(key);
    if (dup === undefined) {
      extraPositions.push(
        positions[index * 3],
        positions[index * 3 + 1],
        positions[index * 3 + 2],
      );
      extraNormals.push(
        normals[index * 3],
        normals[index * 3 + 1],
        normals[index * 3 + 2],
      );
      extraUvs.push(uvs[index * 2], uvs[index * 2 + 1]);
      extraUvs[extraUvs.length - 2 + component] = value;
      dup = nextIndex++;
      duplicateCache.set(key, dup);
    }
    return dup;
  };

  // Sparse patches: few triangles need fixing
  const patchAt = [];
  const patchTo = [];

  const patchTriangle = (i, corners, w, pole) => {
    for (let k = 0; k < 3; k++) {
      if (w[k] === uvs[corners[k] * 2 + component]) continue;
      const key = pole[k]
        ? vertexCount +
          corners[k] * POLE_KEY_CORNER_STRIDE +
          Math.round(w[k] * POLE_KEY_SCALE)
        : corners[k];
      patchAt.push(i + k);
      patchTo.push(duplicate(key, corners[k], w[k]));
    }
  };

  for (let i = 0; i < cells.length; i += 3) {
    const corners = [cells[i], cells[i + 1], cells[i + 2]];
    const pole = corners.map((c) => isPole(c));
    if (pole[0] + pole[1] + pole[2] > 1) continue; // degenerate sliver

    const w = corners.map((c) => uvs[c * 2 + component]);

    // Fast path: most triangles don't touch a pole or the seam
    if (!pole[0] && !pole[1] && !pole[2]) {
      const lo = Math.min(w[0], w[1], w[2]);
      const hi = Math.max(w[0], w[1], w[2]);
      if (hi - lo <= SEAM_WRAP_THRESHOLD) continue;
    }

    unwrapTriangle(w, pole);
    patchTriangle(i, corners, w, pole);
  }

  if (!extraPositions.length) return geometry;

  const finalPositions = new Float32Array(nextIndex * 3);
  finalPositions.set(positions);
  finalPositions.set(extraPositions, positions.length);

  const finalNormals = new Float32Array(nextIndex * 3);
  finalNormals.set(normals);
  finalNormals.set(extraNormals, normals.length);

  const finalUvs = new Float32Array(nextIndex * 2);
  finalUvs.set(uvs);
  finalUvs.set(extraUvs, uvs.length);

  const finalCells = new (getCellsTypedArray(nextIndex))(cells.length);
  finalCells.set(cells);
  for (let p = 0; p < patchAt.length; p++) {
    finalCells[patchAt[p]] = patchTo[p];
  }

  return {
    positions: finalPositions,
    normals: finalNormals,
    uvs: finalUvs,
    cells: finalCells,
  };
}
