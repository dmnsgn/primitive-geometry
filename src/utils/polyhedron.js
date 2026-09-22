/**
 * @module utils
 * @ignore
 */

import { rectangular, spherical } from "../mappings.js";
import {
  computeFaceContext,
  edgePoint,
  getCellsTypedArray,
  normalize,
  point,
  slerpTriangle,
} from "./common.js";

const MAX_VERTICES = 1e7;

// Distance of a uv v-coordinate from 0 or 1 below which a vertex counts as a pole
const POLE_EPSILON = 1e-5;

// A triangle's u-span above this fraction of the full [0, 1) wrap is treated
// as crossing the seam rather than merely being wide
const SEAM_WRAP_THRESHOLD = 0.5;

// Quantization applied to u when folding it into a pole's duplicate-vertex
// cache key (see `duplicate` below)
const POLE_KEY_U_SCALE = 1e6;

// u can be shifted by +1 during unwrapping, so quantized u values stay below
// 2 * POLE_KEY_U_SCALE; this stride keeps each corner's key range disjoint
// from its neighbor's
const POLE_KEY_CORNER_STRIDE = 3 * POLE_KEY_U_SCALE;

// Non-pole cache keys are plain corner (vertex) indices, always < MAX_VERTICES
// (enforced above); offsetting pole keys by MAX_VERTICES keeps the two key
// spaces disjoint regardless of how many vertices this call produces
const POLE_KEY_BASE = MAX_VERTICES;

/**
 * Build a flat-shaded (or, with `project`, smooth) triangle mesh from a seed
 * polyhedron: n-gon faces are fan-triangulated, each triangle optionally
 * subdivided into a barycentric grid. By default each face keeps its own
 * vertices for flat per-face normals. `project` instead normalizes vertices
 * onto `radius` and welds them across faces into a geodesic sphere.
 *
 * @private
 * @param {import("../../types.js").SimplicialComplexPolygon} seed Seed
 *   polyhedron: flat xyz positions (radius already baked in by the caller) and
 *   CCW n-gon faces (indices into positions)
 * @param {object} [options={}]
 * @param {number} [options.radius=0.5] Only used to re-normalize when project
 *   is true
 * @param {number} [options.subdivisions=0] Barycentric grid subdivisions per
 *   fan triangle
 * @param {boolean} [options.project=false] Radially project and weld across
 *   faces
 * @param {"gnomonic" | "spherical"} [options.projection="gnomonic"] How
 *   subdivided points are placed when project is true: "gnomonic" subdivides
 *   flat then projects (denser near seed vertices); "spherical" interpolates
 *   along great circles instead
 * @param {import("../mappings.js").MappingFn} [options.mapping] Defaults to
 *   mappings.spherical when project, mappings.rectangular otherwise
 * @returns {import("../../types.js").SimplicialComplex}
 * @throws {Error} If subdivisions would produce more than 1e7 vertices
 */
