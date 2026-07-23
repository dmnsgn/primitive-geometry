/**
 * Shared mesh analysis helpers for seam/discontinuity tests.
 */

const EPSILON = 1e-4;

const positionKey = (positions, index, epsilon) =>
  [0, 1, 2]
    .map((i) => Math.round(positions[index * 3 + i] / epsilon))
    .join(",");

const positionsEqual = (positions, a, b) =>
  positions[a * 3] === positions[b * 3] &&
  positions[a * 3 + 1] === positions[b * 3 + 1] &&
  positions[a * 3 + 2] === positions[b * 3 + 2];

/** Unnormalized (b-a) x (c-a) face normal for a triangle's vertex indices */
const triangleNormal = (positions, a, b, c) => {
  const ux = positions[b * 3] - positions[a * 3];
  const uy = positions[b * 3 + 1] - positions[a * 3 + 1];
  const uz = positions[b * 3 + 2] - positions[a * 3 + 2];
  const vx = positions[c * 3] - positions[a * 3];
  const vy = positions[c * 3 + 1] - positions[a * 3 + 1];
  const vz = positions[c * 3 + 2] - positions[a * 3 + 2];
  return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
};

/**
 * Analyse a triangle mesh:
 * - nan/outOfBounds/degenerate/unused: allocation and cell defects
 * - nonManifold: edges used by more than two triangles
 * - boundaries: single-use edges with no coincident partner (open shapes)
 * - seams: coincident duplicated edges with bit-identical positions
 *   (intentional: UV atlas borders, texture wrap columns...)
 * - cracks: coincident duplicated edges with non-identical positions
 *   (always a defect)
 */
export function analyze(geometry, epsilon = EPSILON) {
  const { positions, cells } = geometry;
  const vertexCount = positions.length / 3;

  let nan = 0;
  for (const p of positions) if (Number.isNaN(p)) nan++;

  const referenced = new Uint8Array(vertexCount);
  let outOfBounds = 0;
  let degenerate = 0;

  for (let i = 0; i < cells.length; i += 3) {
    const a = cells[i];
    const b = cells[i + 1];
    const c = cells[i + 2];

    if (a >= vertexCount || b >= vertexCount || c >= vertexCount) {
      outOfBounds++;
      continue;
    }
    referenced[a] = referenced[b] = referenced[c] = 1;

    const [nx, ny, nz] = triangleNormal(positions, a, b, c);
    if (Math.hypot(nx, ny, nz) < 1e-12) degenerate++;
  }

  const unused = referenced.reduce((sum, r) => sum + (1 - r), 0);

  const edgeCounts = new Map();
  for (let i = 0; i < cells.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const a = cells[i + j];
      const b = cells[i + ((j + 1) % 3)];
      if (a === b) continue;
      const key = a < b ? a * vertexCount + b : b * vertexCount + a;
      edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
    }
  }

  let nonManifold = 0;
  const groups = new Map();
  for (const [key, count] of edgeCounts) {
    if (count > 2) nonManifold++;
    if (count !== 1) continue;
    const a = Math.floor(key / vertexCount);
    const b = key % vertexCount;
    const ka = positionKey(positions, a, epsilon);
    const kb = positionKey(positions, b, epsilon);
    const groupKey = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push([a, b]);
  }

  let boundaries = 0;
  let seams = 0;
  let cracks = 0;

  for (const edges of groups.values()) {
    if (edges.length === 1) {
      boundaries++;
      continue;
    }
    const [ra, rb] = edges[0];
    const isCrack = edges
      .slice(1)
      .some(
        ([a, b]) =>
          !(
            positionsEqual(positions, a, ra) || positionsEqual(positions, a, rb)
          ) ||
          !(
            positionsEqual(positions, b, ra) || positionsEqual(positions, b, rb)
          ),
      );
    if (isCrack) cracks += edges.length;
    else seams += edges.length;
  }

  return {
    vertexCount,
    triangleCount: cells.length / 3,
    nan,
    outOfBounds,
    degenerate,
    unused,
    nonManifold,
    boundaries,
    seams,
    cracks,
  };
}

/** Number of distinct vertex positions (bit-exact) */
export function uniquePositionCount(geometry) {
  const { positions } = geometry;
  const set = new Set();
  for (let i = 0; i < positions.length; i += 3) {
    set.add(`${positions[i]},${positions[i + 1]},${positions[i + 2]}`);
  }
  return set.size;
}

/** Number of uv components outside [0, 1] */
export function uvsOutOfRange(geometry, epsilon = 1e-6) {
  let count = 0;
  for (const uv of geometry.uvs) {
    if (uv < -epsilon || uv > 1 + epsilon) count++;
  }
  return count;
}

/**
 * Number of coincident vertex pairs sharing the same normal (ie. same surface
 * patch) but with different uvs: a texture discontinuity within a patch
 */
