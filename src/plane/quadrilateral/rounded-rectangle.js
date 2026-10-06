/**
 * @module primitiveGeometry
 * @ignore
 */
import { HALF_PI, getCellsTypedArray } from "../../utils/common.js";
import { computePlane } from "../../utils/plane-grid.js";

/** @typedef {"top-left" | "top-right" | "bottom-right" | "bottom-left"} RoundedRectangleCorner */

/**
 * @typedef {object} RoundedRectangleOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [radius=sx * 0.25]
 * @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
 * @property {import("../../../types.js").PositiveInteger} [nx=1] Segments along
 *   the straight top/bottom sections.
 * @property {import("../../../types.js").PositiveInteger} [ny=nx] Segments
 *   along the straight left/right sections.
 * @property {RoundedRectangleCorner[]} [roundedCorners=["top-left", "top-right", "bottom-right", "bottom-left"]]
 */

const CORNER_ORDER = ["top-left", "top-right", "bottom-right", "bottom-left"];

/**
 * A rectangle with rounded corners.
 *
 * @param {RoundedRectangleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function roundedRectangle({
  sx = 1,
  sy = sx,
  radius = sx * 0.25,
  roundSegments = 8,
  nx = 1,
  ny = nx,
  roundedCorners = CORNER_ORDER,
} = {}) {
  const r2 = radius * 2;
  const widthX = sx - r2;
  const widthY = sy - r2;

  // Zero-length straight sections would produce degenerate cells (eg. stadium)
  if (widthX === 0) nx = 0;
  if (widthY === 0) ny = 0;

  const cols = 2 * roundSegments + nx;
  const rows = 2 * roundSegments + ny;

  const size = (cols + 1) * (rows + 1);

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(cols * rows * 6),
  };

  const indices = { vertex: 0, cell: 0 };

  // One welded grid: no duplicated seams or T-junctions
  computePlane(
    geometry,
    indices,
    widthX,
    widthY,
    nx,
    ny,
    "z",
    0,
    [1, 1],
    [0, 0],
    [0, 0, 0],
    true,
    radius,
    roundSegments,
    CORNER_ORDER.map((corner) => roundedCorners.includes(corner)),
  );

  return geometry;
}

// Walked CCW: each corner's quadrant and the start of its quarter arc
const PATH_CORNERS = [
  { name: "bottom-left", signX: -1, signY: -1, angleStart: Math.PI },
  { name: "bottom-right", signX: 1, signY: -1, angleStart: 1.5 * Math.PI },
  { name: "top-right", signX: 1, signY: 1, angleStart: 0 },
  { name: "top-left", signX: -1, signY: 1, angleStart: HALF_PI },
];

/**
 * @typedef {object} RoundedRectanglePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [radius=sx * 0.25]
 * @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
 * @property {import("../../../types.js").PositiveInteger} [nx=1]
 * @property {import("../../../types.js").PositiveInteger} [ny=nx]
 * @property {RoundedRectangleCorner[]} [roundedCorners=["top-left", "top-right", "bottom-right", "bottom-left"]]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `roundedRectangle`.
 *
 * @param {RoundedRectanglePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function roundedRectanglePath({
  sx = 1,
  sy = sx,
  radius = sx * 0.25,
  roundSegments = 8,
  nx = 1,
  ny = nx,
  roundedCorners = CORNER_ORDER,
  closed = false,
} = {}) {
  const x = sx * 0.5;
  const y = sy * 0.5;

  // Zero-length straight sections would duplicate vertices (eg. stadium)
  if (sx === radius * 2) nx = 0;
  if (sy === radius * 2) ny = 0;

  const isRounded = PATH_CORNERS.map(
    ({ name }) => radius > 0 && roundedCorners.includes(name),
  );
  const cornerCounts = isRounded.map((rounded) =>
    rounded ? roundSegments : 1,
  );
  // A sharp corner's single vertex is also its edge's first sample
  const edgeCounts = [nx, ny, nx, ny].map((n, c) =>
    n > 0 && !isRounded[c] ? n - 1 : n,
  );

  const point = (c, sweep) => {
    const { signX, signY, angleStart } = PATH_CORNERS[c];
    if (!isRounded[c]) return [signX * x, signY * y];
    const cx = signX * (x - radius);
    const cy = signY * (y - radius);
    const angle = angleStart + sweep;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  };

  const size =
    cornerCounts.reduce((a, b) => a + b, 0) +
    edgeCounts.reduce((a, b) => a + b, 0);

  const positions = new Float32Array(size * 3);
  const path = Array.from({ length: size + (closed ? 1 : 0) });

  let vertexIndex = 0;

  const writeVertex = (px, py) => {
    positions[vertexIndex * 3] = px;
    positions[vertexIndex * 3 + 1] = py;
    path[vertexIndex] = vertexIndex;
    vertexIndex++;
  };

  const writeCorner = (c) => {
    for (let s = 0; s < cornerCounts[c]; s++) {
      const [px, py] = point(
        c,
        isRounded[c] ? (s / roundSegments) * HALF_PI : 0,
      );
      writeVertex(px, py);
    }
  };

  const writeEdge = (c) => {
    const n = [nx, ny, nx, ny][c];
    if (n <= 0) return;

    const [x0, y0] = point(c, HALF_PI);
    const [x1, y1] = point((c + 1) % 4, 0);
    const start = isRounded[c] ? 0 : 1;

    for (let i = start; i < n; i++) {
      const t = i / n;
      writeVertex(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
    }
  };

  for (let c = 0; c < 4; c++) {
    writeCorner(c);
    writeEdge(c);
  }

  if (closed) path[size] = 0;

  return { positions, cells: [path] };
}