export function computePolyhedron(
  { positions: seedPositions, cells: seedCells },
  {
    radius = 0.5,
    subdivisions = 0,
    project = false,
    projection = "gnomonic",
    mapping = project ? spherical : rectangular,
  } = {},
) {
  const S = subdivisions + 1; // grid resolution: vertex samples per fan-triangle edge
  const slerped = project && projection === "spherical";
  const numSeedVertices = seedPositions.length / 3;

  // Sizing pre-pass over face lengths only (no vertex math)
  let numTriangles = 0;
  let unsharedTerm = 0; // diagonal + strictly-interior points: never shared across faces
  const edgeKeys = project ? new Set() : null;

  for (const face of seedCells) {
    const n = face.length;
    const fanTriangles = n - 2;
    const diagonals = Math.max(0, n - 3);

    numTriangles += fanTriangles * S * S;
    unsharedTerm +=
      diagonals * (S - 1) + (fanTriangles * (S - 1) * (S - 2)) / 2;

    if (project) {
      for (let i = 0; i < n; i++) {
        const a = face[i];
        const b = face[(i + 1) % n];
        edgeKeys.add(a < b ? a * numSeedVertices + b : b * numSeedVertices + a);
      }
    }
  }

  let numVertices = unsharedTerm;
  if (project) {
    numVertices += seedPositions.length / 3 + edgeKeys.size * (S - 1);
  } else {
    for (const face of seedCells) numVertices += face.length * S;
  }

  if (numVertices > MAX_VERTICES) {
    throw new Error(
      `subdivisions ${subdivisions} would produce ${numVertices} vertices; reduce subdivisions.`,
    );
  }

  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const cells = new (getCellsTypedArray(numVertices))(numTriangles * 3);

  let vertexIndex = 0;
  let cellIndex = 0;

  const cornerCache = project ? new Map() : null;
  const edgeCache = project ? new Map() : null;

  function addVertex(px, py, pz, context) {
    const i3 = vertexIndex * 3;
    const i2 = vertexIndex * 2;

    const l = Math.hypot(px, py, pz) || 1;
    const dx = px / l;
    const dy = py / l;
    const dz = pz / l;

    if (project) {
      positions[i3] = dx * radius;
      positions[i3 + 1] = dy * radius;
      positions[i3 + 2] = dz * radius;
      normals[i3] = dx;
      normals[i3 + 1] = dy;
      normals[i3 + 2] = dz;
    } else {
      positions[i3] = px;
      positions[i3 + 1] = py;
      positions[i3 + 2] = pz;
      normals[i3] = context.normal[0];
      normals[i3 + 1] = context.normal[1];
      normals[i3 + 2] = context.normal[2];
    }

    const rx = px - context.centroid[0];
    const ry = py - context.centroid[1];
    const rz = pz - context.centroid[2];

    mapping({
      uvs,
      index: i2,
      x: rx * context.u[0] + ry * context.u[1] + rz * context.u[2],
      y: rx * context.v[0] + ry * context.v[1] + rz * context.v[2],
      radius: context.extent,
      nx: dx,
      ny: dy,
      nz: dz,
    });

    return vertexIndex++;
  }

  for (const face of seedCells) {
    const n = face.length;
    const context = computeFaceContext(seedPositions, face);

    // Each seed corner, welded across faces only when projecting
    const cornerIndex = Array.from({ length: n });
    for (let k = 0; k < n; k++) {
      const seed = face[k];
      if (project && cornerCache.has(seed)) {
        cornerIndex[k] = cornerCache.get(seed);
      } else {
        const index = addVertex(
          seedPositions[seed * 3],
          seedPositions[seed * 3 + 1],
          seedPositions[seed * 3 + 2],
          context,
        );
        cornerIndex[k] = index;
        if (project) cornerCache.set(seed, index);
      }
    }

    // The S - 1 interior samples of the seed polygon edge (k, k + 1); welded
    // across faces only when projecting, bit-identical duplicates otherwise
    function boundaryEdge(k) {
      const a = face[k];
      const b = face[(k + 1) % n];
      const points = Array.from({ length: S - 1 });

      for (let i = 1; i < S; i++) {
        if (project) {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          const m = a < b ? i : S - i;
          const key = (lo * numSeedVertices + hi) * S + m;
          const cached = edgeCache.get(key);
          if (cached !== undefined) {
            points[i - 1] = cached;
            continue;
          }
          const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
          const index = addVertex(px, py, pz, context);
          edgeCache.set(key, index);
          points[i - 1] = index;
        } else {
          const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
          points[i - 1] = addVertex(px, py, pz, context);
        }
      }

      return points;
    }

    // The S - 1 interior samples of the diagonal from the fan apex (corner 0)
    // to corner k, shared only between this face's two adjacent fan triangles
    const diagonalCache = Array.from({ length: n });
    function diagonal(k) {
      if (diagonalCache[k]) return diagonalCache[k];

      const a = face[0];
      const b = face[k];
      const points = Array.from({ length: S - 1 });
      for (let i = 1; i < S; i++) {
        const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
        points[i - 1] = addVertex(px, py, pz, context);
      }

      diagonalCache[k] = points;
      return points;
    }

    for (let t = 0; t < n - 2; t++) {
      const kB = t + 1;
      const kC = t + 2;

      const sideAB = t === 0 ? boundaryEdge(0) : diagonal(kB);
      const sideAC =
        t === n - 3 ? boundaryEdge(n - 1).toReversed() : diagonal(kC);
      const sideBC = boundaryEdge(kB);

      const a = face[0];
      const b = face[kB];
      const c = face[kC];

      const uA = slerped ? normalize(point(seedPositions, a)) : null;
      const uB = slerped ? normalize(point(seedPositions, b)) : null;
      const uC = slerped ? normalize(point(seedPositions, c)) : null;

      // Strictly-interior points (i, j > 0, i + j < S) are private to this
      // fan triangle but shared by several small triangles around them
      const interiorCache = new Map();

      // Resolve a barycentric grid point (i toward B, j toward C, weight
      // toward the fan apex A implicit as S - i - j) to a vertex index
      function idx(i, j) {
        if (i === 0 && j === 0) return cornerIndex[0];
        if (i === S && j === 0) return cornerIndex[kB];
        if (i === 0 && j === S) return cornerIndex[kC];
        if (j === 0) return sideAB[i - 1];
        if (i === 0) return sideAC[j - 1];
        if (i + j === S) return sideBC[S - i - 1];

        const key = i * (S + 1) + j;
        const cached = interiorCache.get(key);
        if (cached !== undefined) return cached;

        const [px, py, pz] = slerped
          ? slerpTriangle(uA, uB, uC, i / S, j / S)
          : (() => {
              const k = S - i - j;
              return [
                (k * seedPositions[a * 3] +
                  i * seedPositions[b * 3] +
                  j * seedPositions[c * 3]) /
                  S,
                (k * seedPositions[a * 3 + 1] +
                  i * seedPositions[b * 3 + 1] +
                  j * seedPositions[c * 3 + 1]) /
                  S,
                (k * seedPositions[a * 3 + 2] +
                  i * seedPositions[b * 3 + 2] +
                  j * seedPositions[c * 3 + 2]) /
                  S,
              ];
            })();
        const index = addVertex(px, py, pz, context);
        interiorCache.set(key, index);
        return index;
      }

      for (let i = 0; i < S; i++) {
        for (let j = 0; j <= S - 1 - i; j++) {
          cells[cellIndex] = idx(i, j);
          cells[cellIndex + 1] = idx(i + 1, j);
          cells[cellIndex + 2] = idx(i, j + 1);
          cellIndex += 3;

          if (i + j < S - 1) {
            cells[cellIndex] = idx(i + 1, j);
            cells[cellIndex + 1] = idx(i + 1, j + 1);
            cells[cellIndex + 2] = idx(i, j + 1);
            cellIndex += 3;
          }
        }
      }
    }
  }

  // Welding (project) shares one uv per vertex, but the spherical mapping's
  // longitude wraps at u = 0/1 and is undefined at the poles, so a shared
  // vertex can't hold a uv correct for every triangle that touches it.
  // Zipper it by duplicating the affected corner(s) per triangle with a
  // locally-consistent uv. This can't help a triangle whose 3 corners are
  // already ~120° apart in longitude before subdivision (e.g. tetraSphere's
  // 4 huge faces at low subdivisions): no per-vertex uv choice keeps such a
  // triangle non-wrapping, only splitting it would, which this does not do.
  if (project && mapping === spherical) {
    const isPole = (v) => v < POLE_EPSILON || v > 1 - POLE_EPSILON;

    const extraPositions = [];
    const extraNormals = [];
    const extraUvs = [];
    // Non-pole corners need at most one alternate uv (+1 in u, see below),
    // so their own vertex index is already a unique cache key. Poles can
    // need any value depending on the triangle, so those are tagged into a
    // disjoint numeric range instead.
    const duplicateCache = new Map();
    let nextIndex = numVertices;

    function duplicate(key, index, u, v) {
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
        extraUvs.push(u, v);
        dup = nextIndex++;
        duplicateCache.set(key, dup);
      }
      return dup;
    }

    // Patches are recorded as (cell index, replacement vertex) pairs for the
    // rare triangles that need a fix, rather than rewriting the full cells array
    const patchAt = [];
    const patchTo = [];

    for (let i = 0; i < cells.length; i += 3) {
      const c0 = cells[i];
      const c1 = cells[i + 1];
      const c2 = cells[i + 2];
      const v0 = uvs[c0 * 2 + 1];
      const v1 = uvs[c1 * 2 + 1];
      const v2 = uvs[c2 * 2 + 1];
      const p0 = isPole(v0);
      const p1 = isPole(v1);
      const p2 = isPole(v2);
      if (p0 + p1 + p2 > 1) continue; // degenerate sliver

      let u0 = uvs[c0 * 2];
      let u1 = uvs[c1 * 2];
      let u2 = uvs[c2 * 2];

      // Fast path: most triangles don't touch a pole or the seam
      if (!p0 && !p1 && !p2) {
        const lo = Math.min(u0, u1, u2);
        const hi = Math.max(u0, u1, u2);
        if (hi - lo <= SEAM_WRAP_THRESHOLD) continue;
      }

      const corners = [c0, c1, c2];
      const u = [u0, u1, u2];
      const pole = [p0, p1, p2];

      // Unwrap the non-pole corners (always 2 or 3, since the sliver guard
      // above skips multi-pole triangles) onto one local window: cut the
      // circle at its widest empty gap and shift every corner before the cut
      // up by +1 in u. This minimizes the maximum pairwise u difference.
      const order = [0, 1, 2]
        .filter((k) => !pole[k])
        .toSorted((a, b) => u[a] - u[b]);
      const count = order.length;
      let widestGap = -1;
      let cutAt = -1;
      for (let m = 0; m < count; m++) {
        const gap =
          m < count - 1
            ? u[order[m + 1]] - u[order[m]]
            : u[order[0]] + 1 - u[order[count - 1]];
        if (gap > widestGap) {
          widestGap = gap;
          cutAt = m;
        }
      }
      if (cutAt < count - 1) {
        for (let m = 0; m <= cutAt; m++) u[order[m]] += 1;
      }

      for (let k = 0; k < 3; k++) {
        if (!pole[k]) continue;
        const [m, n] = [0, 1, 2].filter((o) => o !== k);
        u[k] = (u[m] + u[n]) / 2;
      }

      for (let k = 0; k < 3; k++) {
        if (u[k] === uvs[corners[k] * 2]) continue;
        const key = pole[k]
          ? POLE_KEY_BASE +
            corners[k] * POLE_KEY_CORNER_STRIDE +
            Math.round(u[k] * POLE_KEY_U_SCALE)
          : corners[k];
        patchAt.push(i + k);
        patchTo.push(duplicate(key, corners[k], u[k], uvs[corners[k] * 2 + 1]));
      }
    }

    if (extraPositions.length) {
      const finalCount = nextIndex;

      const finalPositions = new Float32Array(finalCount * 3);
      finalPositions.set(positions);
      finalPositions.set(extraPositions, positions.length);

      const finalNormals = new Float32Array(finalCount * 3);
      finalNormals.set(normals);
      finalNormals.set(extraNormals, normals.length);

      const finalUvs = new Float32Array(finalCount * 2);
      finalUvs.set(uvs);
      finalUvs.set(extraUvs, uvs.length);

      const finalCells = new (getCellsTypedArray(finalCount))(cells.length);
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
  }

  return { positions, normals, uvs, cells };
}