export function uvMismatches(geometry, epsilon = EPSILON) {
  const { positions, normals, uvs } = geometry;
  const vertexCount = positions.length / 3;

  const byPosition = new Map();
  for (let i = 0; i < vertexCount; i++) {
    const key = positionKey(positions, i, epsilon);
    if (!byPosition.has(key)) byPosition.set(key, []);
    byPosition.get(key).push(i);
  }

  let mismatches = 0;
  for (const group of byPosition.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        const normalDelta = Math.hypot(
          normals[a * 3] - normals[b * 3],
          normals[a * 3 + 1] - normals[b * 3 + 1],
          normals[a * 3 + 2] - normals[b * 3 + 2],
        );
        if (normalDelta > 1e-3) continue;
        if (
          Math.abs(uvs[a * 2] - uvs[b * 2]) > 1e-5 ||
          Math.abs(uvs[a * 2 + 1] - uvs[b * 2 + 1]) > 1e-5
        ) {
          mismatches++;
        }
      }
    }
  }
  return mismatches;
}

/** Number of clockwise triangles for a planar geometry facing +z */
export function flippedTriangles2D(geometry) {
  const { positions, cells } = geometry;
  let flipped = 0;
  for (let i = 0; i < cells.length; i += 3) {
    const [a, b, c] = [cells[i], cells[i + 1], cells[i + 2]];
    const ux = positions[b * 3] - positions[a * 3];
    const uy = positions[b * 3 + 1] - positions[a * 3 + 1];
    const vx = positions[c * 3] - positions[a * 3];
    const vy = positions[c * 3 + 1] - positions[a * 3 + 1];
    if (ux * vy - uy * vx < 0) flipped++;
  }
  return flipped;
}

/**
 * Number of triangles facing the origin, for convex geometries centered on it.
 * Degenerate triangles are ignored.
 */
export function inwardTriangles(geometry) {
  const { positions, cells } = geometry;
  let inward = 0;
  for (let i = 0; i < cells.length; i += 3) {
    const [a, b, c] = [cells[i], cells[i + 1], cells[i + 2]];
    const [nx, ny, nz] = triangleNormal(positions, a, b, c);
    if (Math.hypot(nx, ny, nz) < 1e-12) continue;
    const ax = positions[a * 3];
    const ay = positions[a * 3 + 1];
    const az = positions[a * 3 + 2];
    const cx = (ax + positions[b * 3] + positions[c * 3]) / 3;
    const cy = (ay + positions[b * 3 + 1] + positions[c * 3 + 1]) / 3;
    const cz = (az + positions[b * 3 + 2] + positions[c * 3 + 2]) / 3;
    if (nx * cx + ny * cy + nz * cz < 0) inward++;
  }
  return inward;
}

/**
 * Number of triangles whose geometric winding disagrees with their own
 * vertex normal (negative dot product between the two). Unlike
 * inwardTriangles (which assumes convexity around the origin), this works
 * for any shape - concave, elliptical, off-center - since it only checks
 * that each triangle's winding is consistent with the normal already baked
 * into its vertices. Degenerate triangles are ignored.
 */
export function flippedNormalTriangles(geometry) {
  const { positions, normals, cells } = geometry;
  let flipped = 0;
  for (let i = 0; i < cells.length; i += 3) {
    const [a, b, c] = [cells[i], cells[i + 1], cells[i + 2]];
    const [nx, ny, nz] = triangleNormal(positions, a, b, c);
    if (Math.hypot(nx, ny, nz) < 1e-12) continue;
    const dot =
      nx * normals[a * 3] + ny * normals[a * 3 + 1] + nz * normals[a * 3 + 2];
    if (dot < 0) flipped++;
  }
  return flipped;
}

/**
 * Diagonal slope signs of quad pairs lying in the rounded corner regions of a
 * planar rounded rectangle: quadrant -> Set of Math.sign((bx-ax) * (by-ay))
 * for the diagonal edge shared by each triangle pair.
 * Radial corner seams: +1 in -x-y/+x+y, -1 in +x-y/-x+y.
 */
export function cornerDiagonalSlopes(geometry, rx, ry) {
  const { positions, cells } = geometry;
  const slopes = {};
  for (let i = 0; i + 5 < cells.length; i += 6) {
    const t1 = [cells[i], cells[i + 1], cells[i + 2]];
    const t2 = [cells[i + 3], cells[i + 4], cells[i + 5]];
    const shared = t1.filter((index) => t2.includes(index));
    if (shared.length !== 2) continue;
    const [a, b] = shared;
    const ax = positions[a * 3];
    const ay = positions[a * 3 + 1];
    const bx = positions[b * 3];
    const by = positions[b * 3 + 1];
    const cx = (ax + bx) / 2;
    const cy = (ay + by) / 2;
    if (Math.abs(cx) <= rx || Math.abs(cy) <= ry) continue;
    const quadrant = `${cx > 0 ? "+" : "-"}x${cy > 0 ? "+" : "-"}y`;
    slopes[quadrant] ??= new Set();
    slopes[quadrant].add(Math.sign((bx - ax) * (by - ay)));
  }
  return slopes;
}
