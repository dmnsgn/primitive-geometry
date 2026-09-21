/** @module triangularGrid */

import { SQRT3 } from "../../utils/common.js";

/**
 * @typedef {object} TriangularGridOptions
 * @property {number} [sx=1]
 * @property {number} [nx=10]
 * @property {number} [ny=10]
 * @property {boolean} [inscribed=true]
 */

/**
 * Isometric grid tiling equilateral triangles
 *
 * @param {TriangularGridOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPolygon}
 * @alias module:triangularGrid
 */
export function triangularGrid({
  sx = 1,
  nx = 10,
  ny = 10,
  inscribed = true,
} = {}) {
  const dx = sx / nx;
  const dy = (dx * SQRT3) / 2;
  const halfHeight = (ny * dy) / 2;

  const positions = [];
  const cells = [];
  const rowStart = [];

  for (let row = 0; row <= ny; row++) {
    const y = row * dy - halfHeight;
    const offset = row % 2 === 1 ? dx / 2 : 0;
    const count = row % 2 === 1 ? nx : nx + 1;

    rowStart.push(positions.length / 3);
    for (let col = 0; col < count; col++) {
      positions.push(-sx / 2 + offset + col * dx, y, 0);
    }
  }

  for (let row = 0; row < ny; row++) {
    const offsetIsLower = row % 2 === 1;
    const smallStart = rowStart[offsetIsLower ? row : row + 1];
    const bigStart = rowStart[offsetIsLower ? row + 1 : row];

    for (let col = 0; col < nx; col++) {
      const s = smallStart + col;
      const b0 = bigStart + col;
      const b1 = bigStart + col + 1;
      cells.push(offsetIsLower ? [s, b1, b0] : [s, b0, b1]);
    }

    for (let col = 0; col < nx - 1; col++) {
      const s0 = smallStart + col;
      const s1 = smallStart + col + 1;
      const b1 = bigStart + col + 1;
      cells.push(offsetIsLower ? [s0, s1, b1] : [s1, s0, b1]);
    }
  }

  if (inscribed) {
    for (let row = 1; row < ny; row += 2) {
      cells.push(
        [rowStart[row - 1], rowStart[row], rowStart[row + 1]],
        [
          rowStart[row - 1] + nx,
          rowStart[row + 1] + nx,
          rowStart[row] + nx - 1,
        ],
      );
    }

    if (ny % 2 === 1) {
      const topLeft = positions.length / 3;
      positions.push(-sx / 2, halfHeight, 0);
      const topRight = topLeft + 1;
      positions.push(sx / 2, halfHeight, 0);

      cells.push(
        [rowStart[ny - 1], rowStart[ny], topLeft],
        [rowStart[ny - 1] + nx, topRight, rowStart[ny] + nx - 1],
      );
    }
  }

  return { positions: Float32Array.from(positions), cells };
}
