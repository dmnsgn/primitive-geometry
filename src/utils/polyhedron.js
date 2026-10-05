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
import { splitSeam } from "./seam.js";

const MAX_VERTICES = 1e7;

// Distance of a uv v-coordinate from 0 or 1 below which a vertex counts as a pole
const POLE_EPSILON = 1e-5;

/**
 * Undirected seed edge key, stable whichever way the edge is walked
 *
 * @private
 */
const edgeKey = (a, b, numSeedVertices) =>
  a < b ? a * numSeedVertices + b : b * numSeedVertices + a;

const isPole = (v) => v < POLE_EPSILON || v > 1 - POLE_EPSILON;

/**
 * Vertex and triangle counts for a seed polyhedron, from face lengths only (no
 * vertex math): projecting welds seed corners and seed-edge points across
 * faces, so those are counted once; diagonal and strictly-interior points never
 * are.
 *
 * @private
 */
function computePolyhedronSize(seedCells, numSeedVertices, S, project) {
  let numTriangles = 0;
  let unsharedTerm = 0;
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
        edgeKeys.add(edgeKey(face[i], face[(i + 1) % n], numSeedVertices));
      }
    }
  }

  let numVertices = unsharedTerm;
  if (project) {
    numVertices += numSeedVertices + edgeKeys.size * (S - 1);
  } else {
    for (const face of seedCells) numVertices += face.length * S;
  }

  return { numTriangles, numVertices };
}

/**
 * Flat barycentric grid point of a seed triangle: weights i toward b, j toward
 * c, and the remaining S - i - j toward a.
 *
 * @private
 */
function barycentricPoint(seedPositions, a, b, c, i, j, S) {
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
}

/**
 * Build a flat-shaded (or, with `project`, smooth) triangle mesh from a seed
 * polyhedron: n-gon faces are fan-triangulated, each triangle optionally
 * subdivided into a barycentric grid. By default each face keeps its own
 * vertices for flat per-face normals. `project` instead normalizes vertices
 * onto `radius` and welds them across faces into a geodesic sphere.
 *
 * @private
 * @param {import("../../types.js").PolygonalComplex} seed Seed
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

  const { numTriangles, numVertices } = computePolyhedronSize(
    seedCells,
    numSeedVertices,
    S,
    project,
  );

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

  // Unit direction of a seed vertex, only needed for great-circle interpolation
  const unitPoint = (index) =>
    slerped ? normalize(point(seedPositions, index)) : null;

  // The S x S barycentric grid of one fan triangle, as up to 2 triangles per
  // cell: the upper one is skipped on the diagonal row, where it has no room
  const emitGrid = (idx) => {
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
  };

  const buildFace = (face) => {
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
          // Walked from the lower seed index, so both faces sharing this edge
          // key the same point the same way
          const m = a < b ? i : S - i;
          const key = edgeKey(a, b, numSeedVertices) * S + m;
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

      const uA = unitPoint(a);
      const uB = unitPoint(b);
      const uC = unitPoint(c);

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
          : barycentricPoint(seedPositions, a, b, c, i, j, S);
        const index = addVertex(px, py, pz, context);
        interiorCache.set(key, index);
        return index;
      }

      emitGrid(idx);
    }
  };

  for (const face of seedCells) buildFace(face);

  const geometry = { positions, normals, uvs, cells };

  // Welding (project) shares one uv per vertex, but the spherical mapping's
  // longitude wraps at u = 0/1 and is undefined at the poles. This can't help a
  // triangle whose 3 corners are already ~120deg apart in longitude before
  // subdivision (eg. tetraSphere's 4 huge faces at low subdivisions).
  return project && mapping === spherical
    ? splitSeam(geometry, {
        isPole: (index) => isPole(uvs[index * 2 + 1]),
      })
    : geometry;
}
