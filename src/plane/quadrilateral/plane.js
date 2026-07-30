/** @module plane */

import { computePlane, getCellsTypedArray } from "../../utils.js";

/**
 * @typedef {object} PlaneOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {PlaneDirection} [direction="z"]
 */

/**
 * @typedef {"x" | "-x" | "y" | "-y" | "z" | "-z"} PlaneDirection
 */

/**
 * A flat rectangular grid, facing `direction`.
 * @alias module:plane
 * @param {PlaneOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function plane({ sx = 1, sy = sx, nx = 1, ny = nx, direction = "z" } = {}) {
  const size = (nx + 1) * (ny + 1);

  return computePlane(
    {
      positions: new Float32Array(size * 3),
      normals: new Float32Array(size * 3),
      uvs: new Float32Array(size * 2),
      cells: new (getCellsTypedArray(size))(nx * ny * 6),
    },
    { vertex: 0, cell: 0 },
    sx,
    sy,
    nx,
    ny,
    direction,
    0,
  );
}

/**
 * @typedef {object} RectanglePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [nx=1] Segments along the bottom/top edges
 * @property {number} [ny=nx] Segments along the left/right edges
 */

/**
 * Outline dual of `plane`: just its `z`-facing boundary loop, walked
 * directly (bottom-left → bottom-right → top-right → top-left) rather than
 * extracted from the full grid.
 * @alias module:rectanglePath
 * @param {RectanglePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function rectanglePath({ sx = 1, sy = 0.5, nx = 1, ny = nx } = {}) {
  const x = sx * 0.5;
  const y = sy * 0.5;

  // prettier-ignore
  const corners = [
    [-x, -y],
    [x, -y],
    [x, y],
    [-x, y],
  ];
  const segments = [nx, ny, nx, ny];

  const size = 2 * (nx + ny);
  const positions = new Float32Array(size * 3);
  const path = Array.from({ length: size });

  let vertexIndex = 0;
  for (let edge = 0; edge < 4; edge++) {
    const [x0, y0] = corners[edge];
    const [x1, y1] = corners[(edge + 1) % 4];
    const n = segments[edge];

    for (let i = 0; i < n; i++) {
      const t = i / n;
      positions[vertexIndex * 3] = x0 + (x1 - x0) * t;
      positions[vertexIndex * 3 + 1] = y0 + (y1 - y0) * t;
      path[vertexIndex] = vertexIndex;
      vertexIndex++;
    }
  }

  return { positions, cells: [path] };
}
