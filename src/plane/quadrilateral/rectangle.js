/** @module rectangle */

import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} RectangleOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [nx=1] Segments along the bottom/top edges
 * @property {number} [ny=nx] Segments along the left/right edges
 */

/**
 * @alias module:rectangle
 * @param {RectangleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function rectangle({ sx = 1, sy = 0.5, nx = 1, ny = nx } = {}) {
  checkArguments(arguments);

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
