/**
 * @module primitiveGeometry
 * @ignore
 */

import { SQRT3 } from "../../utils/common.js";

/**
 * @typedef {object} TriangularGridOptions
 * @property {number} [sx=1]
 * @property {import("../../../types.js").PositiveInteger} [nx=10]
 * @property {import("../../../types.js").PositiveInteger} [ny=10]
 * @property {boolean} [inscribed=true]
 */

/**
 * An isometric grid of equilateral triangles.
 *
 * @param {TriangularGridOptions} [options={}]
 * @returns {import("../../../types.js").PolygonalComplex}
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

  // Odd rows are offset by half a step and hold one point fewer, so their
  // points interleave with the rows above and below.
  const addRow = (row) => {
    const odd = row % 2 === 1;
    const y = row * dy - halfHeight;
    const offset = odd ? dx / 2 : 0;
    const count = odd ? nx : nx + 1;

    rowStart.push(positions.length / 3);
    for (let col = 0; col < count; col++) {
      positions.push(-sx / 2 + offset + col * dx, y, 0);
    }
  };

  // The two alternating triangle runs between a short row and the long row
  // beside it: one pointing at the short row, one away from it.
  const addRowCells = (smallStart, bigStart, offsetIsLower) => {
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
  };

  // Half-triangles filling the saw-tooth the offset rows leave along the left
  // and right edges, plus the two top corners when the last row is offset.
  const addInscribedEdges = () => {
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

    if (ny % 2 !== 1) return;

    const topLeft = positions.length / 3;
    positions.push(-sx / 2, halfHeight, 0);
    const topRight = topLeft + 1;
    positions.push(sx / 2, halfHeight, 0);

    cells.push(
      [rowStart[ny - 1], rowStart[ny], topLeft],
      [rowStart[ny - 1] + nx, topRight, rowStart[ny] + nx - 1],
    );
  };

  for (let row = 0; row <= ny; row++) addRow(row);

  for (let row = 0; row < ny; row++) {
    const offsetIsLower = row % 2 === 1;
    addRowCells(
      rowStart[offsetIsLower ? row : row + 1],
      rowStart[offsetIsLower ? row + 1 : row],
      offsetIsLower,
    );
  }

  if (inscribed) addInscribedEdges();

  return { positions: Float32Array.from(positions), cells };
}
