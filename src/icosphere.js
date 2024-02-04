/** @module icosphere */
import { checkArguments, getCellsTypedArray, TAU } from "./utils.js";

const f = 0.5 + Math.sqrt(5) / 2;

/**
 * @typedef {object} IcosphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 */

/**
 * @alias module:icosphere
 * @param {IcosphereOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function icosphere({ radius = 0.5, subdivisions = 2 } = {}) {
  checkArguments(arguments);

  if (subdivisions > 10) throw new Error("Max subdivisions is 10.");

  const T = Math.pow(4, subdivisions);

  const numVertices = 10 * T + 2;
  const numDuplicates =
    subdivisions === 0 ? 3 : Math.pow(2, subdivisions) * 3 + 9;

  const size = numVertices + numDuplicates;

  const positions = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);

  // prettier-ignore
  positions.set(Float32Array.of(
    -1, f, 0,
    1, f, 0,
    -1, -f, 0,
    1, -f, 0,

    0, -1, f,
    0, 1, f,
    0, -1, -f,
    0, 1, -f,

    f, 0, -1,
    f, 0, 1,
    -f, 0, -1,
    -f, 0, 1,
  ));
  // prettier-ignore
  let cells = Uint16Array.of(
    0, 11, 5,
    0, 5, 1,
    0, 1, 7,
    0, 7, 10,
    0, 10, 11,

    11, 10, 2,
    5, 11, 4,
    1, 5, 9,
    7, 1, 8,
    10, 7, 6,

    3, 9, 4,
    3, 4, 2,
    3, 2, 6,
    3, 6, 8,
    3, 8, 9,

    9, 8, 1,
    4, 9, 5,
    2, 4, 11,
    6, 2, 10,
    8, 6, 7,
  );

  let vertexIndex = 12;

  const midCache = subdivisions ? {} : null;

  function addMidPoint(a, b) {
    // Cantor's pairing function
    const key = Math.floor(((a + b) * (a + b + 1)) / 2 + Math.min(a, b));
    const i = midCache[key];
    if (i !== undefined) {
      delete midCache[key];
      return i;
    }
    midCache[key] = vertexIndex;
    positions[3 * vertexIndex + 0] =
      (positions[3 * a + 0] + positions[3 * b + 0]) * 0.5;
    positions[3 * vertexIndex + 1] =
      (positions[3 * a + 1] + positions[3 * b + 1]) * 0.5;
    positions[3 * vertexIndex + 2] =
      (positions[3 * a + 2] + positions[3 * b + 2]) * 0.5;
    return vertexIndex++;
  }

  let cellsPrev = cells;
  const IndexArray = subdivisions > 5 ? Uint32Array : getCellsTypedArray(size);

  // Subdivide
  for (let i = 0; i < subdivisions; i++) {
    const prevLen = cellsPrev.length;
    cells = new IndexArray(prevLen * 4);

    for (let k = 0; k < prevLen; k += 3) {
      const v1 = cellsPrev[k + 0];
      const v2 = cellsPrev[k + 1];
      const v3 = cellsPrev[k + 2];

      const a = addMidPoint(v1, v2);
      const b = addMidPoint(v2, v3);
      const c = addMidPoint(v3, v1);

      cells[k * 4 + 0] = v1;
      cells[k * 4 + 1] = a;
      cells[k * 4 + 2] = c;

      cells[k * 4 + 3] = v2;
      cells[k * 4 + 4] = b;
      cells[k * 4 + 5] = a;

      cells[k * 4 + 6] = v3;
      cells[k * 4 + 7] = c;
      cells[k * 4 + 8] = b;

      cells[k * 4 + 9] = a;
      cells[k * 4 + 10] = b;
      cells[k * 4 + 11] = c;
    }
    cellsPrev = cells;
  }

  // Normalize
  for (let i = 0; i < numVertices * 3; i += 3) {
    const v1 = positions[i + 0];
    const v2 = positions[i + 1];
    const v3 = positions[i + 2];
    const m = 1 / Math.sqrt(v1 * v1 + v2 * v2 + v3 * v3);
    positions[i + 0] *= m;
    positions[i + 1] *= m;
    positions[i + 2] *= m;
  }

  for (let i = 0; i < numVertices; i++) {
    uvs[2 * i + 0] =
      -Math.atan2(positions[3 * i + 2], positions[3 * i]) / TAU + 0.5;
    uvs[2 * i + 1] = Math.asin(positions[3 * i + 1]) / Math.PI + 0.5;
  }

  const duplicates = {};
  function addDuplicate(i, uvx, uvy, cached) {
    if (cached) {
      const dupe = duplicates[i];
      if (dupe !== undefined) return dupe;
    }
    positions[3 * vertexIndex + 0] = positions[3 * i + 0];
    positions[3 * vertexIndex + 1] = positions[3 * i + 1];
    positions[3 * vertexIndex + 2] = positions[3 * i + 2];

    uvs[2 * vertexIndex + 0] = uvx;
    uvs[2 * vertexIndex + 1] = uvy;

    if (cached) duplicates[i] = vertexIndex;
    return vertexIndex++;
  }

  for (let i = 0; i < cells.length; i += 3) {
    const a = cells[i + 0];
    const b = cells[i + 1];
    const c = cells[i + 2];

    let ax = uvs[2 * a];
    let bx = uvs[2 * b];
    let cx = uvs[2 * c];

    const ay = uvs[2 * a + 1];
    const by = uvs[2 * b + 1];
    const cy = uvs[2 * c + 1];

    if (ax - bx >= 0.5 && ay !== 1) bx += 1;
    if (bx - cx > 0.5) cx += 1;
    if ((ax < 0.5 && cx - ax > 0.5) || (ax === 1 && cy === 0)) ax += 1;
    if (bx < 0.5 && ax - bx > 0.5) bx += 1;

    // Poles
    const isPoleA = ay === 0 || ay === 1;
    const isPoleB = by === 0 || by === 1;
    const isPoleC = cy === 0 || cy === 1;

    if (isPoleA) {
      ax = (bx + cx) * 0.5;
      if (ay === 1 - bx) {
        uvs[2 * a] = ax;
      } else {
        cells[i + 0] = addDuplicate(a, ax, ay, false);
      }
    } else if (isPoleB) {
      bx = (ax + cx) * 0.5;
      if (by === ax) {
        uvs[2 * b] = bx;
      } else {
        cells[i + 1] = addDuplicate(b, bx, by, false);
      }
    } else if (isPoleC) {
      cx = (ax + bx) * 0.5;
      if (cy === ax) {
        uvs[2 * c] = cx;
      } else {
        cells[i + 2] = addDuplicate(c, cx, cy, false);
      }
    }

    // Seam zipper
    if (ax !== uvs[2 * a] && !isPoleA) {
      cells[i + 0] = addDuplicate(a, ax, ay, true);
    }
    if (bx !== uvs[2 * b] && !isPoleB) {
      cells[i + 1] = addDuplicate(b, bx, by, true);
    }
    if (cx !== uvs[2 * c] && !isPoleC) {
      cells[i + 2] = addDuplicate(c, cx, cy, true);
    }
  }

  return {
    positions: positions.map((v) => v * radius),
    normals: positions,
    uvs,
    cells,
  };
}

export default icosphere;
